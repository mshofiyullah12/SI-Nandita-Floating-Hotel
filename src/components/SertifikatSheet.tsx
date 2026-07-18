/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sertifikat, Siswa } from "../types";
import NanditaLogo from "./NanditaLogo";
import { 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  Award, 
  CheckCircle, 
  ShieldCheck, 
  X, 
  Sliders, 
  Type, 
  Palette, 
  Sparkles, 
  RefreshCw,
  FileText
} from "lucide-react";

interface SertifikatSheetProps {
  sertifikat: Sertifikat[];
  siswa: Siswa[];
  onAddSertifikat: (newCert: Sertifikat) => void;
  onDeleteSertifikat: (id: string) => void;
  schoolSettings: {
    namaLembaga: string;
    alamat: string;
    direkturNama: string;
    direkturNip: string;
    warnaUtama: string;
    logoUrl?: string;
  };
}

export default function SertifikatSheet({
  sertifikat,
  siswa,
  onAddSertifikat,
  onDeleteSertifikat,
  schoolSettings
}: SertifikatSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activePrintCert, setActivePrintCert] = useState<Sertifikat | null>(null);

  // Certificate Design custom states
  const [designWarna, setDesignWarna] = useState<"amber" | "emerald" | "blue" | "red" | "dark">("amber");
  const [designFrame, setDesignFrame] = useState<"double" | "classic" | "modern" | "simple">("double");
  const [designFont, setDesignFont] = useState<"serif" | "sans" | "playfair" | "elegant">("serif");
  const [designSeal, setDesignSeal] = useState<"gold-star" | "ribbon" | "shield" | "none">("gold-star");
  const [designWatermark, setDesignWatermark] = useState(true);
  const [customTitle, setCustomTitle] = useState("SERTIFIKAT KOMPETENSI");
  const [customSubtitle, setCustomSubtitle] = useState("Certificate of Competency");
  const [customDescription, setCustomDescription] = useState("Atas pencapaian dan kelulusannya dalam mengikuti pelatihan intensif serta evaluasi uji kompetensi profesional:");
  const [signatureName, setSignatureName] = useState(schoolSettings.direkturNama);
  const [signatureTitle, setSignatureTitle] = useState("Direktur LPK Nandita");

  // New certificate form states
  const [selectedSiswaId, setSelectedSiswaId] = useState("");
  const [namaKompetensi, setNamaKompetensi] = useState("");
  const [nomorSertifikat, setNomorSertifikat] = useState("");
  const [tanggalTerbit, setTanggalTerbit] = useState(new Date().toISOString().split("T")[0]);
  const [tanggalKadaluarsa, setTanggalKadaluarsa] = useState("Unlimited");
  const [nilai, setNilai] = useState("Sangat Baik (A)");

  // Filter
  const filteredCerts = sertifikat.filter(c => 
    c.siswaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.namaKompetensi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nomorSertifikat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId || !namaKompetensi) {
      alert("Siswa dan Nama Kompetensi wajib diisi!");
      return;
    }

    const targetSiswa = siswa.find(s => s.id === selectedSiswaId);
    if (!targetSiswa) return;

    const newRecord: Sertifikat = {
      id: `CERT-${Date.now().toString().slice(-4)}`,
      siswaId: selectedSiswaId,
      siswaNama: targetSiswa.nama,
      namaKompetensi: namaKompetensi,
      nomorSertifikat: nomorSertifikat || `LPKN-${Date.now().toString().slice(-5)}`,
      tanggalTerbit: tanggalTerbit,
      tanggalKadaluarsa: tanggalKadaluarsa,
      nilai: nilai,
      penerbit: schoolSettings.namaLembaga
    };

    onAddSertifikat(newRecord);
    setIsFormOpen(false);

    // Reset
    setSelectedSiswaId("");
    setNamaKompetensi("");
    setNomorSertifikat("");
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="sertifikat-sheet-container">
      {/* Excel Ribbon */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            id="btn-add-cert"
            onClick={() => {
              setNomorSertifikat(`CERT/LPKN/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`);
              setIsFormOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Sertifikat (Baris)</span>
          </button>

          <button
            id="btn-print-cert"
            disabled={!selectedRowId}
            onClick={() => {
              const selected = sertifikat.find(c => c.id === selectedRowId);
              if (selected) setActivePrintCert(selected);
            }}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-medium ${
              selectedRowId 
                ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Sertifikat Resmi</span>
          </button>

          {selectedRowId && (
            <button
              id="btn-delete-cert"
              onClick={() => {
                if (confirm("Hapus baris data sertifikat ini?")) {
                  onDeleteSertifikat(selectedRowId);
                  setSelectedRowId(null);
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs px-2.5 py-1.5 rounded border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, sertifikat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-52 focus:outline-none bg-white"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Formula Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-600">
        <div className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-gray-700 min-w-[50px] text-center">
          {selectedRowId ? `CRT-${sertifikat.findIndex(c => c.id === selectedRowId) + 1}` : "A1"}
        </div>
        <div className="text-gray-400 font-bold">fx</div>
        <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
          {selectedRowId 
            ? `=CERTIFICATE(STUDENT: "${sertifikat.find(c => c.id === selectedRowId)?.siswaNama}", COMPETENCY: "${sertifikat.find(c => c.id === selectedRowId)?.namaKompetensi}", NOMOR: "${sertifikat.find(c => c.id === selectedRowId)?.nomorSertifikat}")`
            : "Pilih salah satu baris sertifikat untuk melihat detail rumus. Klik Cetak Sertifikat untuk melihat visual sertifikat siap cetak."
          }
        </div>
      </div>

      {/* Main Grid table */}
      <div className="flex-grow overflow-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-mono text-gray-500">
              <th className="w-10 text-center border-r border-gray-300 select-none py-1">#</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32">ID Sertifikat</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Siswa (A)</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Kompetensi / Kursus (B)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-44">Nomor Seri Sertifikat (C)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-28">Tgl Terbit (D)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-28">Tgl Expire (E)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32 text-center">Predikat Nilai (F)</th>
              <th className="px-3 py-1 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {filteredCerts.map((cert, index) => {
              const isSelected = selectedRowId === cert.id;
              return (
                <tr
                  key={cert.id}
                  onClick={() => setSelectedRowId(cert.id)}
                  onDoubleClick={() => setActivePrintCert(cert)}
                  className={`border-b border-gray-200 cursor-pointer select-none hover:bg-emerald-50/20 ${
                    isSelected ? "bg-emerald-100/60 border-2 border-emerald-600" : ""
                  }`}
                >
                  <td className="w-10 text-center bg-gray-50 border-r border-gray-300 text-[10px] text-gray-400 font-mono py-2.5">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-bold">
                    {cert.id}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-gray-900">
                    {cert.siswaNama}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-teal-800 font-sans font-medium flex items-center">
                    <Award className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0" />
                    {cert.namaKompetensi}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-semibold text-gray-700">
                    {cert.nomorSertifikat}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600">
                    {cert.tanggalTerbit}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-600">
                    {cert.tanggalKadaluarsa}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center text-green-700 font-bold font-sans">
                    {cert.nilai}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePrintCert(cert);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-sans font-bold"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Lihat</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredCerts.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400 bg-gray-50">
                  Belum ada data sertifikat kompetensi yang diterbitkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div>Total Certs: {filteredCerts.length}</div>
        <div>LPK Nandita Certification Authority Database</div>
      </div>

      {/* Add Certificate Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-4 border-b border-gray-200 bg-emerald-800 text-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold text-sm">Terbitkan Sertifikat Kompetensi</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-gray-200">✕</button>
            </div>
            
            <form onSubmit={handleSaveForm} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={selectedSiswaId}
                  onChange={(e) => setSelectedSiswaId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswa.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nis} - {s.programStudi})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Kompetensi / Pelatihan *</label>
                <input
                  type="text"
                  required
                  value={namaKompetensi}
                  onChange={(e) => setNamaKompetensi(e.target.value)}
                  placeholder="e.g. Table Manners, Cruise Ship Steward Basic Training"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Registrasi Sertifikat</label>
                <input
                  type="text"
                  value={nomorSertifikat}
                  onChange={(e) => setNomorSertifikat(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Terbit</label>
                  <input
                    type="date"
                    value={tanggalTerbit}
                    onChange={(e) => setTanggalTerbit(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Masa Berlaku</label>
                  <input
                    type="text"
                    value={tanggalKadaluarsa}
                    onChange={(e) => setTanggalKadaluarsa(e.target.value)}
                    placeholder="e.g. 5 Tahun, Unlimited, 2030-12-10"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Predikat Kelulusan / Nilai</label>
                <select
                  value={nilai}
                  onChange={(e) => setNilai(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white"
                >
                  <option value="Sangat Memuaskan (A+)">Sangat Memuaskan (A+)</option>
                  <option value="Sangat Baik (A)">Sangat Baik (A)</option>
                  <option value="Baik (B+)">Baik (B+)</option>
                  <option value="Cukup (B)">Cukup (B)</option>
                  <option value="Lulus">Lulus</option>
                </select>
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
                  className="px-4 py-1.5 text-xs bg-emerald-800 text-white rounded hover:bg-emerald-900 font-semibold"
                >
                  Selesai & Terbitkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate Visual View Overlay (Full screen mockup styled for physical print) */}
      {activePrintCert && (() => {
        // Compute current styles dynamically
        const getThemeStyles = () => {
          switch (designWarna) {
            case "emerald":
              return {
                bg: "bg-emerald-50/10 text-emerald-950",
                borderOuter: "border-emerald-600",
                borderInner: "border-emerald-500/40",
                titleText: "text-emerald-800",
                accentText: "text-emerald-700",
                watermarkColor: "text-emerald-600/10",
                stampStyle: "border-dashed border-emerald-600 bg-emerald-50/50 text-emerald-800",
                accentLine: "bg-emerald-600",
                darkAccent: "text-emerald-950"
              };
            case "blue":
              return {
                bg: "bg-blue-50/10 text-blue-950",
                borderOuter: "border-blue-700",
                borderInner: "border-blue-500/40",
                titleText: "text-blue-900",
                accentText: "text-blue-800",
                watermarkColor: "text-blue-600/10",
                stampStyle: "border-dashed border-blue-600 bg-blue-50/50 text-blue-800",
                accentLine: "bg-blue-700",
                darkAccent: "text-blue-950"
              };
            case "red":
              return {
                bg: "bg-red-50/10 text-red-950",
                borderOuter: "border-red-700",
                borderInner: "border-red-500/40",
                titleText: "text-red-800",
                accentText: "text-red-700",
                watermarkColor: "text-red-600/10",
                stampStyle: "border-dashed border-red-600 bg-red-50/50 text-red-800",
                accentLine: "bg-red-700",
                darkAccent: "text-red-950"
              };
            case "dark":
              return {
                bg: "bg-slate-950 text-amber-100",
                borderOuter: "border-amber-500",
                borderInner: "border-amber-400/30",
                titleText: "text-amber-400",
                accentText: "text-amber-300",
                watermarkColor: "text-amber-400/5",
                stampStyle: "border-dashed border-amber-500/50 bg-slate-900 text-amber-400",
                accentLine: "bg-amber-500",
                darkAccent: "text-white"
              };
            default: // amber
              return {
                bg: "bg-neutral-50 text-teal-950",
                borderOuter: "border-amber-600",
                borderInner: "border-amber-500/40",
                titleText: "text-amber-800",
                accentText: "text-amber-700",
                watermarkColor: "text-amber-800/10",
                stampStyle: "border-dashed border-emerald-600 bg-emerald-50/50 text-emerald-800",
                accentLine: "bg-amber-600",
                darkAccent: "text-teal-950"
              };
          }
        };

        const getFrameStyle = () => {
          switch (designFrame) {
            case "classic":
              return "border-[12px] border-solid relative";
            case "modern":
              return "border-4 border-solid rounded-2xl relative";
            case "simple":
              return "border border-solid relative";
            default: // double
              return "border-4 border-double relative";
          }
        };

        const getFontStyle = () => {
          switch (designFont) {
            case "sans":
              return "font-sans";
            case "playfair":
              return "font-serif tracking-wide";
            case "elegant":
              return "font-sans tracking-widest font-light";
            default: // serif
              return "font-serif";
          }
        };

        const activeTheme = getThemeStyles();
        const activeFrame = getFrameStyle();
        const activeFont = getFontStyle();

        return (
          <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4 overflow-y-auto" id="certificate-print-overlay">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col lg:flex-row overflow-hidden my-5 border border-slate-200">
              
              {/* Left Column - Certificate Designer Sidebar controls (print:hidden) */}
              <div className="w-full lg:w-80 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col print:hidden select-none max-h-[85vh] lg:max-h-[750px] overflow-y-auto">
                
                {/* Sidebar Header */}
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="font-bold text-xs tracking-wider uppercase">Desainer Sertifikat</span>
                  </div>
                  <button
                    onClick={() => setActivePrintCert(null)}
                    className="text-gray-400 hover:text-white transition"
                    title="Tutup Desainer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sidebar Content Scrollable */}
                <div className="p-4 space-y-5 text-left text-xs">
                  
                  {/* Primary Print / Action Buttons placed at the TOP for absolute clarity */}
                  <div className="space-y-2 border-b border-slate-200 pb-4">
                    <p className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Aksi Utama</p>
                    <button
                      onClick={handleTriggerPrint}
                      className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-xl font-bold shadow-md transition active:scale-[0.98] cursor-pointer"
                    >
                      <Printer className="w-4.5 h-4.5" />
                      <span>Cetak / Simpan PDF</span>
                    </button>
                    <button
                      onClick={() => setActivePrintCert(null)}
                      className="w-full flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-lg font-semibold text-xs transition cursor-pointer"
                    >
                      <span>Selesai & Tutup [X]</span>
                    </button>
                  </div>

                  {/* 1. Theme Color Presets */}
                  <div className="space-y-2 border-b border-slate-200 pb-4">
                    <label className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tema Warna & Background</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[
                        { id: "amber", name: "Amber Gold", color: "bg-amber-500 border-amber-300" },
                        { id: "emerald", name: "Emerald", color: "bg-emerald-600 border-emerald-400" },
                        { id: "blue", name: "Classic Blue", color: "bg-blue-700 border-blue-400" },
                        { id: "red", name: "Crimson", color: "bg-red-600 border-red-400" },
                        { id: "dark", name: "Executive Dark", color: "bg-slate-900 border-slate-700" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setDesignWarna(item.id as any)}
                          title={item.name}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer transition relative flex items-center justify-center ${item.color} ${
                            designWarna === item.id ? "ring-2 ring-emerald-500 scale-110" : "opacity-80 hover:opacity-100"
                          }`}
                        >
                          {designWarna === item.id && (
                            <span className="text-[10px] text-white font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Frame Borders style selector */}
                  <div className="space-y-2 border-b border-slate-200 pb-4">
                    <label className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>Gaya Bingkai (Frame)</span>
                    </label>
                    <select
                      value={designFrame}
                      onChange={(e) => setDesignFrame(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="double">Double Classic Frame</option>
                      <option value="classic">Thick Solid Border</option>
                      <option value="modern">Modern Curved Card</option>
                      <option value="simple">Minimalist Thin Border</option>
                    </select>
                  </div>

                  {/* 3. Typography selector */}
                  <div className="space-y-2 border-b border-slate-200 pb-4">
                    <label className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-slate-500" />
                      <span>Gaya Huruf (Font)</span>
                    </label>
                    <select
                      value={designFont}
                      onChange={(e) => setDesignFont(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="serif">Times New Roman (Classic Serif)</option>
                      <option value="playfair">Playfair Modern Display</option>
                      <option value="sans">Plus Jakarta (Modern Clean)</option>
                      <option value="elegant">Sleek Sans (Elegant Spacing)</option>
                    </select>
                  </div>

                  {/* 4. Stamp and Seal selector */}
                  <div className="space-y-2 border-b border-slate-200 pb-4">
                    <label className="font-bold text-gray-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>Segel / Emblem & Watermark</span>
                    </label>
                    <select
                      value={designSeal}
                      onChange={(e) => setDesignSeal(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="gold-star">Golden Star Medal</option>
                      <option value="ribbon">Luxury Hanging Ribbons</option>
                      <option value="shield">Security Guard Shield</option>
                      <option value="none">Tanpa Segel</option>
                    </select>

                    <div className="flex items-center space-x-2 pt-1.5">
                      <input
                        type="checkbox"
                        id="check-watermark"
                        checked={designWatermark}
                        onChange={(e) => setDesignWatermark(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <label htmlFor="check-watermark" className="text-[11px] text-gray-600 font-medium cursor-pointer">
                        Aktifkan Watermark Latar Belakang
                      </label>
                    </div>
                  </div>

                  {/* 5. Custom Text inputs */}
                  <div className="space-y-3.5">
                    <label className="font-bold text-gray-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Kustomisasi Tulisan & Teks</span>
                    </label>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5 uppercase">Judul Utama</label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5 uppercase">Subjudul Terjemahan</label>
                      <input
                        type="text"
                        value={customSubtitle}
                        onChange={(e) => setCustomSubtitle(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5 uppercase">Paragraf Deskripsi</label>
                      <textarea
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        rows={3}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-[11px] focus:outline-none leading-tight bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5 uppercase">Nama Penandatangan</label>
                      <input
                        type="text"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5 uppercase">Jabatan Penandatangan</label>
                      <input
                        type="text"
                        value={signatureTitle}
                        onChange={(e) => setSignatureTitle(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none bg-white text-gray-900"
                      />
                    </div>

                    {/* Reset button */}
                    <button
                      type="button"
                      onClick={() => {
                        setDesignWarna("amber");
                        setDesignFrame("double");
                        setDesignFont("serif");
                        setDesignSeal("gold-star");
                        setDesignWatermark(true);
                        setCustomTitle("SERTIFIKAT KOMPETENSI");
                        setCustomSubtitle("Certificate of Competency");
                        setCustomDescription("Atas pencapaian dan kelulusannya dalam mengikuti pelatihan intensif serta evaluasi uji kompetensi profesional:");
                        setSignatureName(schoolSettings.direkturNama);
                        setSignatureTitle("Direktur LPK Nandita");
                      }}
                      className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 mt-3"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Kembalikan Desain Bawaan</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Right Column - Live Certificate Preview Container */}
              <div className="flex-grow bg-zinc-100 p-4 md:p-8 flex flex-col items-center justify-center overflow-y-auto max-h-[85vh] lg:max-h-[750px] relative">
                
                {/* Certificate Template Body */}
                <div 
                  className={`p-6 md:p-12 relative ${activeTheme.bg} ${activeFrame} ${activeTheme.borderOuter} shadow-lg text-center w-full max-w-3xl aspect-[1.414/1] flex flex-col justify-between transition-all duration-300 ${activeFont}`} 
                  id="printable-certificate"
                >
                  
                  {/* Background watermark */}
                  {designWatermark && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                      <Award className={`w-72 h-72 ${activeTheme.watermarkColor}`} />
                    </div>
                  )}

                  {/* Borders */}
                  <div className={`border ${activeTheme.borderInner} p-4 md:p-8 flex flex-col justify-between flex-grow`}>
                    
                    {/* Header Section */}
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex justify-center mb-1">
                        <NanditaLogo variant="icon" height={64} logoUrl={schoolSettings.logoUrl} />
                      </div>
                      <h2 className={`text-base md:text-xl font-bold tracking-wide ${activeTheme.darkAccent} uppercase`}>
                        {schoolSettings.namaLembaga}
                      </h2>
                      <p className={`text-[8px] md:text-[10px] uppercase tracking-widest ${activeTheme.titleText} font-bold`}>
                        Pusat Pelatihan Kapal Pesiar dan Perhotelan Internasional
                      </p>
                      <p className="text-[8px] md:text-[9px] text-gray-500 font-sans italic font-medium">
                        Izin Lembaga Kementerian Tenaga Kerja No. KEP. 881/LPK/2026
                      </p>
                      <div className={`w-24 h-0.5 ${activeTheme.accentLine} mx-auto my-1.5 md:my-3`}></div>
                    </div>

                    {/* Main Content */}
                    <div className="my-2 md:my-4 space-y-1.5 md:space-y-3">
                      <h1 className={`text-lg md:text-2xl font-bold tracking-wide ${activeTheme.titleText}`}>
                        {customTitle}
                      </h1>
                      <p className="text-[9px] md:text-xs text-gray-500 italic uppercase tracking-wider font-semibold">
                        {customSubtitle}
                      </p>
                      <p className="text-[9px] md:text-[10px] font-mono text-gray-600 mt-1">
                        Nomor Seri: <span className="font-bold text-gray-900">{activePrintCert.nomorSertifikat}</span>
                      </p>

                      <div className="pt-2">
                        <p className="text-[10px] md:text-xs text-gray-500 italic">Diberikan Kepada / Awarded To:</p>
                        <h3 className={`text-base md:text-xl font-bold border-b border-gray-300 w-2/3 mx-auto pb-1 mt-1 ${activeTheme.darkAccent}`}>
                          {activePrintCert.siswaNama}
                        </h3>
                      </div>

                      <div className="pt-2 max-w-lg mx-auto space-y-1">
                        <p className="text-[10px] md:text-xs text-gray-600 font-sans">
                          {customDescription}
                        </p>
                        <h4 className={`text-sm md:text-base font-bold uppercase ${activeTheme.titleText}`}>
                          "{activePrintCert.namaKompetensi}"
                        </h4>
                        <p className="text-[10px] md:text-xs text-gray-500">
                          Dengan Kategori Predikat Kelulusan: <span className="font-bold text-green-700">"{activePrintCert.nilai}"</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer Signatures */}
                    <div className="grid grid-cols-2 gap-4 md:gap-10 mt-2 md:mt-4 pt-4 border-t border-gray-100">
                      {/* Left validation stamp & Custom Seal */}
                      <div className="flex items-center justify-center space-x-3 text-left">
                        
                        {/* Selected seal badge */}
                        {designSeal === "gold-star" && (
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 text-white rounded-full flex items-center justify-center border-2 border-amber-200 shadow relative">
                            <Award className="w-6 h-6 md:w-7 md:h-7 text-amber-950" />
                          </div>
                        )}
                        {designSeal === "ribbon" && (
                          <div className="flex flex-col items-center relative scale-90">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
                              <Award className="w-5 h-5 text-amber-900" />
                            </div>
                            <div className="flex space-x-1 -mt-1.5 z-0">
                              <div className="w-2 h-7 bg-red-600 transform -rotate-12 rounded-b"></div>
                              <div className="w-2 h-7 bg-blue-600 transform rotate-12 rounded-b"></div>
                            </div>
                          </div>
                        )}
                        {designSeal === "shield" && (
                          <div className="w-11 h-11 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center border-2 border-slate-300 shadow-xs relative">
                            <ShieldCheck className="w-6 h-6 text-teal-700" />
                          </div>
                        )}

                        <div className={`border rounded p-1.5 max-w-[150px] ${activeTheme.stampStyle}`}>
                          <span className="text-[8px] font-mono block font-bold uppercase">✓ VALID DOKUMEN</span>
                          <span className="text-[7px] font-mono block opacity-80 mt-0.5">Diterbitkan oleh LPK Nandita secara resmi.</span>
                        </div>
                      </div>

                      {/* Right Director Sign */}
                      <div className="flex flex-col items-center justify-end text-center">
                        <p className="text-[9px] md:text-[10px] text-gray-500">{signatureTitle},</p>
                        
                        {/* Handwritten signature visual */}
                        <div className="h-8 md:h-12 flex items-center justify-center relative my-0.5 md:my-1">
                          <span className="font-serif italic text-amber-700/80 text-sm md:text-lg font-bold transform -rotate-3 select-none">
                            Nandita Wahyuni
                          </span>
                        </div>

                        <p className="text-[10px] md:text-xs font-bold text-gray-800 border-t border-gray-300 pt-0.5 w-36 md:w-44">
                          {signatureName}
                        </p>
                        <p className="text-[8px] md:text-[9px] font-mono text-gray-500">{schoolSettings.direkturNip}</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Non-printable print instruction */}
                <div className="mt-4 text-center text-[10px] text-gray-400 italic print:hidden">
                  Tip: Atur orientasi halaman pencetakan ke **Landscape** dan matikan header/footer browser untuk hasil cetak yang rapi.
                </div>

              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
