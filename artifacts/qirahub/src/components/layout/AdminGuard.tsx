import { Redirect } from "wouter";
import { isAdminAuthed, adminLoginWithUser, getAdminRole } from "@/lib/admin-auth";
import { useAuthStore } from "@/lib/user-auth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  if (user && token && (user.isAdmin || user.role === "moderator")) {
    // Never downgrade an existing key_admin session — the admin key login
    // sets this and it must not be overwritten by a regular JWT re-auth.
    if (getAdminRole() !== "key_admin") {
      adminLoginWithUser(user, token);
    } else {
      // Already holding a key_admin session; just keep the authed flag alive.
      sessionStorage.setItem("qirahub_admin_authed", "1");
    }
  } else if (!isAdminAuthed()) {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}
