package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"emak-ai-backend/database"
	"emak-ai-backend/nlp"
)

func main() {
	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.Close()

	// Setup routes
	mux := http.NewServeMux()
	
	// API routes
	mux.HandleFunc("/api/webhooks/whatsapp", handleWhatsAppWebhook)
	mux.HandleFunc("/api/orders", handleOrdersList)
	mux.HandleFunc("/api/orders/", handleSingleOrder) // Matches /api/orders/{id} and subroutes
	mux.HandleFunc("/api/escrow/ledger", handleEscrowLedger)
	
	// Helper dictionary endpoint for debug/demo
	mux.HandleFunc("/api/dictionary", handleDictionary)
	mux.HandleFunc("/api/debug/reset", handleDebugReset)

	// Apply CORS & Logging middleware
	handler := loggingMiddleware(corsMiddleware(mux))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Emak AI Titip backend server running on port %s...", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// Middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.RequestURI, time.Since(start))
	})
}

// Helper: generate unique ID
func generateID(prefix string) string {
	rand.Seed(time.Now().UnixNano())
	chars := "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = chars[rand.Intn(len(chars))]
	}
	return fmt.Sprintf("%s_%s", prefix, string(b))
}

// Write JSON utility
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

type whatsappWebhookRequest struct {
	Phone   string `json:"phone"`
	Message string `json:"message"`
}

type whatsappWebhookResponse struct {
	Status  string `json:"status"`
	Reply   string `json:"reply"`
	OrderID string `json:"order_id,omitempty"`
}

