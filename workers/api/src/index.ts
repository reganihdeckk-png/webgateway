export interface Env {
  DB: D1Database;
  APP_ENV: string;
  PAYMENTS_LIVE_ENABLED: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/v1/health") {
      try {
        await env.DB.prepare("SELECT 1 AS ok").first();
        return json({ success: true, service: "GLASYPAY API", environment: env.APP_ENV, database: "connected", livePaymentsEnabled: env.PAYMENTS_LIVE_ENABLED === "true" });
      } catch {
        return json({ success: false, error: "DATABASE_UNAVAILABLE" }, 503);
      }
    }
    if (url.pathname.startsWith("/api/v1/webhooks/")) {
      return json({ success: false, error: "PROVIDER_ADAPTER_NOT_CONFIGURED" }, 503);
    }
    return json({ success: false, error: "NOT_IMPLEMENTED", message: "Endpoint belum tersedia. Tidak ada transaksi yang diproses." }, 501);
  }
};
