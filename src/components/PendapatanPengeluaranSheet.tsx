import React, { useState } from "react";
import { PendapatanLain, PengeluaranKas, PembayaranLog, SchoolSettings } from "../types";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Search, 
  Settings2, 
  Printer, 
  History, 
  DollarSign, 
  Coins, 
  CheckCircle2, 
  Calendar,
  Layers,
  RotateCcw,
  Edit2
} from "lucide-react";
import { formatIncomeNotification, WhatsAppNotification } from "../utils/whatsapp";

interface PendapatanPengeluaranSheetProps {
  // Data State
  pendapatanLain: PendapatanLain[];
  pengeluaranKas: PengeluaranKas[];
  pembayaranLog: PembayaranLog[]; // Student tuition log
  
  // Category State
  jenisPendapatan: string[];
  katPengeluaran: string[];
  
  // Handlers
  onAddPendapatanLain: (item: PendapatanLain) => void;
  onUpdatePendapatanLain?: (item: PendapatanLain) => void;
  onDeletePendapatanLain: (id: string) => void;
  onAddPengeluaranKas: (item: PengeluaranKas) => void;
  onUpdatePengeluaranKas?: (item: PengeluaranKas) => void;
  onDeletePengeluaranKas: (id: string) => void;
  onDeletePaymentLog?: (id: string) => void;
  onUpdatePaymentLog?: (item: PembayaranLog) => void;
  onAddJenisPendapatan: (category: string) => void;
  onAddKatPengeluaran: (category: string) => void;
  onDeleteJenisPendapatan: (category: string) => void;
  onDeleteKatPengeluaran: (category: string) => void;
  onTriggerWhatsApp?: (notif: WhatsAppNotification) => void;
  onResetPembayaranLog?: () => void;
  schoolSettings?: SchoolSettings;
}

