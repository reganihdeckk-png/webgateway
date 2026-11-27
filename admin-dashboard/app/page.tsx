const items = [
  ["Pengguna", "Belum tersedia"],
  ["Dompet dan ledger", "Belum tersedia"],
  ["Transaksi", "Belum tersedia"],
  ["Payment gateway", "Nonaktif"]
];
export default function Home() {
  return <main>
    <header><div><strong>GLASYPAY</strong><div className="muted">Admin Console</div></div><span className="tag">DEVELOPMENT</span></header>
    <section className="panel">
      <h1>Ringkasan sistem</h1>
      <p className="muted">Dashboard awal untuk pengembangan. Data operasional belum ditampilkan karena autentikasi admin dan API belum selesai.</p>
    </section>
    <section className="panel">
      <h2>Modul</h2>
      {items.map(([name,status])=><p key={name}><strong>{name}</strong><br/><span className="muted">{status}</span></p>)}
    </section>
    <section className="panel"><strong>Catatan keamanan</strong><p className="muted">Jangan gunakan dashboard ini untuk mengelola transaksi atau data pelanggan nyata. Login, RBAC, audit trail dan API belum diimplementasikan.</p></section>
  </main>;
}
