import React, { useState } from "react";
import { UserAccount } from "../types";
import { Plus, Search, Edit2, Trash2, Key, Shield, UserX, UserCheck } from "lucide-react";

export const AVAILABLE_SHEETS = [
  "Dashboard & Ringkasan",
  "Siswa",
  "Staf & Instruktur",
  "Absensi",
  "Sertifikat",
  "Keuangan & Piutang",
  "Tagihan Siswa",
  "Kas Operasional",
  "Utang Pegawai",
  "Payroll Gaji",
  "Lowongan / Job",
  "Laporan Keuangan",
  "Data Pengguna",
  "Pengaturan"
];

interface UserAccountSheetProps {
  userAccounts: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
}

export default function UserAccountSheet({
  userAccounts,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}: UserAccountSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [role, setRole] = useState<"Admin" | "Staf" | "Keuangan" | "Instruktur">("Staf");
  const [status, setStatus] = useState<"Aktif" | "Non-Aktif">("Aktif");
  const [password, setPassword] = useState("");
  const [allowedTabs, setAllowedTabs] = useState<string[]>([]);

  const filteredUsers = userAccounts.filter(
    (u) =>
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = (newRole: "Admin" | "Staf" | "Keuangan" | "Instruktur") => {
    setRole(newRole);
    if (newRole === "Instruktur") {
      setAllowedTabs(["Absensi"]);
    } else if (newRole === "Admin") {
      setAllowedTabs([...AVAILABLE_SHEETS]);
    } else if (newRole === "Keuangan") {
      setAllowedTabs(AVAILABLE_SHEETS.filter(t => !["Data Pengguna", "Pengaturan"].includes(t)));
    } else if (newRole === "Staf") {
      setAllowedTabs(AVAILABLE_SHEETS.filter(t => !["Data Pengguna", "Pengaturan"].includes(t)));
    }
  };

  const handleOpenAdd = () => {
    setUsername("");
    setNama("");
    setRole("Staf");
    setStatus("Aktif");
    setPassword("12345");
    setAllowedTabs(AVAILABLE_SHEETS.filter(t => !["Data Pengguna", "Pengaturan"].includes(t)));
    setEditingUser(null);
    setShowAddForm(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setUsername(user.username);
    setNama(user.nama);
    setRole(user.role);
    setStatus(user.status);
    setPassword(user.password || "12345");
    
    // Default allowed tabs based on role if undefined
    if (user.allowedTabs) {
      setAllowedTabs(user.allowedTabs);
    } else {
      if (user.role === "Instruktur") {
        setAllowedTabs(["Absensi"]);
      } else if (user.role === "Admin") {
        setAllowedTabs([...AVAILABLE_SHEETS]);
      } else {
        setAllowedTabs(AVAILABLE_SHEETS.filter(t => !["Data Pengguna", "Pengaturan"].includes(t)));
      }
    }
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !nama.trim()) {
      alert("Harap isi semua kolom wajib!");
      return;
    }

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        username: username.trim(),
        nama: nama.trim(),
        role,
        status,
        password: password.trim(),
        allowedTabs,
      });
    } else {
      // Check duplicate username
      if (userAccounts.some((u) => u.username.toLowerCase() === username.toLowerCase().trim())) {
        alert("Username sudah terdaftar! Pilih username lain.");
        return;
      }
      onAddUser({
        id: `USR-${Date.now().toString().slice(-4)}`,
        username: username.trim().toLowerCase(),
        nama: nama.trim(),
        role,
        status,
        password: password.trim() || "12345",
        allowedTabs,
      });
    }

    setShowAddForm(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (userAccounts.length <= 1) {
      alert("Tidak dapat menghapus semua pengguna! Harus ada minimal 1 akun.");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) {
      onDeleteUser(id);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-grid">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
            Row 41-60: Master Data
          </span>
          <h2 className="text-xl font-bold text-slate-950 font-display mt-2 flex items-center">
            <Shield className="w-5 h-5 text-[#001f3f] mr-2" />
            Master Data Pengguna Aplikasi
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Kelola data staf login, penetapan tingkat akses (Admin, Staf, Keuangan, Instruktur) & masa aktif akun.
          </p>
        </div>

        <button
          id="btn-add-pengguna"
          onClick={handleOpenAdd}
          className="mt-4 md:mt-0 px-4 py-2 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center w-max"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="my-6 flex items-center space-x-3 max-w-md bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#001f3f]">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          id="search-pengguna"
          type="text"
          placeholder="Cari nama, username, atau tingkatan akses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs focus:outline-none placeholder-slate-400 text-slate-700 font-sans"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Tingkat Akses</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{user.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{user.nama}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{user.username}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.role === "Admin"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : user.role === "Keuangan"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : user.role === "Instruktur"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`flex items-center text-[10px] font-bold w-max ${
                          user.status === "Aktif" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {user.status === "Aktif" ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            Non-Aktif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 hover:bg-[#001f3f]/5 rounded-lg text-[#001f3f] transition"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.nama)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Tidak ada data pengguna ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Input/Edit Form Panel */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 h-max">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <Key className="w-4 h-4 text-amber-500 mr-1.5" />
              {editingUser ? "Modifikasi Akun Pengguna" : "Registrasi Pengguna Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="user-nama"
                  type="text"
                  required
                  placeholder="e.g. Budi Santoso"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Username Akun <span className="text-red-500">*</span>
                </label>
                <input
                  id="user-username"
                  type="text"
                  required
                  placeholder="e.g. budisantoso"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!editingUser}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Sandi / Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="user-password"
                  type="password"
                  required
                  placeholder="Masukkan sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Tingkat Akses
                  </label>
                  <select
                    id="user-role"
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staf">Staf</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Instruktur">Instruktur</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Status Akun
                  </label>
                  <select
                    id="user-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              {/* Granular Permission Checklist Grid */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex justify-between items-center">
                  <span>Hak Akses Lembar Kerja (Sheets)</span>
                  <span className="text-[9px] text-amber-600 font-bold lowercase">({allowedTabs.length} dipilih)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-3 bg-slate-50 border border-slate-200/60 rounded-xl max-h-44 overflow-y-auto">
                  {AVAILABLE_SHEETS.map((sheet) => {
                    const isChecked = allowedTabs.includes(sheet);
                    return (
                      <label key={sheet} className="flex items-center space-x-2 text-[10px] text-slate-700 cursor-pointer hover:text-[#001f3f] select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setAllowedTabs(allowedTabs.filter(t => t !== sheet));
                            } else {
                              setAllowedTabs([...allowedTabs, sheet]);
                            }
                          }}
                          className="rounded text-[#001f3f] focus:ring-[#001f3f] w-3 h-3"
                        />
                        <span className="truncate">{sheet}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  id="btn-save-pengguna"
                  type="submit"
                  className="flex-1 py-2 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  {editingUser ? "Simpan Perubahan" : "Simpan Pengguna"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
