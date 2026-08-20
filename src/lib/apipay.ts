/**
 * Server-only ApiPay.kz client (Kaspi Pay). Never import from a component —
 * X-API-Key must not reach the client bundle. Secrets are read inside
 * functions, not at module scope, same reasoning as getSupabaseServerClient()
 * (src/lib/supabase-server.ts) — required by this framework's per-request
 * execution model.
 *
 * Doc reference: https://apipay.kz/for-ai (fetched 2026-08-21, pasted into
 * the task by the owner). Base URL, headers, and payload shapes below come
 * straight from there.
 */

type ApipayConfig = {
  apiKey: string;
  webhookSecret: string | undefined;
  baseUrl: string;
};

export function getApipayConfig(): ApipayConfig {
  const apiKey = process.env["APIPAY_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "ApiPay is not configured: set APIPAY_API_KEY as a server environment variable.",
    );
  }
  return {
    apiKey,
    webhookSecret: process.env["APIPAY_WEBHOOK_SECRET"],
    baseUrl: process.env["APIPAY_BASE_URL"] || "https://api.apipay.kz/api/v1",
  };
}

export type ApipayChannel = "qr" | "phone";

export type ApipayInvoice = {
  id: number | string;
  amount: string | number;
  status: string;
  phone?: string;
  created_at?: string;
  // QR response shape isn't confirmed against a real key yet (docs summary
  // didn't spell out exact field names for POST /invoices/qr) — read every
  // plausible key defensively, verify against the first real sandbox test
  // (plan §Проверка, item 5) and trim the ones that don't show up.
  qr_code?: string;
  qr?: string;
  pay_url?: string;
  link?: string;
};

/**
 * Creates a Kaspi Pay invoice via ApiPay. `channel: "phone"` pushes a Kaspi
 * Pay notification to `phoneNumber` (strict 8XXXXXXXXXX, validated by the
 * caller before this runs); `channel: "qr"` returns QR data to render on our
 * own page instead, no phone number needed.
 */
export async function createApipayInvoice(params: {
  channel: ApipayChannel;
  amount: number;
  description: string;
  externalOrderId: string;
  phoneNumber?: string;
}): Promise<ApipayInvoice> {
  const { apiKey, baseUrl } = getApipayConfig();
  const path = params.channel === "qr" ? "/invoices/qr" : "/invoices";
  const body: Record<string, unknown> = {
    amount: params.amount,
    description: params.description,
    external_order_id: params.externalOrderId,
  };
  if (params.channel === "phone") body["phone_number"] = params.phoneNumber;

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const errorCode =
      data && typeof data === "object" && "error_code" in data
        ? String((data as Record<string, unknown>)["error_code"])
        : `http_${res.status}`;
    throw new Error(`apipay_invoice_failed: ${errorCode}`);
  }
  return data as ApipayInvoice;
}

/**
 * Verifies the `X-Webhook-Signature: sha256=<hex>` header against the raw
 * (unparsed) request body using HMAC-SHA256 — Web Crypto, not `node:crypto`,
 * because this app deploys to Cloudflare Workers (nitro `cloudflare-module`
 * preset, see src/server.ts) where node:crypto isn't guaranteed without
 * nodejs_compat. Same reasoning as the hand-rolled timingSafeEqual in
 * src/lib/admin-session.ts:12-19.
 */
export async function verifyApipaySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const prefix = "sha256=";
  if (!signatureHeader.startsWith(prefix)) return false;
  const got = signatureHeader.slice(prefix.length);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== got.length) return false;
  // Constant-time compare over a fixed-length hex string (both sides are
  // always 64 chars for SHA-256) — same fixed-length-first pattern as
  // admin-session.ts's timingSafeEqual.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ got.charCodeAt(i);
  }
  return diff === 0;
}
