/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sertifikat, Siswa } from "../types";
import { Plus, Trash2, Printer, Search, Award, CheckCircle, ShieldCheck } from "lucide-react";

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
      {activePrintCert && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4 overflow-y-auto" id="certificate-print-overlay">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-1 border-8 border-amber-800/20 my-10 relative">
            
            {/* Header controls inside modal (non-printable) */}
            <div className="bg-gray-100 px-6 py-3 rounded-t flex items-center justify-between border-b border-gray-200 print:hidden">
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dokumen Resmi Terverifikasi LPK Nandita Floating Hotel</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTriggerPrint}
                  className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1.5 rounded font-bold shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setActivePrintCert(null)}
                  className="text-gray-500 hover:text-gray-800 text-xs px-2.5 py-1.5 rounded hover:bg-gray-200"
                >
                  Tutup [X]
                </button>
              </div>
            </div>

            {/* Certificate Template Body */}
            <div className="p-12 relative bg-neutral-50 border-4 border-amber-600 m-2 shadow-inner overflow-hidden text-center min-h-[550px] flex flex-col justify-between" id="printable-certificate">
              
              {/* Background watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Award className="w-96 h-96 text-amber-800" />
              </div>

              {/* Borders */}
              <div className="border border-amber-600 p-8 flex flex-col justify-between flex-grow">
                {/* Header Section */}
                <div className="space-y-2">
                  <div className="flex justify-center mb-2">
                    {/* SVG logo representation */}
                    <div className="w-16 h-16 bg-teal-900 text-white rounded-full flex items-center justify-center border-4 border-amber-500">
                      <span className="font-bold text-[10px] tracking-tight text-center leading-none">LPK<br/>NANDITA</span>
                    </div>
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-teal-950 uppercase tracking-wide">
                    {schoolSettings.namaLembaga}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">
                    Pusat Pelatihan Kapal Pesiar dan Perhotelan Internasional
                  </p>
                  <p className="text-[10px] text-gray-500 font-sans italic font-medium">
                    Izin Lembaga Kementerian Tenaga Kerja No. KEP. 881/LPK/2026
                  </p>
                  <div className="w-32 h-0.5 bg-amber-600 mx-auto my-4"></div>
                </div>

                {/* Main Content */}
                <div className="my-6 space-y-3">
                  <h1 className="text-2xl md:text-3xl font-serif text-amber-800 font-semibold tracking-wide">
                    SERTIFIKAT KOMPETENSI
                  </h1>
                  <p className="text-xs text-gray-500 italic uppercase tracking-wider font-semibold">
                    Certificate of Competency
                  </p>
                  <p className="text-[10px] font-mono text-gray-600 mt-1">
                    Nomor Seri: <span className="font-bold text-gray-900">{activePrintCert.nomorSertifikat}</span>
                  </p>

                  <div className="pt-4">
                    <p className="text-xs text-gray-500 italic">Diberikan Kepada / Awarded To:</p>
                    <h3 className="text-xl font-bold text-teal-950 font-serif border-b border-gray-300 w-3/4 mx-auto pb-1 mt-2">
                      {activePrintCert.siswaNama}
                    </h3>
                  </div>

                  <div className="pt-4 max-w-xl mx-auto space-y-1">
                    <p className="text-xs text-gray-600 font-sans">
                      Atas pencapaian dan kelulusannya dalam mengikuti pelatihan intensif serta evaluasi uji kompetensi profesional:
                    </p>
                    <h4 className="text-base font-bold text-amber-800 uppercase font-sans">
                      "{activePrintCert.namaKompetensi}"
                    </h4>
                    <p className="text-xs text-gray-500">
                      Dengan Kategori Predikat Kelulusan: <span className="font-bold text-green-700 font-serif">"{activePrintCert.nilai}"</span>
                    </p>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="grid grid-cols-2 gap-10 mt-6 pt-6">
                  {/* Left validation stamp */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="border border-dashed border-emerald-600 rounded p-2 text-left bg-emerald-50/50 max-w-[200px]">
                      <span className="text-[9px] font-mono block text-emerald-800 font-bold uppercase">✓ VALID DOKUMEN</span>
                      <span className="text-[8px] font-mono block text-gray-500 mt-0.5">Diterbitkan oleh LPK Nandita Floating Hotel secara resmi.</span>
                    </div>
                  </div>

                  {/* Right Director Sign */}
                  <div className="flex flex-col items-center justify-end text-center">
                    <p className="text-[10px] text-gray-500">Direktur LPK Nandita,</p>
                    
                    {/* Handwritten signature visual */}
                    <div className="h-12 flex items-center justify-center relative my-1">
                      <span className="font-serif italic text-amber-700/80 text-xl font-bold transform -rotate-3 select-none">
                        Nandita Wahyuni
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-gray-800 border-t border-gray-300 pt-1 w-48">
                      {schoolSettings.direkturNama}
                    </p>
                    <p className="text-[9px] font-mono text-gray-500">{schoolSettings.direkturNip}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Non-printable print instruction */}
            <div className="bg-gray-50 px-6 py-3 rounded-b text-center text-xs text-gray-500 border-t border-gray-200 print:hidden">
              Tip: Atur orientasi halaman pencetakan ke **Landscape** dan matikan header/footer browser untuk hasil cetak yang rapi.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
