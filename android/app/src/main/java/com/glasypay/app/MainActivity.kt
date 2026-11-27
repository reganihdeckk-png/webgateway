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
    var showQris by remember { mutableStateOf(false) }
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(
                modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp),
                verticalArrangement = Arrangement.Center
            ) {
                Text("GLASYPAY", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                Text("Dompet digital dan pembayaran", style = MaterialTheme.typography.bodyMedium)
                Spacer(Modifier.height(28.dp))
                Card {
                    Column(Modifier.fillMaxWidth().padding(20.dp)) {
                        Text("Pembayaran QRIS", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(8.dp))
                        Text("Bayar melalui aplikasi bank atau dompet digital yang mendukung QRIS.")
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = { showQris = !showQris }, modifier = Modifier.fillMaxWidth()) {
                            Text(if (showQris) "Tutup informasi QRIS" else "Lihat informasi QRIS")
                        }
                    }
                }
                if (showQris) {
                    Spacer(Modifier.height(16.dp))
                    Card {
                        Column(Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("GLASSY X PREMKU, Konter", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text("NMID: ID1026510716552")
                            Text("Kode merchant: A01")
                            Spacer(Modifier.height(16.dp))
                            Text("Gambar QRIS merchant belum disertakan dalam build ini.", style = MaterialTheme.typography.bodyMedium)
                            Text("Jangan melakukan pembayaran sebelum QR asli ditampilkan dan detail merchant cocok.", style = MaterialTheme.typography.bodySmall)
                            Spacer(Modifier.height(12.dp))
                            Text("QRIS ini bersifat statis. Nominal tidak otomatis terisi dan transaksi tidak otomatis terverifikasi oleh GLASYPAY.", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
                Spacer(Modifier.height(20.dp))
                Text("Status pembayaran", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("Belum ada pembayaran yang diproses. Jangan menganggap pembayaran berhasil hanya karena QR ditampilkan.", style = MaterialTheme.typography.bodyMedium)
                Spacer(Modifier.height(24.dp))
                Text("Versi pengembangan • Payment gateway nonaktif", style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}