// POST /api/webhooks/whatsapp
func handleWhatsAppWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	var req whatsappWebhookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	req.Phone = strings.TrimSpace(req.Phone)
	req.Message = strings.TrimSpace(req.Message)
	if req.Phone == "" || req.Message == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Phone and message are required"})
		return
	}

	// 1. Check if user has an active, incomplete order
	var activeOrderID string
	var activeStatus string
	err := database.DB.QueryRow(
		"SELECT id, status FROM orders WHERE user_phone = ? AND status NOT IN ('COMPLETED', 'CANCELLED') ORDER BY created_at DESC LIMIT 1",
		req.Phone,
	).Scan(&activeOrderID, &activeStatus)

	// If there is an active order and the user is in substitution state, handle yes/no confirmations
	if err == nil {
		if activeStatus == "AWAITING_SUBSTITUTION" {
			msgLower := strings.ToLower(req.Message)
			if strings.Contains(msgLower, "ya") || strings.Contains(msgLower, "setuju") || strings.Contains(msgLower, "boleh") || strings.Contains(msgLower, "ok") {
				// Confirm replacement
				if err := processSubstitutionConfirm(activeOrderID, true); err != nil {
					writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
					return
				}
				reply := "Baik Ibu, penggantian barang telah disetujui. Kurir akan melanjutkan belanja."
				writeJSON(w, http.StatusOK, whatsappWebhookResponse{Status: "success", Reply: reply, OrderID: activeOrderID})
				return
			} else if strings.Contains(msgLower, "tidak") || strings.Contains(msgLower, "batal") || strings.Contains(msgLower, "jangan") {
				// Deny replacement
				if err := processSubstitutionConfirm(activeOrderID, false); err != nil {
					writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
					return
				}
				reply := "Siap Ibu, barang tersebut dibatalkan dari daftar belanja. Kurir akan melanjutkan belanja barang lainnya."
				writeJSON(w, http.StatusOK, whatsappWebhookResponse{Status: "success", Reply: reply, OrderID: activeOrderID})
				return
			} else {
				reply := "Maaf Ibu, mohon balas dengan 'YA / SETUJU' untuk menyetujui penggantian, atau 'TIDAK / BATAL' untuk membatalkan barang tersebut."
				writeJSON(w, http.StatusOK, whatsappWebhookResponse{Status: "success", Reply: reply, OrderID: activeOrderID})
				return
			}
		}

		// If they have another active order in progress, let them know we're working on it
		reply := fmt.Sprintf("Ibu, pesanan Anda yang sebelumnya (%s) masih dalam proses (%s). Silakan tunggu hingga pesanan selesai sebelum membuat pesanan baru.", activeOrderID, activeStatus)
		writeJSON(w, http.StatusOK, whatsappWebhookResponse{Status: "success", Reply: reply, OrderID: activeOrderID})
		return
	}

	// 2. No active order, start standard parsing flow
	parsedItems, err := nlp.ParseText(req.Message)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("AI parsing error: %v", err)})
		return
	}

	if len(parsedItems) == 0 {
		reply := "Halo Ibu! Mohon maaf, kami tidak mendeteksi daftar belanja pada pesan Anda. Bisa tolong sebutkan barang belanjanya secara jelas? (Contoh: Beli wortel 1 kg, tempe 1 papan)"
		writeJSON(w, http.StatusOK, whatsappWebhookResponse{Status: "success", Reply: reply})
		return
	}

	// 3. Create database Order transaction
	tx, err := database.DB.Begin()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to begin transaction"})
		return
	}
	defer tx.Rollback()

	orderID := generateID("ord")
	totalEst := 0

	for _, item := range parsedItems {
		itemID := generateID("item")
		_, err := tx.Exec(
			`INSERT INTO order_items (id, order_id, name, category, quantity, unit, custom_note, estimated_price, actual_price, status) 
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			itemID, orderID, item.RawName, item.Category, item.Quantity, item.Unit, item.CustomNote, item.EstimatedIDR, 0, "PENDING",
		)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create order items"})
			return
		}
		totalEst += item.EstimatedIDR
	}

	bufferAmt := int(float64(totalEst) * 0.15)
	
	_, err = tx.Exec(
		`INSERT INTO orders (id, user_phone, status, raw_text, total_estimated, buffer_amount, total_actual, refund_amount, receipt_url) 
		 VALUES (?, ?, ?, ?, ?, ?, 0, 0, '')`,
		orderID, req.Phone, "AWAITING_PAYMENT", req.Message, totalEst, bufferAmt,
	)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create order"})
		return
	}

	if err := tx.Commit(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to commit order"})
		return
	}

	// 4. Draft WhatsApp reply message
	var itemsText []string
	for idx, item := range parsedItems {
		notePart := ""
		if item.CustomNote != "" {
			notePart = fmt.Sprintf(" (%s)", item.CustomNote)
		}
		itemsText = append(itemsText, fmt.Sprintf("%d. %s %.1f %s - Rp %s%s", idx+1, item.RawName, item.Quantity, item.Unit, formatMoney(item.EstimatedIDR), notePart))
	}

	checkoutURL := fmt.Sprintf("http://localhost:5175/checkout/%s", orderID) // Local UI routing
	reply := fmt.Sprintf("Halo Ibu! Pesanan Anda berhasil dicatat.\n\n*Daftar Belanja:*\n%s\n\n*Total Estimasi:* Rp %s\n*Dana Talangan (15%% Buffer):* Rp %s\n*Total yang Perlu Dibayar:* Rp %s\n\nSilakan selesaikan pembayaran agar kurir kami bisa langsung berangkat ke pasar:\n%s",
		strings.Join(itemsText, "\n"),
		formatMoney(totalEst),
		formatMoney(bufferAmt),
		formatMoney(totalEst+bufferAmt),
		checkoutURL,
	)

	writeJSON(w, http.StatusOK, whatsappWebhookResponse{
		Status:  "success",
		Reply:   reply,
		OrderID: orderID,
	})
}

// GET /api/orders
func handleOrdersList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	rows, err := database.DB.Query("SELECT id, user_phone, status, raw_text, total_estimated, buffer_amount, total_actual, refund_amount, receipt_url, created_at, updated_at FROM orders ORDER BY created_at DESC")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	type OrderListItem struct {
		ID             string    `json:"id"`
		UserPhone      string    `json:"user_phone"`
		Status         string    `json:"status"`
		RawText        string    `json:"raw_text"`
		TotalEstimated int       `json:"total_estimated"`
		BufferAmount   int       `json:"buffer_amount"`
		TotalActual    int       `json:"total_actual"`
		RefundAmount   int       `json:"refund_amount"`
		ReceiptURL     string    `json:"receipt_url"`
		CreatedAt      time.Time `json:"created_at"`
		UpdatedAt      time.Time `json:"updated_at"`
	}

	orders := []OrderListItem{}
	for rows.Next() {
		var o OrderListItem
		var createdStr, updatedStr string
		err := rows.Scan(&o.ID, &o.UserPhone, &o.Status, &o.RawText, &o.TotalEstimated, &o.BufferAmount, &o.TotalActual, &o.RefundAmount, &o.ReceiptURL, &createdStr, &updatedStr)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		
		// Parse string timestamps to time.Time
		o.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdStr)
		if o.CreatedAt.IsZero() {
			o.CreatedAt, _ = time.Parse(time.RFC3339, createdStr)
		}
		o.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedStr)
		if o.UpdatedAt.IsZero() {
			o.UpdatedAt, _ = time.Parse(time.RFC3339, updatedStr)
		}

		orders = append(orders, o)
	}

	writeJSON(w, http.StatusOK, orders)
}

// GET /api/orders/{id} & PUT/PATCH subroutes
func handleSingleOrder(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/orders/"), "/")
	if len(pathParts) == 0 || pathParts[0] == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Missing order ID"})
		return
	}
	
	orderID := pathParts[0]

	// Handle methods
	if r.Method == http.MethodGet {
		// Return order with details & items & ledger entries
		getOrderDetails(w, orderID)
		return
	}

	// PATCH /api/orders/{id}/items/{item_id} - Update Driver Checklist Item
	if r.Method == http.MethodPatch && len(pathParts) >= 3 && pathParts[1] == "items" {
		itemID := pathParts[2]
		updateChecklistItem(w, r, orderID, itemID)
		return
	}

	// POST /api/orders/{id}/pay - Simulate checkout payment
	if r.Method == http.MethodPost && len(pathParts) == 2 && pathParts[1] == "pay" {
		processOrderPayment(w, orderID)
		return
	}

	// POST /api/orders/{id}/substitute/confirm - Customer action on replacement
	if r.Method == http.MethodPost && len(pathParts) == 3 && pathParts[1] == "substitute" && pathParts[2] == "confirm" {
		handleSubstitutionConfirmEndpoint(w, r, orderID)
		return
	}

	// POST /api/orders/{id}/complete - Driver completes and uploads receipt
	if r.Method == http.MethodPost && len(pathParts) == 2 && pathParts[1] == "complete" {
		processOrderCompletion(w, r, orderID)
		return
	}

	// POST /api/orders/{id}/transition - Update order status directly (e.g. to ON_DELIVERY)
	if r.Method == http.MethodPost && len(pathParts) == 2 && pathParts[1] == "transition" {
		processOrderStatusTransition(w, r, orderID)
		return
	}

	writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed or route mismatch"})
}

type OrderDetailItem struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Category       string `json:"category"`
	Quantity       float64 `json:"quantity"`
	Unit           string `json:"unit"`
	CustomNote     string `json:"custom_note"`
	EstimatedPrice int    `json:"estimated_price"`
	ActualPrice    int    `json:"actual_price"`
	Status         string `json:"status"`
}

type LedgerItem struct {
	ID          string    `json:"id"`
	OrderID     string    `json:"order_id"`
	Amount      int       `json:"amount"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type OrderDetailResponse struct {
	ID             string            `json:"id"`
	UserPhone      string            `json:"user_phone"`
	Status         string            `json:"status"`
	RawText        string            `json:"raw_text"`
	TotalEstimated int               `json:"total_estimated"`
	BufferAmount   int               `json:"buffer_amount"`
	TotalActual    int               `json:"total_actual"`
	RefundAmount   int               `json:"refund_amount"`
	ReceiptURL     string            `json:"receipt_url"`
	CreatedAt      time.Time         `json:"created_at"`
	UpdatedAt      time.Time         `json:"updated_at"`
	Items          []OrderDetailItem `json:"items"`
	Ledger         []LedgerItem      `json:"ledger"`
}

func getOrderDetails(w http.ResponseWriter, orderID string) {
	var o OrderDetailResponse
	var createdStr, updatedStr string
	err := database.DB.QueryRow(
		`SELECT id, user_phone, status, raw_text, total_estimated, buffer_amount, total_actual, refund_amount, receipt_url, created_at, updated_at 
		 FROM orders WHERE id = ?`, orderID,
	).Scan(&o.ID, &o.UserPhone, &o.Status, &o.RawText, &o.TotalEstimated, &o.BufferAmount, &o.TotalActual, &o.RefundAmount, &o.ReceiptURL, &createdStr, &updatedStr)

	if err != nil {
		if err == sql.ErrNoRows {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "Order not found"})
		} else {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return
	}

	o.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdStr)
	if o.CreatedAt.IsZero() {
		o.CreatedAt, _ = time.Parse(time.RFC3339, createdStr)
	}
	o.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedStr)
	if o.UpdatedAt.IsZero() {
		o.UpdatedAt, _ = time.Parse(time.RFC3339, updatedStr)
	}

	// Fetch items
	rows, err := database.DB.Query(
		"SELECT id, name, category, quantity, unit, custom_note, estimated_price, actual_price, status FROM order_items WHERE order_id = ?",
		orderID,
	)
	if err == nil {
		defer rows.Close()
		o.Items = []OrderDetailItem{}
		for rows.Next() {
			var item OrderDetailItem
			if err := rows.Scan(&item.ID, &item.Name, &item.Category, &item.Quantity, &item.Unit, &item.CustomNote, &item.EstimatedPrice, &item.ActualPrice, &item.Status); err == nil {
				o.Items = append(o.Items, item)
			}
		}
	}

	// Fetch ledger entries
	lRows, err := database.DB.Query(
		"SELECT id, order_id, amount, type, description, created_at FROM escrow_ledger WHERE order_id = ? ORDER BY created_at ASC",
		orderID,
	)
	if err == nil {
		defer lRows.Close()
		o.Ledger = []LedgerItem{}
		for lRows.Next() {
			var l LedgerItem
			var cStr string
			if err := lRows.Scan(&l.ID, &l.OrderID, &l.Amount, &l.Type, &l.Description, &cStr); err == nil {
				l.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", cStr)
				if l.CreatedAt.IsZero() {
					l.CreatedAt, _ = time.Parse(time.RFC3339, cStr)
				}
				o.Ledger = append(o.Ledger, l)
			}
		}
	}

	writeJSON(w, http.StatusOK, o)
}

