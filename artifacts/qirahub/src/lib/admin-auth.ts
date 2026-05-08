const SESSION_KEY = "qirahub_admin_authed";
const ROLE_KEY = "qirahub_user_role";
const TOKEN_KEY = "qirahub_user_token";
const SUPER_ADMIN_EMAIL = "qirahub@gmail.com";

export type AdminRole = "key_admin" | "admin" | "moderator";

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export async function adminLogin(key: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/admin-key-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) return false;
    const { token } = await res.json();
    sessionStorage.setItem(SESSION_KEY, "1");
    sessionStorage.setItem(ROLE_KEY, "key_admin");
    sessionStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
}

export function adminLoginWithUser(user: { isAdmin: boolean; role?: string; email?: string }, token: string): void {
  sessionStorage.setItem(SESSION_KEY, "1");
  sessionStorage.setItem(TOKEN_KEY, token);

  // The super admin email always gets full key_admin powers
  if (user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
    sessionStorage.setItem(ROLE_KEY, "key_admin");
    return;
  }

  const role: AdminRole = user.isAdmin ? "admin" : "moderator";
  sessionStorage.setItem(ROLE_KEY, role);
}

export function getAdminRole(): AdminRole {
  const role = sessionStorage.getItem(ROLE_KEY);
  if (role === "key_admin") return "key_admin";
  if (role === "admin") return "admin";
  return "moderator"; // safe default — least privileged
}

/** Returns true only for the Super Admin (logged in via admin key). */
export function isSuperAdmin(): boolean {
  return getAdminRole() === "key_admin";
}

/**
 * Returns true only for the Super Admin.
 * Regular Admins and Moderators cannot delete anything.
 */
export function canDelete(): boolean {
  return isSuperAdmin();
}

/**
 * Returns true for both Super Admin and Admin — both can access and edit
 * the full admin panel. Moderators are excluded.
 */
export function isFullAdmin(): boolean {
  return getAdminRole() !== "moderator";
}

export function adminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
