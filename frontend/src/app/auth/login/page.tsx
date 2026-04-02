"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ── Client-side demo bypass (works offline) ──────────────────────────────
    if (email === "demo@xcapital.io" && password === "Demo1234!") {
      setAuth(
        {
          id: "demo-user-id",
          email: "demo@xcapital.io",
          firstName: "Demo",
          lastName: "Investor",
          tier: "GOLD" as const,
          kycStatus: "APPROVED" as const,
          accreditationStatus: "ACCREDITED" as const,
          isActive: true,
          createdAt: new Date().toISOString(),
        } as Parameters<typeof setAuth>[0],
        "demo-access-token",
        "demo-refresh-token",
      );
      router.push("/dashboard");
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    try {
      const res = await authAPI.login(email, password);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message ?? "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-xc-black flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/5 pointer-events-none" />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)`,
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <div className="font-black text-3xl tracking-tight mb-2">
              <span className="gradient-text">X-CAPITAL</span>
            </div>
          </Link>
          <p className="text-xc-muted text-sm">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="bg-xc-card border border-xc-border rounded-2xl p-8 shadow-2xl shadow-black/60">
          {/* Demo access card */}
          <div className="mb-6 bg-purple-950/40 border border-purple-700/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-xc-purple-light" />
              <span className="text-sm font-bold text-xc-purple-light">
                Demo Access
              </span>
              <span className="ml-auto text-xs font-mono text-xc-muted bg-xc-dark/60 border border-xc-border px-2 py-0.5 rounded-full">
                GOLD tier
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-xc-muted mb-1">Email</div>
                <div className="font-mono text-xs text-white bg-xc-dark/60 border border-xc-border rounded-lg px-2.5 py-1.5 select-all">
                  demo@xcapital.io
                </div>
              </div>
              <div>
                <div className="text-xs text-xc-muted mb-1">Password</div>
                <div className="font-mono text-xs text-white bg-xc-dark/60 border border-xc-border rounded-lg px-2.5 py-1.5 select-all">
                  Demo1234!
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("demo@xcapital.io");
                setPassword("Demo1234!");
              }}
              className="w-full text-xs bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/40 text-xc-purple-light rounded-lg py-2 font-semibold transition-all cursor-pointer"
            >
              Auto-fill credentials →
            </button>
          </div>

          <h1 className="text-xl font-black text-white mb-6">Welcome back</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-xc-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xc-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full bg-xc-dark/60 border border-xc-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-xc-muted/50 focus:outline-none focus:border-xc-purple/60 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-xc-muted">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-xc-purple-light hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xc-muted" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-xc-dark/60 border border-xc-border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-xc-muted/50 focus:outline-none focus:border-xc-purple/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xc-muted hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-xc-red bg-red-950/30 border border-red-700/40 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-xc-border" />
            <span className="text-xs text-xc-muted">or</span>
            <div className="flex-1 h-px bg-xc-border" />
          </div>

          <p className="text-center text-sm text-xc-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-xc-purple-light hover:text-white font-semibold transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-xc-muted/60 mt-6 leading-relaxed">
          By signing in, you agree to X-CAPITAL&apos;s{" "}
          <span className="text-xc-muted hover:text-white cursor-pointer transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-xc-muted hover:text-white cursor-pointer transition-colors">
            Privacy Policy
          </span>
          . Investment products involve risk. Past performance does not
          guarantee future results.
        </p>
      </div>
    </div>
  );
}
