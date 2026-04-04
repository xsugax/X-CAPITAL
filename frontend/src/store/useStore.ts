import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Wallet, Portfolio } from "@/types";

// Simple hash for client-side password storage (not bcrypt, but acceptable for client-only demo)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "xcapital-salt-2026");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Default God Admin account — always available
const GOD_ADMIN_USER: User = {
  id: "god-admin-001",
  email: "admin@xcapital.io",
  firstName: "Platform",
  lastName: "Admin",
  role: "GOD_ADMIN",
  tier: "BLACK" as const,
  kycStatus: "APPROVED" as const,
  accreditationStatus: "ACCREDITED" as const,
  createdAt: "2024-01-01T00:00:00Z",
  isFrozen: false,
  isSuspended: false,
  isBlocked: false,
  tradingEnabled: true,
  profitHold: false,
  profitMultiplier: 1.0,
  balance: 0,
  country: "US",
  trades: 0,
  // passwordHash will be set during init
  passwordHash: "",
};

// Pre-hashed password for admin@xcapital.io / Admin2026!
const GOD_ADMIN_PW_HASH =
  "6e3a6c3f8e4b2a1d9c8f7e6d5b4a3c2e1f0d9c8b7a6e5d4c3b2a1f0e9d8c7b6"; // placeholder, will be computed

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  registeredUsers: User[];
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  registerUser: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginUser: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => User[];
  updateUserById: (userId: string, updates: Partial<User>) => void;
  deleteUserById: (userId: string) => void;
  createUserAsAdmin: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    tier?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  addAuditEntry: (entry: AuditEntry) => void;
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  level: "info" | "action" | "warning" | "success" | "danger";
}

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

interface DataState {
  wallet: Wallet | null;
  portfolio: Portfolio | null;
  setWallet: (wallet: Wallet) => void;
  setPortfolio: (portfolio: Portfolio) => void;
}

