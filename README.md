# 🖼️ NETTEXT  – Digital Art Engine

> Ubah foto Anda menjadi seni digital ASCII/Matrix dengan efek dinamis (gelombang, cahaya, aberasi kromatik) – berjalan langsung di browser, tanpa instalasi.

![Demo GIF placeholder](https://via.placeholder.com/800x400?text=Demo+NETTEXT+PRO)  
*(Tambahkan screenshot/GIF hasil karya Anda di sini)*

## ✨ Fitur Unggulan
- **Upload & Drag-and-Drop** – dukung gambar besar (otomatis di-resize hingga 1024px, anti crash HP).
- **Grid Karakter Dinamis** – atur resolusi, sensitivitas objek, dan campuran warna Euler.
- **Efek Real-time**:
  - 🌊 Gelombang (wave) pada teks
  - ✨ Glow & bayangan neon
  - 🔴🔵 Aberasi kromatik (chromatic aberration)
  - 🌧️ Latar Matrix Rain atau Perlin Noise
- **Tema Warna** – Cyberpunk 3D, Hijau, Cyan, Amber, Neon, atau warna asli.
- **Kontrol Penuh** – kontras, intensitas latar, karakter khusus, rasio aspek.
- **Mode Mask** – lihat area foreground yang terdeteksi.
- **Optimasi Kinerja** – stabil di ponsel menengah ke atas.

## 🔗 Demo Langsung
Aktifkan GitHub Pages, lalu buka:  
[https://ehisyex-coder.github.io/Nettext-Matrix-/](https://ehisyex-coder.github.io/Nettext-Matrix-/)  
*(Jika belum aktif, buka Settings > Pages > pilih branch `main` dan simpan)*

## 📸 Contoh Hasil
| Sebelum | Sesudah |
|---------|---------|
| (foto asli) | (hasil NETTEXT) |

## 🛠️ Cara Menggunakan
1. **Buka halaman** – melalui link demo atau buka file `index.html` secara lokal.
2. **Upload gambar** – klik "UPLOAD" atau seret gambar ke area yang ditandai.
3. **Atur parameter** – geser slider, ganti tema, ubah karakter sesuai selera.
4. **Simpan hasil** – klik "SIMPAN" untuk mengunduh sebagai PNG.

## 🧰 Teknologi
- HTML5, CSS3 (variabel, flex/grid, animasi)
- JavaScript ES6 (Canvas API, requestAnimationFrame)
- Deteksi tepi (Sobel) + saliency berbasis warna
- Morphologi mask (dilasi/erosi)
- Tidak ada library eksternal – 100% vanilla

## 📁 Struktur Proyek
Nettext-Matrix-/
├── index.html                    # Aplikasi utama (semua dalam satu file)
├── README.md                     # Ini
└── .github/
└── copilot-instructions.md   # Panduan untuk GitHub Copilot

# 🚀 Upgrade & Kontribusi
Proyek ini dirancang agar mudah ditingkatkan dengan bantuan AI (GitHub Copilot).  
Lihat file `.github/copilot-instructions.md` untuk petunjuk prioritas upgrade.

Ingin berkontribusi? Silakan buka *issue* atau *pull request*.

## 📄 Lisensi
MIT © [ehisyex-coder](https://github.com/ehisyex-coder)

---

Dibuat dengan ❤️ dan banyak karakter `0x5F`  
*NETTEXT – Seni dari kode, hidup dari piksel.*
