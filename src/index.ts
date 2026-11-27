export interface Env {
  DB: D1Database;
  APP_NAME?: string;
  APP_ENV?: string;
  PREMKU_BASE_URL?: string;
  PREMKU_API_KEY?: string;
  PREMKU_API_SECRET?: string;
  PREMKU_AUTH_MODE?: string;
}

const json = (data: unknown, status = 200): Response => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  }
});
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let response: Response;

    if (request.method === "OPTIONS") {
      response = new Response(null, { status: 204 });
    } else {
      try {
        if (url.pathname === "/api/health" && request.method === "GET") {
          response = json({
            success: true,
            app: env.APP_NAME ?? "GLASSY STORE",
            status: "ok",
            supplier: "not_configured_until_official_auth_is_verified"
          });
        } else if (url.pathname === "/api/categories" && request.method === "GET") {
          const result = await env.DB.prepare(
            "SELECT id, name, slug, description FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC"
          ).all();
          response = json({ success: true, data: result.results });
        } else if (url.pathname === "/api/products" && request.method === "GET") {
          const page = Math.max(1, Math.min(1000, Number(url.searchParams.get("page") ?? 1) || 1));
          const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? 20) || 20));
          const category = url.searchParams.get("category");
          const search = (url.searchParams.get("q") ?? "").trim().slice(0, 80);

          if (category && !slugPattern.test(category)) {
            response = json({ success: false, message: "Invalid category" }, 400);
          } else {
            const conditions = ["p.status = 'available'", "p.stock > 0", "c.is_active = 1"];
            const values: (string | number)[] = [];
            if (category) {
              conditions.push("c.slug = ?");
              values.push(category);
            }
            if (search) {
              conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
              values.push("%" + search + "%", "%" + search + "%");
            }
            const where = conditions.join(" AND ");
            const rowsPromise = env.DB.prepare(
              "SELECT p.id, p.name, p.slug, p.description, p.price_minor, p.currency, p.stock, p.image_url, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE " +
              where + " ORDER BY p.name ASC LIMIT ? OFFSET ?"
            ).bind(...values, limit, (page - 1) * limit).all();
            const countPromise = env.DB.prepare(
              "SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE " + where
            ).bind(...values).first<{ total: number }>();
            const [rows, count] = await Promise.all([rowsPromise, countPromise]);
            response = json({
              success: true,
              data: rows.results,
              pagination: { page, limit, total: count?.total ?? 0 }
            });
          }
        } else if (url.pathname.startsWith("/api/products/") && request.method === "GET") {
          const slug = decodeURIComponent(url.pathname.slice("/api/products/".length));
          if (!slugPattern.test(slug)) {
            response = json({ success: false, message: "Product not found" }, 404);
          } else {
            const product = await env.DB.prepare(
              "SELECT p.id, p.name, p.slug, p.description, p.price_minor, p.currency, p.stock, p.image_url, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.slug = ? AND p.status = 'available' AND p.stock > 0"
            ).bind(slug).first();
            response = product
              ? json({ success: true, data: product })
              : json({ success: false, message: "Product not found" }, 404);
          }
        } else {
          response = json({ success: false, message: "Not found" }, 404);
        }
      } catch (error) {
        console.error("request_failed", error instanceof Error ? error.name : "unknown");
        response = json({ success: false, message: "Internal server error" }, 500);
      }
    }

    const headers = new Headers(response.headers);
    headers.set("access-control-allow-origin", request.headers.get("Origin") ?? "null");
    headers.set("access-control-allow-methods", "GET, OPTIONS");
    headers.set("access-control-allow-headers", "Content-Type");
    headers.set("vary", "Origin");
    return new Response(response.body, { status: response.status, headers });
  }
};
