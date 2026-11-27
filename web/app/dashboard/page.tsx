"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft,LogOut,ShieldCheck,ShoppingBag,Users,Wallet } from "lucide-react";
const API=process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8787";
type User={id:string;name:string;email:string;role:string};
export default function DashboardPage(){
 const router=useRouter();const [user,setUser]=useState<User|null>(null);const [counts,setCounts]=useState<Record<string,number>|null>(null);const [error,setError]=useState("");
 useEffect(()=>{fetch(API+"/api/auth/me",{credentials:"include"}).then(async r=>{if(!r.ok)throw new Error("Silakan masuk terlebih dahulu.");return r.json()}).then(x=>setUser(x.data)).catch(e=>{setError(e.message);router.replace("/login")});},[router]);
 useEffect(()=>{if(user?.role==="admin")fetch(API+"/api/admin/overview",{credentials:"include"}).then(r=>r.json()).then(x=>{if(x.success)setCounts(x.data)}).catch(()=>{});},[user]);
 async function logout(){await fetch(API+"/api/auth/logout",{method:"POST",credentials:"include"});router.replace("/");}
 if(!user)return <main className="auth-shell"><div className="empty-state">{error||"Memuat akun..."}</div></main>;
 return <main className="dashboard-shell"><header className="dash-nav"><a className="brand" href="/"><span className="brand-mark">G</span> GLASSY STORE</a><button className="logout-button" onClick={logout}><LogOut size={16}/> Keluar</button></header>
 <section className="dash-content"><a href="/" className="back-link"><ArrowLeft size={15}/> Beranda</a><span className="eyebrow">PERSONAL SPACE</span><h1>Halo, {user.name}</h1><p>Selamat datang di ruang akun GLASSY STORE.</p>
 <div className="dash-profile"><div className="profile-avatar">{user.name.slice(0,1).toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.email}</span></div><span className="role-pill">{user.role}</span></div>
 {user.role==="admin"&&<><h2>Ringkasan admin</h2><div className="dash-stats">{[{label:"Pengguna",value:counts?.users,icon:Users},{label:"Produk",value:counts?.products,icon:ShoppingBag},{label:"Pesanan",value:counts?.orders,icon:ShieldCheck},{label:"Deposit",value:counts?.deposits,icon:Wallet}].map(item=><article key={item.label}><item.icon/><span>{item.label}</span><strong>{item.value??"—"}</strong></article>)}</div></>}
 <div className="dash-notice"><ShieldCheck/><div><strong>Akun dasar aktif</strong><span>Fitur transaksi dan saldo belum diaktifkan sampai integrasi supplier dan pembayaran diverifikasi.</span></div></div>
 </section></main>;
}
