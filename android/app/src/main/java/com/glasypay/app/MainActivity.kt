package com.glasypay.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { GlasyPayApp() }
    }
}

@Composable
private fun GlasyPayApp() {
    var showQris by remember { mutableStateOf(true) }
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(
                modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp),
                verticalArrangement = Arrangement.Top
            ) {
                Text("GLASYPAY", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                Text("Pembayaran produk dan layanan", style = MaterialTheme.typography.bodyMedium)
                Spacer(Modifier.height(24.dp))

                Card {
                    Column(Modifier.fillMaxWidth().padding(20.dp)) {
                        Text("Cara pembayaran", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(8.dp))
                        Text("1. Pilih produk atau layanan dan buat pesanan.")
                        Text("2. Bayar dengan QRIS merchant yang ditampilkan setelah aset QRIS resmi dipasang.")
                        Text("3. Simpan bukti transaksi dan kirim melalui fitur unggah resmi saat tersedia.")
                        Text("4. Tunggu admin memeriksa dana masuk sebelum pesanan diproses.")
                    }
                }

                Spacer(Modifier.height(16.dp))
                Card {
                    Column(Modifier.fillMaxWidth().padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("QRIS merchant", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                            Spacer(Modifier.weight(1f))
                            TextButton(onClick = { showQris = !showQris }) {
                                Text(if (showQris) "Sembunyikan" else "Detail")
                            }
                        }
                        if (showQris) {
                            Spacer(Modifier.height(8.dp))
                            Text("GLASSY X PREMKU, Konter", fontWeight = FontWeight.Bold)
                            Text("NMID: ID1026510716552")
                            Text("Kode merchant: A01")
                            Spacer(Modifier.height(12.dp))
                            Text(
                                "Aset gambar QRIS asli belum dipasang. Untuk mencegah pembayaran ke QR yang salah, aplikasi belum menampilkan kode pengganti.",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "QRIS statis tidak mengisi nominal otomatis dan tidak mengirim konfirmasi pembayaran ke aplikasi. Admin wajib mencocokkan transaksi pada akun merchant resmi.",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }

                Spacer(Modifier.height(16.dp))
                Card {
                    Column(Modifier.fillMaxWidth().padding(20.dp)) {
                        Text("Status layanan", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(6.dp))
                        Text("Pembayaran live: nonaktif")
                        Text("Pembuatan pesanan dan unggah bukti: belum terhubung")
                        Text("Pemeriksaan admin: belum terhubung")
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Jangan mengirim pembayaran sampai QRIS asli tampil dan detail merchant cocok. Unggah bukti saja tidak berarti pembayaran berhasil.",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
                Spacer(Modifier.height(24.dp))
                Text("GLASYPAY • Versi pengembangan", style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}
