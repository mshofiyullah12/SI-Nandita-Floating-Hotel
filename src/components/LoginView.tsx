import React, { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Key, UserCheck, Ship, Anchor, User, UserPlus, Info, AlertCircle } from "lucide-react";
import { UserAccount } from "../types";
import NanditaLogo from "./NanditaLogo";
import { googleSignIn } from "../lib/googleAuth";

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
  onRegister?: (user: UserAccount) => void;
  userAccounts: UserAccount[];
  logoUrl?: string;
}

export default function LoginView({ onLogin, userAccounts, logoUrl }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Silakan masukkan username dan password!");
      return;
    }

    const foundUser = userAccounts.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase().trim() &&
        (u.password === password || (!u.password && password === "admin")) // Fallback if no password set
    );

    if (foundUser) {
      if (foundUser.status === "Non-Aktif") {
        setError("Akun Anda dinonaktifkan. Hubungi admin!");
        return;
      }
      onLogin(foundUser);
    } else {
      setError("Username atau password salah!");
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setSuccess("");
    setIsGoogleLoading(true);
    try {
      const authResult = await googleSignIn();
      if (authResult) {
        const { user, accessToken } = authResult;
        const email = user.email || "";
        const displayName = user.displayName || user.email?.split("@")[0] || "Google User";
        
        // Search if user exists by username (email prefix or email)
        const googleUsername = email ? email.split("@")[0].toLowerCase() : displayName.toLowerCase().replace(/\s+/g, "");
        
        let existingUser = userAccounts.find(
          (u) => 
            (u.googleEmail && u.googleEmail.toLowerCase() === email.toLowerCase()) ||
            u.username.toLowerCase() === googleUsername || 
            (email && u.username.toLowerCase() === email.toLowerCase())
        );

        if (existingUser) {
          if (existingUser.status === "Non-Aktif") {
            throw new Error("Akun Google ini telah dinonaktifkan oleh admin.");
          }
          // If existing user has no googleEmail saved yet, let's link it
          if (!existingUser.googleEmail && email) {
            existingUser.googleEmail = email;
          }
          setSuccess(`Selamat datang kembali, ${existingUser.nama}!`);
          setTimeout(() => {
            onLogin(existingUser!);
          }, 1000);
        } else {
          setError("Akun Google Anda belum terdaftar di sistem. Silakan hubungi administrator untuk mendaftarkan akun Anda.");
        }
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err?.message || "Gagal menghubungkan Akun Google Anda.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001124] via-[#001f3f] to-[#002d5c] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background design elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        
        {/* Official Brand Logo */}
        <NanditaLogo variant="vertical" height={80} lightText logoUrl={logoUrl} className="mb-4" />

        {/* Form Header info */}
        <p className="text-[11px] text-slate-300 text-center max-w-xs leading-relaxed opacity-90 mb-6">
          Masuk ke sistem operasional LPK Nandita Floating Hotel.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl text-center font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs p-3 rounded-xl text-center font-medium">
              ✓ {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username..."
              className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full bg-slate-900/40 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#001124] font-bold text-sm rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] mt-4"
          >
            Masuk ke Aplikasi
          </button>
        </form>

        {/* Separator */}
        <div className="w-full flex items-center justify-between gap-3 my-5">
          <div className="h-[1px] bg-white/10 flex-grow" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Atau</span>
          <div className="h-[1px] bg-white/10 flex-grow" />
        </div>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-semibold shadow-sm transition active:scale-[0.99] cursor-pointer"
        >
          {isGoogleLoading ? (
            <span className="animate-pulse">Menghubungkan...</span>
          ) : (
            <>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Masuk dengan Google</span>
            </>
          )}
        </button>

        {/* Footer credits */}
        <p className="text-[9px] text-slate-500 font-mono mt-6">
          Sistem Terlindungi SSL / Enskripsi Pengguna Lokal
        </p>
      </div>
    </div>
  );
}

