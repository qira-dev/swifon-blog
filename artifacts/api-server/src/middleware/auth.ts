import { type Request, type RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

if (!process.env.ADMIN_API_KEY) {
  throw new Error(
    "ADMIN_API_KEY environment variable is required. Add it to your Replit secrets."
  );
}
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Add it to your Replit secrets."
  );
}

const DEFAULT_ADMIN_KEY = process.env.ADMIN_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

/** The one account that can never be deleted, demoted, or have its role changed. */
export const SUPER_ADMIN_EMAIL = "qirahub@gmail.com";

let _cachedKey: string | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000;

export async function getEffectiveAdminKey(): Promise<string> {
  const now = Date.now();
  if (_cachedKey !== null && now - _cacheTime < CACHE_TTL) return _cachedKey;
  try {
    const [row] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "admin_key"))
      .limit(1);
    _cachedKey = row?.value || DEFAULT_ADMIN_KEY;
  } catch {
    _cachedKey = DEFAULT_ADMIN_KEY;
  }
  _cacheTime = now;
  return _cachedKey;
}

export function invalidateAdminKeyCache() {
  _cachedKey = null;
  _cacheTime = 0;
}

export const requireAdminKey: RequestHandler = async (req, res, next) => {
  const ADMIN_KEY = await getEffectiveAdminKey();

  const keyHeader = req.headers["x-admin-key"] as string | undefined;
  if (keyHeader === ADMIN_KEY) { next(); return; }

  const authHeader = req.headers["authorization"] as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === ADMIN_KEY) { next(); return; }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin?: boolean; role?: string };
      if (decoded.isAdmin || decoded.role === "admin" || decoded.role === "key_admin") { next(); return; }
    } catch {}
  }

  res.status(401).json({ error: "Unauthorized" });
};

/**
 * Accepts any authenticated admin — either the raw admin key, or a JWT
 * where role === "admin" or isAdmin === true.  No raw key entry needed
 * when the user is already signed in with an admin account.
 */
export const requireAdmin: RequestHandler = async (req, res, next) => {
  const ADMIN_KEY = await getEffectiveAdminKey();

  const keyHeader = req.headers["x-admin-key"] as string | undefined;
  if (keyHeader === ADMIN_KEY) { next(); return; }

  const authHeader = req.headers["authorization"] as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === ADMIN_KEY) { next(); return; }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        isAdmin?: boolean;
        role?: string;
      };
      if (decoded.isAdmin || decoded.role === "admin" || decoded.role === "key_admin") {
        next();
        return;
      }
    } catch {}
  }

  res.status(401).json({ error: "Unauthorized — admin role required" });
};

export const requireModeratorOrAdmin: RequestHandler = async (req, res, next) => {
  const ADMIN_KEY = await getEffectiveAdminKey();

  const keyHeader = req.headers["x-admin-key"] as string | undefined;
  if (keyHeader === ADMIN_KEY) { next(); return; }

  const authHeader = req.headers["authorization"] as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === ADMIN_KEY) { next(); return; }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
        isAdmin: boolean;
        role?: string;
      };
      if (decoded.isAdmin || decoded.role === "moderator" || decoded.role === "admin") {
        next();
        return;
      }
    } catch {}
  }

  res.status(401).json({ error: "Unauthorized" });
};

/**
 * Restricts the route to the Super Admin only.
 * Super Admin = raw admin key bearer, JWT with role "key_admin", or the super-admin email.
 * Regular admin accounts (role "admin") are explicitly rejected.
 */
export const requireSuperAdmin: RequestHandler = async (req, res, next) => {
  const ADMIN_KEY = await getEffectiveAdminKey();

  const keyHeader = req.headers["x-admin-key"] as string | undefined;
  if (keyHeader === ADMIN_KEY) { next(); return; }

  const authHeader = req.headers["authorization"] as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === ADMIN_KEY) { next(); return; }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId?: number;
        email?: string;
        isAdmin?: boolean;
        role?: string;
      };
      if (decoded.role === "key_admin" || decoded.email === SUPER_ADMIN_EMAIL) {
        next();
        return;
      }
    } catch {}
  }

  res.status(403).json({ error: "Forbidden — only the Super Admin can perform this action" });
};

/**
 * Decodes the caller's identity from the request without blocking it.
 * Useful inside route handlers to check whether the caller is the Super Admin.
 */
export async function extractCallerInfo(req: Request): Promise<{
  role: string;
  email: string;
  isSuperAdmin: boolean;
}> {
  const ADMIN_KEY = await getEffectiveAdminKey();

  const keyHeader = req.headers["x-admin-key"] as string | undefined;
  if (keyHeader === ADMIN_KEY) {
    return { role: "key_admin", email: SUPER_ADMIN_EMAIL, isSuperAdmin: true };
  }

  const authHeader = req.headers["authorization"] as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === ADMIN_KEY) {
      return { role: "key_admin", email: SUPER_ADMIN_EMAIL, isSuperAdmin: true };
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId?: number;
        email?: string;
        role?: string;
      };
      const isSuperAdmin =
        decoded.role === "key_admin" || decoded.email === SUPER_ADMIN_EMAIL;
      return { role: decoded.role || "user", email: decoded.email || "", isSuperAdmin };
    } catch {}
  }

  return { role: "anonymous", email: "", isSuperAdmin: false };
}