func processOrderPayment(w http.ResponseWriter, orderID string) {
	// Fetch order
	var totalEst, bufferAmt int
	var status string
	err := database.DB.QueryRow("SELECT status, total_estimated, buffer_amount FROM orders WHERE id = ?", orderID).Scan(&status, &totalEst, &bufferAmt)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Order not found"})
		return
	}

	if status != "AWAITING_PAYMENT" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Order is not in AWAITING_PAYMENT state"})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// 1. Update order status to MITRA_PREPPING
	_, err = tx.Exec("UPDATE orders SET status = 'MITRA_PREPPING', updated_at = CURRENT_TIMESTAMP WHERE id = ?", orderID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update order status"})
		return
	}

	// 2. Insert Credit Payment into Ledger
	totalPaid := totalEst + bufferAmt
	ledgerID := generateID("led")
	_, err = tx.Exec(
		`INSERT INTO escrow_ledger (id, order_id, amount, type, description) 
		 VALUES (?, ?, ?, 'CREDIT_PAYMENT', ?)`,
		ledgerID, orderID, totalPaid, fmt.Sprintf("Hold escrow payment: Estimasi Rp %s + Buffer 15%% Rp %s", formatMoney(totalEst), formatMoney(bufferAmt)),
	)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to write ledger record"})
		return
	}

	if err := tx.Commit(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to commit payment"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success",
		"message": "Payment simulation successful. Order moved to MITRA_PREPPING.",
	})
}

