import React, { useState } from "react";
import { UtangPegawai, Staff } from "../types";
import { Plus, Search, BookOpen, Trash2, CheckCircle2, AlertCircle, Coins, DollarSign, Calendar } from "lucide-react";

interface UtangPegawaiSheetProps {
  utangList: UtangPegawai[];
  staffList: Staff[];
  onAddUtang: (newUtang: UtangPegawai) => void;
  onDeleteUtang: (id: string) => void;
  onAddCicilan: (utangId: string, cicilan: { id: string; tanggal: string; jumlah: number; keterangan: string }) => void;
}

export default function UtangPegawaiSheet({
  utangList,
  staffList,
  onAddUtang,
  onDeleteUtang,
  onAddCicilan,
}: UtangPegawaiSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Lunas" | "Belum Lunas">("Semua");
  
  // Forms states
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showCicilanFormId, setShowCicilanFormId] = useState<string | null>(null);

  // New Loan Form
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [jumlahPinjam, setJumlahPinjam] = useState<number>(0);
  const [tanggalPinjam, setTanggalPinjam] = useState(new Date().toISOString().split("T")[0]);
  const [deskripsi, setDeskripsi] = useState("");

  // New Installment Form
  const [cicilanJumlah, setCicilanJumlah] = useState<number>(0);
  const [cicilanTanggal, setCicilanTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [cicilanKet, setCicilanKet] = useState("");

  const filteredUtang = utangList.filter((u) => {
    const matchesSearch = u.staffNama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "Semua" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || jumlahPinjam <= 0 || !deskripsi.trim()) {
      alert("Harap lengkapi semua kolom wajib!");
      return;
    }

    const targetStaff = staffList.find((s) => s.id === selectedStaffId);
    if (!targetStaff) return;

    onAddUtang({
      id: `DEB-${Date.now().toString().slice(-4)}`,
      staffId: selectedStaffId,
      staffNama: targetStaff.nama,
      tanggalPinjam,
      jumlahPinjam: Number(jumlahPinjam),
      totalBayar: 0,
      sisaUtang: Number(jumlahPinjam),
      deskripsi: deskripsi.trim(),
      status: "Belum Lunas",
      riwayatCicilan: [],
    });

    // Reset Form
    setSelectedStaffId("");
    setJumlahPinjam(0);
    setDeskripsi("");
    setShowLoanForm(false);
  };

  const handleCreateCicilan = (e: React.FormEvent, utangId: string) => {
    e.preventDefault();
    if (cicilanJumlah <= 0) {
      alert("Masukkan nominal cicilan yang valid!");
      return;
    }

    const parentUtang = utangList.find((u) => u.id === utangId);
    if (!parentUtang) return;

    if (cicilanJumlah > parentUtang.sisaUtang) {
      alert(`Jumlah bayar (${formatRupiah(cicilanJumlah)}) melebihi sisa utang (${formatRupiah(parentUtang.sisaUtang)})!`);
      return;
    }

    onAddCicilan(utangId, {
      id: `CIC-${Date.now().toString().slice(-4)}`,
      tanggal: cicilanTanggal,
      jumlah: Number(cicilanJumlah),
      keterangan: cicilanKet.trim() || "Angsuran Mandiri",
    });

    // Reset Form
    setCicilanJumlah(0);
    setCicilanKet("");
    setShowCicilanFormId(null);
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-grid">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-red-700 font-bold uppercase bg-red-50 px-2 py-1 rounded-full border border-red-200">
            Row 121-140: Kas Pegawai
          </span>
          <h2 className="text-xl font-bold text-slate-950 font-display mt-2 flex items-center">
            <Coins className="w-5 h-5 text-[#001f3f] mr-2" />
            Pinjaman & Utang Pegawai (Kasbon Staf)
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Catat pinjaman darurat karyawan, kelola cicilan pengembalian, serta pantau piutang internal lembaga.
          </p>
        </div>

        <button
          id="btn-add-loan"
          onClick={() => setShowLoanForm(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center w-max"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Ajukan Kasbon Baru
        </button>
      </div>

      {/* FILTER & METRICS */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 flex items-center space-x-3 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#001f3f]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="search-loan"
            type="text"
            placeholder="Cari nama pegawai atau rincian kasbon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs focus:outline-none placeholder-slate-400 text-slate-700 font-sans"
          />
        </div>

        {/* Status */}
        <div className="flex items-center bg-white border border-slate-200/80 rounded-xl px-2 py-1 shadow-sm">
          <select
            id="filter-loan-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full text-xs focus:outline-none text-slate-600 bg-transparent py-1 font-sans font-medium"
          >
            <option value="Semua">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum Lunas">Belum Lunas</option>
          </select>
        </div>

        {/* Total Metric */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Total Outstanding</span>
            <span className="text-sm font-bold font-mono text-red-600">
              {formatRupiah(filteredUtang.reduce((acc, u) => acc + u.sisaUtang, 0))}
            </span>
          </div>
          <DollarSign className="w-5 h-5 text-red-400 opacity-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Nama Pegawai</th>
                    <th className="py-3 px-4">Deskripsi Pinjaman</th>
                    <th className="py-3 px-4">Nominal Pinjam</th>
                    <th className="py-3 px-4">Terbayar</th>
                    <th className="py-3 px-4">Sisa Utang</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUtang.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{u.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{u.staffNama}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{u.deskripsi}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Tanggal: {u.tanggalPinjam}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{formatRupiah(u.jumlahPinjam)}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600">+{formatRupiah(u.totalBayar)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-red-600">{formatRupiah(u.sisaUtang)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === "Lunas"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {u.status === "Lunas" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Lunas
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
                              Belum Lunas
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {u.status === "Belum Lunas" && (
                            <button
                              onClick={() => {
                                setCicilanJumlah(0);
                                setCicilanKet("");
                                setShowCicilanFormId(u.id);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition"
                            >
                              Bayar Cicilan
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan kasbon milik ${u.staffNama}?`)) {
                                onDeleteUtang(u.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"
                            title="Hapus Kasbon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUtang.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        Tidak ada catatan pinjaman kasbon ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Child Installments (Riwayat Cicilan) expansion */}
          {filteredUtang.some(u => u.riwayatCicilan.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-xs font-bold font-mono uppercase text-[#001f3f] tracking-wider mb-3">
                📋 Riwayat Realisasi Pembayaran Cicilan Pegawai
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUtang.filter(u => u.riwayatCicilan.length > 0).map((u) => (
                  <div key={u.id} className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/30">
                    <span className="text-[10px] font-bold text-slate-700 block mb-2">
                      👤 {u.staffNama} (Kasbon {u.id})
                    </span>
                    <div className="space-y-2">
                      {u.riwayatCicilan.map((c) => (
                        <div key={c.id} className="flex justify-between items-center text-xs font-sans">
                          <div className="text-slate-500 font-mono flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {c.tanggal}
                          </div>
                          <div className="font-semibold text-slate-700">
                            {c.keterangan}
                          </div>
                          <div className="font-mono font-bold text-emerald-600">
                            +{formatRupiah(c.jumlah)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Loan Form */}
        {showLoanForm && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 h-max">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <Coins className="w-4 h-4 text-amber-500 mr-1.5" />
              Pengajuan Kasbon Pegawai
            </h3>

            <form onSubmit={handleCreateLoan} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Pilih Pegawai / Staf <span className="text-red-500">*</span>
                </label>
                <select
                  id="loan-staff-id"
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                >
                  <option value="">-- Pilih Staf --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nip} - {s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Jumlah Nominal Kasbon <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loan-amount"
                    type="number"
                    required
                    placeholder="e.g. 1000000"
                    value={jumlahPinjam || ""}
                    onChange={(e) => setJumlahPinjam(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Tanggal Pinjam
                  </label>
                  <input
                    id="loan-date"
                    type="date"
                    required
                    value={tanggalPinjam}
                    onChange={(e) => setTanggalPinjam(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Keperluan / Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="loan-desc"
                  required
                  placeholder="e.g. Keperluan pengobatan mendesak..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full h-16 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  id="btn-save-loan"
                  type="submit"
                  className="flex-1 py-2 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  Ajukan Pinjaman
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoanForm(false)}
                  className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Input Cicilan Form */}
        {showCicilanFormId && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 h-max">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
              Input Cicilan Kasbon ({showCicilanFormId})
            </h3>

            <form onSubmit={(e) => handleCreateCicilan(e, showCicilanFormId)} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Jumlah Bayar (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cicilan-amount"
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    value={cicilanJumlah || ""}
                    onChange={(e) => setCicilanJumlah(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Tanggal Bayar
                  </label>
                  <input
                    id="cicilan-date"
                    type="date"
                    required
                    value={cicilanTanggal}
                    onChange={(e) => setCicilanTanggal(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-slate-50/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Metode / Keterangan
                </label>
                <input
                  id="cicilan-desc"
                  type="text"
                  placeholder="e.g. Potong gaji / Setoran Tunai"
                  value={cicilanKet}
                  onChange={(e) => setCicilanKet(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  id="btn-save-cicilan"
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Simpan Cicilan
                </button>
                <button
                  type="button"
                  onClick={() => setShowCicilanFormId(null)}
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