export default function PendapatanPengeluaranSheet({
  pendapatanLain,
  pengeluaranKas,
  pembayaranLog,
  jenisPendapatan,
  katPengeluaran,
  onAddPendapatanLain,
  onUpdatePendapatanLain,
  onDeletePendapatanLain,
  onAddPengeluaranKas,
  onUpdatePengeluaranKas,
  onDeletePengeluaranKas,
  onDeletePaymentLog,
  onUpdatePaymentLog,
  onAddJenisPendapatan,
  onAddKatPengeluaran,
  onDeleteJenisPendapatan,
  onDeleteKatPengeluaran,
  onTriggerWhatsApp,
  onResetPembayaranLog,
  schoolSettings
}: PendapatanPengeluaranSheetProps) {
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<"pendapatan" | "pengeluaran" | "riwayat">("pendapatan");

  // Filter and search
  const [searchQuery, setSearchQuery] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");
  
  // Forms & Category configs
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showCatConfig, setShowCatConfig] = useState(false);

  // Edit Modal states
  const [editingPendapatan, setEditingPendapatan] = useState<PendapatanLain | null>(null);
  const [editingPengeluaran, setEditingPengeluaran] = useState<PengeluaranKas | null>(null);
  const [editingPaymentLog, setEditingPaymentLog] = useState<PembayaranLog | null>(null);

  // Pendapatan Form
  const [incTanggal, setIncTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [incKategori, setIncKategori] = useState("");
  const [incJumlah, setIncJumlah] = useState<number>(0);
  const [incKeterangan, setIncKeterangan] = useState("");
  const [incPenerima, setIncPenerima] = useState("");

  // Pengeluaran Form
  const [expTanggal, setExpTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [expKategori, setExpKategori] = useState("");
  const [expJumlah, setExpJumlah] = useState<number>(0);
  const [expKeterangan, setExpKeterangan] = useState("");
  const [expPenanggung, setExpPenanggung] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Submits
  const handleAddPendapatan = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryToSave = incKategori || jenisPendapatan[0];
    if (incJumlah <= 0 || !incKeterangan.trim() || !incPenerima.trim()) {
      alert("Harap lengkapi semua kolom dengan benar!");
      return;
    }
    onAddPendapatanLain({
      id: `INC-${Date.now().toString().slice(-4)}`,
      tanggal: incTanggal,
      kategori: categoryToSave,
      jumlah: Number(incJumlah),
      keterangan: incKeterangan.trim(),
      penerima: incPenerima.trim(),
    });

    if (onTriggerWhatsApp) {
      const msg = formatIncomeNotification(
        incPenerima.trim(),
        categoryToSave,
        incKeterangan.trim(),
        Number(incJumlah),
        incTanggal,
        schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
        schoolSettings?.waTemplateDanaMasuk
      );
      onTriggerWhatsApp({
        recipientName: incPenerima.trim(),
        phone: "",
        category: "Dana Masuk Transfer",
        message: msg
      });
    }

    setIncJumlah(0);
    setIncKeterangan("");
    setIncPenerima("");
    setShowAddForm(false);
  };

  const handleAddPengeluaran = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryToSave = expKategori || katPengeluaran[0];
    if (expJumlah <= 0 || !expKeterangan.trim() || !expPenanggung.trim()) {
      alert("Harap lengkapi semua kolom dengan benar!");
      return;
    }
    onAddPengeluaranKas({
      id: `EXP-${Date.now().toString().slice(-4)}`,
      tanggal: expTanggal,
      kategori: categoryToSave,
      jumlah: Number(expJumlah),
      keterangan: expKeterangan.trim(),
      penanggungJawab: expPenanggung.trim(),
    });
    setExpJumlah(0);
    setExpKeterangan("");
    setExpPenanggung("");
    setShowAddForm(false);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    if (activeSubTab === "pendapatan") {
      if (jenisPendapatan.includes(newCatName.trim())) {
        alert("Kategori sudah terdaftar!");
        return;
      }
      onAddJenisPendapatan(newCatName.trim());
    } else {
      if (katPengeluaran.includes(newCatName.trim())) {
        alert("Kategori sudah terdaftar!");
        return;
      }
      onAddKatPengeluaran(newCatName.trim());
    }
    setNewCatName("");
  };

  // Filter Lists
  const filteredPendapatan = pendapatanLain.filter((item) => {
    const matchesSearch = item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.penerima.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = catFilter === "Semua" || item.kategori === catFilter;
    return matchesSearch && matchesCat;
  });

  const filteredPengeluaran = pengeluaranKas.filter((item) => {
    const matchesSearch = item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.penanggungJawab.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = catFilter === "Semua" || item.kategori === catFilter;
    return matchesSearch && matchesCat;
  });

  // Unified Payment Logs
  const combinedHistory = [
    ...pembayaranLog.map((log) => ({
      id: log.id,
      tanggal: log.tanggalBayar,
      tipe: "Uang Sekolah" as const,
      subjek: log.siswaNama,
      jumlah: log.jumlahBayar,
      kategori: "Pendidikan Siswa",
      keterangan: `${log.metodeBayar} - ${log.keterangan || "Cicilan SPP"}`,
    })),
    ...pendapatanLain.map((item) => ({
      id: item.id,
      tanggal: item.tanggal,
      tipe: "Pendapatan Lain" as const,
      subjek: item.penerima,
      jumlah: item.jumlah,
      kategori: item.kategori,
      keterangan: item.keterangan,
    })),
  ].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const filteredHistory = combinedHistory.filter((log) => {
    const matchesSearch = log.subjek.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipe = catFilter === "Semua" || 
                        (catFilter === "Uang Sekolah" && log.tipe === "Uang Sekolah") ||
                        (catFilter === "Pendapatan Lain" && log.tipe === "Pendapatan Lain");
    return matchesSearch && matchesTipe;
  });

  const handlePrintHistory = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const rowsHtml = filteredHistory.map(h => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-family: monospace;">${h.id}</td>
        <td style="padding: 10px;">${h.tanggal}</td>
        <td style="padding: 10px; font-weight: bold;">${h.subjek}</td>
        <td style="padding: 10px;">${h.tipe}</td>
        <td style="padding: 10px;">${h.kategori}</td>
        <td style="padding: 10px;">${h.keterangan}</td>
        <td style="padding: 10px; text-align: right; font-family: monospace; font-weight: bold;">
          ${formatRupiah(h.jumlah)}
        </td>
      </tr>
    `).join("");

    const totalInflow = filteredHistory.reduce((acc, h) => acc + h.jumlah, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Riwayat Pembayaran & Pendapatan</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; color: #333; margin: 40px; }
            h1 { font-size: 20px; font-weight: bold; color: #001f3f; text-align: center; }
            h2 { font-size: 11px; font-family: monospace; text-align: center; color: #666; margin-top: -10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { background-color: #f4f4f4; text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; font-family: monospace; }
            .total-box { margin-top: 30px; text-align: right; padding: 15px; background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>LPK NANDITA FLOATING HOTEL</h1>
          <h2>REKAP RIWAYAT PEMBAYARAN & PENDAPATAN TERPADU</h2>
          <p style="font-size: 12px;">Dicetak tanggal: ${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID")}</p>
          <table>
            <thead>
              <tr>
                <th>ID Log</th>
                <th>Tanggal</th>
                <th>Penerima/Siswa</th>
                <th>Sumber Penerimaan</th>
                <th>Jenis Penerimaan</th>
                <th>Keterangan</th>
                <th style="text-align: right;">Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="total-box">
            <span style="font-size: 12px; color: #555;">TOTAL REALISASI DANA MASUK:</span>
            <strong style="font-size: 16px; color: #10b981; font-family: monospace; margin-left: 10px;">
              ${formatRupiah(totalInflow)}
            </strong>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-grid">
      
      {/* SHEET HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#001f3f] font-bold uppercase bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Row 81-120: Kas Operasional
          </span>
          <h2 className="text-xl font-bold text-slate-950 font-display mt-2 flex items-center">
            {activeSubTab === "pendapatan" ? (
              <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
            ) : activeSubTab === "pengeluaran" ? (
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            ) : (
              <History className="w-5 h-5 text-indigo-600 mr-2" />
            )}
            Manajemen Transaksi Kas & Penerimaan Lain
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Catat pendapatan di luar SPP, pengeluaran kas rutin sekolah, serta cetak bukti riwayat kas masuk terpadu.
          </p>
        </div>

        {activeSubTab !== "riwayat" ? (
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <button
              onClick={() => setShowCatConfig(!showCatConfig)}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl shadow-sm transition flex items-center"
            >
              <Settings2 className="w-4 h-4 mr-1.5 text-slate-400" />
              Kelola Kategori
            </button>
            <button
              id="btn-add-transaksi"
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center"
            >
              <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
              {activeSubTab === "pendapatan" ? "Tambah Pendapatan" : "Catat Pengeluaran"}
            </button>
          </div>
        ) : (
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <button
              id="btn-reset-riwayat-filters"
              onClick={() => {
                setSearchQuery("");
                setCatFilter("Semua");
              }}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl shadow-sm transition flex items-center"
              title="Reset Semua Pencarian & Filter Kategori"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 text-slate-400" />
              Reset Filter
            </button>
            {onResetPembayaranLog && (
              <button
                id="btn-reset-pembayaran-data"
                onClick={() => {
                  if (
                    confirm(
                      "Apakah Anda yakin ingin me-reset (menghapus) seluruh data riwayat pembayaran siswa?\n\nTindakan ini akan mengosongkan semua log kuitansi pembayaran dan mengembalikan sisa piutang siswa ke nominal tagihan semula."
                    )
                  ) {
                    onResetPembayaranLog();
                  }
                }}
                className="px-3.5 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-750 font-bold text-xs rounded-xl shadow-sm transition flex items-center"
                title="Hapus / Reset Seluruh Data Pembayaran Siswa"
              >
                <Trash2 className="w-4 h-4 mr-1.5 text-rose-500" />
                Reset Data Pembayaran
              </button>
            )}
            <button
              id="btn-print-riwayat"
              onClick={handlePrintHistory}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center w-max"
            >
              <Printer className="w-4 h-4 mr-1.5 text-white" />
              Cetak Riwayat Kas Masuk
            </button>
          </div>
        )}
      </div>

      {/* COMPONENT SUB TABS */}
      <div className="flex border-b border-slate-200 mt-6 mb-4">
        <button
          onClick={() => {
            setActiveSubTab("pendapatan");
            setCatFilter("Semua");
            setShowAddForm(false);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "pendapatan"
              ? "border-[#001f3f] text-[#001f3f]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          📈 Pendapatan Lain-lain
        </button>
        <button
          onClick={() => {
            setActiveSubTab("pengeluaran");
            setCatFilter("Semua");
            setShowAddForm(false);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "pengeluaran"
              ? "border-red-500 text-red-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          📉 Pengeluaran Kas Sekolah
        </button>
        <button
          onClick={() => {
            setActiveSubTab("riwayat");
            setCatFilter("Semua");
            setShowAddForm(false);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "riwayat"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          📜 Riwayat Pembayaran (Terpadu)
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 flex items-center space-x-3 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#001f3f]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="search-transaksi"
            type="text"
            placeholder={
              activeSubTab === "riwayat"
                ? "Cari siswa, ID log, atau rincian transfer..."
                : "Cari deskripsi transaksi atau nama penanggung jawab..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs focus:outline-none placeholder-slate-400 text-slate-700 font-sans"
          />
        </div>

        {/* Dynamic Category Filter */}
        <div className="flex items-center bg-white border border-slate-200/80 rounded-xl px-2 py-1 shadow-sm">
          <select
            id="filter-transaksi-kategori"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full text-xs focus:outline-none text-slate-600 bg-transparent py-1 font-sans font-medium"
          >
            <option value="Semua">Semua Kategori</option>
            {activeSubTab === "pendapatan" &&
              jenisPendapatan.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            {activeSubTab === "pengeluaran" &&
              katPengeluaran.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            {activeSubTab === "riwayat" && (
              <>
                <option value="Uang Sekolah">Uang Pendidikan Siswa (SPP)</option>
                <option value="Pendapatan Lain">Pendapatan Non-SPP</option>
              </>
            )}
          </select>
        </div>

        {/* Aggregations */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
              {activeSubTab === "pendapatan"
                ? "Total Penerimaan Lain"
                : activeSubTab === "pengeluaran"
                ? "Total Pengeluaran Kas"
                : "Jumlah Transaksi Masuk"}
            </span>
            <span className={`text-sm font-bold font-mono ${activeSubTab === "pengeluaran" ? "text-red-600" : "text-emerald-700"}`}>
              {activeSubTab === "pendapatan"
                ? formatRupiah(filteredPendapatan.reduce((acc, p) => acc + p.jumlah, 0))
                : activeSubTab === "pengeluaran"
                ? formatRupiah(filteredPengeluaran.reduce((acc, e) => acc + e.jumlah, 0))
                : formatRupiah(filteredHistory.reduce((acc, h) => acc + h.jumlah, 0))}
            </span>
          </div>
          <Coins className="w-5 h-5 text-slate-400 opacity-60" />
        </div>
      </div>

      {/* CATEGORY LISTING CONFIGURATION MODAL/SECTION */}
      {showCatConfig && activeSubTab !== "riwayat" && (
        <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
          <h3 className="text-xs font-bold font-mono uppercase text-[#001f3f] tracking-wider mb-3 flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-amber-500" />
            Konfigurasi Kategori Operasional
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white border border-slate-200/80 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase font-mono">
                {activeSubTab === "pendapatan" ? "Daftar Jenis Pendapatan" : "Daftar Kategori Pengeluaran"}
              </span>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(activeSubTab === "pendapatan" ? jenisPendapatan : katPengeluaran).map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center text-[10px] font-bold text-slate-700 bg-slate-100 rounded-full px-2.5 py-1 border border-slate-200"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() =>
                        activeSubTab === "pendapatan" ? onDeleteJenisPendapatan(cat) : onDeleteKatPengeluaran(cat)
                      }
                      className="ml-1 text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="new-cat-name"
                  type="text"
                  placeholder="Kategori baru..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 bg-slate-50/50"
                />
                <button
                  id="btn-add-cat"
                  onClick={handleAddCategory}
                  className="bg-[#001f3f] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  Tambah Kategori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* main table column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            
            {/* 1. Pendapatan Sheet */}
            {activeSubTab === "pendapatan" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kategori Penerimaan</th>
                    <th className="py-3 px-4">Rincian Deskripsi</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Penerima Kas</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPendapatan.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{p.id}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{p.tanggal}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{p.keterangan}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{formatRupiah(p.jumlah)}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{p.penerima}</td>
                      <td className="py-3.5 px-4 text-right flex items-center justify-end space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = formatIncomeNotification(
                              p.penerima,
                              p.kategori,
                              p.keterangan,
                              p.jumlah,
                              p.tanggal,
                              schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
                              schoolSettings?.waTemplateDanaMasuk
                            );
                            if (onTriggerWhatsApp) {
                              onTriggerWhatsApp({
                                recipientName: p.penerima,
                                phone: "",
                                category: "Dana Masuk Transfer",
                                message: msg
                              });
                            }
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-sans font-bold cursor-pointer"
                          title="Kirim Bukti Penerimaan via WhatsApp"
                        >
                          WA Resi
                        </button>
                        <button
                          onClick={() => setEditingPendapatan(p)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                          title="Edit Transaksi Pendapatan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus pendapatan "${p.keterangan}"?`)) onDeletePendapatanLain(p.id);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPendapatan.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        Belum ada data transaksi pendapatan lain
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 2. Pengeluaran Sheet */}
            {activeSubTab === "pengeluaran" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kategori Beban</th>
                    <th className="py-3 px-4">Keterangan Pengeluaran</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Penanggung Jawab</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPengeluaran.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{e.id}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{e.tanggal}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-150">
                          {e.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{e.keterangan}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-red-600">{formatRupiah(e.jumlah)}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{e.penanggungJawab}</td>
                      <td className="py-3.5 px-4 text-right flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setEditingPengeluaran(e)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                          title="Edit Transaksi Pengeluaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus pengeluaran "${e.keterangan}"?`)) onDeletePengeluaranKas(e.id);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPengeluaran.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        Belum ada data transaksi pengeluaran kas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 3. Unified Payment History Log */}
            {activeSubTab === "riwayat" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Ref Log</th>
                    <th className="py-3 px-4">Tanggal Realisasi</th>
                    <th className="py-3 px-4">Subjek/Penyetor</th>
                    <th className="py-3 px-4">Sumber Kas</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Deskripsi Metode & Keterangan</th>
                    <th className="py-3 px-4 text-right">Dana Masuk</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{h.id}</td>
                      <td className="py-3.5 px-4 text-slate-600">{h.tanggal}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{h.subjek}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                            h.tipe === "Uang Sekolah"
                              ? "bg-blue-50 text-blue-700 border-blue-150"
                              : "bg-emerald-50 text-emerald-700 border-emerald-150"
                          }`}
                        >
                          {h.tipe}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-500">{h.kategori}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{h.keterangan}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-emerald-600 flex items-center justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                          {formatRupiah(h.jumlah)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right flex items-center justify-end space-x-1">
                        {h.tipe === "Uang Sekolah" ? (
                          <>
                            <button
                              onClick={() => {
                                const logItem = pembayaranLog.find(p => p.id === h.id);
                                if (logItem) {
                                  setEditingPaymentLog(logItem);
                                }
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                              title="Edit Pembayaran SPP"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus transaksi pembayaran "${h.id}" (${h.subjek})?`)) {
                                  if (onDeletePaymentLog) onDeletePaymentLog(h.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition cursor-pointer"
                              title="Hapus Pembayaran SPP"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                const pItem = pendapatanLain.find(p => p.id === h.id);
                                if (pItem) {
                                  setEditingPendapatan(pItem);
                                }
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                              title="Edit Pendapatan Lain"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus transaksi pendapatan "${h.id}" (${h.keterangan})?`)) {
                                  onDeletePendapatanLain(h.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition cursor-pointer"
                              title="Hapus Pendapatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        Belum ada riwayat transaksi kas masuk
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

          </div>
        </div>

        {/* Input form panel side */}
        {showAddForm && activeSubTab !== "riwayat" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 h-max">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              {activeSubTab === "pendapatan" ? (
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1.5" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1.5" />
              )}
              {activeSubTab === "pendapatan" ? "Catat Pendapatan Lain" : "Catat Transaksi Pengeluaran"}
            </h3>

            {/* Pendapatan Form */}
            {activeSubTab === "pendapatan" ? (
              <form onSubmit={handleAddPendapatan} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Tanggal
                    </label>
                    <input
                      id="inc-date"
                      type="date"
                      required
                      value={incTanggal}
                      onChange={(e) => setIncTanggal(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Pilih Jenis
                    </label>
                    <select
                      id="inc-cat"
                      value={incKategori}
                      onChange={(e) => setIncKategori(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none"
                    >
                      {jenisPendapatan.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Jumlah Nominal (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inc-amt"
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    value={incJumlah || ""}
                    onChange={(e) => setIncJumlah(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Rincian Keterangan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="inc-desc"
                    required
                    placeholder="e.g. Sewa ruang kelas praktik kuliner..."
                    value={incKeterangan}
                    onChange={(e) => setIncKeterangan(e.target.value)}
                    className="w-full h-16 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Staf Penerima Kas <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inc-recv"
                    type="text"
                    required
                    placeholder="e.g. Siti Rahmawati"
                    value={incPenerima}
                    onChange={(e) => setIncPenerima(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-2 border-t border-slate-100">
                  <button
                    id="btn-save-income"
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Simpan Pendapatan
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
            ) : (
              /* Pengeluaran Form */
              <form onSubmit={handleAddPengeluaran} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Tanggal
                    </label>
                    <input
                      id="exp-date"
                      type="date"
                      required
                      value={expTanggal}
                      onChange={(e) => setExpTanggal(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Pilih Jenis
                    </label>
                    <select
                      id="exp-cat"
                      value={expKategori}
                      onChange={(e) => setExpKategori(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none"
                    >
                      {katPengeluaran.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Jumlah Nominal (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="exp-amt"
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={expJumlah || ""}
                    onChange={(e) => setExpJumlah(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Rincian Keterangan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="exp-desc"
                    required
                    placeholder="e.g. Pembelian bahan baku kuliner dsb..."
                    value={expKeterangan}
                    onChange={(e) => setExpKeterangan(e.target.value)}
                    className="w-full h-16 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Penanggung Jawab <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="exp-pic"
                    type="text"
                    required
                    placeholder="e.g. Budi Santoso"
                    value={expPenanggung}
                    onChange={(e) => setExpPenanggung(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-2 border-t border-slate-100">
                  <button
                    id="btn-save-expense"
                    type="submit"
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Simpan Pengeluaran
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
            )}
          </div>
        )}
      </div>

      {/* EDIT PENDAPATAN MODAL */}
      {editingPendapatan && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-[#001f3f] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase font-mono">Edit Pendapatan Lain ({editingPendapatan.id})</h3>
              <button onClick={() => setEditingPendapatan(null)} className="text-white hover:text-slate-200">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdatePendapatanLain) {
                  onUpdatePendapatanLain(editingPendapatan);
                }
                setEditingPendapatan(null);
              }}
              className="p-4 space-y-3 font-sans"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={editingPendapatan.tanggal}
                  onChange={(e) => setEditingPendapatan({ ...editingPendapatan, tanggal: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Penerimaan</label>
                <select
                  value={editingPendapatan.kategori}
                  onChange={(e) => setEditingPendapatan({ ...editingPendapatan, kategori: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                >
                  {jenisPendapatan.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={editingPendapatan.jumlah}
                  onChange={(e) => setEditingPendapatan({ ...editingPendapatan, jumlah: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rincian Keterangan</label>
                <input
                  type="text"
                  required
                  value={editingPendapatan.keterangan}
                  onChange={(e) => setEditingPendapatan({ ...editingPendapatan, keterangan: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Penerima Kas</label>
                <input
                  type="text"
                  required
                  value={editingPendapatan.penerima}
                  onChange={(e) => setEditingPendapatan({ ...editingPendapatan, penerima: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPendapatan(null)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#001f3f] text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PENGELUARAN MODAL */}
      {editingPengeluaran && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase font-mono">Edit Pengeluaran Kas ({editingPengeluaran.id})</h3>
              <button onClick={() => setEditingPengeluaran(null)} className="text-white hover:text-slate-200">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdatePengeluaranKas) {
                  onUpdatePengeluaranKas(editingPengeluaran);
                }
                setEditingPengeluaran(null);
              }}
              className="p-4 space-y-3 font-sans"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={editingPengeluaran.tanggal}
                  onChange={(e) => setEditingPengeluaran({ ...editingPengeluaran, tanggal: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Beban</label>
                <select
                  value={editingPengeluaran.kategori}
                  onChange={(e) => setEditingPengeluaran({ ...editingPengeluaran, kategori: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {katPengeluaran.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={editingPengeluaran.jumlah}
                  onChange={(e) => setEditingPengeluaran({ ...editingPengeluaran, jumlah: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rincian Keterangan</label>
                <input
                  type="text"
                  required
                  value={editingPengeluaran.keterangan}
                  onChange={(e) => setEditingPengeluaran({ ...editingPengeluaran, keterangan: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  value={editingPengeluaran.penanggungJawab}
                  onChange={(e) => setEditingPengeluaran({ ...editingPengeluaran, penanggungJawab: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPengeluaran(null)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-red-600 text-white rounded font-bold hover:bg-red-700 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PEMBAYARAN LOG MODAL */}
      {editingPaymentLog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-emerald-700 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs uppercase font-mono">Edit Setoran Siswa ({editingPaymentLog.id})</h3>
                <p className="text-[10px] text-emerald-100">Siswa: {editingPaymentLog.siswaNama}</p>
              </div>
              <button onClick={() => setEditingPaymentLog(null)} className="text-white hover:text-slate-200">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdatePaymentLog) {
                  onUpdatePaymentLog(editingPaymentLog);
                }
                setEditingPaymentLog(null);
              }}
              className="p-4 space-y-3 font-sans"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Bayar</label>
                <input
                  type="date"
                  required
                  value={editingPaymentLog.tanggalBayar}
                  onChange={(e) => setEditingPaymentLog({ ...editingPaymentLog, tanggalBayar: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah Setoran (Rp)</label>
                <input
                  type="number"
                  required
                  value={editingPaymentLog.jumlahBayar}
                  onChange={(e) => setEditingPaymentLog({ ...editingPaymentLog, jumlahBayar: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Metode Pembayaran</label>
                <input
                  type="text"
                  required
                  value={editingPaymentLog.metodeBayar}
                  onChange={(e) => setEditingPaymentLog({ ...editingPaymentLog, metodeBayar: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={editingPaymentLog.keterangan || ""}
                  onChange={(e) => setEditingPaymentLog({ ...editingPaymentLog, keterangan: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPaymentLog(null)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
