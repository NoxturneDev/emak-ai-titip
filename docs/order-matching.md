---

# Technical Specification: Order Matching Feature

## 1. Konsep Arsitektur (State Machine)

Sistem *matching* ini menggunakan pola State Machine linier. Order bertindak sebagai *single source of truth*, dan transisi antar state memicu antarmuka aktor (Mitra dan Runner) untuk bereaksi (menampilkan tombol *bidding* atau status).

### Tabel Siklus Order (Order Lifecycle)

| State / Status | Aktor yang Terlibat | Kondisi Pemicu (Trigger) | Visibilitas UI |
| --- | --- | --- | --- |
| `PENDING_LLM` | User | User submit teks belanjaan. | Loading UI di sisi User. |
| `BROADCAST_MITRA` | Sistem & Mitra | LLM selesai mem-parsing data. | Muncul di daftar "Order Baru" semua Mitra terdekat. |
| `MITRA_PREPPING` | Mitra | Salah satu Mitra menekan tombol "ACC". | Menghilang dari layar Mitra lain. Masuk ke halaman "Proses" Mitra yang menang. |
| `BROADCAST_DRIVER` | Sistem & Driver | Mitra selesai mengemas & klik "Siap Pickup". | Muncul di daftar "Tugas Baru" semua Driver terdekat. |
| `ON_DELIVERY` | Driver & User | Driver menekan "Ambil Order". | User melihat status "Driver menuju rumah". |
| `COMPLETED` | Driver | Driver menekan "Selesai". | Masuk ke histori (Order History). |

---

## 2. Pembaruan Skema Database (Prisma)

Untuk mendukung relasi *matching* ini, model `Order` pada `prisma/schema.prisma` perlu diperluas dengan kolom relasi *dummy* (karena ini prototype, kita simpan ID Mitra dan Driver secara opsional).

```prisma
// prisma/schema.prisma

model Order {
  id             String   @id @default(cuid())
  rawText        String   
  parsedItems    String   
  status         String   @default("PENDING_LLM") 
  
  // Matching Identifiers
  mitraId        String?  // Terisi saat Mitra ACC order
  driverId       String?  // Terisi saat Driver Ambil order
  
  // Financials
  estimatedPrice Int?     // Estimasi dari LLM
  finalPrice     Int?     // Harga riil dari timbangan Mitra
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

```

---

## 3. Logika Backend (Next.js API Routes)

Karena lingkungan saat ini menggunakan HTTP REST (tanpa WebSocket/RabbitMQ), kita akan memanfaatkan *Route Handlers* Next.js (`app/api/...`) untuk menangani *bidding race condition*.

### A. Endpoint Bidding Mitra (`POST /api/match/mitra`)

Saat beberapa Mitra melihat order yang sama dan menekan "ACC" secara bersamaan, kita harus mencegah pesanan diambil oleh lebih dari satu Mitra (Optimistic Concurrency Control sederhana).

```javascript
// src/app/api/match/mitra/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { orderId, mitraId } = await request.json();

  try {
    // 1. Pengecekan atomik: Cari order yang id-nya cocok DAN statusnya masih BROADCAST_MITRA
    const updatedOrder = await prisma.order.updateMany({
      where: {
        id: orderId,
        status: 'BROADCAST_MITRA' // Kunci untuk mencegah double-booking
      },
      data: {
        status: 'MITRA_PREPPING',
        mitraId: mitraId
      }
    });

    // 2. Jika count 0, artinya order sudah diambil Mitra lain sepersekian detik sebelumnya
    if (updatedOrder.count === 0) {
      return NextResponse.json(
        { success: false, message: 'Maaf, pesanan sudah diambil toko lain.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, message: 'Berhasil mengambil order.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

```

### B. Endpoint Dispatch Driver (`POST /api/match/driver`)

Polanya identik dengan *bidding* Mitra, namun dipicu pada tahap selanjutnya.

```javascript
// src/app/api/match/driver/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { orderId, driverId } = await request.json();

  try {
    const updatedOrder = await prisma.order.updateMany({
      where: {
        id: orderId,
        status: 'BROADCAST_DRIVER'
      },
      data: {
        status: 'ON_DELIVERY',
        driverId: driverId
      }
    });

    if (updatedOrder.count === 0) {
      return NextResponse.json(
        { success: false, message: 'Order sudah diambil Driver lain.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

```

---

## 4. Simulasi Real-time di Frontend (Client Polling)

Untuk menirukan sifat *event-driven* dan *real-time push notification* di tahap *prototyping* ini tanpa setup infrastruktur tambahan, kita gunakan metode **Short Polling** menggunakan SWR atau React `useEffect`.

**Mekanisme Polling pada UI Mitra (Contoh Implementasi):**

```javascript
// src/app/(mitra)/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function MitraDashboard() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const dummyMitraId = "mitra-001";

  // Polling data setiap 3 detik untuk simulasi real-time broadcast
  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders?status=BROADCAST_MITRA');
      const data = await res.json();
      setAvailableOrders(data);
    };

    fetchOrders(); // Initial fetch
    const interval = setInterval(fetchOrders, 3000); 
    
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId) => {
    const res = await fetch('/api/match/mitra', {
      method: 'POST',
      body: JSON.stringify({ orderId, mitraId: dummyMitraId }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await res.json();
    if (result.success) {
      alert("Order berhasil di-ACC!");
      // Re-fetch untuk menghapus order dari daftar public
    } else {
      alert(result.message); // Kasus kalah cepat dengan Mitra lain
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Radar Order Pasar</h1>
      {availableOrders.map(order => (
        <div key={order.id} className="border p-4 mb-2 rounded-lg shadow-sm">
          <p>Order ID: {order.id}</p>
          <p className="text-sm text-gray-500">Item: {order.parsedItems}</p>
          <Button onClick={() => handleAcceptOrder(order.id)} className="mt-2 w-full">
            ACC Pesanan
          </Button>
        </div>
      ))}
    </div>
  );
}

```

## 5. Ringkasan Alur Eksekusi Prototipe

1. User mengetik form → Database `Order` terbuat dengan status `BROADCAST_MITRA`.
2. Halaman Mitra (yg berjalan di tab berbeda) secara periodik melakukan *fetching*. Order baru muncul di layar.
3. Mitra klik "ACC". Fungsi backend `updateMany` memastikan hanya satu transaksi yang lolos. Status berubah menjadi `MITRA_PREPPING`.
4. Mitra selesai, menekan "Siap Pickup" → Status berubah jadi `BROADCAST_DRIVER`.
5. Halaman Runner mulai melihat order tersebut dan proses adu cepat (*bidding*) kembali terjadi untuk Driver.
