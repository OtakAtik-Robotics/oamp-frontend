# OAMP Frontend Dashboard

**Status: Dalam tahap pengembangan**

Repositori ini berisi antarmuka web (frontend) untuk platform OtakAtik-Robotics. Program web ini dirancang secara sederhana, ringan, dan responsif agar dapat diakses melalui berbagai perangkat (komputer maupun telepon seluler) tanpa memerlukan proses instalasi yang rumit. 

Web ini berfungsi sebagai dashboard utama yang terhubung langsung dengan sistem backend OAMP.

## Fitur Utama

1. **Input Data**: Formulir pendaftaran peserta baru (menyimpan UID, nama, usia, kelas, jenis kelamin, tinggi, dan berat badan) ke dalam database.
2. **Ranking (Leaderboard)**: Menampilkan papan peringkat peserta secara real-time berdasarkan skor permainan (Visuo-Spatial Fit dan waktu penyelesaian).
3. **Pemantauan Data**: Memantau status koneksi antara web, server backend, dan database.
4. **Ekspor Laporan**: Mengunduh seluruh data peserta dan hasil sesi permainan ke dalam format dokumen Excel (.xlsx) atau PDF (.pdf).

## Teknologi yang Digunakan

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- Bootstrap 5 (via CDN untuk desain antarmuka)

Sistem ini menerapkan konsep Single Page Application (SPA) sederhana menggunakan JavaScript murni, tanpa memerlukan Node.js atau framework tambahan seperti React/Vue.

## Fitur Keamanan (Security)

Frontend ini telah dilengkapi dengan beberapa lapisan keamanan standar:
- **Content Security Policy (CSP)**: Membatasi eksekusi skrip hanya dari sumber yang dipercaya.
- **Sanitasi XSS**: Mencegah serangan Cross-Site Scripting dengan mengubah karakter tag HTML berbahaya menjadi teks biasa.
- **Validasi Input & Batasan Karakter**: Memastikan format data yang dikirim sesuai dengan tipe database dan tidak melebihi batas karakter.
- **Pencegahan Spam (Double Submit)**: Menonaktifkan tombol pengiriman saat sistem sedang memproses data untuk menghindari duplikasi input.

## Cara Penggunaan

1. Pastikan program backend (`oamp-backend`) sudah berjalan secara lokal di `http://localhost:8080`.
2. Buka folder `oamp-frontend` di komputer Anda.
3. Klik dua kali pada file `index.html` untuk membukanya di browser (Google Chrome, Mozilla Firefox, Microsoft Edge, dll).
4. Web sudah siap digunakan untuk memasukkan dan memantau data.

## Struktur Direktori

```text
oamp-frontend/
├── index.html    # Kerangka utama halaman web
├── style.css     # Pengaturan tema dan gaya tampilan (Light Theme)
├── app.js        # Logika sistem, keamanan, dan koneksi API ke Backend
└── README.md     # Dokumentasi program
```