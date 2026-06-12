package database

import (
	"database/sql"
	"fmt"
	"log"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

// InitDB initializes SQLite and runs migrations and seeds
func InitDB() (*sql.DB, error) {
	// Create the data directory if it doesn't exist
	dbDir := "."
	dbPath := filepath.Join(dbDir, "emak_ai_titip.db")

	var err error
	DB, err = sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connection established at:", dbPath)

	if err := runMigrations(); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	if err := runSeeds(); err != nil {
		return nil, fmt.Errorf("failed to seed database: %w", err)
	}

	return DB, nil
}

func runMigrations() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS market_pricing_dictionary (
			id TEXT PRIMARY KEY,
			name TEXT UNIQUE,
			category TEXT,
			estimated_price INTEGER,
			unit TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS orders (
			id TEXT PRIMARY KEY,
			user_phone TEXT,
			status TEXT,
			raw_text TEXT,
			total_estimated INTEGER,
			buffer_amount INTEGER,
			total_actual INTEGER,
			refund_amount INTEGER,
			receipt_url TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS order_items (
			id TEXT PRIMARY KEY,
			order_id TEXT,
			name TEXT,
			category TEXT,
			quantity REAL,
			unit TEXT,
			custom_note TEXT,
			estimated_price INTEGER,
			actual_price INTEGER,
			status TEXT,
			FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS escrow_ledger (
			id TEXT PRIMARY KEY,
			order_id TEXT,
			amount INTEGER,
			type TEXT,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			return fmt.Errorf("migration query failed: %s, error: %w", query, err)
		}
	}

	log.Println("Migrations applied successfully.")
	return nil
}

func runSeeds() error {
	seeds := []struct {
		id    string
		name  string
		cat   string
		price int
		unit  string
	}{
		{"dict_1", "tempe papan", "Lauk Pauk", 8000, "papan"},
		{"dict_2", "tempe daun", "Lauk Pauk", 5000, "daun"},
		{"dict_3", "bumbu lodeh", "Bumbu", 15000, "porsi"},
		{"dict_4", "wortel", "Sayuran", 12000, "kg"},
		{"dict_5", "kentang", "Sayuran", 15000, "kg"},
		{"dict_6", "ayam potong", "Daging", 40000, "ekor"},
		{"dict_7", "kangkung", "Sayuran", 3000, "ikat"},
		{"dict_8", "bawang merah", "Bumbu", 35000, "kg"},
		{"dict_9", "bawang putih", "Bumbu", 30000, "kg"},
		{"dict_10", "cabai rawit", "Bumbu", 45000, "kg"},
		{"dict_11", "tomat", "Sayuran", 10000, "kg"},
		{"dict_12", "telur ayam", "Daging", 28000, "kg"},
		{"dict_13", "daging sapi", "Daging", 120000, "kg"},
		{"dict_14", "tahu putih", "Lauk Pauk", 6000, "bungkus"},
	}

	stmt, err := DB.Prepare(`INSERT OR IGNORE INTO market_pricing_dictionary (id, name, category, estimated_price, unit) VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		return fmt.Errorf("failed to prepare seed statement: %w", err)
	}
	defer stmt.Close()

	for _, s := range seeds {
		_, err := stmt.Exec(s.id, s.name, s.cat, s.price, s.unit)
		if err != nil {
			return fmt.Errorf("failed to seed item %s: %w", s.name, err)
		}
	}

	log.Println("Database seed completed.")
	return nil
}
