# Birthday Letter untuk Muhamad Nova Efendi 🩷

Website ulang tahun digital bertema **pink romantis** dengan 9 scene interaktif: pembuka (kucing & efek hati), kunci tanggal rahasia, foto, **kolase cinta**, ucapan, jarak Gorontalo — Bandung, tiga alasan (dengan teddy bear), kalender November 2007, dan surat penutup.

## Struktur
```text
birthday-website/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── nova-photo.jpg
│   ├── collage/           (5 foto untuk scene kolase)
│   └── birthday-music.mp3
└── fallback/          (cadangan otomatis, jangan dihapus)
    ├── photo-fallback.js
    ├── collage-fallback.js
    └── music-fallback.js
```

## Menjalankan
Buka folder ini di VS Code → klik kanan `index.html` → **Open with Live Server** (atau klik dua kali `index.html`). Klik **Mulai Kejutan**; musik menyala setelah klik pertama (aturan browser), tombol ♫ untuk mematikan.

## Konfigurasi cepat (bagian atas `script.js`)
- `SECRET_DATE = '09102026'` — kunci halaman 2 (09 – 10 – 2026, format DDMMYYYY).
- `BIRTH = { year: 2007, month: 11, day: 15 }` — kalender dibuat otomatis dari sini (15 November 2007 = hari Kamis).
- Teks lain ada di `index.html`.

## Catatan
- Foto: `nova-photo.jpg`. Jika gagal dimuat, script mencoba lokasi lain lalu `photo-fallback.js` (berisi foto yang sama). Jika mengganti foto, ganti juga isi fallback atau hapus folder `fallback/`.
- Google Fonts butuh internet; ada font cadangan jika offline.
- Animasi dikurangi otomatis untuk pengguna dengan "reduce motion".
- Untuk publikasi, unggah seluruh folder ke GitHub Pages atau Netlify.

## Scene kolase cinta (scene 4)
Lima foto polaroid dengan selotip, satu foto berbentuk hati, untaian hati yang berayun, dan tombol **Kirim cinta**. Ketuk foto untuk pratinjau layar penuh (tombol sebelumnya/berikutnya, panah keyboard, Esc untuk menutup). Foto ada di `folder utama (root)`; jika gagal dimuat, dicoba lokasi lain lalu `collage-fallback.js` (versi kecil), dan jika tetap gagal tampil ikon hati. Untuk mengganti foto, ganti berkas di `folder utama (root)` dengan nama yang sama.
