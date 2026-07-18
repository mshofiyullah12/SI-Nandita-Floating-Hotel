/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SchoolSettings } from "../types";
import { Save, RefreshCw, HelpCircle, Check, Palette } from "lucide-react";

interface SettingsSheetProps {
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  onResetToDefault: () => void;
}

export default function SettingsSheet({
  settings,
  onUpdateSettings,
  onResetToDefault
}: SettingsSheetProps) {
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

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
            </div>
          </div>

          {/* Section 2: Director Signee details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2">
              2. Detail Direktur & Legalitas Sertifikat
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

          {/* Section 3: Visual App Style Customizer */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <Palette className="w-4 h-4 mr-1 text-teal-700" />
              3. Visual & Tema Aplikasi
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
