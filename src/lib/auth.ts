import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "anutech_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 183;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-only-secret";
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function signAdminSession(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
    })
  ).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(payload).digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyAdminSession(token?: string) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    email: string;
    exp: number;
  };

  if (!parsed.email || parsed.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return parsed;
}

export const adminSessionMaxAge = SESSION_MAX_AGE_SECONDS;