type updateItemRequest struct {
	Status      string  `json:"status"` // 'PENDING', 'FULFILLED', 'SUBSTITUTED', 'OUT_OF_STOCK'
	ActualPrice int     `json:"actual_price"`
	AltName     string  `json:"alt_name,omitempty"`     // Proposed substitution item
	AltPrice    int     `json:"alt_price,omitempty"`    // Proposed substitution price
}

func updateChecklistItem(w http.ResponseWriter, r *http.Request, orderID, itemID string) {
	if r.Method != http.MethodPatch {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	var req updateItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	// Check order state
	var orderStatus string
	err := database.DB.QueryRow("SELECT status FROM orders WHERE id = ?", orderID).Scan(&orderStatus)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Order not found"})
		return
	}

	// The driver can update checklist when order is ON_DELIVERY (representing shopping in progress)
	// Or during MITRA_PREPPING as well, depending on how they transition. Let's allow updates in MITRA_PREPPING and ON_DELIVERY.
	if orderStatus != "MITRA_PREPPING" && orderStatus != "ON_DELIVERY" && orderStatus != "AWAITING_SUBSTITUTION" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Checklist can only be updated while prepping or shopping"})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// If driver flags OUT_OF_STOCK, we change the item status to OUT_OF_STOCK,
	// and transition the ORDER status to AWAITING_SUBSTITUTION
	if req.Status == "OUT_OF_STOCK" {
		if req.AltName == "" {
			req.AltName = "barang sejenis"
		}
		if req.AltPrice == 0 {
			req.AltPrice = req.ActualPrice
		}

		// Update item with substitution suggestions in custom note field
		noteVal := fmt.Sprintf("SUB_REQ: %s | Rp %d", req.AltName, req.AltPrice)

		_, err = tx.Exec(
			"UPDATE order_items SET status = 'OUT_OF_STOCK', custom_note = ? WHERE id = ? AND order_id = ?",
			noteVal, itemID, orderID,
		)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update item status"})
			return
		}

		// Update order status to AWAITING_SUBSTITUTION
		_, err = tx.Exec("UPDATE orders SET status = 'AWAITING_SUBSTITUTION', updated_at = CURRENT_TIMESTAMP WHERE id = ?", orderID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update order status"})
			return
		}
	} else {
		// Standard item check off (FULFILLED or regular updates)
		_, err = tx.Exec(
			"UPDATE order_items SET status = ?, actual_price = ? WHERE id = ? AND order_id = ?",
			req.Status, req.ActualPrice, itemID, orderID,
		)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update item"})
			return
		}

		// If order status was AWAITING_SUBSTITUTION but driver resolves it, transition it back to ON_DELIVERY (or keep)
		// Usually resolved via customer confirm webhook, but let's allow safe updates.
	}

	if err := tx.Commit(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to commit item update"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success",
		"message": "Item updated successfully",
	})
}

