import React, { useState, useEffect } from "react";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  createSpreadsheet, 
  updateSheetValues, 
  ensureSheetTabExists, 
  fetchUserSpreadsheets 
} from "../lib/googleAuth";
import { User } from "firebase/auth";
import { 
  Siswa, 
  Staff, 
  Absensi, 
  KeuanganSiswa, 
  PendapatanLain, 
  PengeluaranKas,
  TagihanSiswa,
  Gender
} from "../types";
import { 
  FileSpreadsheet, 
  CloudLightning, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Database,
  ArrowRight,
  PlusCircle,
  HelpCircle
} from "lucide-react";

interface GoogleSheetsSyncProps {
  siswa: Siswa[];
  staff: Staff[];
  absensi: Absensi[];
  keuangan: KeuanganSiswa[];
  pendapatanLain: PendapatanLain[];
  pengeluaranKas: PengeluaranKas[];
  tagihan: TagihanSiswa[];
}

export default function GoogleSheetsSync({
  siswa,
  staff,
  absensi,
  keuangan,
  pendapatanLain,
  pengeluaranKas,
  tagihan
}: GoogleSheetsSyncProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Spreadsheets state
  const [spreadsheets, setSpreadsheets] = useState<any[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>("NEW");
  const [newSpreadsheetTitle, setNewSpreadsheetTitle] = useState(
    `LPK Nandita - Sinkronisasi ${new Date().toLocaleDateString("id-ID")}`
  );
  
  // Sync status state
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [syncError, setSyncError] = useState<string>("");
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Table options to sync
  const [tablesToSync, setTablesToSync] = useState({
    siswa: true,
    staff: true,
    absensiSiswa: true,
    absensiInstruktur: true,
    keuangan: true,
    kasOperasional: true
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
        loadSpreadsheets(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadSpreadsheets = async (accessToken: string) => {
    try {
      const files = await fetchUserSpreadsheets(accessToken);
      setSpreadsheets(files);
    } catch (err) {
      console.error("Gagal mengambil spreadsheets:", err);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setSyncError("");
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        loadSpreadsheets(result.accessToken);
      }
    } catch (err: any) {
      console.error("Login gagal:", err);
      setSyncError("Gagal masuk dengan Google. Silakan coba lagi.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin memutuskan sambungan akun Google Anda?")) {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setSpreadsheets([]);
      setSelectedSpreadsheetId("NEW");
    }
  };

  const toggleTable = (key: keyof typeof tablesToSync) => {
    setTablesToSync(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSync = async () => {
    if (!token) return;

    // Explicit user confirmation dialog
    const targetText = selectedSpreadsheetId === "NEW" 
      ? `membuat Spreadsheet baru bernama "${newSpreadsheetTitle}"`
      : "memperbarui dan menimpa tab data pada Spreadsheet yang dipilih";

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menyinkronkan data ke Google Sheets?\nTindakan ini akan ${targetText} di Google Drive Anda.`
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setSyncError("");
    setSyncSuccess(false);
    setSyncStatus("Menginisialisasi sinkronisasi...");

    try {
      let spreadsheetId = selectedSpreadsheetId;
      let spreadsheetUrl = "";

      // 1. Create spreadsheet if new
      if (selectedSpreadsheetId === "NEW") {
        setSyncStatus(`Membuat spreadsheet baru: "${newSpreadsheetTitle}"...`);
        const sheetMeta = await createSpreadsheet(token, newSpreadsheetTitle);
        spreadsheetId = sheetMeta.spreadsheetId;
        spreadsheetUrl = sheetMeta.spreadsheetUrl;
      } else {
        const found = spreadsheets.find(s => s.id === selectedSpreadsheetId);
        spreadsheetUrl = found ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : "";
      }

      // 2. Sync Siswa Table
      if (tablesToSync.siswa) {
        setSyncStatus("Menulis Data Siswa...");
        await ensureSheetTabExists(token, spreadsheetId, "Data Siswa");
        const header = ["NIS", "NIK", "Nama Siswa", "Gender", "Program Studi", "Angkatan", "Agama", "Tanggal Daftar", "Status", "Alamat", "No HP"];
        const rows = siswa.map(s => [
          s.nis,
          s.nik || "-",
          s.nama,
          s.gender === Gender.LakiLaki ? "Laki-laki" : "Perempuan",
          s.programStudi,
          s.angkatan,
          s.agama || "Islam",
          s.tanggalDaftar,
          s.status,
          s.alamat,
          s.noHp
        ]);
        await updateSheetValues(token, spreadsheetId, "'Data Siswa'!A1", [header, ...rows]);
      }

      // 3. Sync Staff & Instruktur Table
      if (tablesToSync.staff) {
        setSyncStatus("Menulis Data Staf & Instruktur...");
        await ensureSheetTabExists(token, spreadsheetId, "Staf & Instruktur");
        const header = ["Nama Lengkap", "NIP", "Peran", "No HP", "Alamat", "Status"];
        const rows = staff.map(st => [
          st.nama,
          st.nip || "-",
          st.role,
          st.noHp,
          st.alamat,
          st.status
        ]);
        await updateSheetValues(token, spreadsheetId, "'Staf & Instruktur'!A1", [header, ...rows]);
      }

      // 4. Sync Absensi Siswa
      if (tablesToSync.absensiSiswa) {
        setSyncStatus("Menulis Data Absensi Siswa...");
        await ensureSheetTabExists(token, spreadsheetId, "Absensi Siswa");
        const header = ["Tanggal", "ID Target/NIS", "Nama Siswa", "Status Absensi", "Keterangan / Alasan"];
        const rows = absensi
          .filter(a => a.kategori === "Siswa")
          .map(a => [
            a.tanggal,
            a.targetId,
            a.nama,
            a.status,
            a.keterangan || "-"
          ]);
        await updateSheetValues(token, spreadsheetId, "'Absensi Siswa'!A1", [header, ...rows]);
      }

      // 5. Sync Absensi Instruktur
      if (tablesToSync.absensiInstruktur) {
        setSyncStatus("Menulis Data Absensi Instruktur & Staf...");
        await ensureSheetTabExists(token, spreadsheetId, "Absensi Staf & Instruktur");
        const header = ["Tanggal", "Nama Personel", "Kategori", "Status Absensi", "Keterangan"];
        const rows = absensi
          .filter(a => a.kategori !== "Siswa")
          .map(a => [
            a.tanggal,
            a.nama,
            a.kategori,
            a.status,
            a.keterangan || "-"
          ]);
        await updateSheetValues(token, spreadsheetId, "'Absensi Staf & Instruktur'!A1", [header, ...rows]);
      }

      // 6. Sync Keuangan
      if (tablesToSync.keuangan) {
        setSyncStatus("Menulis Data Keuangan & Piutang...");
        await ensureSheetTabExists(token, spreadsheetId, "Keuangan & Piutang");
        const header = ["Nama Siswa", "Total Biaya Kursus", "Total Terbayar", "Sisa Piutang", "Status Keuangan"];
        const rows = keuangan.map(k => [
          k.siswaNama,
          k.totalBiaya,
          k.totalBayar,
          k.piutang,
          k.statusBayar
        ]);
        await updateSheetValues(token, spreadsheetId, "'Keuangan & Piutang'!A1", [header, ...rows]);
      }

      // 7. Sync Kas Operasional
      if (tablesToSync.kasOperasional) {
        setSyncStatus("Menulis Data Kas Operasional...");
        await ensureSheetTabExists(token, spreadsheetId, "Kas Operasional & Ledger");
        const header = ["Kategori", "Keterangan", "Jumlah (IDR)", "Tanggal"];
        const rows: any[][] = [];
        pendapatanLain.forEach(p => {
          rows.push(["Pendapatan Lain", p.keterangan, p.jumlah, p.tanggal]);
        });
        pengeluaranKas.forEach(pk => {
          rows.push(["Pengeluaran Kas", pk.keterangan, pk.jumlah, pk.tanggal]);
        });
        await updateSheetValues(token, spreadsheetId, "'Kas Operasional & Ledger'!A1", [header, ...rows]);
      }

      setSyncStatus(`Berhasil menyinkronkan data!`);
      setSyncSuccess(true);
      loadSpreadsheets(token); // reload list to see new spreadsheet

      if (spreadsheetUrl) {
        setSyncStatus(
          `Sukses! Data telah disinkronkan. Buka Spreadsheet di Google Drive:\n${spreadsheetUrl}`
        );
      }
    } catch (err: any) {
      console.error("Sinkronisasi gagal:", err);
      setSyncError(err.message || "Gagal menyinkronkan data. Pastikan akun Google Anda memiliki akses.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-full overflow-y-auto font-sans" id="google-sheets-sync-sheet">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-800 to-[#002d5c] p-6 rounded-2xl text-white shadow-md">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/10 rounded-xl border border-white/20">
            <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Integrasi Google Sheets</h2>
            <p className="text-xs text-emerald-100 mt-1">
              Sinkronisasikan seluruh buku induk, absensi, dan keuangan LPK Nandita langsung ke Google Spreadsheet.
            </p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 text-xs gap-3">
            <img 
              src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80"} 
              alt={user.displayName || "Google User"}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full border border-emerald-400"
            />
            <div className="text-left">
              <p className="font-bold">{user.displayName}</p>
              <p className="text-[10px] text-white/70">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1 hover:bg-white/10 rounded text-red-300 transition"
              title="Putuskan Sambungan"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {needsAuth ? (
        /* Sign-In View */
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-4">
            <CloudLightning className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Hubungkan Akun Google Anda</h3>
          <p className="text-xs text-gray-500 mt-2 mb-6">
            Aplikasi memerlukan izin untuk membaca dan menulis spreadsheet di akun Google Drive Anda. Kami menyinkronkan data langsung dari browser Anda secara aman.
          </p>

          <button 
            id="gsi-login-button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>{isLoggingIn ? "Menghubungkan..." : "Masuk dengan Google"}</span>
          </button>

          {syncError && (
            <p className="text-xs text-red-500 font-medium mt-4">{syncError}</p>
          )}
        </div>
      ) : (
        /* Sync Actions Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Sync Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Konfigurasi Target Spreadsheet</span>
              </h3>

              <div className="space-y-4">
                {/* Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Pilih Spreadsheet di Google Drive
                  </label>
                  <select
                    value={selectedSpreadsheetId}
                    onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="NEW">✨ Buat Spreadsheet Baru Baru</option>
                    {spreadsheets.map(s => (
                      <option key={s.id} value={s.id}>
                        📂 {s.name} (Modifikasi terakhir: {new Date(s.modifiedTime).toLocaleDateString("id-ID")})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Title for New Sheet */}
                {selectedSpreadsheetId === "NEW" && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nama File Spreadsheet Baru *
                    </label>
                    <input
                      type="text"
                      value={newSpreadsheetTitle}
                      onChange={(e) => setNewSpreadsheetTitle(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                      placeholder="Masukkan nama spreadsheet..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Checklist of Tables to Sync */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pilih Data yang Akan Disinkronkan</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "siswa", label: "Data Siswa LPK", count: siswa.length, color: "border-amber-400" },
                  { key: "staff", label: "Data Staf & Instruktur", count: staff.length, color: "border-blue-400" },
                  { key: "absensiSiswa", label: "Data Absensi Siswa", count: absensi.filter(a => a.kategori === "Siswa").length, color: "border-indigo-400" },
                  { key: "absensiInstruktur", label: "Data Absensi Instruktur & Staf", count: absensi.filter(a => a.kategori !== "Siswa").length, color: "border-red-400" },
                  { key: "keuangan", label: "Data Keuangan & Piutang", count: keuangan.length, color: "border-emerald-400" },
                  { key: "kasOperasional", label: "Kas Operasional & Ledger", count: pendapatanLain.length + pengeluaranKas.length, color: "border-teal-400" }
                ].map((item) => (
                  <div 
                    key={item.key}
                    onClick={() => toggleTable(item.key as any)}
                    className={`border rounded-xl p-4 cursor-pointer transition flex items-center justify-between hover:bg-slate-50 ${
                      tablesToSync[item.key as keyof typeof tablesToSync]
                        ? "border-emerald-600 bg-emerald-50/20"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox"
                        checked={tablesToSync[item.key as keyof typeof tablesToSync]}
                        onChange={() => {}} // handled by div click
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-800">{item.label}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{item.count} rekaman ditemukan</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-6 border-t border-gray-100 pt-6 flex flex-col items-center">
                <button
                  id="btn-sync-to-google"
                  onClick={handleSync}
                  disabled={isSyncing || !Object.values(tablesToSync).some(Boolean)}
                  className="w-full md:w-auto px-10 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CloudLightning className="w-5 h-5" />
                  )}
                  <span>{isSyncing ? "Menjalankan Sinkronisasi..." : "Sinkronisasikan Sekarang"}</span>
                </button>

                {/* Display Success or Error */}
                {syncStatus && (
                  <div className={`w-full mt-4 p-4 rounded-xl text-center text-xs border ${
                    syncError 
                      ? "bg-red-50 border-red-200 text-red-800" 
                      : syncSuccess 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-slate-100 border-slate-200 text-slate-800"
                  }`}>
                    {syncError ? (
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="font-semibold">{syncError}</span>
                      </div>
                    ) : syncSuccess ? (
                      <div className="space-y-2">
                        <p className="font-bold flex items-center justify-center gap-1.5 text-sm text-emerald-700">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                          <span>Berhasil Disinkronkan!</span>
                        </p>
                        <p className="whitespace-pre-line leading-relaxed font-mono text-[11px] bg-white p-2 border border-emerald-100 rounded-lg">
                          {syncStatus}
                        </p>
                      </div>
                    ) : (
                      <p className="font-medium animate-pulse">{syncStatus}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Guide Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-1.5">
                <HelpCircle className="w-4.5 h-4.5 text-emerald-600" />
                <span>Panduan Sinkronisasi</span>
              </h3>

              <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">1</div>
                  <p><strong>Hubungkan Akun:</strong> Masuk menggunakan akun Google Anda yang memiliki akses Google Drive dan Google Sheets.</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">2</div>
                  <p><strong>Pilih File:</strong> Anda dapat membuat Spreadsheet baru langsung dari sistem atau menimpa lembar kerja pada Spreadsheet yang sudah ada.</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">3</div>
                  <p><strong>Pemisahan Tab:</strong> Sistem akan otomatis membuat tab-tab yang rapi di dalam file Anda: <em>"Data Siswa"</em>, <em>"Staf & Instruktur"</em>, <em>"Absensi Siswa"</em>, <em>"Absensi Staf & Instruktur"</em>, <em>"Keuangan"</em>, dan <em>"Kas Operasional"</em>.</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">4</div>
                  <p><strong>Dua Arah / Satu Arah:</strong> Sinkronisasi ini bersifat satu arah yaitu melakukan export data lokal dari sistem ke Google Spreadsheet Anda secara lengkap dan akurat.</p>
                </div>
              </div>
            </div>
            
            {/* Real-time stats */}
            <div className="bg-[#001f3f] text-white rounded-2xl p-6 shadow-md border border-white/10 relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] w-24 h-24 bg-white/5 rounded-full" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-3">Statistik Data Lokal</h4>
              
              <div className="space-y-2.5 font-mono text-[11px] text-gray-300">
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span>Siswa Aktif:</span>
                  <span className="text-white font-bold">{siswa.length}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span>Instruktur & Staf:</span>
                  <span className="text-white font-bold">{staff.length}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span>Absensi Hari Ini:</span>
                  <span className="text-white font-bold">
                    {absensi.filter(a => a.tanggal === new Date().toISOString().split("T")[0]).length}
                  </span>
                </div>
                <div className="flex justify-between pb-1.5">
                  <span>Total Transaksi Kas:</span>
                  <span className="text-white font-bold">{pendapatanLain.length + pengeluaranKas.length}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
