import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { usersTable, passwordResetsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth";
import { getEffectiveAdminKey, invalidateAdminKeyCache, requireAdminKey, requireSuperAdmin, SUPER_ADMIN_EMAIL } from "../middleware/auth";
import { sendMail, isSmtpConfigured, getSmtpConfig } from "../lib/mailer";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;

function signToken(user: { id: number; email: string; isAdmin: boolean; role?: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, isAdmin: user.isAdmin, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, username, displayName, avatarUrl, agreedToTerms, agreedToPrivacy } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ error: "Email, username, and password are required" });
      return;
    }

    if (!agreedToTerms || !agreedToPrivacy) {
      res.status(400).json({ error: "You must agree to the Terms of Service and Privacy Policy" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const existingUsername = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()))
      .limit(1);

    if (existingUsername.length > 0) {
      res.status(409).json({ error: "This username is already taken" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await db
      .insert(usersTable)
      .values({
        email: email.toLowerCase().trim(),
        username: username.trim(),
        displayName: displayName?.trim() || username.trim(),
        passwordHash,
        avatarUrl: avatarUrl || null,
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
        displayName: usersTable.displayName,
        isAdmin: usersTable.isAdmin,
        role: usersTable.role,
        avatarUrl: usersTable.avatarUrl,
        createdAt: usersTable.createdAt,
      });

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin, role: user.role });

    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "This account has been deactivated" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    await db.update(usersTable)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin, role: user.role });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role || "user",
        isAdmin: user.isAdmin,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLoginAt: new Date().toISOString(),
      },
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
        displayName: usersTable.displayName,
        isAdmin: usersTable.isAdmin,
        avatarUrl: usersTable.avatarUrl,
        bio: usersTable.bio,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.put("/auth/change-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current password and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" });
      return;
    }

    const [user] = await db
      .select({ id: usersTable.id, passwordHash: usersTable.passwordHash })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db
      .update(usersTable)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(usersTable.id, req.userId!));

    res.json({ message: "Password changed successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const normalised = email.toLowerCase().trim();

    /* ── Super-admin is permanently protected ── */
    if (normalised === SUPER_ADMIN_EMAIL) {
      res.status(404).json({ error: "No account found with that email address." });
      return;
    }

    const [user] = await db
      .select({ id: usersTable.id, isAdmin: usersTable.isAdmin, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.email, normalised))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "No account found with that email address." });
      return;
    }

    /* ── Admin and moderator accounts cannot use self-service password reset ──
       Their passwords can only be reset by the Super Admin via the admin panel. */
    if (user.isAdmin || user.role === "moderator") {
      res.status(404).json({ error: "No account found with that email address." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(passwordResetsTable).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const smtpCfg = await getSmtpConfig();
    if (isSmtpConfigured(smtpCfg)) {
      const resetUrl = `${process.env.APP_URL || ""}/forgot-password?token=${token}&email=${encodeURIComponent(normalised)}`;
      await sendMail({
        to: normalised,
        subject: "Reset your QiraHub password",
        html: `
          <p>You requested a password reset for your QiraHub account.</p>
          <p>Click the link below to set a new password. This link expires in 15 minutes.</p>
          <p><a href="${resetUrl}" style="color:#6d28d9;font-weight:bold;">Reset my password</a></p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <hr/>
          <p style="font-size:11px;color:#888;">This link expires in 15 minutes.</p>
        `,
      });
      res.json({ message: "If an account with that email exists, a reset link has been sent." });
    } else {
      if (process.env.NODE_ENV === "production") {
        res.json({ message: "If an account with that email exists, a reset link has been sent." });
      } else {
        res.json({ token });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const [resetRecord] = await db
      .select()
      .from(passwordResetsTable)
      .where(
        and(
          eq(passwordResetsTable.token, token),
          eq(passwordResetsTable.used, false)
        )
      )
      .limit(1);

    if (!resetRecord) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    if (new Date() > resetRecord.expiresAt) {
      await db
        .update(passwordResetsTable)
        .set({ used: true })
        .where(eq(passwordResetsTable.id, resetRecord.id));
      res.status(400).json({ error: "Reset token has expired" });
      return;
    }

    /* ── Double-guard: never allow resetting the super-admin password ── */
    const [targetUser] = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, resetRecord.userId))
      .limit(1);

    if (targetUser?.email === SUPER_ADMIN_EMAIL) {
      res.status(403).json({ error: "Password reset is not available for this account." });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db
      .update(usersTable)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(usersTable.id, resetRecord.userId));

    await db
      .update(passwordResetsTable)
      .set({ used: true })
      .where(eq(passwordResetsTable.id, resetRecord.id));

    res.json({ message: "Password has been reset successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

router.put("/auth/update-email", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      res.status(400).json({ error: "New email and password are required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    const [user] = await db
      .select({ id: usersTable.id, passwordHash: usersTable.passwordHash })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Password is incorrect" });
      return;
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);

    if (existing && existing.id !== req.userId) {
      res.status(409).json({ error: "This email is already in use" });
      return;
    }

    await db
      .update(usersTable)
      .set({ email: normalizedEmail, updatedAt: new Date() })
      .where(eq(usersTable.id, req.userId!));

    const token = signToken({ id: req.userId!, email: normalizedEmail, isAdmin: req.userIsAdmin! });

    res.json({ message: "Email updated successfully", email: normalizedEmail, token });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update email" });
  }
});

router.put("/auth/update-profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { displayName, bio, avatarUrl } = req.body;

    const updates: Record<string, any> = { updatedAt: new Date() };

    if (displayName !== undefined) updates.displayName = displayName?.trim() || null;
    if (bio !== undefined) updates.bio = bio?.trim() || null;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl || null;

    await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, req.userId!));

    const [updated] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
        displayName: usersTable.displayName,
        isAdmin: usersTable.isAdmin,
        avatarUrl: usersTable.avatarUrl,
        bio: usersTable.bio,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    res.json({ user: updated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.post("/auth/admin-key-login", async (req, res) => {
  try {
    const { key } = req.body;
    if (!key || typeof key !== "string") {
      res.status(400).json({ error: "Key is required" });
      return;
    }
    const effectiveKey = await getEffectiveAdminKey();
    if (key !== effectiveKey) {
      res.status(401).json({ error: "Incorrect admin key" });
      return;
    }
    const token = jwt.sign(
      { isAdmin: true, role: "key_admin", keyLogin: true },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ success: true, token });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/admin-key", requireAdminKey, async (_req, res) => {
  try {
    const [row] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "admin_key"))
      .limit(1);
    const currentKey = row?.value || null;
    res.json({ hasCustomKey: !!currentKey, keyPreview: currentKey ? `${currentKey.slice(0, 4)}${"*".repeat(Math.max(0, currentKey.length - 4))}` : null });
  } catch {
    res.status(500).json({ error: "Failed to fetch admin key info" });
  }
});

router.put("/auth/admin-key", requireSuperAdmin, async (req, res) => {
  try {
    const { newKey } = req.body;
    if (!newKey || typeof newKey !== "string" || newKey.length < 8) {
      res.status(400).json({ error: "Admin key must be at least 8 characters" });
      return;
    }
    const [existing] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "admin_key"))
      .limit(1);
    if (existing) {
      await db
        .update(siteSettingsTable)
        .set({ value: newKey, updatedAt: new Date() })
        .where(eq(siteSettingsTable.key, "admin_key"));
    } else {
      await db.insert(siteSettingsTable).values({ key: "admin_key", value: newKey });
    }
    invalidateAdminKeyCache();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update admin key" });
  }
});

export default router;
