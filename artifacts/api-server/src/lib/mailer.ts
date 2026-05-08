import nodemailer from "nodemailer";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function getSetting(key: string): Promise<string> {
  const [row] = await db
    .select({ value: siteSettingsTable.value })
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, key))
    .limit(1);
  return row?.value ?? "";
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const [host, port, user, pass, fromEmail, fromName] = await Promise.all([
    getSetting("smtp_host"),
    getSetting("smtp_port"),
    getSetting("smtp_user"),
    getSetting("smtp_pass"),
    getSetting("smtp_from_email"),
    getSetting("smtp_from_name"),
  ]);
  return {
    host: host || "smtp.gmail.com",
    port: parseInt(port || "587"),
    user,
    pass,
    fromEmail,
    fromName: fromName || "QiraHub",
  };
}

export function isSmtpConfigured(cfg: SmtpConfig): boolean {
  return !!(cfg.user && cfg.pass && cfg.fromEmail);
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = await getSmtpConfig();

    if (!isSmtpConfigured(cfg)) {
      return { ok: false, error: "SMTP is not configured. Go to Admin → Email Settings to set it up." };
    }

    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });

    await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ""),
    });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Unknown error" };
  }
}

export async function testSmtpConnection(cfg: SmtpConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    await transporter.verify();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Connection failed" };
  }
}
