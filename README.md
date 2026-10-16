# English Mastery — Panduan Setup, Autentikasi Supabase & Deployment Cloudflare Pages

Aplikasi web pembelajaran kosakata **Oxford 3000™ & CEFR (A1–C2)** interaktif berbasis **React 19 + Vite 8**, dilengkapi sistem autentikasi dan sinkronisasi awan menggunakan **Supabase**, serta kompatibilitas penuh untuk **Cloudflare Pages**.

---

## 1. Fitur Autentikasi & Database Supabase

Proyek ini telah terintegrasi dengan Supabase Auth & PostgreSQL:
- **Autentikasi Email & Kata Sandi**: Halaman Masuk (`/login`) & Pendaftaran (`/register`).
- **Pemulihan Kata Sandi**: Alur Forgot Password (`/forgot-password`) & Reset Password (`/reset-password`).
- **Session Management**: Sesi login tersimpan secara aman di browser dan otomatis dipulihkan saat aplikasi dibuka kembali.
- **Offline-First & Cloud Sync**: Pengguna tetap dapat belajar 100% offline (disimpan di `localStorage`). Saat pengguna masuk (login), progres belajar otomatis disinkronkan dua arah ke database Supabase tanpa menghilangkan data lokal.
- **Row Level Security (RLS)**: Setiap data progres dikunci di tingkat database menggunakan RLS policies PostgreSQL. Pengguna hanya dapat membaca dan menulis data miliknya sendiri.

---

## 2. Menjalankan Skrip SQL Migration di Supabase

Sebelum pengguna pertama kali melakukan sinkronisasi data ke cloud, jalankan skema tabel dan aturan keamanan RLS di Supabase Dashboard:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Masuk ke proyek Anda (**`https://cedpkkgtqrrbexisdrhx.supabase.co`**).
3. Di menu bilah samping kiri, pilih **SQL Editor**.
4. Klik **New query**.
5. Buka dan salin seluruh isi file **`supabase/schema.sql`** yang ada di dalam proyek ini.
6. Tempelkan ke dalam SQL Editor, lalu klik tombol **Run** (atau tekan `Ctrl+Enter`).
7. Pastikan pesan sukses muncul: `Success. No rows returned`.

Tabel yang akan dibuat lengkap dengan RLS:
- `public.profiles`: Menyimpan nama tampilan, avatar emoji, target harian, dan tema.
- `public.user_word_progress`: Menyimpan status penguasaan per kosakata (`new`, `learning`, `mastered`), percobaan benar/salah berturut-turut, dan timestamp.
- `public.user_daily_activity`: Rekap riwayat aktivitas harian, jumlah percobaan, dan streak.

---

## 3. Konfigurasi Environment Variables

Aplikasi menggunakan variabel lingkungan berikut (hanya public/publishable credentials):

```env
VITE_SUPABASE_URL=https://cedpkkgtqrrbexisdrhx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Z3CzHePjNwFfjZJBRhrB2w_dbmbGD9l
```

- **Lokal**: Buat file `.env.local` di folder root dan masukkan kedua variabel di atas. (File `.env.local` otomatis dikecualikan dari Git).
- **Cloudflare Pages**: Tambahkan kedua variabel di atas pada menu:
  `Cloudflare Dashboard -> Workers & Pages -> Project English Mastery -> Settings -> Environment Variables`.

---

## 4. Cara Deploy ke Cloudflare Pages via GitHub

1. Ekstrak seluruh isi file ZIP ke folder lokal Anda.
2. Unggah/commit semua file tersebut ke repository GitHub:
   ```bash
   git add .
   git commit -m "feat: integrate Supabase authentication and cloud progress sync"
   git push origin main
   ```
3. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
4. Pilih repository `English-Mastery`.
5. Pengaturan Build:
   - **Framework preset**: `Vite` (atau `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (kosongkan)
6. Masukkan **Environment Variables**:
   - `VITE_SUPABASE_URL`: `https://cedpkkgtqrrbexisdrhx.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_Z3CzHePjNwFfjZJBRhrB2w_dbmbGD9l`
7. Klik **Save and Deploy**.

> **Catatan Routing Cloudflare Pages:** Proyek ini memanfaatkan native SPA routing fallback Cloudflare Pages. Routing internal seperti `/flashcards`, `/review`, `/login`, dan `/profile` dapat diakses langsung maupun di-refresh tanpa error 404 dan tanpa file `_redirects` yang menyebabkan loop.
