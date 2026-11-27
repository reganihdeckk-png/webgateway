"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft,PackageCheck,Sparkles } from "lucide-react";
const API=process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8787";
type Product={id:string;name:string;slug:string;description?:string;price_minor:number;currency:string;stock:number;image_url?:string;category_name?:string};
export default function ProductDetailPage(){
 const params=useParams<{slug:string}>();const [product,setProduct]=useState<Product|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{const controller=new AbortController();fetch(API+"/api/products/"+encodeURIComponent(params.slug),{signal:controller.signal}).then(async r=>{const x=await r.json();if(!r.ok)throw new Error(x.message??"Produk tidak ditemukan.");return x}).then(x=>setProduct(x.data)).catch(e=>{if(e.name!=="AbortError")setError(e.message)}).finally(()=>setLoading(false));return()=>controller.abort()},[params.slug]);
 const money=(value:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
 return <main className="detail-shell"><header className="nav-glass"><Link className="brand" href="/"><span className="brand-mark">G</span> GLASSY STORE</Link><Link className="nav-login" href="/login">Masuk</Link></header><section className="detail-content"><Link href="/" className="back-link"><ArrowLeft size={15}/> Kembali ke katalog</Link>{loading?<div className="empty-state">Memuat detail produk...</div>:error?<div className="empty-state">{error}</div>:product&&<article className="detail-card"><div className="detail-image">{product.image_url?<img src={product.image_url} alt={product.name}/>:<Sparkles size={48}/>}</div><div className="detail-copy"><span className="eyebrow">{product.category_name??"DIGITAL PRODUCT"}</span><h1>{product.name}</h1><p>{product.description??"Informasi produk belum tersedia."}</p><div className="detail-stock"><PackageCheck size={17}/> {product.stock} tersedia</div><strong className="detail-price">{money(product.price_minor)}</strong><div className="detail-info">Pembelian online belum diaktifkan. Sistem order akan tersedia setelah integrasi supplier dan pengujian keamanan selesai.</div><button className="primary-button" disabled>Segera hadir</button></div></article>}</section></main>
}
