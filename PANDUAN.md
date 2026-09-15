# Aplikasi Inspeksi HSE Mobile Web

## Isi file

- `index.html`: aplikasi utama untuk GitHub Pages.
- `Code.gs`: backend Google Apps Script untuk Google Sheets dan Google Drive.

## 1. Siapkan Google Drive dan Spreadsheet

1. Buat folder di Google Drive, misalnya `Foto Inspeksi HSE`.
2. Salin ID folder dari URL. Pada `https://drive.google.com/drive/folders/ID_FOLDER`, bagian `ID_FOLDER` adalah ID yang dibutuhkan.
3. Buat Google Spreadsheet kosong, misalnya `Database Inspeksi HSE`.
4. Salin ID Spreadsheet dari URL. Pada `https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit`, bagian `ID_SPREADSHEET` adalah ID yang dibutuhkan.

## 2. Pasang backend Apps Script

1. Buka `https://script.google.com`, lalu buat project baru.
2. Hapus contoh kode, lalu salin seluruh isi `Code.gs`.
3. Isi `SPREADSHEET_ID` dan `DRIVE_FOLDER_ID`.
4. Buat token acak minimal 32 karakter. Isi token yang sama pada `APP_TOKEN` di `Code.gs` dan `index.html`.
5. Klik **Deploy**, **New deployment**, pilih **Web app**.
6. Atur **Execute as: Me** dan **Who has access: Anyone**.
7. Klik **Deploy**, izinkan akses Google, lalu salin URL Web App yang berakhiran `/exec`.
8. Tempel URL tersebut pada `API_URL` di `index.html`.

Jika `Code.gs` diubah, buat deployment versi baru melalui **Manage deployments**, **Edit**, **New version**, lalu **Deploy**.

## 3. Publikasikan melalui GitHub Pages

1. Buat repository GitHub baru. Pilih **Private** bila akun GitHub mendukung Pages untuk repository private. Jika memakai repository public, token di HTML dapat terlihat oleh siapa pun.
2. Upload `index.html` ke root repository, lalu commit.
3. Buka **Settings**, **Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main`, folder `/root`, lalu **Save**.
6. Tunggu deployment selesai. Buka alamat yang diberikan GitHub Pages.

## 4. Cara memakai

1. Buka aplikasi dari HP.
2. Isi tanggal, lokasi, inspector, severity, kategori, deskripsi, tindakan, checklist, dan foto.
3. Tekan **Simpan ke Google Drive**.
4. Baris data masuk ke Spreadsheet. Foto masuk ke folder Drive. URL foto tercatat pada baris yang sama.
5. Buka Dashboard untuk melihat total, persentase Close, grafik kategori, dan grafik severity.
6. Pada Data Temuan, gunakan tombol **Tutup** atau **Buka** untuk mengubah status.
7. Gunakan **Export Excel** atau **Export PDF** untuk mengunduh laporan.

## Catatan keamanan dan operasional

- Jangan membagikan URL Apps Script dan token kepada pihak yang tidak berwenang.
- Token dalam HTML adalah penghambat akses sederhana, bukan autentikasi tingkat perusahaan. Untuk data sensitif, gunakan login Google dengan backend terautentikasi.
- Deployment Apps Script dengan akses `Anyone` diperlukan agar GitHub Pages dapat mengirim data tanpa login Google setiap saat.
- Batas dan kuota Google Apps Script serta Google Drive tetap berlaku.
- Aplikasi memerlukan internet saat menyimpan, membaca dashboard, dan memuat library ekspor. Data tidak disimpan permanen di browser.
- Nomor temuan menggunakan kunci backend, sehingga dua pengguna yang mengirim data bersamaan tetap memperoleh nomor berbeda.
- Checklist disusun untuk inspeksi umum. Sesuaikan dengan HIRADC, prosedur internal, konteks organisasi, dan persyaratan hukum yang berlaku.
