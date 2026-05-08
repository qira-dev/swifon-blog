import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireModeratorOrAdmin, requireAdmin } from "../middleware/auth";
import { sendMail, testSmtpConnection, getSmtpConfig, isSmtpConfigured } from "../lib/mailer";
import { logAudit } from "../lib/audit";

const router = Router();

/* Public: submit contact form */
router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email, and message are required" });
    }
    const [created] = await db
      .insert(contactMessagesTable)
      .values({ name, email, subject: subject || "", message })
      .returning();
    res.status(201).json({ success: true, id: created.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit message" });
  }
});

/* Admin: list messages — moderators and above */
router.get("/contact-messages", requireModeratorOrAdmin, async (_req, res) => {
  try {
    const messages = await db
      .select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.createdAt));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/* Admin: reply to message — moderators and above */
router.put("/contact-messages/:id/reply", requireModeratorOrAdmin, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: "reply is required" });

    const [updated] = await db
      .update(contactMessagesTable)
      .set({ reply, repliedAt: new Date(), status: "replied" })
      .where(eq(contactMessagesTable.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });

    const emailResult = await sendMail({
      to: updated.email,
      subject: updated.subject
        ? `Re: ${updated.subject}`
        : "Re: Your message to us",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
          <p>Hi ${updated.name},</p>
          <p>Thank you for reaching out. Here is our reply to your message:</p>
          <blockquote style="border-left:4px solid #6366f1;padding:12px 16px;margin:16px 0;background:#f5f4ff;border-radius:4px;color:#555">
            ${reply.replace(/\n/g, "<br />")}
          </blockquote>
          ${updated.subject ? `<p><strong>Your original message subject:</strong> ${updated.subject}</p>` : ""}
          <p>If you have further questions, feel free to reply to this email.</p>
          <p style="margin-top:24px;color:#888;font-size:13px">— QiraHub Support</p>
        </div>
      `,
    });

    logAudit(req, "MESSAGE_REPLIED", "contact_message", Number(req.params.id), {
      to: updated.email,
      emailSent: emailResult.ok,
    });

    res.json({
      ...updated,
      emailSent: emailResult.ok,
      emailError: emailResult.ok ? undefined : emailResult.error,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to reply to message" });
  }
});

/* Admin: update message status — moderators and above */
router.put("/contact-messages/:id/status", requireModeratorOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    const [updated] = await db
      .update(contactMessagesTable)
      .set({ status })
      .where(eq(contactMessagesTable.id, Number(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

/* Admin: delete message — admin and above only */
router.delete("/contact-messages/:id", requireAdmin, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(contactMessagesTable)
      .where(eq(contactMessagesTable.id, Number(req.params.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Not found" });
    logAudit(req, "MESSAGE_DELETED", "contact_message", Number(req.params.id), {
      from: deleted.email,
      subject: deleted.subject,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

/* ─── SMTP Test Endpoints ─── */

router.post("/admin/smtp/test-connection", requireAdmin, async (req, res) => {
  try {
    const { host, port, user, pass, fromEmail, fromName } = req.body;
    if (!user || !pass) {
      return res.status(400).json({ ok: false, message: "Gmail address and App Password are required" });
    }
    const result = await testSmtpConnection({
      host: host || "smtp.gmail.com",
      port: parseInt(port) || 587,
      user,
      pass,
      fromEmail: fromEmail || user,
      fromName: fromName || "QiraHub",
    });
    res.json({ ok: result.ok, message: result.ok ? "Connection verified successfully!" : result.error });
  } catch {
    res.status(500).json({ ok: false, message: "Server error during test" });
  }
});

router.post("/admin/smtp/send-test", requireAdmin, async (req, res) => {
  try {
    const cfg = await getSmtpConfig();
    if (!isSmtpConfigured(cfg)) {
      return res.json({ ok: false, error: "SMTP settings are not configured yet. Save your settings first." });
    }
    const { to } = req.body;
    const recipient = to || cfg.user;
    const result = await sendMail({
      to: recipient,
      subject: "QiraHub — SMTP Test Email",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
          <h2 style="color:#6366f1">SMTP is working!</h2>
          <p>This is a test email sent from your QiraHub admin panel.</p>
          <ul>
            <li><strong>SMTP Host:</strong> ${cfg.host}:${cfg.port}</li>
            <li><strong>Gmail Account:</strong> ${cfg.user}</li>
            <li><strong>From Address:</strong> ${cfg.fromName} &lt;${cfg.fromEmail}&gt;</li>
          </ul>
          <p style="color:#888;font-size:13px;margin-top:24px">
            If you can read this, your email configuration is working correctly.
          </p>
        </div>
      `,
    });
    logAudit(req, "SMTP_TEST_SENT", "smtp", null, { to: recipient, ok: result.ok });
    res.json(result);
  } catch {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
