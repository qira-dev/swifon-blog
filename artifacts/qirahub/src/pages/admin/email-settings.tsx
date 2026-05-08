import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { useSiteSetting, useUpdateSiteSetting } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail, Server, Lock, Eye, EyeOff, CheckCircle, AlertCircle,
  Loader2, Save, Send, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("qirahub_user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_BASE = "/api";

function useSmtpSetting(key: string) {
  const { data } = useSiteSetting(key);
  return data?.value ?? "";
}

function FieldRow({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
  secret = false,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  secret?: boolean;
}) {
  const [show, setShow] = useState(false);
  const inputType = secret ? (show ? "text" : "password") : type;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
          autoComplete="off"
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminEmailSettings() {
  const { toast } = useToast();
  const updateMutation = useUpdateSiteSetting();

  const initHost      = useSmtpSetting("smtp_host");
  const initPort      = useSmtpSetting("smtp_port");
  const initUser      = useSmtpSetting("smtp_user");
  const initPass      = useSmtpSetting("smtp_pass");
  const initFromEmail = useSmtpSetting("smtp_from_email");
  const initFromName  = useSmtpSetting("smtp_from_name");

  const [host,      setHost]      = useState("");
  const [port,      setPort]      = useState("587");
  const [user,      setUser]      = useState("");
  const [pass,      setPass]      = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName,  setFromName]  = useState("");

  const [saving,  setSaving]  = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => { if (initHost)      setHost(initHost); },      [initHost]);
  useEffect(() => { if (initPort)      setPort(initPort); },      [initPort]);
  useEffect(() => { if (initUser)      setUser(initUser); },      [initUser]);
  useEffect(() => { if (initPass)      setPass(initPass); },      [initPass]);
  useEffect(() => { if (initFromEmail) setFromEmail(initFromEmail); }, [initFromEmail]);
  useEffect(() => { if (initFromName)  setFromName(initFromName); },  [initFromName]);

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all([
        updateMutation.mutateAsync({ key: "smtp_host",       value: host }),
        updateMutation.mutateAsync({ key: "smtp_port",       value: port }),
        updateMutation.mutateAsync({ key: "smtp_user",       value: user }),
        updateMutation.mutateAsync({ key: "smtp_pass",       value: pass }),
        updateMutation.mutateAsync({ key: "smtp_from_email", value: fromEmail }),
        updateMutation.mutateAsync({ key: "smtp_from_name",  value: fromName }),
      ]);
      toast({ title: "Email settings saved!" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/smtp/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ host, port: parseInt(port), user, pass, fromEmail, fromName }),
      });
      const data = await res.json();
      setTestResult({ ok: data.ok, message: data.message || (data.ok ? "Connection successful!" : "Connection failed") });
    } catch {
      setTestResult({ ok: false, message: "Network error — could not reach the server" });
    } finally {
      setTesting(false);
    }
  }

  async function handleSendTestEmail() {
    if (!user) { toast({ title: "Enter your Gmail address first", variant: "destructive" }); return; }
    setSendingTest(true);
    try {
      const res = await fetch(`${API_BASE}/admin/smtp/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ to: user }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: `Test email sent to ${user}` });
      } else {
        toast({ title: data.error || "Failed to send test email", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email / SMTP Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure Gmail SMTP so replies to contact messages are actually sent by email.
          </p>
        </div>

        {/* How it works callout */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Info className="w-5 h-5 text-primary shrink-0" />
            How to use your custom domain email with Gmail SMTP
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              In your Gmail account go to <strong className="text-foreground">Settings → Accounts and Import → Send mail as</strong> and click <em>Add another email address</em>.
            </li>
            <li>
              Enter your custom domain address (e.g. <code className="bg-muted px-1 rounded text-xs text-foreground">hello@yourdomain.com</code>) and follow Gmail's verification steps.
            </li>
            <li>
              Once verified, set that address as your <em>Reply-to</em> or <em>default From</em> in Gmail — or simply fill in the <strong className="text-foreground">From Email</strong> field below.
            </li>
            <li>
              Create a <strong className="text-foreground">Gmail App Password</strong>: go to <em>Google Account → Security → 2-Step Verification → App passwords</em>, generate one for "Mail", and paste it in the <strong className="text-foreground">App Password</strong> field below.
            </li>
            <li>
              Your <strong className="text-foreground">Gmail address</strong> is used only for authentication — recipients will see only your custom domain email as the sender.
            </li>
          </ol>
        </div>

        {/* SMTP Configuration */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">SMTP Server</h2>
              <p className="text-xs text-muted-foreground">Connection settings for outgoing mail</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow
              label="SMTP Host"
              id="smtp_host"
              value={host}
              onChange={setHost}
              placeholder="smtp.gmail.com"
              hint="Leave as smtp.gmail.com for Gmail"
            />
            <FieldRow
              label="SMTP Port"
              id="smtp_port"
              type="number"
              value={port}
              onChange={setPort}
              placeholder="587"
              hint="587 (TLS/STARTTLS) or 465 (SSL)"
            />
          </div>
        </div>

        {/* Gmail Auth */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Gmail Authentication</h2>
              <p className="text-xs text-muted-foreground">Your Gmail credentials — used only for sending, never shown to recipients</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow
              label="Gmail Address"
              id="smtp_user"
              type="email"
              value={user}
              onChange={setUser}
              placeholder="yourname@gmail.com"
              hint="Your actual Gmail account"
            />
            <FieldRow
              label="App Password"
              id="smtp_pass"
              value={pass}
              onChange={setPass}
              placeholder="xxxx xxxx xxxx xxxx"
              hint="16-character Google App Password (not your Gmail password)"
              secret
            />
          </div>
        </div>

        {/* Sender identity */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Sender Identity</h2>
              <p className="text-xs text-muted-foreground">What recipients see as the "From" address</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow
              label="From Name"
              id="smtp_from_name"
              value={fromName}
              onChange={setFromName}
              placeholder="QiraHub Support"
              hint="Display name shown to email recipients"
            />
            <FieldRow
              label="From Email (Custom Domain)"
              id="smtp_from_email"
              type="email"
              value={fromEmail}
              onChange={setFromEmail}
              placeholder="hello@yourdomain.com"
              hint="Must be verified in Gmail's 'Send mail as' settings"
            />
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            testResult.ok
              ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
          }`}>
            {testResult.ok
              ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <p>{testResult.message}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Settings"}
          </Button>

          <Button variant="outline" onClick={handleTestConnection} disabled={testing} className="gap-2">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
            {testing ? "Testing…" : "Test Connection"}
          </Button>

          <Button variant="outline" onClick={handleSendTestEmail} disabled={sendingTest} className="gap-2">
            {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sendingTest ? "Sending…" : "Send Test Email"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          "Test Connection" verifies SMTP credentials. "Send Test Email" sends a real email to your Gmail address using the saved settings.
        </p>
      </div>
    </AdminLayout>
  );
}
