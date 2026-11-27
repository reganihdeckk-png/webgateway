export interface Env {
  DB: D1Database;
  APP_ENV: string;
  PAYMENTS_LIVE_ENABLED: string;
  ALLOWED_ORIGIN?: string;
}

const json = (body: unknown, status = 200, origin = "*"): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN || "*";
    if (request.method === "OPTIONS") return json({}, 204, origin);

    if (url.pathname === "/api/v1/health") {
      if (request.method !== "GET") return json({success:false,error:"METHOD_NOT_ALLOWED"},405,origin);
      try {
        await env.DB.prepare("SELECT 1 AS ok").first();
        return json({success:true,service:"GLASYPAY API",environment:env.APP_ENV,database:"connected",livePaymentsEnabled:env.PAYMENTS_LIVE_ENABLED === "true"},200,origin);
      } catch {
        return json({success:false,error:"DATABASE_UNAVAILABLE"},503,origin);
      }
    }

    if (url.pathname === "/api/v1/providers") {
      if (request.method !== "GET") return json({success:false,error:"METHOD_NOT_ALLOWED"},405,origin);
      try {
        const result = await env.DB.prepare(
          "SELECT code, display_name AS name, enabled, environment FROM payment_providers ORDER BY priority ASC"
        ).all<{code:string;name:string;enabled:number;environment:string}>();
        return json({success:true,data:result.results.map(p=>({...p,enabled:p.enabled === 1}))},200,origin);
      } catch {
        return json({success:false,error:"DATABASE_UNAVAILABLE"},503,origin);
      }
    }

    if (url.pathname.startsWith("/api/v1/webhooks/")) {
      return json({success:false,error:"PROVIDER_ADAPTER_NOT_CONFIGURED"},503,origin);
    }
    return json({success:false,error:"NOT_IMPLEMENTED",message:"Endpoint belum tersedia; tidak ada transaksi yang diproses."},501,origin);
  }
};
