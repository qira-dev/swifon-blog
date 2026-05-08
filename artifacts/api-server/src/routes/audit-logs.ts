import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db/schema";
import { desc, sql, and, gte, lte, eq, ilike, or } from "drizzle-orm";
import { requireSuperAdmin } from "../middleware/auth";

const router = Router();

/* Super Admin only: list audit logs with pagination and filtering */
router.get("/admin/audit-logs", requireSuperAdmin, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page   as string) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const { role, action, resource, search, from, to } = req.query as Record<string, string>;

    const conditions: ReturnType<typeof eq>[] = [];

    if (role)     conditions.push(eq(auditLogsTable.actorRole, role));
    if (action)   conditions.push(eq(auditLogsTable.action, action));
    if (resource) conditions.push(eq(auditLogsTable.resourceType, resource));
    if (from)     conditions.push(gte(auditLogsTable.createdAt, new Date(from)));
    if (to)       conditions.push(lte(auditLogsTable.createdAt, new Date(to)));
    if (search) {
      conditions.push(
        or(
          ilike(auditLogsTable.actorEmail, `%${search}%`),
          ilike(auditLogsTable.action, `%${search}%`),
          ilike(auditLogsTable.details, `%${search}%`)
        ) as any
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(auditLogsTable)
        .where(where)
        .orderBy(desc(auditLogsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(auditLogsTable)
        .where(where),
    ]);

    res.json({ logs: rows, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

/* Super Admin only: get summary stats */
router.get("/admin/audit-logs/stats", requireSuperAdmin, async (_req, res) => {
  try {
    const [stats] = await db
      .select({
        total:     sql<number>`count(*)::int`,
        today:     sql<number>`sum(case when created_at > now() - interval '1 day' then 1 else 0 end)::int`,
        thisWeek:  sql<number>`sum(case when created_at > now() - interval '7 days' then 1 else 0 end)::int`,
        deletions: sql<number>`sum(case when action like '%DELETED' then 1 else 0 end)::int`,
      })
      .from(auditLogsTable);

    res.json(stats);
  } catch {
    res.status(500).json({ error: "Failed to fetch audit stats" });
  }
});

/* Super Admin only: delete all audit logs */
router.delete("/admin/audit-logs", requireSuperAdmin, async (_req, res) => {
  try {
    await db.delete(auditLogsTable);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to clear audit logs" });
  }
});

export default router;
