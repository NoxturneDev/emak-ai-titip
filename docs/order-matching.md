# Technical Specification: Order State Machine & API Endpoints

## 1. Siklus Hidup Pesanan (Order Lifecycle State Machine)

Pesanan bertindak sebagai *single source of truth* untuk seluruh ekosistem Emak AI Titip. State machine melacak status pesanan mulai dari percakapan WhatsApp hingga penyelesaian escrow di ledger.

### Tabel Siklus Order (Order Lifecycle)

| State / Status | Deskripsi | Aksi Pemicu (Trigger) | Visibilitas UI & Efek |
| --- | --- | --- | --- |
| `AWAITING_PAYMENT` | Menunggu pembayaran uang muka dari pengguna. | Pesan belanjaan di-parse oleh AI, pesanan dibuat di SQLite. | Menampilkan halaman ringkasan checkout di simulator WhatsApp. |
| `MITRA_PREPPING` | Toko/Mitra pasar sedang menyiapkan barang belanjaan. | Simulasi webhook pembayaran (`POST /api/orders/:id/pay`) dipanggil. | Order muncul di tab **Mitra Dashboard** sebagai pesanan yang perlu dikemas. |
| `DRIVER_CONCIERGE` | Kurir sedang berbelanja dan melakukan verifikasi barang di pasar. | Mitra menekan tombol "Siap Pickup / Kirim". | Order muncul di tab **Driver Concierge** sebagai daftar checklist belanja. |
| `AWAITING_SUBSTITUTION` | Kurir mendapati barang habis dan menawarkan barang pengganti. | Kurir mengubah status item menjadi "Out of Stock" dengan saran substitusi. | Pesanan dipause. Simulator WhatsApp menampilkan pilihan tombol konfirmasi. |
| `COMPLETED` | Pesanan selesai dikirim dan dana escrow dicairkan. | Kurir mengunggah foto struk belanja (`POST /api/orders/:id/complete`). | Rekening escrow dicairkan (payout mitra/driver, refund sisa uang ke user). |

---

## 2. Struktur API Endpoints (Go Backend)

Backend Go melayani endpoint berikut untuk mengontrol alur state machine dan integrasi data:

### A. WhatsApp & Chatbot Webhook
* **`POST /api/webhooks/whatsapp`**
  - **Payload:** `{ "phone": "string", "message": "string" }`
  - **Logika:** 
    - Jika pengguna tidak memiliki pesanan aktif: Melakukan parse teks belanja menggunakan NLP parser (mock/LLM), menghitung estimasi harga + dana talangan (15% buffer), membuat pesanan baru di database, dan membalas dengan link checkout.
    - Jika pengguna sedang dalam state `AWAITING_SUBSTITUTION`: Memproses balasan "YA/SETUJU" atau "TIDAK/BATAL" untuk memproses substitusi barang.

### B. Manajemen Pesanan (Orders)
* **`GET /api/orders`**
  - Mengambil daftar semua pesanan.
* **`GET /api/orders/:id`**
  - Mengambil detail satu pesanan beserta item belanjanya.
* **`POST /api/orders/:id/pay`**
  - Mensimulasikan pembayaran dari gateway. Mengubah status order dari `AWAITING_PAYMENT` menjadi `MITRA_PREPPING` dan menambahkan kredit deposit di ledger escrow.
* **`POST /api/orders/:id/transition`**
  - Memaksa perubahan status pesanan secara langsung (berguna untuk demo control panel).
* **`PATCH /api/orders/:id/items/:item_id`**
  - Mengupdate status belanja per item oleh kurir (misal: harga riil, kuantitas riil, status: `PURCHASED` atau `OUT_OF_STOCK` beserta informasi substitusi). Jika di-set `OUT_OF_STOCK`, otomatis mengubah status pesanan menjadi `AWAITING_SUBSTITUTION`.
* **`POST /api/orders/:id/substitute/confirm`**
  - Mengonfirmasi penerimaan atau penolakan barang pengganti dari dashboard simulator.
* **`POST /api/orders/:id/complete`**
  - Kurir mengunggah struk belanja (base64/URL) dan menyelesaikan pesanan. Sistem menghitung pengeluaran riil, mencairkan dana escrow untuk mitra dan kurir, serta menghitung sisa refund belanja untuk pengguna.

### C. Keuangan & Escrow Ledger
* **`GET /api/escrow/ledger`**
  - Mengambil seluruh log histori transaksi debit/kredit pada rekening escrow.

### D. System Debug & Dictionary
* **`GET /api/dictionary`**
  - Mengambil daftar kamus harga pasar saat ini.
* **`POST /api/debug/reset`**
  - Menghapus semua data transaksi pesanan di database untuk me-restart demonstrasi E2E dari awal.
