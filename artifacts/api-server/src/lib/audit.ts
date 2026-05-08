import type { Request } from "express";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db/schema";
import jwt from "jsonwebtoken";
import { getEffectiveAdminKey, SUPER_ADMIN_EMAIL } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET!;

export type AuditAction =
  | "LOGIN_ADMIN_KEY"
  | "LOGIN_ACCOUNT"
  | "POST_CREATED" | "POST_UPDATED" | "POST_DELETED"
  | "CATEGORY_CREATED" | "CATEGORY_UPDATED" | "CATEGORY_DELETED"
  | "PRODUCT_CREATED" | "PRODUCT_UPDATED" | "PRODUCT_DELETED"
  | "COMPARISON_CREATED" | "COMPARISON_UPDATED" | "COMPARISON_DELETED"
  | "AD_CREATED" | "AD_UPDATED" | "AD_TOGGLED" | "AD_DELETED"
  | "COUPON_CREATED" | "COUPON_UPDATED" | "COUPON_TOGGLED" | "COUPON_DELETED"
  | "COUPON_AD_CREATED" | "COUPON_AD_UPDATED" | "COUPON_AD_TOGGLED" | "COUPON_AD_DELETED"
  | "TRANSLATION_UPDATED"
  | "SETTING_UPDATED"
  | "AD_NETWORK_UPDATED"
  | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_ROLE_CHANGED" | "USER_PASSWORD_RESET"
  | "MESSAGE_REPLIED" | "MESSAGE_DELETED"
  | "ADMIN_KEY_UPDATED"
  | "SMTP_TEST_SENT";

interface CallerInfo {
  actorRole: string;
  actorEmail: string;
}

async function extractCaller(req: Request): Promise<CallerInfo> {
  try {
    const ADMIN_KEY = await getEffectiveAdminKey();
    const keyHeader = req.headers["x-admin-key"] as string | undefined;
    if (keyHeader === ADMIN_KEY) {
      return { actorRole: "key_admin", actorEmail: SUPER_ADMIN_EMAIL };
    }
    const authHeader = req.headers["authorization"] as string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      if (token === ADMIN_KEY) {
        return { actorRole: "key_admin", actorEmail: SUPER_ADMIN_EMAIL };
      }
      const decoded = jwt.verify(token, JWT_SECRET) as {
        email?: string; role?: string;
      };
      return {
        actorRole: decoded.role || "user",
        actorEmail: decoded.email || "",
      };
    }
  } catch {}
  return { actorRole: "anonymous", actorEmail: "" };
}

function getIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    ""
  );
}

export async function logAudit(
  req: Request,
  action: AuditAction,
  resourceType?: string,
  resourceId?: string | number | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const caller = await extractCaller(req);
    await db.insert(auditLogsTable).values({
      actorRole:    caller.actorRole,
      actorEmail:   caller.actorEmail,
      action,
      resourceType: resourceType ?? null,
      resourceId:   resourceId != null ? String(resourceId) : null,
      details:      details ? JSON.stringify(details) : null,
      ip:           getIp(req),
      userAgent:    (req.headers["user-agent"] || "").slice(0, 300),
    });
  } catch {
    // Never let audit logging crash the actual response
  }
}
