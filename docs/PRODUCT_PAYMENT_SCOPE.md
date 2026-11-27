# GLASYPAY — Ruang Lingkup Pembayaran Produk dan Jasa

## Keputusan produk
GLASYPAY pada tahap pertama digunakan untuk menerima pembayaran atas produk atau jasa yang benar-benar dijual oleh merchant. GLASYPAY **bukan** dompet elektronik, layanan transfer antarpengguna, atau layanan pencairan saldo.

## Alur pembayaran QRIS manual
1. Pelanggan memilih produk/jasa dan membuat pesanan dengan nomor referensi unik.
2. Backend menyimpan pesanan beserta nominal yang harus dibayar dan status `awaiting_payment`.
3. Aplikasi menampilkan QRIS merchant yang sah dan informasi merchant yang konsisten.
4. Pelanggan mengirim bukti pembayaran melalui kanal unggah privat. Bukti tidak boleh disimpan pada URL publik.
5. Backend membuat pengajuan pembayaran berstatus `pending_review`; unggahan bukti tidak otomatis berarti pembayaran berhasil.
6. Admin yang telah login dan memiliki izin khusus memeriksa transaksi pada kanal merchant resmi serta mencocokkan nominal, waktu, dan referensi.
7. Admin menyetujui atau menolak dengan alasan. Setiap keputusan dicatat dalam audit log.
8. Hanya pesanan yang disetujui setelah pemeriksaan dana masuk yang boleh diteruskan ke proses pemenuhan produk/jasa.

## Batasan wajib
- Jangan menambah saldo pelanggan dari pembayaran QRIS.
- Jangan menyediakan transfer, penarikan, P2P, atau penyimpanan nilai uang pelanggan.
- Jangan menandai pesanan lunas hanya karena pelanggan mengunggah tangkapan layar.
- Jangan menerima keputusan admin tanpa autentikasi, otorisasi berbasis peran, dan audit log.
- Jangan menyimpan QRIS atau bukti transaksi pada repositori publik.
- Jangan mengaktifkan pembayaran live sampai merchant, QRIS, akun bisnis, dan prosedur operasional diverifikasi oleh pemilik usaha dewasa yang berwenang.
- Rahasia API hanya boleh dimasukkan melalui secret manager/deployment secrets, bukan source code atau chat.

## Prasyarat implementasi produksi
- Identitas merchant dan izin penggunaan QRIS dikonfirmasi.
- QRIS resmi diperoleh dari penyedia/merchant dan diverifikasi sebelum dipasang.
- API autentikasi pelanggan dan admin, sesi aman, pembatasan percobaan, serta otorisasi admin diterapkan.
- Penyimpanan bukti privat dengan validasi tipe/ukuran file, nama objek acak, dan akses terbatas tersedia.
- Endpoint pesanan, pengajuan pembayaran, antrean review, keputusan admin, dan riwayat pesanan terhubung ke D1.
- Log audit tidak dapat diubah oleh pengguna biasa.
- Pengujian integrasi, keamanan, backup, dan pemulihan selesai.
- Domain, CORS, rate limiting, monitoring, dan kebijakan privasi/retensi data ditetapkan.

## Status saat dokumen ini dibuat
Dokumen ini menetapkan ruang lingkup dan aturan bisnis, bukan bukti bahwa fitur produksi sudah tersedia. Worker saat ini masih memiliki endpoint placeholder untuk sebagian besar API. Dashboard review belum terhubung ke autentikasi, database, atau unggahan privat. Aset gambar QRIS belum dipasang ke aplikasi. Pembayaran live harus tetap nonaktif sampai seluruh prasyarat di atas terpenuhi.


## Aset QRIS merchant — persetujuan dan status
- Pemilik/pengguna menyatakan izin publikasi aset QRIS di repository publik telah diperoleh dari merchant.
- Informasi yang terlihat pada gambar yang diberikan: nama merchant "GLASSY X PREMKU, Konter" (teks pada gambar terpotong), NMID "ID1026510716552", kode "A01".
- Persetujuan publikasi bukan verifikasi independen atas kepemilikan, status aktif, atau settlement QRIS.
- File gambar belum tersimpan sebagai aset di repository dan belum disertakan dalam APK. Jangan menampilkan QR pengganti atau membuat ulang pola QR dari tebakan.
- Sebelum rilis, unggah file asli sebagai aset statis, pastikan file dapat dipindai oleh beberapa aplikasi pembayaran, dan cocokkan nama merchant/NMID pada layar konfirmasi pembayaran.


## URL aset QRIS untuk aplikasi Android
- URL gambar yang diberikan pengguna: https://cdn.phototourl.com/anon/2026-11-27-1e3a68a5-d52e-4ddb-8880-940577d4e7a1.jpg
- Android memuat gambar melalui Coil dari URL HTTPS tersebut.
- Ketersediaan URL dari lingkungan build belum berhasil diverifikasi; uji pemuatan pada perangkat dan pastikan URL mengembalikan gambar secara langsung.
- Jika URL berubah, perbarui konstanta QRIS_IMAGE_URL di MainActivity.kt.
