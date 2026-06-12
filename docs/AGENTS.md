# Technical Specification: Emak AI Titip (Go + React-Vite MVP)

## 1. Arsitektur Aplikasi (Monolithic MVP)

Sistem ini diimplementasikan sebagai arsitektur decoupled monolitik sederhana dengan backend Go dan frontend React-Vite.

* **Backend / API Layer:** Go (Golang) menggunakan `net/http` router standar. Melayani REST API dan mengelola state machine pesanan serta simulasi pesan WhatsApp.
* **Frontend / UI Layer:** React-Vite SPA menggunakan Tailwind CSS untuk styling dan Lucide Icons untuk ikonografi.
* **Database Layer:** SQLite yang diakses secara langsung menggunakan driver Go `github.com/mattn/go-sqlite3` dan query SQL mentah.

## 2. Tech Stack & Library

* **Backend:**
  - Bahasa: Go (1.20+)
  - Database: SQLite3 (WAL mode enabled)
  - Driver: `github.com/mattn/go-sqlite3`
* **Frontend:**
  - Framework: React (v19) + Vite (v8)
  - Styling: Tailwind CSS (v4)
  - Animasi: `framer-motion`
  - Ikon: `lucide-react`
* **Orkestrasi:**
  - Script startup bash (`start.sh`) untuk menjalankan backend (port 8080) dan dev server frontend (port 5173) secara paralel.

## 3. Struktur Direktori (Project Structure)

```text
emak-ai/
├── backend/
│   ├── database/
│   │   └── sqlite.go       # Koneksi SQLite, skema tabel, migrasi, dan seed data
│   ├── nlp/
│   │   ├── llm.go          # Client LLM (OpenAI/Gemini) dengan fallback mockup
│   │   └── parser.go       # Algoritma pencocokan kamus fuzzy & ekstraksi kuantitas
│   ├── main.go             # Entry point server, routing, middleware, dan handler API
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── LandingPage.jsx # Beranda interaktif dengan simulasi chat WhatsApp & JSON terminal
│   │   ├── App.css
│   │   ├── App.jsx         # Dashboard utama Control Center (WhatsApp, Mitra, Driver, Escrow)
│   │   ├── index.css       # Token styling & font import
│   │   └── main.jsx        # Entry point React
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── AGENTS.md           # Dokumen spesifikasi teknis (ini)
│   └── order-matching.md   # Alur siklus hidup pesanan & transisi state
└── start.sh                # Script startup sistem dev
```

## 4. Cara Menjalankan Aplikasi

Jalankan perintah berikut di direktori root untuk mengompilasi backend dan memulai server secara konkuren:
```bash
chmod +x start.sh
./start.sh
```
