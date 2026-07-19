/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { SchoolSettings } from "../types";
import { Save, RefreshCw, HelpCircle, Check, Palette, Upload, Trash2, Image, CreditCard, FileSpreadsheet, MessageSquare, Download } from "lucide-react";
import NanditaLogo from "./NanditaLogo";

interface SettingsSheetProps {
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  onResetToDefault: () => void;
  onImportFullBackup: (backup: any) => void;
  onExportFullBackup: () => string;
}

export default function SettingsSheet({
  settings,
  onUpdateSettings,
  onResetToDefault,
  onImportFullBackup,
  onExportFullBackup
}: SettingsSheetProps) {
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const handleExportData = () => {
    try {
      const jsonString = onExportFullBackup();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      const timeStr = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
      link.download = `LPK_Nandita_Semua_Data_Backup_${dateStr}_${timeStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setBackupSuccess("Ekspor data berhasil! File JSON siap disimpan.");
      setTimeout(() => setBackupSuccess(null), 3000);
    } catch (err: any) {
      setBackupError("Gagal mengekspor data: " + err.message);
      setTimeout(() => setBackupError(null), 4000);
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Simple validation check
        if (!parsed.siswa && !parsed.staff && !parsed.schoolSettings) {
          throw new Error("File JSON tidak mengandung data backup LPK Nandita yang valid.");
        }

        if (confirm("Apakah Anda yakin ingin memulihkan semua data dari file backup ini? Data saat ini di browser Anda akan sepenuhnya digantikan.")) {
          onImportFullBackup(parsed);
          setBackupSuccess("Restorasi data backup LPK berhasil! Memuat ulang konfigurasi...");
          setTimeout(() => {
            setBackupSuccess(null);
            window.location.reload(); // Reload to refresh all components cleanly
          }, 1500);
        }
      } catch (err: any) {
        setBackupError("Gagal mengimpor file backup: " + err.message);
        setTimeout(() => setBackupError(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar (PNG, JPG, SVG, dll) yang diperbolehkan!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          logoUrl: event.target!.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleClearLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang pengaturan lembaga ke bawaan LPK Nandita?")) {
      onResetToDefault();
      setFormData(settings);
    }
  };

  // Pre-configured color options
  const colorOptions = [
    { name: "Bento Navy (Luxury)", value: "#001f3f" },
    { name: "Teal (Maritime)", value: "#0f766e" },
    { name: "Classic Navy (Ocean)", value: "#1e3a8a" },
    { name: "Slate (Corporate)", value: "#334155" },
    { name: "Luxury Maroon", value: "#7f1d1d" }
  ];

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 p-6 overflow-y-auto font-sans" id="settings-sheet-container">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Ribbon */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-900">⚙️ Pengaturan & Konfigurasi Lembaga LPK</h2>
          <p className="text-xs text-gray-500 mt-1">
            Ubah identitas lembaga, logo, direktur penandatangan sertifikat, dan skema warna visual aplikasi.
          </p>
        </div>

        {isSaved && (
          <div className="bg-green-100 border border-green-300 text-green-800 text-xs px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Pengaturan lembaga berhasil disimpan dan diterapkan ke seluruh lembar kerja Excel!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Institutional Core Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2">
              1. Identitas Inti Lembaga LPK
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lembaga Pendidikan (LPK)</label>
                <input
                  type="text"
                  required
                  value={formData.namaLembaga}
                  onChange={(e) => setFormData({ ...formData, namaLembaga: e.target.value })}
                  placeholder="LPK Nandita Floating Hotel"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slogan / Tagline Lembaga</label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Pusat Pendidikan & Pelatihan Perhotelan dan Kapal Pesiar"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Resmi Lembaga</label>
                <textarea
                  required
                  rows={2}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jl. Raya Maritim No. 88..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Telepon LPK</label>
                  <input
                    type="text"
                    required
                    value={formData.noTelepon}
                    onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Resmi LPK</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Website Resmi LPK</label>
                  <input
                    type="text"
                    required
                    value={formData.website || ""}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.nanditafloatinghotel.com"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status Akreditasi LPK</label>
                  <input
                    type="text"
                    required
                    value={formData.akreditasi || ""}
                    onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                    placeholder="Terakreditasi A (Sangat Baik) - LA-LPK"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Logo & Identitas Visual LPK */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center justify-between">
              <span className="flex items-center">
                <Image className="w-4 h-4 mr-1.5 text-teal-700" />
                2. Logo & Identitas Visual Resmi LPK
              </span>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleClearLogo}
                  className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center space-x-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 mr-0.5" />
                  Gunakan Logo Default
                </button>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drag and Drop Zone */}
              <div className="flex flex-col justify-between space-y-3">
                <label className="block text-xs font-bold text-gray-700">Unggah File Logo Baru</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                    isDragging
                      ? "border-teal-600 bg-teal-50/50 scale-[1.02]"
                      : "border-gray-300 hover:border-teal-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className={`w-8 h-8 mb-2 ${isDragging ? "text-teal-700" : "text-gray-400"}`} />
                  <span className="text-xs font-bold text-gray-700 block">
                    {isDragging ? "Lepaskan Logo Di Sini" : "Seret & Lepas Gambar Logo"}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    atau klik untuk memilih file dari komputer
                  </span>
                  <span className="text-[9px] text-gray-400 mt-0.5 block italic">
                    Format: PNG, JPG, JPEG, SVG, GIF (Rekomendasi rasio 1:1)
                  </span>
                </div>
              </div>

              {/* Live Preview Display */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Pratinjau Logo Aktif</span>
                
                <div className="space-y-4 flex flex-col justify-center items-center py-2">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <span className="text-[9px] text-gray-400 block mb-1">Variant: Icon</span>
                      <div className="p-2 bg-white rounded-lg border border-gray-200 inline-block shadow-sm">
                        <NanditaLogo logoUrl={formData.logoUrl} variant="icon" height={50} />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-[9px] text-gray-400 block mb-1">Variant: Certificate</span>
                      <div className="p-2 bg-white rounded-lg border border-gray-200 inline-block shadow-sm">
                        <NanditaLogo logoUrl={formData.logoUrl} variant="icon" height={64} />
                      </div>
                    </div>
                  </div>

                  <div className="w-full text-center">
                    <span className="text-[9px] text-gray-400 block mb-1">Variant: Horizontal (Header / Logo Utama)</span>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm inline-block max-w-full overflow-hidden">
                      <NanditaLogo logoUrl={formData.logoUrl} variant="horizontal" height={50} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Director Signee details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2">
              3. Detail Direktur & Legalitas Sertifikat
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Direktur Penandatangan</label>
                <input
                  type="text"
                  required
                  value={formData.direkturNama}
                  onChange={(e) => setFormData({ ...formData, direkturNama: e.target.value })}
                  placeholder="Nandita Wahyuni, M.Par."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">NIP / NIDN Direktur</label>
                <input
                  type="text"
                  required
                  value={formData.direkturNip}
                  onChange={(e) => setFormData({ ...formData, direkturNip: e.target.value })}
                  placeholder="NIP. 19820512..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic">
              * Detail di atas akan dicantumkan secara otomatis pada modul cetak Sertifikat Kompetensi Resmi LPK.
            </p>
          </div>

          {/* Section 4: Metode Pembayaran Transfer Bank */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4" id="settings-bank-transfer-card">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <CreditCard className="w-4 h-4 mr-1.5 text-teal-700" />
              <span>4. Metode Pembayaran Transfer Bank (Informasi Rekening)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={formData.bankNama || ""}
                  onChange={(e) => setFormData({ ...formData, bankNama: e.target.value })}
                  placeholder="e.g. Bank Mandiri, BCA, BRI"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={formData.bankRekening || ""}
                  onChange={(e) => setFormData({ ...formData, bankRekening: e.target.value })}
                  placeholder="e.g. 142-00-1234567-8"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pemilik Rekening (Atas Nama)</label>
                <input
                  type="text"
                  value={formData.bankAtasNama || ""}
                  onChange={(e) => setFormData({ ...formData, bankAtasNama: e.target.value })}
                  placeholder="e.g. LPK NANDITA FLOATING HOTEL"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic">
              * Detail rekening ini akan ditampilkan pada halaman tagihan di akun Siswa sebagai tujuan transfer pembayaran resmi.
            </p>
          </div>

          {/* Section 5: Integrasi Penyimpanan Google Sheets & Google Drive */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4" id="settings-google-sheets-card">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-teal-700" />
              <span>5. Integrasi Penyimpanan Google Sheets & Google Drive</span>
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Konfigurasikan sinkronisasi otomatis dan cadangan penyimpanan cloud LPK Nandita langsung ke Google Drive dan spreadsheet Google Sheets Anda.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Spreadsheet ID Target (Default)</label>
                  <input
                    type="text"
                    value={formData.googleSpreadsheetId || ""}
                    onChange={(e) => setFormData({ ...formData, googleSpreadsheetId: e.target.value })}
                    placeholder="e.g. 1x_A_bCD-efG12345..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Biarkan kosong atau isi <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">NEW</code> untuk membuat Spreadsheet baru secara otomatis saat penyelarasan pertama.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Otomatisasi Sinkronisasi</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="autoSyncEnabled"
                      checked={!!formData.autoSyncEnabled}
                      onChange={(e) => setFormData({ ...formData, autoSyncEnabled: e.target.checked })}
                      className="w-4 h-4 text-teal-650 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="autoSyncEnabled" className="text-xs font-medium text-gray-700 cursor-pointer select-none">
                      Aktifkan Sinkronisasi Otomatis Cloud Drive
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Ketika diaktifkan, data transaksi harian dan log absensi akan diselaraskan dengan Google Cloud Drive.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-850 flex items-start space-x-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold block">💡 Petunjuk Penyimpanan Cloud:</span>
                  <p className="leading-relaxed text-[11px] text-slate-700">
                    Untuk menggunakan fitur integrasi ini, pastikan Anda juga masuk melalui lembar kerja <strong className="text-teal-900">"Integrasi Google Sheets"</strong> di menu tab utama untuk memberikan izin hak akses Google Drive yang aman.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Visual App Style Customizer */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <Palette className="w-4 h-4 mr-1 text-teal-700" />
              6. Visual & Tema Aplikasi
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Pilih Skema Warna Aplikasi (Tema Excel)</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {colorOptions.map((opt) => {
                  const isSelected = formData.warnaUtama === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, warnaUtama: opt.value })}
                      className={`p-3 rounded-lg border text-left flex flex-col justify-between h-16 transition-all ${
                        isSelected 
                          ? "border-gray-900 ring-2 ring-gray-900/50" 
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full block border border-gray-300" style={{ backgroundColor: opt.value }} />
                      <span className="text-[10px] font-bold text-gray-700 truncate block mt-1">{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 7: Kustomisasi Pesan Notifikasi WhatsApp */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1 text-teal-700" />
              7. Kustomisasi Isi Pesan Notifikasi WhatsApp
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed">
              Atur format pesan otomatis yang dikirim ke siswa atau staf melalui WhatsApp. Anda dapat menggunakan tag variabel (placeholder) dinamis seperti <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-teal-800">{`{nama_siswa}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-teal-800">{`{nominal}`}</code>, dll. yang akan otomatis diganti dengan data transaksi.
            </p>

            <div className="space-y-4">
              {/* Template 1: Bukti Pembayaran Siswa */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                <span className="block text-xs font-bold text-gray-700">A. Template WhatsApp Bukti Pembayaran Siswa</span>
                <textarea
                  rows={4}
                  value={formData.waTemplatePembayaran || ""}
                  onChange={(e) => setFormData({ ...formData, waTemplatePembayaran: e.target.value })}
                  placeholder="Ketik format template bukti pembayaran..."
                  className="w-full border border-gray-300 rounded p-2 text-xs font-mono focus:outline-none"
                />
                <div className="text-[10px] text-gray-500">
                  <strong>Variabel tersedia:</strong> <code className="bg-slate-50 px-1 rounded">{`{lembaga}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{nama_siswa}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{tanggal}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{nominal}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{keterangan}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{sisa_piutang}`}</code>
                </div>
              </div>

              {/* Template 2: Pengingat Tunggakan Siswa */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                <span className="block text-xs font-bold text-gray-700">B. Template WhatsApp Pengingat Tunggakan Siswa</span>
                <textarea
                  rows={4}
                  value={formData.waTemplateTagihanSiswa || ""}
                  onChange={(e) => setFormData({ ...formData, waTemplateTagihanSiswa: e.target.value })}
                  placeholder="Ketik format template pengingat tagihan..."
                  className="w-full border border-gray-300 rounded p-2 text-xs font-mono focus:outline-none"
                />
                <div className="text-[10px] text-gray-500">
                  <strong>Variabel tersedia:</strong> <code className="bg-slate-50 px-1 rounded">{`{lembaga}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{nama_siswa}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{total_biaya}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{terbayar}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{sisa_piutang}`}</code>
                </div>
              </div>

              {/* Template 3: Slip Gaji Staf & Instruktur */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                <span className="block text-xs font-bold text-gray-700">C. Template WhatsApp Slip Gaji Staf & Instruktur</span>
                <textarea
                  rows={4}
                  value={formData.waTemplateGaji || ""}
                  onChange={(e) => setFormData({ ...formData, waTemplateGaji: e.target.value })}
                  placeholder="Ketik format template slip gaji..."
                  className="w-full border border-gray-300 rounded p-2 text-xs font-mono focus:outline-none"
                />
                <div className="text-[10px] text-gray-500">
                  <strong>Variabel tersedia:</strong> <code className="bg-slate-50 px-1 rounded">{`{lembaga}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{nama_staf}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{peran}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{bulan}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{tanggal}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{gaji_pokok}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{tunjangan}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{lembur_bonus}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{potongan}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{take_home_pay}`}</code>
                </div>
              </div>

              {/* Template 4: Notifikasi Transfer Uang Masuk */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                <span className="block text-xs font-bold text-gray-700">D. Template WhatsApp Notifikasi Uang Masuk</span>
                <textarea
                  rows={4}
                  value={formData.waTemplateDanaMasuk || ""}
                  onChange={(e) => setFormData({ ...formData, waTemplateDanaMasuk: e.target.value })}
                  placeholder="Ketik format template uang masuk..."
                  className="w-full border border-gray-300 rounded p-2 text-xs font-mono focus:outline-none"
                />
                <div className="text-[10px] text-gray-500">
                  <strong>Variabel tersedia:</strong> <code className="bg-slate-50 px-1 rounded">{`{lembaga}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{tanggal}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{nominal}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{kategori}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{keterangan}`}</code>, <code className="bg-slate-50 px-1 rounded">{`{penerima}`}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Ekspor & Impor Semua Data (Backup & Restore) */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-1 text-teal-700" />
              8. Ekspor & Impor Semua Data (Backup & Restore)
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed">
              Fasilitas cadangan data lengkap untuk mencegah kehilangan data lokal. Anda dapat mengunduh seluruh database (pengaturan lembaga, biodata siswa aktif, absensi harian, buku sertifikat, rincian pembayaran, tunggakan, kas utama operasional, utang piutang, dan log slip payroll) ke dalam satu file tunggal <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-teal-800">.json</code>, kemudian mengimpornya kembali kapan pun dibutuhkan.
            </p>

            {backupSuccess && (
              <div className="bg-green-100 border border-green-300 text-green-800 text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 animate-pulse">
                <Check className="w-4 h-4 text-green-700" />
                <span>{backupSuccess}</span>
              </div>
            )}

            {backupError && (
              <div className="bg-red-100 border border-red-300 text-red-800 text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2">
                <span className="font-bold">⚠️ Error:</span>
                <span>{backupError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Export Panel */}
              <div className="border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center">
                    <Download className="w-3.5 h-3.5 text-teal-700 mr-1.5" />
                    Cadangkan Semua Data (Ekspor)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Unduh seluruh data LPK Nandita dan berkas konfigurasi ke file cadangan JSON lokal komputer Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center space-x-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File Cadangan (.json)</span>
                </button>
              </div>

              {/* Import Panel */}
              <div className="border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center">
                    <Upload className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                    Pulihkan Semua Data (Impor)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Unggah file cadangan JSON sebelumnya untuk memulihkan seluruh keadaan lembar kerja & pengaturan.
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={importFileInputRef}
                    onChange={handleImportData}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => importFileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah & Terapkan Cadangan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded font-semibold border border-red-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data Lembaga</span>
            </button>

            <button
              type="submit"
              className="flex items-center space-x-1 bg-teal-800 hover:bg-teal-950 text-white text-xs px-5 py-2 rounded-lg font-bold shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
