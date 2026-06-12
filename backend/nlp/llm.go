package nlp

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type openAIChatRequest struct {
	Model          string          `json:"model"`
	Messages       []openAIMessage `json:"messages"`
	ResponseFormat responseFormat  `json:"response_format"`
}

type openAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type responseFormat struct {
	Type string `json:"type"`
}

type openAIChatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type llmOutputWrapper struct {
	Items []ParsedItem `json:"items"`
}

// ParseWithLLM makes an HTTP API request to the configured LLM API
func ParseWithLLM(text, apiKey string) ([]ParsedItem, error) {
	provider := os.Getenv("LLM_PROVIDER") // "openai" or "gemini"
	if provider == "" {
		provider = "openai"
	}

	model := os.Getenv("LLM_MODEL")
	if model == "" {
		if provider == "gemini" {
			model = "gemini-2.5-flash"
		} else {
			model = "gpt-4o-mini"
		}
	}

	var apiURL string
	if provider == "gemini" {
		// Gemini OpenAI Compatibility Endpoint
		apiURL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
	} else {
		apiURL = "https://api.openai.com/v1/chat/completions"
	}

	systemPrompt := `You are an AI assistant for a traditional market shopping platform in Indonesia (called 'Emak AI Titip'). 
Your job is to parse unstructured, raw text grocery lists (often typed casually like 'beli tempe 2 papan, bumbu lodeh 1, sama wortel setengah kg') into a structured JSON array.

You MUST return a JSON object with a single key "items", which is an array of objects. 
Each item object must have these exact fields:
- raw_name: (string) simplified name of the item (e.g. "tempe papan", "bumbu lodeh", "wortel")
- category: (string) must be one of: "Sayuran", "Daging", "Bumbu", "Lauk Pauk", "Lainnya"
- quantity: (number) float representation of quantity (e.g. 1.0, 0.5, 2.0)
- unit: (string) unit of measurement (e.g. "kg", "porsi", "papan", "bungkus", "ikat", "ekor", "daun", "pcs")
- custom_note: (string) any special request (e.g., "jangan busuk", "jangan terlalu matang"). Leave empty if none.
- estimated_idr: (number) approximate traditional market price in Rupiah for this item. Set to 0 if unsure (the backend will look it up).

Example output format:
{
  "items": [
    {"raw_name": "bumbu lodeh", "category": "Bumbu", "quantity": 2, "unit": "porsi", "custom_note": "", "estimated_idr": 30000},
    {"raw_name": "tempe papan", "category": "Lauk Pauk", "quantity": 1, "unit": "papan", "custom_note": "", "estimated_idr": 8000}
  ]
}`

	reqBody := openAIChatRequest{
		Model: model,
		Messages: []openAIMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: text},
		},
		ResponseFormat: responseFormat{Type: "json_object"},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if provider == "gemini" {
		// For Gemini endpoint, we pass key as a header or query parameter
		// The OpenAI-compatible API allows Authorization Bearer too
		req.Header.Set("Authorization", "Bearer "+apiKey)
	} else {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("api responded with status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var chatResp openAIChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return nil, fmt.Errorf("received empty choices from LLM api")
	}

	rawResult := chatResp.Choices[0].Message.Content

	var wrapper llmOutputWrapper
	if err := json.Unmarshal([]byte(rawResult), &wrapper); err != nil {
		// LLM might have returned a raw array, try unmarshalling directly to []ParsedItem
		var itemsDirect []ParsedItem
		if errDirect := json.Unmarshal([]byte(rawResult), &itemsDirect); errDirect == nil {
			return itemsDirect, nil
		}
		return nil, fmt.Errorf("failed to parse structured LLM output: %w, raw content: %s", err, rawResult)
	}

	return wrapper.Items, nil
}
