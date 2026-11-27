export interface Env {
  DB: D1Database;
  APP_NAME?: string;
  APP_ENV?: string;
  ALLOWED_ORIGIN?: string;
  SESSION_TTL_SECONDS?: string;
  PREMKU_BASE_URL?: string;
  PREMKU_API_KEY?: string;
  PREMKU_API_SECRET?: string;
  PREMKU_AUTH_MODE?: string;
}

type UserRow = { id:string; name:string; email:string; role:string; password_hash?:string; is_active:number };
const json = (data: unknown, status = 200, extra: HeadersInit = {}): Response => {
  const headers = new Headers(extra);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "same-origin");
  return new Response(JSON.stringify(data), { status, headers });
};
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const encoder = new TextEncoder();
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb64 = (value: string) => Uint8Array.from(atob(value.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-value.length%4)%4)), c=>c.charCodeAt(0));
async function digest(value: string): Promise<string> {
  return b64(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}
async function passwordHash(password: string, salt = b64(crypto.getRandomValues(new Uint8Array(16)))): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:unb64(salt),iterations:310000,hash:"SHA-256"},key,256);
  return "pbkdf2$310000$"+salt+"$"+b64(new Uint8Array(bits));
}
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, rounds, salt, expected] = stored.split("$");
  if (scheme !== "pbkdf2" || rounds !== "310000" || !salt || !expected) return false;
  const actual = await passwordHash(password,salt);
  return actual === stored;
}
function cookie(request: Request, name: string, value: string, maxAge: number): string {
  const secure = new URL(request.url).protocol === "https:";
  const sameSite = secure ? "None; Secure" : "Lax";
  return name+"="+value+"; HttpOnly; Path=/; SameSite="+sameSite+"; Max-Age="+maxAge;
}
function clearCookie(request: Request): string { return cookie(request,"glassy_session","",0); }
function sessionFrom(request: Request): string | null {
  const raw=request.headers.get("Cookie") ?? "";
  const part=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith("glassy_session="));
  return part ? decodeURIComponent(part.slice("glassy_session=".length)) : null;
}
async function getUser(request: Request, env: Env): Promise<UserRow | null> {
  const token=sessionFrom(request);
  if (!token) return null;
  const tokenHash=await digest(token);
  const row=await env.DB.prepare("SELECT u.id,u.name,u.email,u.role,u.is_active FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id_hash=? AND s.expires_at>datetime('now') AND u.is_active=1").bind(tokenHash).first<UserRow>();
  return row ?? null;
}
function originAllowed(request: Request, env: Env): boolean {
  const origin=request.headers.get("Origin");
  if (!origin) return true;
  return Boolean(env.ALLOWED_ORIGIN && origin === env.ALLOWED_ORIGIN);
}
async function bodyObject(request: Request): Promise<Record<string,unknown> | null> {
  const type=request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return null;
  const length=Number(request.headers.get("content-length") ?? 0);
  if (length>12000) return null;
  try { const value=await request.json(); return value && typeof value==="object" && !Array.isArray(value) ? value as Record<string,unknown> : null; }
  catch { return null; }
}
async function limited(env: Env, key: string): Promise<boolean> {
  const now=Math.floor(Date.now()/1000);
  const row=await env.DB.prepare("SELECT attempts,window_started_at,blocked_until FROM auth_rate_limits WHERE bucket=?").bind(key).first<{attempts:number;window_started_at:number;blocked_until:number|null}>();
  if (row?.blocked_until && row.blocked_until>now) return true;
  if (!row || now-row.window_started_at>=900) {
    await env.DB.prepare("INSERT INTO auth_rate_limits(bucket,attempts,window_started_at,blocked_until) VALUES(?,0,?,NULL) ON CONFLICT(bucket) DO UPDATE SET attempts=0,window_started_at=excluded.window_started_at,blocked_until=NULL").bind(key,now).run();
    return false;
  }
  return row.attempts>=8;
}
async function recordFailure(env: Env,key: string): Promise<void> {
  const now=Math.floor(Date.now()/1000);
  await env.DB.prepare("INSERT INTO auth_rate_limits(bucket,attempts,window_started_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1,blocked_until=CASE WHEN attempts+1>=8 THEN ? ELSE blocked_until END").bind(key,now,now+900).run();
}
function validEmail(email:string):boolean { return email.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url=new URL(request.url);
    if (request.method==="OPTIONS") {
      const origin=request.headers.get("Origin");
      if (!origin || !env.ALLOWED_ORIGIN || origin!==env.ALLOWED_ORIGIN) return new Response(null,{status:403});
      return new Response(null,{status:204,headers:{
        "access-control-allow-origin":origin,
        "access-control-allow-methods":"GET, POST, OPTIONS",
        "access-control-allow-headers":"Content-Type",
        "access-control-allow-credentials":"true",
        "access-control-max-age":"600",
        "vary":"Origin"
      }});
    }
    if (["POST","PUT","PATCH","DELETE"].includes(request.method) && !originAllowed(request,env)) return json({success:false,message:"Origin not allowed"},403);
    let response:Response;
    try {
      if (url.pathname==="/api/health" && request.method==="GET") {
        response=json({success:true,app:env.APP_NAME??"GLASSY STORE",status:"ok",supplier:"not_configured_until_official_auth_is_verified"});
      } else if (url.pathname==="/api/auth/register" && request.method==="POST") {
        const input=await bodyObject(request);
        const name=typeof input?.name==="string"?input.name.trim():"";
        const email=typeof input?.email==="string"?input.email.trim().toLowerCase():"";
        const password=typeof input?.password==="string"?input.password:"";
        if (!input || name.length<2 || name.length>80 || !validEmail(email) || password.length<10 || password.length>128) {
          response=json({success:false,message:"Periksa nama, email, dan kata sandi (minimal 10 karakter)."},400);
        } else {
          const bucket="register:"+await digest(email);
          if (await limited(env,bucket)) response=json({success:false,message:"Terlalu banyak percobaan. Coba lagi nanti."},429);
          else {
            const exists=await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
            if (exists) { await recordFailure(env,bucket); response=json({success:false,message:"Email sudah terdaftar."},409); }
            else {
              const id=crypto.randomUUID(), hash=await passwordHash(password);
              await env.DB.prepare("INSERT INTO users(id,name,email,password_hash,role) VALUES(?,?,?,?,'member')").bind(id,name,email,hash).run();
              response=json({success:true,message:"Akun berhasil dibuat. Verifikasi email perlu diaktifkan sebelum penggunaan produksi.",data:{id,name,email,role:"member"}},201);
            }
          }
        }
      } else if (url.pathname==="/api/auth/login" && request.method==="POST") {
        const input=await bodyObject(request);
        const email=typeof input?.email==="string"?input.email.trim().toLowerCase():"";
        const password=typeof input?.password==="string"?input.password:"";
        if (!input || !validEmail(email) || password.length>128 || !password) response=json({success:false,message:"Email atau kata sandi tidak valid."},400);
        else {
          const bucket="login:"+await digest(email);
          if (await limited(env,bucket)) response=json({success:false,message:"Terlalu banyak percobaan. Coba lagi dalam 15 menit."},429);
          else {
            const user=await env.DB.prepare("SELECT id,name,email,role,password_hash,is_active FROM users WHERE email=?").bind(email).first<UserRow>();
            const valid=Boolean(user?.is_active===1 && user.password_hash && await verifyPassword(password,user.password_hash));
            if (!valid || !user) { await recordFailure(env,bucket); response=json({success:false,message:"Email atau kata sandi salah."},401); }
            else {
              await env.DB.prepare("DELETE FROM sessions WHERE user_id=? OR expires_at<=datetime('now')").bind(user.id).run();
              const token=b64(crypto.getRandomValues(new Uint8Array(32)));
              const ttl=Math.max(900,Math.min(2592000,Number(env.SESSION_TTL_SECONDS??604800)));
              await env.DB.prepare("INSERT INTO sessions(id_hash,user_id,expires_at) VALUES(?,?,datetime('now',?))").bind(await digest(token),user.id,"+"+ttl+" seconds").run();
              response=json({success:true,data:{id:user.id,name:user.name,email:user.email,role:user.role}},200,{"set-cookie":cookie(request,"glassy_session",token,ttl)});
            }
          }
        }
      } else if (url.pathname==="/api/auth/me" && request.method==="GET") {
        const user=await getUser(request,env);
        response=user?json({success:true,data:{id:user.id,name:user.name,email:user.email,role:user.role}}):json({success:false,message:"Unauthorized"},401);
      } else if (url.pathname==="/api/auth/logout" && request.method==="POST") {
        const token=sessionFrom(request);
        if (token) await env.DB.prepare("DELETE FROM sessions WHERE id_hash=?").bind(await digest(token)).run();
        response=json({success:true},200,{"set-cookie":clearCookie(request)});
      } else if (url.pathname==="/api/admin/overview" && request.method==="GET") {
        const user=await getUser(request,env);
        if (!user) response=json({success:false,message:"Unauthorized"},401);
        else if (user.role!=="admin") response=json({success:false,message:"Forbidden"},403);
        else {
          const [users,products,orders,deposits]=await Promise.all([
            env.DB.prepare("SELECT COUNT(*) AS total FROM users").first<{total:number}>(),
            env.DB.prepare("SELECT COUNT(*) AS total FROM products").first<{total:number}>(),
            env.DB.prepare("SELECT COUNT(*) AS total FROM orders").first<{total:number}>(),
            env.DB.prepare("SELECT COUNT(*) AS total FROM deposits").first<{total:number}>()
          ]);
          response=json({success:true,data:{users:users?.total??0,products:products?.total??0,orders:orders?.total??0,deposits:deposits?.total??0}});
        }
      } else if (url.pathname==="/api/categories" && request.method==="GET") {
        const result=await env.DB.prepare("SELECT id,name,slug,description FROM categories WHERE is_active=1 ORDER BY sort_order ASC,name ASC").all();
        response=json({success:true,data:result.results});
      } else if (url.pathname==="/api/products" && request.method==="GET") {
        const page=Math.max(1,Math.min(1000,Number(url.searchParams.get("page")??1)||1));
        const limit=Math.max(1,Math.min(50,Number(url.searchParams.get("limit")??20)||20));
        const category=url.searchParams.get("category");
        const search=(url.searchParams.get("q")??"").trim().slice(0,80);
        if (category && !slugPattern.test(category)) response=json({success:false,message:"Invalid category"},400);
        else {
          const conditions=["p.status='available'","p.stock>0","c.is_active=1"];
          const values:(string|number)[]=[];
          if(category){conditions.push("c.slug=?");values.push(category);}
          if(search){conditions.push("(p.name LIKE ? OR p.description LIKE ?)");values.push("%"+search+"%","%"+search+"%");}
          const where=conditions.join(" AND ");
          const [rows,count]=await Promise.all([
            env.DB.prepare("SELECT p.id,p.name,p.slug,p.description,p.price_minor,p.currency,p.stock,p.image_url,c.name AS category_name,c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE "+where+" ORDER BY p.name ASC LIMIT ? OFFSET ?").bind(...values,limit,(page-1)*limit).all(),
            env.DB.prepare("SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE "+where).bind(...values).first<{total:number}>()
          ]);
          response=json({success:true,data:rows.results,pagination:{page,limit,total:count?.total??0}});
        }
      } else if (url.pathname.startsWith("/api/products/") && request.method==="GET") {
        const slug=decodeURIComponent(url.pathname.slice("/api/products/".length));
        if(!slugPattern.test(slug)) response=json({success:false,message:"Product not found"},404);
        else {
          const product=await env.DB.prepare("SELECT p.id,p.name,p.slug,p.description,p.price_minor,p.currency,p.stock,p.image_url,c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.slug=? AND p.status='available' AND p.stock>0").bind(slug).first();
          response=product?json({success:true,data:product}):json({success:false,message:"Product not found"},404);
        }
      } else response=json({success:false,message:"Not found"},404);
    } catch(error) {
      console.error("request_failed",error instanceof Error?error.name:"unknown");
      response=json({success:false,message:"Internal server error"},500);
    }
    const headers=new Headers(response.headers);
    const origin=request.headers.get("Origin");
    if(origin && env.ALLOWED_ORIGIN && origin===env.ALLOWED_ORIGIN){
      headers.set("access-control-allow-origin",origin);
      headers.set("access-control-allow-credentials","true");
      headers.append("vary","Origin");
    }
    headers.set("strict-transport-security","max-age=31536000; includeSubDomains");
    headers.set("x-frame-options","DENY");
    headers.set("content-security-policy","default-src 'none'; frame-ancestors 'none'");
    return new Response(response.body,{status:response.status,headers});
  }
};