type Store = AuthState & UIState & DataState;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ─── Auth ─────────────────────────────────────────────────────────────
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      registeredUsers: [],
      auditLog: [],

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("xc_access_token", accessToken);
          localStorage.setItem("xc_refresh_token", refreshToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("xc_access_token");
          localStorage.removeItem("xc_refresh_token");
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          portfolio: null,
          wallet: null,
        });
      },

      registerUser: async ({ firstName, lastName, email, password }) => {
        const state = get();
        const existing = state.registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (existing)
          return {
            success: false,
            error: "An account with this email already exists.",
          };

        const pwHash = await hashPassword(password);
        const newUser: User = {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          email: email.toLowerCase(),
          firstName,
          lastName,
          role: "USER",
          tier: "CORE",
          kycStatus: "NOT_STARTED",
          accreditationStatus: "NOT_ACCREDITED",
          createdAt: new Date().toISOString(),
          isFrozen: false,
          isSuspended: false,
          isBlocked: false,
          tradingEnabled: true,
          profitHold: false,
          profitMultiplier: 1.0,
          passwordHash: pwHash,
          balance: 0,
          lastLogin: new Date().toISOString(),
          country: "",
          trades: 0,
        };

        const token = `xc-token-${Date.now()}`;
        set({
          registeredUsers: [...state.registeredUsers, newUser],
          user: newUser,
          accessToken: token,
          refreshToken: `xc-refresh-${Date.now()}`,
          isAuthenticated: true,
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("xc_access_token", token);
        }
        return { success: true };
      },

      loginUser: async (email, password) => {
        const state = get();
        const pwHash = await hashPassword(password);

        // Check God Admin hardcoded account
        const godAdminHash = await hashPassword("Admin2026!");
        if (
          email.toLowerCase() === "admin@xcapital.io" &&
          pwHash === godAdminHash
        ) {
          const adminUser = state.registeredUsers.find(
            (u) => u.email === "admin@xcapital.io",
          ) || {
            ...GOD_ADMIN_USER,
            passwordHash: godAdminHash,
            lastLogin: new Date().toISOString(),
          };

          // Ensure admin exists in registered users
          const exists = state.registeredUsers.some(
            (u) => u.email === "admin@xcapital.io",
          );
          const updatedUsers = exists
            ? state.registeredUsers.map((u) =>
                u.email === "admin@xcapital.io"
                  ? { ...u, lastLogin: new Date().toISOString() }
                  : u,
              )
            : [
                ...state.registeredUsers,
                { ...adminUser, lastLogin: new Date().toISOString() },
              ];

          const token = `xc-token-${Date.now()}`;
          set({
            registeredUsers: updatedUsers,
            user: { ...adminUser, lastLogin: new Date().toISOString() },
            accessToken: token,
            refreshToken: `xc-refresh-${Date.now()}`,
            isAuthenticated: true,
          });
          return { success: true };
        }

        // Check registered users
        const foundUser = state.registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (!foundUser)
          return { success: false, error: "No account found with this email." };
        if (foundUser.passwordHash !== pwHash)
          return { success: false, error: "Incorrect password." };
        if (foundUser.isBlocked)
          return {
            success: false,
            error: "This account has been blocked. Contact support.",
          };
        if (foundUser.isSuspended)
          return {
            success: false,
            error: "This account is suspended. Contact support.",
          };

        const updatedUser = {
          ...foundUser,
          lastLogin: new Date().toISOString(),
        };
        const token = `xc-token-${Date.now()}`;
        set({
          registeredUsers: state.registeredUsers.map((u) =>
            u.id === foundUser.id ? updatedUser : u,
          ),
          user: updatedUser,
          accessToken: token,
          refreshToken: `xc-refresh-${Date.now()}`,
          isAuthenticated: true,
        });
        return { success: true };
      },

      getAllUsers: () => get().registeredUsers,

      updateUserById: (userId, updates) => {
        set((state) => ({
          registeredUsers: state.registeredUsers.map((u) =>
            u.id === userId ? { ...u, ...updates } : u,
          ),
          // Also update the current user if it matches
          user:
            state.user?.id === userId
              ? { ...state.user, ...updates }
              : state.user,
        }));
      },

      deleteUserById: (userId) => {
        set((state) => ({
          registeredUsers: state.registeredUsers.filter((u) => u.id !== userId),
        }));
      },

      createUserAsAdmin: async ({
        firstName,
        lastName,
        email,
        password,
        role = "USER",
        tier = "CORE",
      }) => {
        const state = get();
        const existing = state.registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (existing)
          return {
            success: false,
            error: "An account with this email already exists.",
          };

        const pwHash = await hashPassword(password);
        const newUser: User = {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          email: email.toLowerCase(),
          firstName,
          lastName,
          role: role as User["role"],
          tier: tier as User["tier"],
          kycStatus: "APPROVED",
          accreditationStatus: "NOT_ACCREDITED",
          createdAt: new Date().toISOString(),
          isFrozen: false,
          isSuspended: false,
          isBlocked: false,
          tradingEnabled: true,
          profitHold: false,
          profitMultiplier: 1.0,
          passwordHash: pwHash,
          balance: 0,
          lastLogin: "",
          country: "",
          trades: 0,
        };

        set({ registeredUsers: [...state.registeredUsers, newUser] });
        return { success: true };
      },

      addAuditEntry: (entry) => {
        set((state) => ({
          auditLog: [entry, ...state.auditLog].slice(0, 200),
        }));
      },

      // ─── UI ───────────────────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ─── App Data ─────────────────────────────────────────────────────────
      wallet: null,
      portfolio: null,
      setWallet: (wallet) => set({ wallet }),
      setPortfolio: (portfolio) => set({ portfolio }),
    }),
    {
      name: "xcapital-store",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
        auditLog: state.auditLog,
      }),
    },
  ),
);
