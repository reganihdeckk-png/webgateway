"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck, Sparkles, Waves } from "lucide-react";

type Product = {
  id: string; name: string; slug: string; description?: string;
  price_minor: number; currency: string; stock: number; image_url?: string;
  category_name?: string;
};
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(API + "/api/products?limit=12", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Katalog belum dapat dimuat.");
        return response.json();
      })
      .then(result => setProducts(result.data ?? []))
      .catch(reason => { if (reason.name !== "AbortError") setError(reason.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const visible = products.filter(product =>
    (product.name + " " + (product.category_name ?? "")).toLowerCase().includes(query.toLowerCase())
  );
  const rupiah = (minor: number) => new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(minor / 100);

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <nav className="nav-glass">
        <a className="brand" href="#"><span className="brand-mark">G</span><span>GLASSY<span className="brand-light"> STORE</span></span></a>
        <div className="nav-links"><a href="#products">Produk</a><a href="#trust">Keunggulan</a></div>
        <a className="nav-cta" href="#products">Jelajahi <ArrowRight size={15}/></a>
      </nav>

      <section className="hero">
        <motion.div className="hero-copy" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.65}}>
          <div className="eyebrow"><Sparkles size={14}/> YOUR TRUSTED DIGITAL MARKETPLACE</div>
          <h1>Everything digital.<br/><span>Beautifully simple.</span></h1>
          <p>Temukan kebutuhan digital favoritmu dalam pengalaman belanja yang jernih, nyaman, dan transparan.</p>
          <a className="primary-button" href="#products">Jelajahi produk <ArrowRight size={17}/></a>
          <div className="hero-proof"><ShieldCheck size={16}/> Katalog terhubung ke database</div>
        </motion.div>
        <motion.div className="hero-art" initial={{opacity:0,scale:.94}} animate={{opacity:1,scale:1}} transition={{duration:.8}}>
          <div className="orb orb-back"/><div className="orb orb-front"/>
          <div className="glass-tile"><Waves size={35}/><strong>GLASSY</strong><span>Crystal clear experience</span></div>
          <div className="float-chip chip-top">✦ Digital essentials</div><div className="float-chip chip-bottom">Secure by design</div>
        </motion.div>
      </section>

      <section className="trust-row" id="trust">
        <div><ShieldCheck/><strong>Transparan</strong><span>Informasi produk jelas</span></div>
        <div><Sparkles/><strong>Premium feel</strong><span>Antarmuka glass modern</span></div>
        <div><Waves/><strong>Selalu terhubung</strong><span>Data dari katalog database</span></div>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading"><div><span className="eyebrow">DISCOVER GLASSY</span><h2>Produk pilihan</h2><p>Produk aktif yang tersedia di katalog.</p></div>
          <label className="search-box"><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari produk..."/></label>
        </div>
        {loading ? <div className="empty-state">Memuat katalog...</div> :
          error ? <div className="empty-state">{error} Pastikan API Worker sudah dijalankan.</div> :
          visible.length === 0 ? <div className="empty-state">Belum ada produk tersedia. Katalog akan tampil setelah sinkronisasi supplier yang valid.</div> :
          <div className="product-grid">{visible.map(product=><article className="product-card" key={product.id}>
            <div className="product-image">{product.image_url ? <img src={product.image_url} alt={product.name}/> : <div className="image-placeholder"><Sparkles size={28}/></div>}</div>
            <div className="product-meta">{product.category_name ?? "Digital product"}<span>{product.stock} tersedia</span></div>
            <h3>{product.name}</h3><p>{product.description ?? "Produk digital pilihan dari katalog GLASSY STORE."}</p>
            <div className="product-bottom"><strong>{rupiah(product.price_minor)}</strong><button disabled aria-label="Pembelian belum diaktifkan">Segera hadir</button></div>
          </article>)}</div>}
      </section>
      <footer><a className="brand" href="#"><span className="brand-mark">G</span> GLASSY STORE</a><span>© {new Date().getFullYear()} GLASSY STORE. Built with clarity.</span></footer>
    </main>
  );
}
