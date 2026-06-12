---

# Technical Specification: Jastip Pasar Tradisional (JS Prototyping Phase)

## 1. Arsitektur Aplikasi (Monolithic Prototype)

Sama seperti sebelumnya, kita menggunakan **Next.js (App Router)** dengan *Route Groups*, namun sepenuhnya menggunakan JavaScript.

* **Frontend / UI Layer:** Next.js React Server Components (RSC) & Client Components (berbasis `.js` dan `.jsx`).
* **Backend / API Layer:** Next.js Server Actions dan Route Handlers (`app/api/...`).
* **Database Layer:** SQLite yang diakses melalui Prisma ORM. (Prisma Client tetap bekerja sangat baik dan intuitif di lingkungan JavaScript).

## 2. Tech Stack & Library

*Package* yang digunakan untuk *rapid prototyping*:

### Core & Framework

* **Framework:** `next` (v14+)
* **Language:** `javascript` (Tidak pakai TypeScript)
* **Database & ORM:** `prisma`, `@prisma/client`, `sqlite3`

### UI, Styling & Animation

* **Styling:** `tailwindcss`
* **UI Components:** `shadcn/ui` (Mendukung instalasi versi JavaScript/JSX).
* **Icons:** `lucide-react`
* **Animation:** `framer-motion`

### State Management & Forms

* **Global State (Client):** `zustand` (Sangat simpel diimplementasikan dengan JS biasa).
* **Form Handling & Validation:** `react-hook-form` + `zod`

## 3. Struktur Direktori (Project Structure)

Ekstensi file diubah ke `.jsx` (untuk komponen UI) dan `.js` (untuk logic/fungsi).

```text
jastip-pasar-ui/
├── prisma/
│   ├── schema.prisma       # Skema SQLite
│   └── dev.db              # File database lokal
├── src/
│   ├── app/
│   │   ├── (user)/         
│   │   │   ├── page.jsx    # Halaman input chat/free-text LLM
│   │   │   └── track/      
│   │   │       └── page.jsx
│   │   ├── (mitra)/        
│   │   │   ├── page.jsx    # Dashboard list order masuk (bidding)
│   │   │   └── order/      
│   │   │       └── page.jsx
│   │   ├── (runner)/       
│   │   │   ├── page.jsx    # Halaman peta dan daftar pickup
│   │   └── api/            
│   ├── components/
│   │   ├── ui/             # Reusable UI (Shadcn versi .jsx)
│   │   ├── shared/         
│   │   └── specific/       
│   ├── lib/
│   │   ├── prisma.js       # Inisialisasi Prisma client
│   │   ├── utils.js        # Helper functions (Tailwind merge, dll)
│   │   └── dummy-data.js   # Data statis untuk prototyping cepat
│   └── store/
│       └── useOrderStore.js # Zustand state 

```

## 4. Project Setup Guide

Langkah-langkah inisialisasi disesuaikan untuk memastikan *environment* ter-set up menggunakan JavaScript.

**Step 1: Inisialisasi Next.js**
Jalankan perintah ini di terminal. Pastikan pilih **No** saat ditanya *"Would you like to use TypeScript?"*.

```bash
npx create-next-app@latest jastip-pasar-ui
cd jastip-pasar-ui

```

*(Pilih opsi: TypeScript = No, Tailwind CSS = Yes, ESLint = Yes, App Router = Yes, src/ directory = Yes)*

**Step 2: Install Dependencies Tambahan**

```bash
npm install framer-motion zustand lucide-react react-hook-form @hookform/resolvers zod

```

**Step 3: Setup Shadcn UI (Versi JS)**
Saat inisialisasi Shadcn, pastikan kamu menjawab **No** pada pertanyaan *TypeScript*.

```bash
npx shadcn-ui@latest init
# Pertanyaan penting saat prompt:
# Would you like to use TypeScript (recommended)? » no

# Install komponen dasar
npx shadcn-ui@latest add button card input textarea badge scroll-area separator

```

**Step 4: Setup Database (SQLite + Prisma)**
Instalasi Prisma tetap sama.

```bash
npm install prisma --save-dev
npm install @prisma/client

npx prisma init --datasource-provider sqlite

```

**Step 5: Skema & Prisma Client (di `prisma/schema.prisma`)**
Isi `schema.prisma` dengan model *dummy* yang sama:

```prisma
model Order {
  id          String   @id @default(cuid())
  rawText     String   
  parsedItems String   
  status      String   @default("PENDING") 
  totalPrice  Int?     
  createdAt   DateTime @default(now())
}

```

Lalu jalankan:

```bash
npx prisma db push

```

Di dalam file `src/lib/prisma.js`, inisialisasi client-nya cukup seperti ini:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;

```

Dengan *setup* ini, kamu bisa langsung tancap gas *slicing* UI dan bikin purwarupa fitur-fiturnya tanpa hambatan *type checking*. Ada bagian lain yang mau disesuaikan?
