/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Staff, StaffRole } from "../types";
import { Search, Plus, Trash2, Edit2, FileDown, FileUp } from "lucide-react";
import { exportToCSV, parseCSV, formatRupiah } from "../utils";

interface StaffSheetProps {
  staff: Staff[];
  onAddStaff: (newStaff: Staff) => void;
  onUpdateStaff: (updatedStaff: Staff) => void;
  onDeleteStaff: (id: string) => void;
  onBulkStaffImport: (staffList: Staff[]) => void;
}

export default function StaffSheet({
  staff,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onBulkStaffImport
}: StaffSheetProps) {
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<Staff>>({
    nama: "",
    nip: "",
    role: StaffRole.Instruktur,
    spesialisasi: "",
    noHp: "",
    alamat: "",
    status: "Aktif",
    gajiPokok: 5000000
  });

  // Filter & Search
  const filteredStaff = staff.filter(s => {
    const matchesSearch = 
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nip.includes(searchTerm) ||
      s.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Form Handlers
  const handleOpenAdd = () => {
    setFormMode("add");
    setFormData({
      nama: "",
      nip: `NIP-${Date.now().toString().slice(-6)}`,
      role: StaffRole.Instruktur,
      spesialisasi: "",
      noHp: "",
      alamat: "",
      status: "Aktif",
      gajiPokok: 5000000
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (staffItem: Staff) => {
    setFormMode("edit");
    setFormData(staffItem);
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) {
      alert("Nama Pegawai wajib diisi!");
      return;
    }

    if (formMode === "add") {
      const newRecord: Staff = {
        id: `STF-${Date.now().toString().slice(-4)}`,
        nama: formData.nama,
        nip: formData.nip || `NIP-${Date.now().toString().slice(-5)}`,
        role: formData.role as StaffRole,
        spesialisasi: formData.spesialisasi || "",
        noHp: formData.noHp || "",
        alamat: formData.alamat || "",
        status: (formData.status || "Aktif") as "Aktif" | "Non-Aktif",
        gajiPokok: Number(formData.gajiPokok) || 3000000
      };
      onAddStaff(newRecord);
    } else {
      onUpdateStaff(formData as Staff);
    }
    setIsFormOpen(false);
  };

  // CSV Import/Export
  const handleExportCSV = () => {
    const headersMap = {
      nip: "NIP",
      nama: "Nama Lengkap",
      role: "Jabatan/Role",
      spesialisasi: "Spesialisasi/Kompetensi",
      noHp: "Nomor HP",
      alamat: "Alamat Domisili",
      gajiPokok: "Gaji Pokok (Rupiah)",
      status: "Status Aktif"
    };
    exportToCSV(staff, "buku_induk_staf_instruktur", headersMap);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        alert("File CSV tidak valid!");
        return;
      }

      const importedStaff: Staff[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 7 && row[1]) {
          importedStaff.push({
            id: `STF-IMP-${i}-${Date.now().toString().slice(-3)}`,
            nip: row[0] || `NIP-${Date.now().toString().slice(-4)}`,
            nama: row[1],
            role: (row[2] || StaffRole.Instruktur) as StaffRole,
            spesialisasi: row[3] || "",
            noHp: row[4] || "",
            alamat: row[5] || "",
            gajiPokok: Number(row[6]) || 4000000,
            status: (row[7] === "Non-Aktif" ? "Non-Aktif" : "Aktif")
          });
        }
      }

      if (importedStaff.length > 0) {
        onBulkStaffImport(importedStaff);
        alert(`Berhasil mengimpor ${importedStaff.length} data Staf & Instruktur.`);
      } else {
        alert("Tidak ada data valid ditemukan di CSV.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="staff-sheet-container">
      {/* Ribbon Bar (Excel-style) */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            id="btn-add-staff"
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Baris (Staf/Instruktur)</span>
          </button>
          
          <button
            id="btn-edit-staff"
            disabled={!selectedRowId}
            onClick={() => {
              const selected = staff.find(s => s.id === selectedRowId);
              if (selected) handleOpenEdit(selected);
            }}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-medium ${
              selectedRowId 
                ? "bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Baris</span>
          </button>

          <button
            id="btn-delete-staff"
            disabled={!selectedRowId}
            onClick={() => {
              if (selectedRowId && confirm("Apakah Anda yakin ingin menghapus data pegawai ini?")) {
                onDeleteStaff(selectedRowId);
                setSelectedRowId(null);
              }
            }}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-medium ${
              selectedRowId 
                ? "bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer border border-red-200" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Baris</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari NIP, Nama, Kompetensi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-48 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none bg-white"
          >
            <option value="All">Semua Jabatan</option>
            {Object.values(StaffRole).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          {/* Import/Export */}
          <button
            id="btn-export-staff-csv"
            onClick={handleExportCSV}
            title="Ekspor ke Excel (CSV)"
            className="flex items-center justify-center p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 bg-white"
          >
            <FileDown className="w-4 h-4" />
          </button>

          <label className="flex items-center justify-center p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 bg-white cursor-pointer" title="Impor dari Excel (CSV)">
            <FileUp className="w-4 h-4" />
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Spreadsheet Formula Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-600">
        <div className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-gray-700 min-w-[50px] text-center">
          {selectedRowId ? `STF-${staff.findIndex(s => s.id === selectedRowId) + 1}` : "A1"}
        </div>
        <div className="text-gray-400 font-bold">fx</div>
        <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
          {selectedRowId 
            ? `=STAFF(NIP: "${staff.find(s => s.id === selectedRowId)?.nip}", JABATAN: "${staff.find(s => s.id === selectedRowId)?.role}", SPESIALISASI: "${staff.find(s => s.id === selectedRowId)?.spesialisasi}")`
            : "Pilih salah satu baris pegawai untuk memuat formula sel"
          }
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-grow overflow-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-mono text-gray-500">
              <th className="w-10 text-center border-r border-gray-300 select-none py-1">#</th>
              <th className="px-3 py-1 border-r border-gray-300 w-44">NIP (A)</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Pegawai (B)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32">Kategori/Role (C)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-56">Spesialisasi Kompetensi (D)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36">No HP (E)</th>
              <th className="px-3 py-1 border-r border-gray-300">Alamat (F)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32 text-right">Gaji Pokok (G)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-24 text-center">Status (H)</th>
              <th className="px-3 py-1 text-center w-16">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono text-gray-700">
            {filteredStaff.map((staffItem, index) => {
              const isSelected = selectedRowId === staffItem.id;
              return (
                <tr
                  key={staffItem.id}
                  onClick={() => setSelectedRowId(staffItem.id)}
                  onDoubleClick={() => handleOpenEdit(staffItem)}
                  className={`border-b border-gray-200 cursor-pointer select-none hover:bg-blue-50/40 transition-colors ${
                    isSelected ? "bg-blue-100/70 border-2 border-blue-600" : ""
                  }`}
                >
                  <td className="w-10 text-center bg-gray-50 border-r border-gray-300 text-[10px] text-gray-400 font-mono py-2.5">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-semibold">
                    {staffItem.nip}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-900 font-sans font-medium">
                    {staffItem.nama}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-blue-800">
                    {staffItem.role}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600 font-sans">
                    {staffItem.spesialisasi}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300">
                    {staffItem.noHp}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-sans">
                    {staffItem.alamat}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right font-semibold text-gray-900">
                    {formatRupiah(staffItem.gajiPokok)}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      staffItem.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {staffItem.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(staffItem);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400 bg-gray-50">
                  Tidak ada baris data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total Footer bar */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div>Total Rows: {filteredStaff.length} of {staff.length}</div>
        <div>LPK Nandita Staff & Instructor Ledger Database v1.0</div>
      </div>

      {/* Overlay Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end transition-opacity" id="staff-form-overlay">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slide-in">
            <div className="p-5 border-b border-gray-200 bg-blue-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {formMode === "add" ? "Tambah Data Staf/Instruktur Baru" : "Edit Baris Pegawai"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="text-white hover:text-gray-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  value={formData.nip || ""}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  placeholder="19xxxxxxxxxxxx"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Pegawai Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.nama || ""}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama Lengkap & Gelar jika ada"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori / Jabatan</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  >
                    {Object.values(StaffRole).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "Aktif" | "Non-Aktif" })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Spesialisasi Kompetensi / Mengajar</label>
                <input
                  type="text"
                  value={formData.spesialisasi || ""}
                  onChange={(e) => setFormData({ ...formData, spesialisasi: e.target.value })}
                  placeholder="e.g. Housekeeping, Galley, F&B Service"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Handphone</label>
                <input
                  type="text"
                  value={formData.noHp || ""}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Gaji Pokok bulanan (Rp)</label>
                <input
                  type="number"
                  value={formData.gajiPokok || ""}
                  onChange={(e) => setFormData({ ...formData, gajiPokok: Number(e.target.value) })}
                  placeholder="5000000"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Domisili</label>
                <textarea
                  value={formData.alamat || ""}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat lengkap tempat tinggal..."
                  rows={3}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </form>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="px-4 py-1.5 text-xs bg-blue-800 text-white rounded hover:bg-blue-950 font-semibold"
              >
                Simpan Baris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
