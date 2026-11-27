const stages = [
  ["Menunggu pemeriksaan", "pending_review"],
  ["Perlu informasi", "needs_information"],
  ["Disetujui", "approved"],
  ["Ditolak", "rejected"]
];
export default function Home() {
  return <main>
    <header><div><strong>GLASYPAY</strong><div className="muted">Admin Console · QRIS manual review</div></div><span className="tag">PROTOTYPE</span></header>
    <section className="panel">
      <h1>Pemeriksaan pembayaran QRIS</h1>
      <p className="muted">Alur pemeriksaan manual untuk QRIS GLASSY X PREMKU, Konter · NMID ID1026510716552.</p>
      <p className="notice">Dashboard ini masih prototipe. Belum terhubung ke database, autentikasi admin, unggahan bukti, atau API keputusan.</p>
    </section>
    <section className="panel">
      <h2>Alur status</h2>
      {stages.map(([label,status])=><div className="stage" key={status}><strong>{label}</strong><code>{status}</code></div>)}
    </section>
    <section className="panel">
      <h2>Aturan pemeriksaan</h2>
      <ol>
        <li>Cocokkan ID pesanan dan nominal.</li>
        <li>Periksa transaksi masuk langsung di DANA Bisnis.</li>
        <li>Periksa waktu, referensi, dan identitas merchant bila tersedia.</li>
        <li>Catat keputusan dan alasan pemeriksaan.</li>
      </ol>
      <p className="muted">Jangan menyetujui hanya berdasarkan screenshot. Status persetujuan manual ini tidak otomatis menambah saldo wallet.</p>
    </section>
    <section className="panel"><strong>Keamanan</strong><p className="muted">Login admin, role-based access, penyimpanan bukti privat, audit log yang terhubung, dan API keputusan harus selesai sebelum dashboard dipakai untuk transaksi nyata.</p></section>
  </main>;
}
