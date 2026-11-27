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
