"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail, UserRound } from "lucide-react";

const API=process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8787";
export default function AuthForm({mode}:{mode:"login"|"register"}) {
  const router=useRouter();
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const register=mode==="register";
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError("");
    try {
      const response=await fetch(API+"/api/auth/"+(register?"register":"login"),{
        method:"POST",headers:{"content-type":"application/json"},credentials:"include",
        body:JSON.stringify({name,email,password})
      });
      const result=await response.json();
      if(!response.ok) throw new Error(result.message??"Permintaan gagal.");
      if(register) router.push("/login?created=1");
      else router.push("/dashboard");
    } catch(reason) { setError(reason instanceof Error?reason.message:"Terjadi kesalahan."); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><div className="auth-glow"/><Link href="/" className="back-link"><ArrowLeft size={16}/> Kembali ke beranda</Link>
    <section className="auth-card"><div className="brand-mark auth-mark">G</div><span className="eyebrow">GLASSY STORE ACCOUNT</span>
      <h1>{register?"Buat akun baru":"Selamat datang kembali"}</h1><p>{register?"Daftar untuk menyimpan aktivitas belanjamu.":"Masuk ke akun GLASSY STORE kamu."}</p>
      <form onSubmit={submit}>
        {register&&<label>Nama lengkap<div className="auth-input"><UserRound size={17}/><input value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={80} autoComplete="name" placeholder="Nama kamu"/></div></label>}
        <label>Email<div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254} autoComplete="email" placeholder="nama@email.com"/></div></label>
        <label>Kata sandi<div className="auth-input"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={register?10:1} maxLength={128} autoComplete={register?"new-password":"current-password"} placeholder={register?"Minimal 10 karakter":"Kata sandi kamu"}/></div></label>
        {error&&<div className="auth-error" role="alert">{error}</div>}
        <button className="primary-button auth-submit" disabled={busy}>{busy?"Memproses...":register?"Buat akun":"Masuk"}</button>
      </form>
      <div className="auth-switch">{register?"Sudah punya akun?":"Belum punya akun?"} <Link href={register?"/login":"/register"}>{register?"Masuk":"Daftar"}</Link></div>
      <small className="auth-note">Jangan gunakan kata sandi yang sama dengan akun penting lainnya.</small>
    </section>
  </main>;
}
