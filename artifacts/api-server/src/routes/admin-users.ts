import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, passwordResetsTable } from "@workspace/db/schema";
import { eq, desc, ilike, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAdmin, requireSuperAdmin, extractCallerInfo } from "../middleware/auth";
import { logAudit } from "../lib/audit";

const router = Router();
const SALT_ROUNDS = 10;

const SUPER_ADMIN_EMAIL = "qirahub@gmail.com";

async function isSuperAdmin(userId: number): Promise<boolean> {
  const [user] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user?.email === SUPER_ADMIN_EMAIL;
}

/* Admin: create user */
router.post("/admin/users", requireAdmin, async (req, res) => {
  try {
    const { username, email, password, displayName, role } = req.body as {
      username: string; email: string; password: string;
      displayName?: string; role?: string;
    };

    if (!username || !email || !password) {
      res.status(400).json({ error: "username, email, and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const assignedRole = role || "user";
    const [user] = await db
      .insert(usersTable)
      .values({
        username,
        email,
        passwordHash,
        displayName: displayName || username,
        role: assignedRole as any,
        isAdmin: assignedRole === "admin",
        isActive: true,
      })
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        displayName: usersTable.displayName,
        role: usersTable.role,
        isAdmin: usersTable.isAdmin,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
      });

    logAudit(req, "USER_CREATED", "user", user.id, { email: user.email, role: user.role });
    res.status(201).json({ user });
  } catch {
    res.status(500).json({ error: "Failed to create user" });
  }
});

/* Admin: list users */
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const search = (req.query.search as string) || "";
    const role = (req.query.role as string) || "";
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    let whereClause;
    if (search) {
      whereClause = or(
        ilike(usersTable.username, `%${search}%`),
        ilike(usersTable.email, `%${search}%`),
        ilike(usersTable.displayName, `%${search}%`)
      );
    }

    let users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        displayName: usersTable.displayName,
        avatarUrl: usersTable.avatarUrl,
        role: usersTable.role,
        isAdmin: usersTable.isAdmin,
        isActive: usersTable.isActive,
        lastLoginAt: usersTable.lastLoginAt,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(whereClause)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    if (role) {
      users = users.filter(u => (u.role || "user") === role);
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(whereClause);

    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`sum(case when is_active then 1 else 0 end)::int`,
        admins: sql<number>`sum(case when role = 'admin' then 1 else 0 end)::int`,
        moderators: sql<number>`sum(case when role = 'moderator' then 1 else 0 end)::int`,
        recentLogins: sql<number>`sum(case when last_login_at > now() - interval '7 days' then 1 else 0 end)::int`,
      })
      .from(usersTable);

    res.json({ users, total: count, page, limit, stats });
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* Admin: update user */
router.put("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isActive, isAdmin, role, newPassword, displayName, bio } = req.body;

    if (await isSuperAdmin(userId)) {
      const isAttemptingRestricted =
        (role !== undefined && role !== "admin") ||
        (isAdmin !== undefined && isAdmin !== true) ||
        (isActive !== undefined && isActive !== true);
      if (isAttemptingRestricted) {
        res.status(403).json({ error: "The super-admin account cannot be demoted or deactivated." });
        return;
      }
    }

    // Only Super Admin can change roles
    if (role !== undefined || isAdmin !== undefined) {
      const caller = await extractCallerInfo(req);
      if (!caller.isSuperAdmin) {
        res.status(403).json({ error: "Forbidden — only the Super Admin can change user roles" });
        return;
      }
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (isActive !== undefined) updates.isActive = isActive;
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;

    const roleChanged = role !== undefined || isAdmin !== undefined;
    if (role !== undefined) {
      updates.role = role;
      updates.isAdmin = role === "admin";
    } else if (isAdmin !== undefined) {
      updates.isAdmin = isAdmin;
      updates.role = isAdmin ? "admin" : "user";
    }

    // Only Super Admin can reset passwords
    if (newPassword) {
      if (newPassword.length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters" });
        return;
      }
      const caller = await extractCallerInfo(req);
      if (!caller.isSuperAdmin) {
        res.status(403).json({ error: "Forbidden — only the Super Admin can reset user passwords" });
        return;
      }
      updates.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, userId))
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        displayName: usersTable.displayName,
        avatarUrl: usersTable.avatarUrl,
        role: usersTable.role,
        isAdmin: usersTable.isAdmin,
        isActive: usersTable.isActive,
        lastLoginAt: usersTable.lastLoginAt,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      });

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const auditAction = newPassword
      ? "USER_PASSWORD_RESET"
      : roleChanged
      ? "USER_ROLE_CHANGED"
      : "USER_UPDATED";

    logAudit(req, auditAction, "user", userId, {
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
      passwordReset: !!newPassword,
    });

    res.json({ user: updated });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

/* Super Admin only: delete user */
router.delete("/admin/users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (await isSuperAdmin(userId)) {
      res.status(403).json({ error: "The super-admin account (qirahub@gmail.com) cannot be deleted." });
      return;
    }

    const [user] = await db
      .select({ id: usersTable.id, email: usersTable.email, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await db.delete(usersTable).where(eq(usersTable.id, userId));
    logAudit(req, "USER_DELETED", "user", userId, { email: user.email, role: user.role });
    res.json({ message: "User deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/* Admin: list password resets */
router.get("/admin/password-resets", requireAdmin, async (_req, res) => {
  try {
    const resets = await db
      .select({
        id: passwordResetsTable.id,
        userId: passwordResetsTable.userId,
        token: passwordResetsTable.token,
        expiresAt: passwordResetsTable.expiresAt,
        used: passwordResetsTable.used,
        createdAt: passwordResetsTable.createdAt,
        username: usersTable.username,
        email: usersTable.email,
      })
      .from(passwordResetsTable)
      .innerJoin(usersTable, eq(passwordResetsTable.userId, usersTable.id))
      .where(eq(passwordResetsTable.used, false))
      .orderBy(desc(passwordResetsTable.createdAt))
      .limit(50);

    const activeResets = resets.filter(r => new Date() < r.expiresAt);
    res.json({ resets: activeResets });
  } catch {
    res.status(500).json({ error: "Failed to fetch password resets" });
  }
});

export default router;
