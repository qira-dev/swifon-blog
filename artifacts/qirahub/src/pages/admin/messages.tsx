import { canDelete } from "@/lib/admin-auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import {
  useContactMessages,
  useReplyToMessage,
  useUpdateMessageStatus,
  useDeleteMessage,
  type ContactMessage,
} from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MailOpen,
  Reply,
  Trash2,
  Loader2,
  CheckCircle,
  Clock,
  X,
  Send,
  Inbox,
  Eye,
  Archive,
  AlertCircle,
} from "lucide-react";

function MessageDetail({
  msg,
  onClose,
}: {
  msg: ContactMessage;
  onClose: () => void;
}) {
  const replyMutation = useReplyToMessage();
  const statusMutation = useUpdateMessageStatus();
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    const result: any = await replyMutation.mutateAsync({ id: msg.id, reply: replyText });
    setShowReply(false);
    setReplyText("");
    if (result?.emailSent === true) {
      setEmailFeedback({ ok: true, msg: `Reply sent to ${msg.email}` });
    } else if (result?.emailSent === false) {
      setEmailFeedback({ ok: false, msg: result?.emailError ?? "Reply saved, but email could not be sent. Check Email Settings." });
    }
    setTimeout(() => setEmailFeedback(null), 6000);
  };

  const markAsRead = () => {
    if (msg.status === "unread") {
      statusMutation.mutate({ id: msg.id, status: "read" });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {msg.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{msg.name}</h3>
            <p className="text-sm text-muted-foreground">{msg.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date(msg.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {msg.subject && (
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Subject</span>
            <p className="text-foreground font-medium">{msg.subject}</p>
          </div>
        )}
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase">Message</span>
          <p className="text-foreground whitespace-pre-wrap mt-1">{msg.message}</p>
        </div>

        {emailFeedback && (
          <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            emailFeedback.ok
              ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
          }`}>
            {emailFeedback.ok
              ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <p>{emailFeedback.msg}</p>
          </div>
        )}

        {msg.reply && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium mb-2">
              <CheckCircle className="w-4 h-4" />
              Replied {msg.repliedAt && `on ${new Date(msg.repliedAt).toLocaleDateString()}`}
            </div>
            <p className="text-foreground whitespace-pre-wrap">{msg.reply}</p>
          </div>
        )}

        {showReply ? (
          <div className="space-y-3 border-t border-border/60 pt-4">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="min-h-[120px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReply(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="gap-2"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Reply
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 border-t border-border/60 pt-4">
            {msg.status === "unread" && (
              <Button variant="outline" size="sm" onClick={markAsRead} className="gap-2">
                <Eye className="w-4 h-4" /> Mark as Read
              </Button>
            )}
            <Button size="sm" onClick={() => setShowReply(true)} className="gap-2">
              <Reply className="w-4 h-4" /> Reply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminMessages() {
  const { data: messages, isLoading } = useContactMessages();
  const deleteMutation = useDeleteMessage();
  const statusMutation = useUpdateMessageStatus();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = messages?.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const unreadCount = messages?.filter((m) => m.status === "unread").length ?? 0;
  const selected = messages?.find((m) => m.id === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                : "All messages read"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "All", icon: <Inbox className="w-4 h-4" /> },
            { key: "unread", label: "Unread", icon: <Mail className="w-4 h-4" /> },
            { key: "read", label: "Read", icon: <MailOpen className="w-4 h-4" /> },
            { key: "replied", label: "Replied", icon: <CheckCircle className="w-4 h-4" /> },
            { key: "archived", label: "Archived", icon: <Archive className="w-4 h-4" /> },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
              className="gap-2"
            >
              {f.icon} {f.label}
              {f.key === "unread" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                  {unreadCount}
                </span>
              )}
            </Button>
          ))}
        </div>

        {selected && (
          <MessageDetail msg={selected} onClose={() => setSelectedId(null)} />
        )}

        {isLoading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading messages...
          </div>
        ) : !filtered?.length ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Messages</h3>
            <p className="text-muted-foreground">
              {filter === "all"
                ? "No contact messages yet. Messages from the contact form will appear here."
                : `No ${filter} messages.`}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border/60">
              {filtered.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/40 ${
                    msg.status === "unread" ? "bg-primary/5" : ""
                  } ${selectedId === msg.id ? "bg-primary/8 border-l-4 border-l-primary" : ""}`}
                  onClick={() => setSelectedId(msg.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0 mt-0.5">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${msg.status === "unread" ? "text-foreground" : "text-foreground"}`}>
                        {msg.name}
                      </span>
                      {msg.status === "unread" && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                      {msg.status === "replied" && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      )}
                    </div>
                    {msg.subject && (
                      <p className="text-sm font-medium text-foreground truncate">{msg.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (msg.status !== "archived") {
                          statusMutation.mutate({ id: msg.id, status: "archived" });
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    {canDelete() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this message?")) {
                            deleteMutation.mutate(msg.id);
                            if (selectedId === msg.id) setSelectedId(null);
                          }
                        }}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
