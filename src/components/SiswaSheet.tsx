/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Siswa, ProgramStudi, Gender, SiswaStatus } from "../types";
import { Search, Plus, Trash2, Edit2, FileDown, FileUp, Filter, BookOpen, Printer, FileText, User, Heart, Briefcase, MapPin, Eye, FileSpreadsheet } from "lucide-react";
import { exportToCSV, parseCSV } from "../utils";
import * as XLSX from "xlsx";

interface SiswaSheetProps {
  siswa: Siswa[];
  onAddSiswa: (newSiswa: Siswa) => void;
  onUpdateSiswa: (updatedSiswa: Siswa) => void;
  onDeleteSiswa: (id: string) => void;
  onBulkSiswaImport: (siswaList: Siswa[]) => void;
}

export default function SiswaSheet({
  siswa,
  onAddSiswa,
  onUpdateSiswa,
  onDeleteSiswa,
  onBulkSiswaImport
}: SiswaSheetProps) {
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterProgram, setFilterProgram] = useState<string>("All");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Detail Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSiswa, setDetailSiswa] = useState<Siswa | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<Siswa>>({
    nama: "",
    nis: "",
    tempatLahir: "",
    tanggalLahir: "",
    gender: Gender.LakiLaki,
    alamat: "",
    noHp: "",
    programStudi: ProgramStudi.Perhotelan,
    angkatan: "Angkatan 12",
    tanggalDaftar: new Date().toISOString().split("T")[0],
    status: SiswaStatus.Aktif,
    // extended Buku Induk fields
    nik: "",
    agama: "Islam",
    pendidikanTerakhir: "SMA",
    namaAyah: "",
    pekerjaanAyah: "",
    namaIbu: "",
    pekerjaanIbu: "",
    noHpOrangTua: "",
    tinggiBadan: "",
    beratBadan: "",
    catatanKesehatan: ""
  });

  // Filter & Search logic
  const filteredSiswa = siswa.filter(s => {
    const matchesSearch = 
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.includes(searchTerm) ||
      (s.nik && s.nik.includes(searchTerm)) ||
      s.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.noHp.includes(searchTerm);
    
    const matchesStatus = filterStatus === "All" || s.status === filterStatus;
    const matchesProgram = filterProgram === "All" || s.programStudi === filterProgram;

    return matchesSearch && matchesStatus && matchesProgram;
  });

  // Form handlers
  const handleOpenAdd = () => {
    setFormMode("add");
    setFormData({
      nama: "",
      nis: `NIS-${Date.now().toString().slice(-6)}`,
      tempatLahir: "",
      tanggalLahir: "2005-01-01",
      gender: Gender.LakiLaki,
      alamat: "",
      noHp: "",
      programStudi: ProgramStudi.Perhotelan,
      angkatan: "Angkatan 12",
      tanggalDaftar: new Date().toISOString().split("T")[0],
      status: SiswaStatus.Aktif,
      // extended Buku Induk fields
      nik: "",
      agama: "Islam",
      pendidikanTerakhir: "SMA",
      namaAyah: "",
      pekerjaanAyah: "",
      namaIbu: "",
      pekerjaanIbu: "",
      noHpOrangTua: "",
      tinggiBadan: "",
      beratBadan: "",
      catatanKesehatan: ""
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (siswaItem: Siswa) => {
    setFormMode("edit");
    setFormData({
      ...siswaItem,
      nik: siswaItem.nik || "",
      agama: siswaItem.agama || "Islam",
      pendidikanTerakhir: siswaItem.pendidikanTerakhir || "SMA",
      namaAyah: siswaItem.namaAyah || "",
      pekerjaanAyah: siswaItem.pekerjaanAyah || "",
      namaIbu: siswaItem.namaIbu || "",
      pekerjaanIbu: siswaItem.pekerjaanIbu || "",
      noHpOrangTua: siswaItem.noHpOrangTua || "",
      tinggiBadan: siswaItem.tinggiBadan || "",
      beratBadan: siswaItem.beratBadan || "",
      catatanKesehatan: siswaItem.catatanKesehatan || ""
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) {
      alert("Nama Siswa wajib diisi!");
      return;
    }

    if (formMode === "add") {
      const newRecord: Siswa = {
        id: `SIS-${Date.now().toString().slice(-4)}`,
        nama: formData.nama,
        nis: formData.nis || `NIS-${Date.now().toString().slice(-5)}`,
        tempatLahir: formData.tempatLahir || "",
        tanggalLahir: formData.tanggalLahir || "",
        gender: formData.gender as Gender,
        alamat: formData.alamat || "",
        noHp: formData.noHp || "",
        programStudi: formData.programStudi as ProgramStudi,
        angkatan: formData.angkatan || "Angkatan 12",
        tanggalDaftar: formData.tanggalDaftar || "",
        status: formData.status as SiswaStatus,
        // extended Buku Induk fields
        nik: formData.nik || "",
        agama: formData.agama || "Islam",
        pendidikanTerakhir: formData.pendidikanTerakhir || "",
        namaAyah: formData.namaAyah || "",
        pekerjaanAyah: formData.pekerjaanAyah || "",
        namaIbu: formData.namaIbu || "",
        pekerjaanIbu: formData.pekerjaanIbu || "",
        noHpOrangTua: formData.noHpOrangTua || "",
        tinggiBadan: formData.tinggiBadan || "",
        beratBadan: formData.beratBadan || "",
        catatanKesehatan: formData.catatanKesehatan || ""
      };
      onAddSiswa(newRecord);
    } else {
      onUpdateSiswa(formData as Siswa);
    }
    setIsFormOpen(false);
  };

  // CSV Import/Export
  const handleExportCSV = () => {
    const headersMap = {
      nis: "NIS",
      nama: "Nama Siswa",
      gender: "Jenis Kelamin",
      tempatLahir: "Tempat Lahir",
      tanggalLahir: "Tanggal Lahir",
      noHp: "Nomor HP",
      alamat: "Alamat",
      programStudi: "Program Studi",
      angkatan: "Angkatan",
      tanggalDaftar: "Tanggal Daftar",
      status: "Status"
    };
    exportToCSV(siswa, "buku_induk_siswa", headersMap);
  };

  const handleExportExcel = () => {
    const formatted = filteredSiswa.map((s, idx) => ({
      "No": idx + 1,
      "ID Siswa": s.id,
      "Nama Lengkap": s.nama,
      "NIS (Nomor Induk)": s.nis,
      "NIK": s.nik || "-",
      "Jenis Kelamin": s.gender,
      "Tempat Lahir": s.tempatLahir,
      "Tanggal Lahir": s.tanggalLahir,
      "No. Handphone": s.noHp,
      "Alamat Rumah": s.alamat,
      "Program Studi": s.programStudi,
      "Angkatan": s.angkatan,
      "Tanggal Daftar": s.tanggalDaftar,
      "Status": s.status,
      "Agama": s.agama || "-",
      "Pendidikan Terakhir": s.pendidikanTerakhir || "-",
      "Nama Ayah": s.namaAyah || "-",
      "Pekerjaan Ayah": s.pekerjaanAyah || "-",
      "Nama Ibu": s.namaIbu || "-",
      "Pekerjaan Ibu": s.pekerjaanIbu || "-",
      "No. HP Orang Tua": s.noHpOrangTua || "-",
      "Tinggi Badan (cm)": s.tinggiBadan || "-",
      "Berat Badan (kg)": s.beratBadan || "-",
      "Catatan Kesehatan": s.catatanKesehatan || "Sehat Walafiat"
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formatted);
    XLSX.utils.book_append_sheet(wb, ws, "Buku Induk Siswa");
    
    const filterDesc = filterProgram !== "All" || filterStatus !== "All" ? "_Filtered" : "";
    XLSX.writeFile(wb, `Buku_Induk_Siswa_Nandita${filterDesc}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        alert("File CSV tidak valid atau kosong!");
        return;
      }

      // First row is headers. We attempt to map headers to keys
      const importedSiswa: Siswa[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 10 && row[1]) {
          importedSiswa.push({
            id: `SIS-IMP-${i}-${Date.now().toString().slice(-3)}`,
            nis: row[0] || `NIS-${Date.now().toString().slice(-4)}`,
            nama: row[1],
            gender: row[2] === "Perempuan" ? Gender.Perempuan : Gender.LakiLaki,
            tempatLahir: row[3] || "",
            tanggalLahir: row[4] || "",
            noHp: row[5] || "",
            alamat: row[6] || "",
            programStudi: (row[7] || ProgramStudi.Perhotelan) as ProgramStudi,
            angkatan: row[8] || "Angkatan 12",
            tanggalDaftar: row[9] || new Date().toISOString().split("T")[0],
            status: (row[10] || SiswaStatus.Aktif) as SiswaStatus
          });
        }
      }

      if (importedSiswa.length > 0) {
        onBulkSiswaImport(importedSiswa);
        alert(`Berhasil mengimpor ${importedSiswa.length} data siswa.`);
      } else {
        alert("Tidak ada data siswa yang valid ditemukan di CSV.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="siswa-sheet-container">
      {/* Ribbon Bar (Excel-style) */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          {/* Action buttons */}
          <button
            id="btn-add-siswa"
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 bg-green-700 hover:bg-green-800 text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Baris (Siswa)</span>
          </button>
          
          <button
            id="btn-edit-siswa"
            disabled={!selectedRowId}
            onClick={() => {
              const selected = siswa.find(s => s.id === selectedRowId);
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
            id="btn-delete-siswa"
            disabled={!selectedRowId}
            onClick={() => {
              if (selectedRowId && confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
                onDeleteSiswa(selectedRowId);
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
        <div className="flex items-center space-x-2 flex-grow md:flex-grow-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari NIS, Nama, Alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-48 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 bg-white"
            />
          </div>

          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 bg-white"
          >
            <option value="All">Semua Jurusan</option>
            {Object.values(ProgramStudi).map(prog => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 bg-white"
          >
            <option value="All">Semua Status</option>
            {Object.values(SiswaStatus).map(stat => (
              <option key={stat} value={stat}>{stat}</option>
            ))}
          </select>

          {/* Import/Export */}
          <button
            id="btn-export-siswa-xlsx"
            onClick={handleExportExcel}
            title="Ekspor langsung ke Excel (.xlsx)"
            className="flex items-center justify-center p-1.5 border border-emerald-300 rounded hover:bg-emerald-50 text-emerald-700 bg-white cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <button
            id="btn-export-siswa-csv"
            onClick={handleExportCSV}
            title="Ekspor ke Excel (CSV)"
            className="flex items-center justify-center p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 bg-white cursor-pointer"
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
          {selectedRowId ? `SIS-${siswa.findIndex(s => s.id === selectedRowId) + 1}` : "A1"}
        </div>
        <div className="text-gray-400 font-bold">fx</div>
        <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
          {selectedRowId 
            ? `=SISWA(NIS: "${siswa.find(s => s.id === selectedRowId)?.nis}", NAMA: "${siswa.find(s => s.id === selectedRowId)?.nama}", STATUS: "${siswa.find(s => s.id === selectedRowId)?.status}")`
            : "Pilih salah satu baris siswa untuk memuat formula sel"
          }
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-grow overflow-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-mono text-gray-500">
              <th className="w-10 text-center border-r border-gray-300 select-none py-1">#</th>
              <th className="px-3 py-1 border-r border-gray-300 w-28">NIS (A)</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Siswa (B)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-24">Gender (C)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36">Tempat, Tgl Lahir (D)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32">No HP (E)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-44">Program Studi (F)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-28">Angkatan (G)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32">Tgl Daftar (H)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-28 text-center">Status (I)</th>
              <th className="px-3 py-1 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {filteredSiswa.map((siswaItem, index) => {
              const isSelected = selectedRowId === siswaItem.id;
              return (
                <tr
                  key={siswaItem.id}
                  onClick={() => setSelectedRowId(siswaItem.id)}
                  onDoubleClick={() => handleOpenEdit(siswaItem)}
                  className={`border-b border-gray-200 cursor-pointer select-none hover:bg-green-50/40 transition-colors ${
                    isSelected ? "bg-green-100/70 border-2 border-green-600" : ""
                  }`}
                >
                  <td className="w-10 text-center bg-gray-50 border-r border-gray-300 text-[10px] text-gray-400 font-mono py-2">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600 font-semibold">
                    {siswaItem.nis}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-900 font-sans font-medium">
                    {siswaItem.nama}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600">
                    {siswaItem.gender}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600">
                    {siswaItem.tempatLahir}, {siswaItem.tanggalLahir}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600">
                    {siswaItem.noHp}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-teal-800 font-medium font-sans">
                    {siswaItem.programStudi}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600">
                    {siswaItem.angkatan}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600">
                    {siswaItem.tanggalDaftar}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      siswaItem.status === SiswaStatus.Aktif ? "bg-green-100 text-green-800" :
                      siswaItem.status === SiswaStatus.Lulus ? "bg-blue-100 text-blue-800" :
                      siswaItem.status === SiswaStatus.Cuti ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {siswaItem.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(siswaItem);
                      }}
                      className="p-1 text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredSiswa.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-8 text-gray-400 bg-gray-50">
                  Tidak ada baris siswa ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total Sheet Record bar */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div>Total Rows: {filteredSiswa.length} of {siswa.length}</div>
        <div>LPK Nandita Student Ledger Database v1.0</div>
      </div>

      {/* Excel Sheet Slide-over Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end transition-opacity" id="siswa-form-overlay">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slide-in">
            <div className="p-5 border-b border-gray-200 bg-teal-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {formMode === "add" ? "Tambah Data Siswa Baru" : "Edit Baris Buku Induk"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="text-white hover:text-gray-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* SECTION 1: AKADEMIK */}
              <div className="border-b border-gray-200 pb-3">
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3 flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  <span>Informasi Akademik LPK</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nomor Induk Siswa (NIS)</label>
                    <input
                      type="text"
                      value={formData.nis || ""}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      placeholder="2026xxxx"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">NIK (No. KTP) *</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={formData.nik || ""}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      placeholder="16-digit NIK"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Program Studi</label>
                    <select
                      value={formData.programStudi}
                      onChange={(e) => setFormData({ ...formData, programStudi: e.target.value as ProgramStudi })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                    >
                      {Object.values(ProgramStudi).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Angkatan</label>
                    <input
                      type="text"
                      value={formData.angkatan || ""}
                      onChange={(e) => setFormData({ ...formData, angkatan: e.target.value })}
                      placeholder="Angkatan 12"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status Keaktifan</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as SiswaStatus })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                    >
                      {Object.values(SiswaStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tanggal Daftar</label>
                    <input
                      type="date"
                      value={formData.tanggalDaftar || ""}
                      onChange={(e) => setFormData({ ...formData, tanggalDaftar: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: BIODATA DIRI */}
              <div className="border-b border-gray-200 pb-3">
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1" />
                  <span>Biodata Diri Peserta Didik</span>
                </h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ""}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama lengkap"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700 mb-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Jenis Kelamin</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                    >
                      {Object.values(Gender).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Agama</label>
                    <select
                      value={formData.agama || "Islam"}
                      onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen Protestan">Kristen Protestan</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Budha">Budha</option>
                      <option value="Konghucu">Konghucu</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.tempatLahir || ""}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                      placeholder="Surabaya"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={formData.tanggalLahir || ""}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nomor HP</label>
                    <input
                      type="text"
                      value={formData.noHp || ""}
                      onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                      placeholder="08123xxxxxx"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pendidikan Terakhir</label>
                    <input
                      type="text"
                      value={formData.pendidikanTerakhir || ""}
                      onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                      placeholder="SMK Perhotelan / SMA"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Alamat Lengkap (KTP & Domisili)</label>
                  <textarea
                    value={formData.alamat || ""}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Alamat lengkap siswa..."
                    rows={2}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: KESEHATAN FISIK */}
              <div className="border-b border-gray-200 pb-3">
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3 flex items-center">
                  <Heart className="w-3.5 h-3.5 mr-1 text-red-500 animate-pulse" />
                  <span>Kondisi Jasmani & Kesehatan</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tinggi Badan (cm)</label>
                    <input
                      type="text"
                      value={formData.tinggiBadan || ""}
                      onChange={(e) => setFormData({ ...formData, tinggiBadan: e.target.value })}
                      placeholder="170"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Berat Badan (kg)</label>
                    <input
                      type="text"
                      value={formData.beratBadan || ""}
                      onChange={(e) => setFormData({ ...formData, beratBadan: e.target.value })}
                      placeholder="60"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Catatan / Riwayat Penyakit</label>
                  <input
                    type="text"
                    value={formData.catatanKesehatan || ""}
                    onChange={(e) => setFormData({ ...formData, catatanKesehatan: e.target.value })}
                    placeholder="Tidak ada riwayat penyakit kronis"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 4: KELUARGA / ORANG TUA */}
              <div>
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3 flex items-center">
                  <Briefcase className="w-3.5 h-3.5 mr-1" />
                  <span>Latar Belakang Orang Tua / Wali</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Ayah Kandung</label>
                    <input
                      type="text"
                      value={formData.namaAyah || ""}
                      onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                      placeholder="Nama ayah"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pekerjaan Ayah</label>
                    <input
                      type="text"
                      value={formData.pekerjaanAyah || ""}
                      onChange={(e) => setFormData({ ...formData, pekerjaanAyah: e.target.value })}
                      placeholder="Pekerjaan ayah"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Ibu Kandung</label>
                    <input
                      type="text"
                      value={formData.namaIbu || ""}
                      onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                      placeholder="Nama ibu"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pekerjaan Ibu</label>
                    <input
                      type="text"
                      value={formData.pekerjaanIbu || ""}
                      onChange={(e) => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
                      placeholder="Pekerjaan ibu"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nomor HP Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.noHpOrangTua || ""}
                    onChange={(e) => setFormData({ ...formData, noHpOrangTua: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-600 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="px-4 py-1.5 text-xs bg-teal-800 text-white rounded hover:bg-teal-950 font-bold"
              >
                Simpan Baris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUKU INDUK SISWA LEDGER PRINT & DETAIL MODAL */}
      {isDetailOpen && detailSiswa && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white" id="siswa-detail-modal">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
            {/* Modal Header */}
            <div className="p-4 bg-teal-800 text-white flex items-center justify-between rounded-t-xl print:hidden">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-sm">Lembar Buku Induk Siswa</h3>
                  <p className="text-[10px] text-teal-100">Biodata komprehensif arsip peserta didik LPK Nandita</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-teal-700 hover:bg-teal-650 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow-inner"
                >
                  <Printer className="w-4.5 h-4.5" />
                  <span>Cetak Buku Induk</span>
                </button>
                <button 
                  onClick={() => {
                    setIsDetailOpen(false);
                    setDetailSiswa(null);
                  }}
                  className="text-white hover:text-gray-200 text-lg font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body / Official Ledger Printable Card */}
            <div className="p-8 flex-1 overflow-y-auto font-sans text-gray-800 bg-[#fbfbf9] print:bg-white print:p-0 print:overflow-visible">
              <div className="max-w-3xl mx-auto bg-white border border-gray-300 p-8 shadow-sm rounded-lg print:border-none print:shadow-none print:p-0">
                {/* Official Institution Header */}
                <div className="text-center border-b-2 border-double border-gray-800 pb-4 mb-6 relative">
                  <div className="absolute left-2 top-1 font-serif text-[10px] text-gray-400 font-mono print:hidden">
                    FORM-BI/LPK/01
                  </div>
                  <h1 className="text-lg font-serif font-bold text-teal-950 uppercase tracking-wide">
                    LPK NANDITA FLOATING HOTEL
                  </h1>
                  <p className="text-xs text-gray-600 font-medium italic">
                    Pusat Pendidikan & Pelatihan Perhotelan dan Kapal Pesiar
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Jl. Raya Floating Hotel No. 88, Kawasan Pendidikan Maritim, Telp: +62 821-3456-7890
                  </p>
                  <div className="mt-3 font-serif font-extrabold text-sm border-t border-b border-gray-800 py-1 text-gray-900 tracking-wider">
                    LEMBAR BUKU INDUK PESERTA DIDIK
                  </div>
                </div>

                {/* Registry Core Keys */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-3 rounded border border-gray-250 text-xs font-mono">
                  <div>
                    <span className="text-gray-500">NOMOR INDUK SISWA (NIS):</span>
                    <p className="font-bold text-teal-950 text-sm">{detailSiswa.nis}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">NOMOR INDUK KEPENDUDUKAN (NIK):</span>
                    <p className="font-bold text-gray-900 text-sm">{detailSiswa.nik || "-"}</p>
                  </div>
                </div>

                {/* Comprehensive Profile Sections */}
                <div className="space-y-6 text-xs text-gray-800">
                  {/* Section A: Keterangan Diri */}
                  <div>
                    <h3 className="font-bold font-serif border-b border-gray-400 pb-1 text-teal-950 mb-3 uppercase tracking-wide flex items-center">
                      <span className="bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded text-[10px] mr-1.5 font-sans">A</span>
                      Keterangan Pribadi Peserta Didik
                    </h3>
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">1. Nama Lengkap</td>
                          <td className="w-2/3 font-semibold text-gray-950">{detailSiswa.nama}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">2. Jenis Kelamin</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.gender}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">3. Tempat, Tanggal Lahir</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.tempatLahir || "-"}, {detailSiswa.tanggalLahir || "-"}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">4. Agama / Kepercayaan</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.agama || "-"}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">5. Pendidikan Terakhir</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.pendidikanTerakhir || "-"}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">6. Nomor Telepon / HP</td>
                          <td className="w-2/3 font-mono text-gray-800">{detailSiswa.noHp}</td>
                        </tr>
                        <tr className="py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">7. Alamat Tinggal / Domisili</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.alamat || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section B: Keterangan Latar Belakang Keluarga */}
                  <div>
                    <h3 className="font-bold font-serif border-b border-gray-400 pb-1 text-teal-950 mb-3 uppercase tracking-wide flex items-center">
                      <span className="bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded text-[10px] mr-1.5 font-sans">B</span>
                      Keterangan Latar Belakang Keluarga
                    </h3>
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">1. Nama Ayah Kandung</td>
                          <td className="w-2/3 font-semibold text-gray-900">{detailSiswa.namaAyah || "-"}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">2. Pekerjaan Ayah</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.pekerjaanAyah || "-"}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">3. Nama Ibu Kandung</td>
                          <td className="w-2/3 font-semibold text-gray-900">{detailSiswa.namaIbu || "-"}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">4. Pekerjaan Ibu</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.pekerjaanIbu || "-"}</td>
                        </tr>
                        <tr className="py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">5. No. HP Orang Tua / Wali</td>
                          <td className="w-2/3 font-mono text-gray-800">{detailSiswa.noHpOrangTua || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section C: Keterangan Jasmani */}
                  <div>
                    <h3 className="font-bold font-serif border-b border-gray-400 pb-1 text-teal-950 mb-3 uppercase tracking-wide flex items-center">
                      <span className="bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded text-[10px] mr-1.5 font-sans">C</span>
                      Kondisi Jasmani & Kesehatan
                    </h3>
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">1. Tinggi Badan</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.tinggiBadan ? `${detailSiswa.tinggiBadan} cm` : "-"}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">2. Berat Badan</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.beratBadan ? `${detailSiswa.beratBadan} kg` : "-"}</td>
                        </tr>
                        <tr className="py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">3. Catatan / Riwayat Kesehatan</td>
                          <td className="w-2/3 text-gray-850">{detailSiswa.catatanKesehatan || "Tidak ada catatan riwayat penyakit khusus"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section D: Akademik */}
                  <div>
                    <h3 className="font-bold font-serif border-b border-gray-400 pb-1 text-teal-950 mb-3 uppercase tracking-wide flex items-center">
                      <span className="bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded text-[10px] mr-1.5 font-sans">D</span>
                      Keterangan Masuk & Program Studi
                    </h3>
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">1. Program Studi / Jurusan</td>
                          <td className="w-2/3 font-semibold text-teal-800">{detailSiswa.programStudi}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">2. Angkatan Masuk</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.angkatan}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">3. Tanggal Terdaftar</td>
                          <td className="w-2/3 text-gray-800">{detailSiswa.tanggalDaftar}</td>
                        </tr>
                        <tr className="py-1.5 flex">
                          <td className="w-1/3 font-medium text-gray-500">4. Status Peserta Didik</td>
                          <td className="w-2/3">
                            <span className="font-bold text-gray-900">{detailSiswa.status}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-12 flex justify-between text-xs font-serif pt-4">
                  <div className="w-1/2 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-10">Tanda Tangan Peserta Didik</p>
                    <p className="font-bold border-b border-gray-800 w-44 mx-auto pb-0.5"></p>
                    <p className="text-[9px] text-gray-500 mt-1">{detailSiswa.nama}</p>
                  </div>
                  <div className="w-1/2 text-center">
                    <p className="text-gray-700">Floating Hotel, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-10 mt-0.5">Direktur LPK Nandita</p>
                    <p className="font-bold border-b border-gray-800 w-48 mx-auto pb-0.5">Nandita Wahyuni, M.Par.</p>
                    <p className="text-[9px] text-gray-500 mt-1">NIP. 19820512 201012 2 001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2 rounded-b-xl print:hidden">
              <button
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  setDetailSiswa(null);
                }}
                className="px-4 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold cursor-pointer"
              >
                Tutup Lembar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