type subConfirmRequest struct {
	Confirm bool `json:"confirm"`
}

func handleSubstitutionConfirmEndpoint(w http.ResponseWriter, r *http.Request, orderID string) {
	var req subConfirmRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	if err := processSubstitutionConfirm(orderID, req.Confirm); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "success", "message": "Substitution response recorded."})
}

// Shareable logic for substitution confirmation
func processSubstitutionConfirm(orderID string, approved bool) error {
	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Find the item flagged as OUT_OF_STOCK with SUB_REQ in the note
	var itemID, itemName, note string
	err = tx.QueryRow(
		"SELECT id, name, custom_note FROM order_items WHERE order_id = ? AND status = 'OUT_OF_STOCK' AND custom_note LIKE 'SUB_REQ:%' LIMIT 1",
		orderID,
	).Scan(&itemID, &itemName, &note)

	if err != nil {
		return fmt.Errorf("no pending substitution item found: %w", err)
	}

	// Parse out AltName and AltPrice from custom_note
	// Format: "SUB_REQ: AltName | Rp AltPrice" or similar
	altName := ""
	altPrice := 0
	fmt.Sscanf(note, "SUB_REQ: %s | Rp %d", &altName, &altPrice)
	// fallback parsing
	if altName == "" {
		parts := strings.Split(note, "|")
		if len(parts) == 2 {
			altName = strings.TrimSpace(strings.Replace(parts[0], "SUB_REQ:", "", 1))
			fmt.Sscanf(strings.TrimSpace(parts[1]), "Rp %d", &altPrice)
		}
	}

	if approved {
		// Replace details
		_, err = tx.Exec(
			"UPDATE order_items SET status = 'SUBSTITUTED', name = ?, actual_price = ?, custom_note = ? WHERE id = ?",
			altName, altPrice, fmt.Sprintf("Substituted from original: %s", itemName), itemID,
		)
	} else {
		// Cancel item
		_, err = tx.Exec(
			"UPDATE order_items SET status = 'OUT_OF_STOCK', actual_price = 0, custom_note = ? WHERE id = ?",
			fmt.Sprintf("Cancelled by customer: %s", itemName), itemID,
		)
	}

	if err != nil {
		return fmt.Errorf("failed to update item substitution: %w", err)
	}

	// Check if order still has any other items waiting for substitution or if it can go back to shopping
	// For simplicity, reset the order status back to ON_DELIVERY
	_, err = tx.Exec("UPDATE orders SET status = 'ON_DELIVERY', updated_at = CURRENT_TIMESTAMP WHERE id = ?", orderID)
	if err != nil {
		return fmt.Errorf("failed to restore order status: %w", err)
	}

	return tx.Commit()
}

