# Traders Family HTML Rule Checker

Proyek ini digunakan untuk memverifikasi keberadaan elemen-elemen penting pada halaman HTML Traders Family. Setiap aturan (rule) mengecek keberadaan tag HTML atau teks tertentu yang wajib ada pada halaman untuk memenuhi standar branding, SEO, dan kepatuhan.

## 📦 Fitur

- Mengecek keberadaan tag `<script>` untuk data layer.
- Validasi tag meta seperti `og:image`, `twitter:image`, dan lainnya.
- Validasi link pingback dan ikon shortcut.
- Pengecekan prefetch DNS.
- Validasi tautan RSS feed.
- Pengecekan teks disclaimer dan kebijakan privasi.

## 📜 Aturan yang Dicek

Berikut adalah daftar aturan (`rules`) yang digunakan untuk memeriksa HTML:

| No  | Nama Aturan                          | Deskripsi                                                                                           |
|-----|--------------------------------------|------------------------------------------------------------------------------------------------------|
| 1   | Data layer script                    | Ada `<script>` dari `account.tradersfamily.id/embed/js/datalayer?...`                              |
| 2   | og:image meta                        | Ada tag `<meta>` dengan `name="image"` dan `property="og:image"`                                   |
| 3   | twitter:image meta                   | Ada tag `<meta>` dengan `name="twitter:image"`                                                     |
| 4   | pingback link                        | Ada link pingback ke `https://tradersfamily.id/xmlrpc.php`                                         |
| 5   | shortcut icon                        | Ada tag `<link rel="shortcut icon">`                                                               |
| 6   | og:site_name meta                    | Ada tag `<meta property="og:site_name" content="Traders Family">`                                  |
| 7   | og:title contains Traders Family     | Ada tag `<meta property="og:title" content="...Traders Family...">`                                |
| 8   | dns-prefetch s.w.org                 | Ada prefetch DNS ke `//s.w.org`                                                                    |
| 9   | dns-prefetch static2                 | Ada prefetch DNS ke `//static2.tradersfamily.id`                                                   |
| 10  | RSS feed link                        | Ada RSS feed dengan judul `Traders Family Feed`                                                    |
| 11  | Comments feed link                   | Ada RSS feed komentar dengan judul `Traders Family Comments Feed`                                  |
| 12  | disclaimer text                      | Halaman mengandung teks disclaimer tentang konten informatif                                       |
| 13  | privacy policy text                  | Halaman mengandung teks kebijakan privasi dari PT. Traders Family                                  |

## 🚀 Cara Menggunakan

1. Clone repository ini:
   ```bash
   git clone https://github.com/hanafiadhi/original-website
   cd original-website
   npm run build
   npm run dev
