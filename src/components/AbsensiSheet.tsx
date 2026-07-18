/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Absensi, AbsensiStatus, Siswa, Staff } from "../types";
import { Search, Plus, Trash2, Calendar, Check, AlertCircle } from "lucide-react";

interface AbsensiSheetProps {
  absensi: Absensi[];
  siswa: Siswa[];
  staff: Staff[];
  onAddAbsensi: (newAbsensi: Absensi) => void;
  onUpdateAbsensi: (updatedAbsensi: Absensi) => void;
  onDeleteAbsensi: (id: string) => void;
  onBulkGenerateAbsensi: (date: string, category: "Siswa" | "Staf/Instruktur") => void;
  viewMode: "Siswa" | "Instruktur";
}

export default function AbsensiSheet({
  absensi,
  siswa,
  staff,
  onAddAbsensi,
  onUpdateAbsensi,
  onDeleteAbsensi,
  onBulkGenerateAbsensi,
  viewMode
}: AbsensiSheetProps) {
  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"Siswa" | "Staf" | "Instruktur">(
    viewMode === "Siswa" ? "Siswa" : "Instruktur"
  );
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [status, setStatus] = useState<AbsensiStatus>(AbsensiStatus.Hadir);
  const [notes, setNotes] = useState("");
  const [jamMasuk, setJamMasuk] = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("12:00");

  // Filter attendance records by date, category, and search
  const filteredAbsensi = absensi.filter(a => {
    const matchesDate = a.tanggal === selectedDate;
    const matchesCategory = viewMode === "Siswa" 
      ? a.kategori === "Siswa"
      : (a.kategori === "Staf" || a.kategori === "Instruktur");
    const matchesSearch = a.nama.toLowerCase().includes(searchTerm.toLowerCase()) || a.keterangan.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDate && matchesCategory && matchesSearch;
  });

  // Bulk generator options
  const handleBulkGenerate = (cat: "Siswa" | "Staf/Instruktur") => {
    // Check if logs already exist for this date
    const alreadyExists = absensi.some(a => a.tanggal === selectedDate && (
      cat === "Siswa" ? a.kategori === "Siswa" : (a.kategori === "Staf" || a.kategori === "Instruktur")
    ));

    if (alreadyExists) {
      if (!confirm(`Log absensi ${cat} untuk tanggal ${selectedDate} sudah ada. Apakah Anda ingin membuat sisanya yang belum terdaftar?`)) {
        return;
      }
    }

    onBulkGenerateAbsensi(selectedDate, cat);
  };

  // Direct status click updater (excel style)
  const handleToggleStatus = (record: Absensi, newStatus: AbsensiStatus) => {
    onUpdateAbsensi({
      ...record,
      status: newStatus
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) {
      alert("Silakan pilih personel terlebih dahulu!");
      return;
    }

    // Find name
    let targetNama = "";
    let targetKategori: "Siswa" | "Staf" | "Instruktur" = "Siswa";

    if (formType === "Siswa") {
      const s = siswa.find(item => item.id === selectedTargetId);
      targetNama = s ? s.nama : "";
      targetKategori = "Siswa";
    } else {
      const st = staff.find(item => item.id === selectedTargetId);
      targetNama = st ? st.nama : "";
      targetKategori = formType === "Staf" ? "Staf" : "Instruktur";
    }

    // Check if record already exists for this person on this date
    const duplicate = absensi.find(a => a.tanggal === selectedDate && a.targetId === selectedTargetId);
    if (duplicate) {
      alert(`Absensi untuk ${targetNama} pada tanggal ${selectedDate} sudah terdaftar! Gunakan edit di tabel.`);
      return;
    }

    const newRecord: Absensi = {
      id: `ABS-${Date.now().toString().slice(-4)}`,
      tanggal: selectedDate,
      targetId: selectedTargetId,
      nama: targetNama,
      kategori: targetKategori,
      status: status,
      keterangan: notes,
      jamMasuk: targetKategori !== "Siswa" ? jamMasuk : undefined,
      jamSelesai: targetKategori !== "Siswa" ? jamSelesai : undefined
    };

    onAddAbsensi(newRecord);
    setIsFormOpen(false);
    setSelectedTargetId("");
    setNotes("");
    setJamMasuk("08:00");
    setJamSelesai("12:00");
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="absensi-sheet-container">
      {/* Excel Tool Bar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          {/* Custom Date Picker */}
          <div className="flex items-center space-x-1.5 border border-gray-300 rounded px-2.5 py-1 bg-white text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="focus:outline-none bg-transparent text-gray-800"
            />
          </div>

          <button
            id="btn-add-absensi"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center space-x-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs px-3 py-1.5 rounded font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Absen Manual</span>
          </button>

          {/* Productivity Bulk Generators */}
          {viewMode === "Siswa" ? (
            <button
              id="btn-bulk-siswa"
              onClick={() => handleBulkGenerate("Siswa")}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded font-medium"
              title="Otomatis masukkan semua siswa aktif dengan status Hadir untuk tanggal terpilih"
            >
              ⚡ Buat Absen Semua Siswa
            </button>
          ) : (
            <button
              id="btn-bulk-staff"
              onClick={() => handleBulkGenerate("Staf/Instruktur")}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1.5 rounded font-medium"
              title="Otomatis masukkan semua staf/instruktur aktif dengan status Hadir untuk tanggal terpilih"
            >
              ⚡ Buat Absen Semua Instruktur & Staf
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama personel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-48 focus:outline-none focus:ring-1 bg-white"
            />
          </div>

          {selectedRowId && (
            <button
              id="btn-delete-absensi"
              onClick={() => {
                if (confirm("Hapus baris absensi ini?")) {
                  onDeleteAbsensi(selectedRowId);
                  setSelectedRowId(null);
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs px-2.5 py-1.5 rounded border border-red-200"
            >
              Hapus Baris
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet Formula Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-600">
        <div className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-gray-700 min-w-[50px] text-center">
          {selectedRowId ? `ABS-${absensi.findIndex(a => a.id === selectedRowId) + 1}` : "A1"}
        </div>
        <div className="text-gray-400 font-bold">fx</div>
        <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
          {selectedRowId 
            ? `=ATTENDANCE(PERSON: "${absensi.find(a => a.id === selectedRowId)?.nama}", DATE: "${absensi.find(a => a.id === selectedRowId)?.tanggal}", STATUS: "${absensi.find(a => a.id === selectedRowId)?.status}")`
            : `Pilih baris absensi untuk melihat formula. Menampilkan absensi untuk tanggal: ${selectedDate}`
          }
        </div>
      </div>

      {/* Productivity Advice */}
      <div className="bg-indigo-50/60 px-4 py-2 border-b border-gray-200 flex items-center text-[11px] text-indigo-800">
        <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-indigo-600 flex-shrink-0" />
        <span>
          <strong>💡 Tips Excel Cepat:</strong> Anda dapat mengubah status kehadiran (Hadir, Sakit, Izin, Alpa) secara instan dengan mengklik tombol status di kolom **Presensi (C-F)**.
        </span>
      </div>

      {/* Main Spreadsheet Table */}
      <div className="flex-grow overflow-auto">
        <table className={`w-full text-left border-collapse ${viewMode === "Instruktur" ? "min-w-[1100px]" : "min-w-[900px]"}`}>
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-mono text-gray-500">
              <th className="w-10 text-center border-r border-gray-300 select-none py-1">#</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Personel (A)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36">Kategori (B)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-24 text-center text-green-700">Hadir (C)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-24 text-center text-amber-600">Sakit (D)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-24 text-center text-blue-600">Izin (E)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-24 text-center text-red-600">Alpa (F)</th>
              {viewMode === "Instruktur" && (
                <>
                  <th className="px-3 py-1 border-r border-gray-300 w-32 text-center text-indigo-700">Jam Masuk (G)</th>
                  <th className="px-3 py-1 border-r border-gray-300 w-32 text-center text-indigo-700">Jam Selesai (H)</th>
                </>
              )}
              <th className="px-3 py-1 border-r border-gray-300">Keterangan / Alasan ({viewMode === "Instruktur" ? "I" : "G"})</th>
              <th className="px-3 py-1 text-center w-20">Tanggal</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {filteredAbsensi.map((record, index) => {
              const isSelected = selectedRowId === record.id;
              return (
                <tr
                  key={record.id}
                  onClick={() => setSelectedRowId(record.id)}
                  className={`border-b border-gray-200 cursor-pointer select-none hover:bg-indigo-50/20 ${
                    isSelected ? "bg-indigo-100/60" : ""
                  }`}
                >
                  <td className="w-10 text-center bg-gray-50 border-r border-gray-300 text-[10px] text-gray-400 font-mono py-2.5">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-gray-900">
                    {record.nama}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      record.kategori === "Siswa" ? "bg-teal-100 text-teal-800" :
                      record.kategori === "Instruktur" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {record.kategori}
                    </span>
                  </td>

                  {/* Hadir button cell */}
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(record, AbsensiStatus.Hadir);
                      }}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs border transition ${
                        record.status === AbsensiStatus.Hadir
                          ? "bg-green-500 text-white border-green-600 shadow-sm"
                          : "bg-gray-50 text-gray-300 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      H
                    </button>
                  </td>

                  {/* Sakit button cell */}
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(record, AbsensiStatus.Sakit);
                      }}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs border transition ${
                        record.status === AbsensiStatus.Sakit
                          ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                          : "bg-gray-50 text-gray-300 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      S
                    </button>
                  </td>

                  {/* Izin button cell */}
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(record, AbsensiStatus.Izin);
                      }}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs border transition ${
                        record.status === AbsensiStatus.Izin
                          ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                          : "bg-gray-50 text-gray-300 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      I
                    </button>
                  </td>

                  {/* Alpa button cell */}
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(record, AbsensiStatus.Alpa);
                      }}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs border transition ${
                        record.status === AbsensiStatus.Alpa
                          ? "bg-red-500 text-white border-red-600 shadow-sm"
                          : "bg-gray-50 text-gray-300 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      A
                    </button>
                  </td>

                  {viewMode === "Instruktur" && (
                    <>
                      <td className="px-3 py-2 border-r border-gray-300 text-center">
                        <input
                          type="time"
                          value={record.jamMasuk || ""}
                          onChange={(e) => onUpdateAbsensi({ ...record, jamMasuk: e.target.value })}
                          className="w-full bg-transparent border border-gray-200 rounded px-1.5 py-0.5 text-center focus:border-indigo-600 focus:outline-none focus:bg-white font-mono text-xs text-indigo-900 font-semibold"
                        />
                      </td>
                      <td className="px-3 py-2 border-r border-gray-300 text-center">
                        <input
                          type="time"
                          value={record.jamSelesai || ""}
                          onChange={(e) => onUpdateAbsensi({ ...record, jamSelesai: e.target.value })}
                          className="w-full bg-transparent border border-gray-200 rounded px-1.5 py-0.5 text-center focus:border-indigo-600 focus:outline-none focus:bg-white font-mono text-xs text-indigo-900 font-semibold"
                        />
                      </td>
                    </>
                  )}

                  {/* Keterangan */}
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-sans">
                    <input
                      type="text"
                      value={record.keterangan}
                      onChange={(e) => onUpdateAbsensi({ ...record, keterangan: e.target.value })}
                      placeholder="Masukkan keterangan absen (double click untuk edit)"
                      className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-600 focus:outline-none"
                    />
                  </td>

                  {/* Date column */}
                  <td className="px-3 py-2 text-center text-gray-500">
                    {record.tanggal}
                  </td>
                </tr>
              );
            })}
            {filteredAbsensi.length === 0 && (
              <tr>
                <td colSpan={viewMode === "Instruktur" ? 11 : 9} className="text-center py-10 text-gray-400 bg-gray-50">
                  Belum ada rekaman absensi untuk tanggal <strong>{selectedDate}</strong>.
                  <div className="mt-3 space-x-2">
                    {viewMode === "Siswa" ? (
                      <button
                        onClick={() => handleBulkGenerate("Siswa")}
                        className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded font-semibold"
                      >
                        Buat Log Siswa Baru
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBulkGenerate("Staf/Instruktur")}
                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-semibold"
                      >
                        Buat Log Instruktur & Staf Baru
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grid footer */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div className="flex space-x-4">
          <span>Hadir: {filteredAbsensi.filter(a => a.status === AbsensiStatus.Hadir).length}</span>
          <span>Sakit: {filteredAbsensi.filter(a => a.status === AbsensiStatus.Sakit).length}</span>
          <span>Izin: {filteredAbsensi.filter(a => a.status === AbsensiStatus.Izin).length}</span>
          <span>Alpa: {filteredAbsensi.filter(a => a.status === AbsensiStatus.Alpa).length}</span>
        </div>
        <div>Tanggal Aktif: {selectedDate}</div>
      </div>

      {/* Add Absensi Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-4 border-b border-gray-200 bg-indigo-800 text-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Absensi Manual ({viewMode === "Siswa" ? "Siswa" : "Instruktur & Staf"})</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-gray-200">✕</button>
            </div>
            
            <form onSubmit={handleSaveForm} className="p-4 space-y-4">
              {viewMode === "Instruktur" ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Kategori Personel</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Instruktur", "Staf"] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setFormType(type);
                          setSelectedTargetId("");
                        }}
                        className={`py-1.5 text-xs rounded border font-medium ${
                          formType === type 
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700" 
                            : "bg-white border-gray-300 text-gray-700"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Personel *</label>
                <select
                  required
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="">-- Pilih Personel --</option>
                  {formType === "Siswa" 
                    ? siswa.filter(s => s.status === "Aktif").map(s => (
                        <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                      ))
                    : staff.filter(st => st.status === "Aktif" && (formType === "Staf" ? st.role !== "Instruktur" : st.role === "Instruktur")).map(st => (
                        <option key={st.id} value={st.id}>{st.nama} ({st.nip})</option>
                      ))
                  }
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Absensi</label>
                  <input
                    type="date"
                    disabled
                    value={selectedDate}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status Kehadiran</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AbsensiStatus)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none"
                  >
                    {Object.values(AbsensiStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formType !== "Siswa" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jam Masuk Mengajar</label>
                    <input
                      type="time"
                      value={jamMasuk}
                      onChange={(e) => setJamMasuk(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jam Selesai Mengajar</label>
                    <input
                      type="time"
                      value={jamSelesai}
                      onChange={(e) => setJamSelesai(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Demam, Dispensasi, dll."
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-indigo-800 text-white rounded hover:bg-indigo-900 font-semibold"
                >
                  Simpan Absen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