type completeOrderRequest struct {
	ReceiptURL string `json:"receipt_url"`
}

func processOrderCompletion(w http.ResponseWriter, r *http.Request, orderID string) {
	var req completeOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	// Get order details
	var status string
	var totalEstimated, bufferAmount int
	err := database.DB.QueryRow(
		"SELECT status, total_estimated, buffer_amount FROM orders WHERE id = ?", orderID,
	).Scan(&status, &totalEstimated, &bufferAmount)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Order not found"})
		return
	}

	if status == "COMPLETED" || status == "CANCELLED" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Order is already finalized"})
		return
	}

	// Start distributed SAGA simulation using SQL transaction
	tx, err := database.DB.Begin()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to begin transaction"})
		return
	}
	defer tx.Rollback()

	// 1. Calculate Actual Total from items checkoffs
	rows, err := tx.Query("SELECT actual_price FROM order_items WHERE order_id = ? AND status IN ('FULFILLED', 'SUBSTITUTED')", orderID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to query items"})
		return
	}
	defer rows.Close()

	totalActual := 0
	for rows.Next() {
		var price int
		if err := rows.Scan(&price); err == nil {
			totalActual += price
		}
	}

	// Driver flat convenience fee
	driverFee := 10000 
	
	// Escrow calculation:
	// Total Paid initially = totalEstimated + bufferAmount
	totalPaid := totalEstimated + bufferAmount
	refundAmount := totalPaid - totalActual - driverFee
	
	if refundAmount < 0 {
		// If buffer wasn't enough (rare in traditional market, but possible), set refund to 0 (or charge extra)
		refundAmount = 0
	}

	// 2. Perform ledger writes
	// Entry 1: Refund back to user
	if refundAmount > 0 {
		_, err = tx.Exec(
			`INSERT INTO escrow_ledger (id, order_id, amount, type, description) 
			 VALUES (?, ?, ?, 'DEBIT_REFUND', 'Refund sisa buffer & belanja ke Pengguna')`,
			generateID("led"), orderID, refundAmount,
		)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to write refund ledger"})
			return
		}
	}

	// Entry 2: Driver fee settlement
	_, err = tx.Exec(
		`INSERT INTO escrow_ledger (id, order_id, amount, type, description) 
		 VALUES (?, ?, ?, 'DEBIT_DRIVER_FEE', 'Convenience fee disalurkan ke kurir')`,
		generateID("led"), orderID, driverFee,
	)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to write driver fee ledger"})
		return
	}

	// Entry 3: Vendor merchandise payout
	vendorPayout := totalActual
	if vendorPayout > 0 {
		_, err = tx.Exec(
			`INSERT INTO escrow_ledger (id, order_id, amount, type, description) 
			 VALUES (?, ?, ?, 'DEBIT_VENDOR_PAYOUT', 'Disbursement nilai barang ke Stall Aggregator Mitra')`,
			generateID("led"), orderID, vendorPayout,
		)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to write vendor payout ledger"})
			return
		}
	}

	// 3. Update order record details
	if req.ReceiptURL == "" {
		req.ReceiptURL = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=300" // Premium mock receipt image
	}

	_, err = tx.Exec(
		`UPDATE orders 
		 SET status = 'COMPLETED', total_actual = ?, refund_amount = ?, receipt_url = ?, updated_at = CURRENT_TIMESTAMP 
		 WHERE id = ?`,
		totalActual, refundAmount, req.ReceiptURL, orderID,
	)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to complete order"})
		return
	}

	// Commit atomic financial transaction!
	if err := tx.Commit(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to commit ledger entries"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success",
		"total_actual": totalActual,
		"refund_amount": refundAmount,
		"driver_fee": driverFee,
	})
}

