# NETTEXT PRO – Digital Art Engine

## 🧠 Identitas Proyek
- Nama: NETTEXT PRO v5.1
- Jenis: Aplikasi web single-file (HTML/CSS/JS)
- Fungsi: Mengubah foto menjadi digital art berbasis karakter ASCII/Matrix dengan efek real-time (wave, glow, chromatic aberration, background dinamis).

## 🛠 Teknologi Utama
- Vanilla JavaScript (ES6)
- Canvas 2D API
- CSS3 (Grid, animasi, responsive)
- Tidak ada framework/library eksternal

## 📁 Struktur Kode (saat ini)
Semua kode berada dalam satu file `index.html`:
- `<style>`: desain UI, variabel CSS, dark theme, animasi toast & overlay.
- `<script>`: semua logika (upload gambar, edge detection, grid generation, rendering, event handlers).
- Tidak ada modul terpisah – semua fungsi global dalam IIFE.

## 🔧 Alur Pemrosesan Gambar
1. Upload / drag & drop gambar → resize maksimal 1024px (anti crash HP).
2. Hitung edge map (Sobel) + foreground mask (saliency + jarak dari tepi).
3. Buat grid karakter (kolom × baris) berdasarkan slider resolusi.
4. Hitung frekuensi lokal & fase per sel (tanpa NaN).
5. Terapkan contrast stretching aman (hindari pembagian nol).
6. Render tiap frame: background (rain / noise / kosong) + foreground teks dengan efek wave, glow, chromatic.
7. Animasi berjalan dengan `requestAnimationFrame`.

## 🎯 Prioritas Upgrade / Perbaikan (jika diminta)
1. **Optimasi performa** untuk grid > 60x60 (gunakan dirty rect atau throttling).
2. **Pisahkan kode menjadi modul ES6** (`canvas.js`, `imageProcessor.js`, `gridGenerator.js`, `effects.js`, `ui.js`).
3. **Dukungan sentuhan (mobile)** – zoom, rotasi gambar asli, touchstart/touchmove pada canvas.
4. **Simpan & muat preset parameter** ke `localStorage` (semua slider, select, customChars).
5. **Perbaiki bug potensial**:
   - `computeLocalFreqPhase` jika gambar width < 2 atau height < 2.
   - Contrast stretch saat `maxB === minB`.
   - Chromatic blend merusak background (sudah diperbaiki di v5.1, tapi perlu dipastikan).
6. **Unit testing sederhana** (menggunakan Playwright atau Puppeteer) untuk fungsi inti: `computeEdgeMap`, `computeForegroundMask`, `generateGrid`.
7. **Tambahkan indikator loading** yang lebih halus (selain progress bar).
8. **Dukungan PWA** – manifest.json dan service worker agar bisa di-install di HP.

## 📦 Petunjuk untuk Copilot Agent Mode
- Saat mengubah kode, **jangan merusak fungsionalitas existing** (upload, grid, efek).
- Jika memecah file menjadi modul, pastikan semua fungsi tetap terhubung (gunakan `export/import`).
- Tambahkan komentar JSDoc pada fungsi-fungsi penting.
- Untuk perubahan besar, buatlah **pull request** terlebih dahulu, jangan langsung commit ke main.

## 🧪 Cara menguji setelah perubahan
- Buka file `index.html` di browser desktop & mobile.
- Upload gambar dengan resolusi besar (3000px) → harus tetap stabil.
- Geser semua slider dan ganti tema – tidak boleh ada error console.
- Cek frame rate dengan metrik visual (animasi wave harus mulus).

## 🌐 URL demo (jika sudah di-GitHub Pages)
`https://ehisyex-coder.github.io/Nettext-Matrix-/`

---

Terima kasih telah membantu meningkatkan NETTEXT PRO!
