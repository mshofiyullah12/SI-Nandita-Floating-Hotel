import React, { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Key, UserCheck, Ship, Anchor } from "lucide-react";
import { UserAccount } from "../types";

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
  userAccounts: UserAccount[];
}

export default function LoginView({ onLogin, userAccounts }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleQuickLogin = (user: UserAccount) => {
    setUsername(user.username);
    setPassword(user.password || "admin");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001124] via-[#001f3f] to-[#002d5c] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background design elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        
        {/* Logo Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 border border-amber-300 relative">
          <Anchor className="w-6 h-6 text-[#001124] absolute opacity-20" />
          <Ship className="w-9 h-9 text-[#001124] relative z-10 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-white text-center tracking-tight font-display">
          LPK NANDITA FLOATING HOTEL
        </h2>
        <p className="text-xs text-amber-400 font-mono uppercase tracking-widest mt-1">
          Sistem Informasi Terpadu Buku Induk
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl text-center font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block">
              Username
            </label>
            <div className="relative">
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition"
              />
            </div>
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
                className="w-full bg-slate-900/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#001124] font-bold text-sm rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-6"
          >
            Masuk ke Aplikasi
          </button>
        </form>

        {/* Preset accounts for testing convenience */}
        <div className="w-full mt-8 border-t border-white/10 pt-6">
          <p className="text-[10px] font-mono text-center text-slate-400 uppercase tracking-widest mb-3">
            🔐 Akun Demo Cepat (Klik untuk Isi)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {userAccounts.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-2.5 text-center transition flex flex-col items-center justify-center cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400 mb-1" />
                <span className="text-[10px] font-bold text-white block capitalize">
                  {u.username}
                </span>
                <span className="text-[8px] text-slate-400 block mt-0.5">
                  ({u.role})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer credits */}
        <p className="text-[9px] text-slate-500 font-mono mt-8">
          Sistem Terlindungi SSL / Enskripsi Pengguna Lokal
        </p>
      </div>
    </div>
  );
}
