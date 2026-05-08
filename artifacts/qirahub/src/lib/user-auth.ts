import { create } from "zustand";

const TOKEN_KEY = "qirahub_token";
const USER_KEY = "qirahub_user";
const API_BASE = "/api";

export interface User {
  id: number;
  email: string;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  role?: string;
  avatarUrl: string | null;
  bio?: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  setAuth: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, token, isLoading: false });
  },
  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    set({ user: updated });
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isLoading: false });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isLoading: false });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Login failed" }));
    throw new Error(data.error || "Login failed");
  }
  return res.json();
}

export async function registerUser(data: {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({ error: "Registration failed" }));
    throw new Error(d.error || "Registration failed");
  }
  return res.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({ error: "Failed to change password" }));
    throw new Error(d.error || "Failed to change password");
  }
}

export async function forgotPassword(email: string): Promise<{ token?: string; emailSent?: boolean }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(d.error || "Failed to process request");
  }
  const data = await res.json();
  if (data.token) return { token: data.token };
  return { emailSent: true };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({ error: "Failed to reset password" }));
    throw new Error(d.error || "Failed to reset password");
  }
}

export async function updateEmail(newEmail: string, password: string): Promise<{ email: string; token: string }> {
  const res = await fetch(`${API_BASE}/auth/update-email`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ newEmail, password }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({ error: "Failed to update email" }));
    throw new Error(d.error || "Failed to update email");
  }
  const data = await res.json();
  return { email: data.email, token: data.token };
}

export async function updateProfile(data: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/update-profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({ error: "Failed to update profile" }));
    throw new Error(d.error || "Failed to update profile");
  }
  const result = await res.json();
  return result.user;
}

export function getToken(): string | null {
  return useAuthStore.getState().token;
}

export function isLoggedIn(): boolean {
  return !!useAuthStore.getState().user;
}
