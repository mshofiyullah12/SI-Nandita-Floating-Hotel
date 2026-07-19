import React, { useState } from "react";
import { TagihanSiswa, Siswa, SchoolSettings } from "../types";
import { Plus, Search, Receipt, Trash2, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from "lucide-react";
import { formatReceivableNotification, WhatsAppNotification } from "../utils/whatsapp";

interface TagihanSiswaSheetProps {
  tagihanList: TagihanSiswa[];
  siswaList: Siswa[];
  onAddTagihan: (newTagihan: TagihanSiswa) => void;
  onDeleteTagihan: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onTriggerWhatsApp?: (notif: WhatsAppNotification) => void;
  schoolSettings?: SchoolSettings;
}

export default function TagihanSiswaSheet({
  tagihanList,
  siswaList,
  onAddTagihan,
  onDeleteTagihan,
  onMarkAsPaid,
  onTriggerWhatsApp,
  schoolSettings,
}: TagihanSiswaSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Lunas" | "Belum Lunas">("Semua");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [selectedSiswaId, setSelectedSiswaId] = useState("");
  const [namaTagihan, setNamaTagihan] = useState("");
  const [jumlah, setJumlah] = useState<number>(0);
  const [tanggalTagihan, setTanggalTagihan] = useState(new Date().toISOString().split("T")[0]);
  const [deskripsi, setDeskripsi] = useState("");

  const filteredTagihan = tagihanList.filter((t) => {
    const matchesSearch =
      t.siswaNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.namaTagihan.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "Semua" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId || !namaTagihan.trim() || jumlah <= 0) {
      alert("Harap lengkapi semua kolom wajib dengan benar!");
      return;
    }

    const targetSiswa = siswaList.find((s) => s.id === selectedSiswaId);
    if (!targetSiswa) return;

    onAddTagihan({
      id: `TAG-${Date.now().toString().slice(-4)}`,
      siswaId: selectedSiswaId,
      siswaNama: targetSiswa.nama,
      namaTagihan: namaTagihan.trim(),
      jumlah: Number(jumlah),
      tanggalTagihan,
      status: "Belum Lunas",
      deskripsi: deskripsi.trim(),
    });

    // Reset Form
    setSelectedSiswaId("");
    setNamaTagihan("");
    setJumlah(0);
    setDeskripsi("");
    setShowAddForm(false);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-grid">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-700 font-bold uppercase bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
            Row 61-80: Akun Piutang
          </span>
          <h2 className="text-xl font-bold text-slate-950 font-display mt-2 flex items-center">
            <Receipt className="w-5 h-5 text-[#001f3f] mr-2" />
            Master Tunggakan Siswa LPK
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Rincian jenis tunggakan operasional (SPP, Jas Almamater, Buku, Ujian) yang dibebankan per siswa.
          </p>
        </div>

        <button
          id="btn-add-tagihan"
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center w-max"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Tambah Tunggakan Baru
        </button>
      </div>

      {/* FILTER & STATS BAR */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 flex items-center space-x-3 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#001f3f]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="search-tagihan"
            type="text"
            placeholder="Cari siswa atau nama tunggakan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs focus:outline-none placeholder-slate-400 text-slate-700 font-sans"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center bg-white border border-slate-200/80 rounded-xl px-2 py-1 shadow-sm">
          <select
            id="filter-tagihan-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full text-xs focus:outline-none text-slate-600 bg-transparent py-1 font-sans font-medium"
          >
            <option value="Semua">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum Lunas">Belum Lunas</option>
          </select>
        </div>

        {/* Quick totals */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Total Tunggakan</span>
            <span className="text-sm font-bold font-mono text-slate-800">
              {formatRupiah(filteredTagihan.reduce((acc, t) => acc + t.jumlah, 0))}
            </span>
          </div>
          <Receipt className="w-5 h-5 text-slate-400 opacity-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Rincian Tunggakan</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Tanggal Beban</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTagihan.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{t.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{t.siswaNama}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{t.namaTagihan}</div>
                      {t.deskripsi && <div className="text-[10px] text-slate-400 font-sans mt-0.5">{t.deskripsi}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{formatRupiah(t.jumlah)}</td>
                    <td className="py-3.5 px-4 text-slate-500">{t.tanggalTagihan}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === "Lunas"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                        }`}
                      >
                        {t.status === "Lunas" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            Lunas
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
                            Belum Lunas
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {t.status === "Belum Lunas" && (
                          <>
                            <button
                              onClick={() => {
                                const targetSiswa = siswaList.find(s => s.nama === t.siswaNama);
                                const phone = targetSiswa ? targetSiswa.noHp : "";
                                const msg = formatReceivableNotification(
                                  t.siswaNama,
                                  t.jumlah,
                                  t.jumlah,
                                  schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
                                  schoolSettings?.waTemplateTagihanSiswa
                                );
                                if (onTriggerWhatsApp) {
                                  onTriggerWhatsApp({
                                    recipientName: t.siswaNama,
                                    phone,
                                    category: "Tunggakan Siswa",
                                    message: msg
                                  });
                                }
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition cursor-pointer"
                              title="Kirim Tunggakan via WhatsApp"
                            >
                              Kirim WA
                            </button>
                            <button
                              onClick={() => onMarkAsPaid(t.id)}
                              className="px-2 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-[10px] font-bold shadow-sm transition cursor-pointer"
                              title="Tandai Sebagai Lunas"
                            >
                              Tandai Lunas
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data tunggakan "${t.namaTagihan}" milik ${t.siswaNama}?`)) {
                              onDeleteTagihan(t.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"
                          title="Hapus Tunggakan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTagihan.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      Tidak ada data tunggakan ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Input Form Panel */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 h-max">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <Receipt className="w-4 h-4 text-amber-500 mr-1.5" />
              Bebankan Tunggakan Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Pilih Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  id="tagihan-siswa-id"
                  required
                  value={selectedSiswaId}
                  onChange={(e) => setSelectedSiswaId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Nama / Rincian Tunggakan <span className="text-red-500">*</span>
                </label>
                <input
                  id="tagihan-nama"
                  type="text"
                  required
                  placeholder="e.g. SPP Angsuran 3"
                  value={namaTagihan}
                  onChange={(e) => setNamaTagihan(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Jumlah Nominal (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tagihan-jumlah"
                    type="number"
                    required
                    placeholder="e.g. 1500000"
                    value={jumlah || ""}
                    onChange={(e) => setJumlah(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Tanggal Tunggakan
                  </label>
                  <input
                    id="tagihan-tanggal"
                    type="date"
                    required
                    value={tanggalTagihan}
                    onChange={(e) => setTanggalTagihan(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Keterangan / Deskripsi
                </label>
                <textarea
                  id="tagihan-deskripsi"
                  placeholder="e.g. Tunggakan seragam praktik kuliner lengkap..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full h-16 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-[#001f3f] resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  id="btn-save-tagihan"
                  type="submit"
                  className="flex-1 py-2 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  Bebankan
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