// GET /api/escrow/ledger
func handleEscrowLedger(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	rows, err := database.DB.Query("SELECT id, order_id, amount, type, description, created_at FROM escrow_ledger ORDER BY created_at DESC")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	ledger := []LedgerItem{}
	for rows.Next() {
		var l LedgerItem
		var cStr string
		if err := rows.Scan(&l.ID, &l.OrderID, &l.Amount, &l.Type, &l.Description, &cStr); err == nil {
			l.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", cStr)
			if l.CreatedAt.IsZero() {
				l.CreatedAt, _ = time.Parse(time.RFC3339, cStr)
			}
			ledger = append(ledger, l)
		}
	}

	writeJSON(w, http.StatusOK, ledger)
}

// GET /api/dictionary (For viewing pricing seeds)
func handleDictionary(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, name, category, estimated_price, unit FROM market_pricing_dictionary ORDER BY name ASC")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	type DictItem struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Cat   string `json:"category"`
		Price int    `json:"estimated_price"`
		Unit  string `json:"unit"`
	}

	list := []DictItem{}
	for rows.Next() {
		var d DictItem
		if err := rows.Scan(&d.ID, &d.Name, &d.Cat, &d.Price, &d.Unit); err == nil {
			list = append(list, d)
		}
	}

	writeJSON(w, http.StatusOK, list)
}

// Helper formatting utilities
func formatMoney(amount int) string {
	return fmt.Sprintf("%,d", amount)
}

// POST /api/debug/reset
func handleDebugReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM orders")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to clear orders"})
		return
	}

	_, err = tx.Exec("DELETE FROM order_items")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to clear order items"})
		return
	}

	_, err = tx.Exec("DELETE FROM escrow_ledger")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to clear ledger"})
		return
	}

	if err := tx.Commit(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to commit reset"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "success", "message": "Database reset successful"})
}

type transitionRequest struct {
	Status string `json:"status"`
}

func processOrderStatusTransition(w http.ResponseWriter, r *http.Request, orderID string) {
	var req transitionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	if req.Status == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Status is required"})
		return
	}

	_, err := database.DB.Exec("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", req.Status, orderID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update status: " + err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "success", "message": "Order status updated to " + req.Status})
}
