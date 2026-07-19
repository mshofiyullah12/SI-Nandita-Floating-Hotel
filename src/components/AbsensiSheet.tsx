/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Absensi, AbsensiStatus, Siswa, Staff, SchoolSettings } from "../types";
import { Search, Plus, Trash2, Calendar, Check, AlertCircle, Printer, FileSpreadsheet, List, FileText } from "lucide-react";
import NanditaLogo from "./NanditaLogo";

// Helper function to calculate teaching hours based on start time and end time
const calculateTeachingHours = (jamMasuk?: string, jamSelesai?: string): number => {
  if (!jamMasuk || !jamSelesai) return 0;
  const [h1, m1] = jamMasuk.split(":").map(Number);
  const [h2, m2] = jamSelesai.split(":").map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  if (minutes2 <= minutes1) return 0;
  
  const diffMinutes = minutes2 - minutes1;
  return Math.round((diffMinutes / 60) * 10) / 10; // Round to 1 decimal place, e.g. 4.5
};

interface AbsensiSheetProps {
  absensi: Absensi[];
  siswa: Siswa[];
  staff: Staff[];
  onAddAbsensi: (newAbsensi: Absensi) => void;
  onUpdateAbsensi: (updatedAbsensi: Absensi) => void;
  onDeleteAbsensi: (id: string) => void;
  onBulkGenerateAbsensi: (date: string, category: "Siswa" | "Staf/Instruktur") => void;
  viewMode: "Siswa" | "Instruktur";
  schoolSettings?: SchoolSettings;
}

export default function AbsensiSheet({
  absensi,
  siswa,
  staff,
  onAddAbsensi,
  onUpdateAbsensi,
  onDeleteAbsensi,
  onBulkGenerateAbsensi,
  viewMode,
  schoolSettings
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

  // Mode: "harian" (Daily Attendance) or "rekap" (Attendance Recap)
  const [activeSubTab, setActiveSubTab] = useState<"harian" | "rekap">("harian");

  // Recap states
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [recapCategory, setRecapCategory] = useState<"Semua" | "Siswa" | "Staf" | "Instruktur">(
    viewMode === "Siswa" ? "Siswa" : "Semua"
  );
  const [recapSearchTerm, setRecapSearchTerm] = useState("");

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);

  const monthStr = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
  const prefix = `${selectedYear}-${monthStr}`;

  // Filter logs for this month/year
  const monthlyLogs = absensi.filter(a => a.tanggal.startsWith(prefix));

  // Get unique targetIds from absensi that match the period
  const loggedIds = new Set(monthlyLogs.map(a => a.targetId));

  let filteredPersonnel: any[] = [];

  if (recapCategory === "Siswa" || recapCategory === "Semua") {
    siswa.forEach(s => {
      const hasLogs = loggedIds.has(s.id);
      if (s.status === "Aktif" || hasLogs) {
        filteredPersonnel.push({
          id: s.id,
          nama: s.nama,
          identity: s.nis,
          kategori: "Siswa",
          subcat: s.programStudi
        });
      }
    });
  }

  if (recapCategory === "Staf" || recapCategory === "Instruktur" || recapCategory === "Semua") {
    staff.forEach(st => {
      const isInstructor = st.role === "Instruktur";
      const isStaff = st.role === "Staf" || st.role === "Manajemen";

      const matchesCat = 
        recapCategory === "Semua" ||
        (recapCategory === "Staf" && isStaff) ||
        (recapCategory === "Instruktur" && isInstructor);

      if (matchesCat) {
        const hasLogs = loggedIds.has(st.id);
        if (st.status === "Aktif" || hasLogs) {
          filteredPersonnel.push({
            id: st.id,
            nama: st.nama,
            identity: st.nip,
            kategori: isInstructor ? "Instruktur" : "Staf",
            subcat: st.spesialisasi || st.role
          });
        }
      }
    });
  }

  // Filter by search term
  if (recapSearchTerm) {
    filteredPersonnel = filteredPersonnel.filter(p => 
      p.nama.toLowerCase().includes(recapSearchTerm.toLowerCase()) ||
      p.identity.toLowerCase().includes(recapSearchTerm.toLowerCase())
    );
  }

  // Calculate statistics for each personnel
  const recapData = filteredPersonnel.map(p => {
    const personLogs = monthlyLogs.filter(l => l.targetId === p.id);
    
    const hadir = personLogs.filter(l => l.status === AbsensiStatus.Hadir).length;
    const sakit = personLogs.filter(l => l.status === AbsensiStatus.Sakit).length;
    const izin = personLogs.filter(l => l.status === AbsensiStatus.Izin).length;
    const alpa = personLogs.filter(l => l.status === AbsensiStatus.Alpa).length;
    const total = hadir + sakit + izin + alpa;
    const persen = total > 0 ? Math.round((hadir / total) * 100) : 0;

    // Calculate total teaching hours (only for instructors)
    let totalJamMengajar = 0;
    personLogs.forEach(l => {
      if (l.status === AbsensiStatus.Hadir) {
        totalJamMengajar += calculateTeachingHours(l.jamMasuk, l.jamSelesai);
      }
    });

    return {
      ...p,
      hadir,
      sakit,
      izin,
      alpa,
      total,
      persen,
      totalJamMengajar
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const isInstructorCategory = recapCategory === "Instruktur" || recapCategory === "Semua";
    const totalCols = isInstructorCategory ? 11 : 10;

    // Construct HTML content for Excel
    const rowsHtml = recapData.map((row, index) => {
      const rowStyle = row.persen >= 80 ? 'background-color: #f0fdf4;' : 'background-color: #fef2f2;';
      const hoursCell = isInstructorCategory 
        ? `<td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #b91c1c;">${row.kategori === "Instruktur" ? row.totalJamMengajar + ' Jam' : '-'}</td>`
        : '';
      return `
        <tr>
          <td style="border: 1px solid #cbd5e1; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold;">${row.nama}</td>
          <td style="border: 1px solid #cbd5e1;">${row.identity}</td>
          <td style="border: 1px solid #cbd5e1;">${row.subcat}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center; color: #16a34a; font-weight: bold;">${row.hadir}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center; color: #d97706;">${row.sakit}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center; color: #2563eb;">${row.izin}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center; color: #dc2626; font-weight: bold;">${row.alpa}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${row.total}</td>
          ${hoursCell}
          <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; ${rowStyle}">${row.persen}%</td>
        </tr>
      `;
    }).join("");

    const dateString = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const excelAlignment = schoolSettings?.kopSuratPosisi === "Kanan" 
      ? "right" 
      : schoolSettings?.kopSuratPosisi === "Kiri" 
      ? "left" 
      : "center";

    const html = `
      <html xmlns:o="urn:schemas-microsoft-error:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          th { background-color: #0f766e; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; padding: 6px; }
          td { border: 1px solid #cbd5e1; padding: 6px; }
          .title { font-size: 16px; font-weight: bold; text-align: center; color: #0f766e; }
          .subtitle { font-size: 11px; text-align: center; color: #475569; margin-bottom: 10px; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <!-- Kop Surat Excel -->
          <tr>
            <td colspan="${totalCols}" style="text-align: ${excelAlignment}; font-size: 16px; font-weight: bold; color: #0f766e; font-family: 'Georgia', serif; border: none;">
              ${schoolSettings?.namaLembaga?.toUpperCase() || "LPK NANDITA FLOATING HOTEL"}
            </td>
          </tr>
          <tr>
            <td colspan="${totalCols}" style="text-align: ${excelAlignment}; font-size: 10px; font-weight: bold; color: #b45309; text-transform: uppercase; border: none;">
              ${schoolSettings?.tagline || "PUSAT PENDIDIKAN & PELATIHAN PERHOTELAN DAN KAPAL PESIAR"}
            </td>
          </tr>
          <tr>
            <td colspan="${totalCols}" style="text-align: ${excelAlignment}; font-size: 9px; color: #4b5563; border: none;">
              ${schoolSettings?.alamat || "Jl. Raya Floating Hotel No. 88, Indonesia"}
            </td>
          </tr>
          <tr>
            <td colspan="${totalCols}" style="text-align: ${excelAlignment}; font-size: 8px; color: #6b7280; border: none;">
              Telp: ${schoolSettings?.noTelepon || "-"} | Email: ${schoolSettings?.email || "-"} | Website: ${schoolSettings?.website || "-"}
            </td>
          </tr>
          <tr>
            <td colspan="${totalCols}" style="text-align: ${excelAlignment}; font-size: 9px; color: #0f766e; font-weight: bold; border: none; padding-bottom: 8px;">
              No. Izin LPK: ${schoolSettings?.nomorIzin || "KEP. 421.9/3024/436.7.15/2026"} | Akreditasi: ${schoolSettings?.akreditasi || "Terakreditasi A - LA-LPK"}
            </td>
          </tr>
          <!-- Double border divider for excel -->
          <tr>
            <td colspan="${totalCols}" style="height: 4px; padding: 0; background-color: #0f766e; border: none;"></td>
          </tr>
          <tr><td colspan="${totalCols}" style="height: 15px; border: none;"></td></tr>
          
          <!-- Document Title inside Excel -->
          <tr>
            <td colspan="${totalCols}" class="title" style="text-align: center; font-size: 14px; font-weight: bold; color: #1e293b; border: none;">
              LAPORAN REKAPITULASI PRESENSI & KEHADIRAN
            </td>
          </tr>
          <tr>
            <td colspan="${totalCols}" class="subtitle" style="text-align: center; font-size: 10px; color: #64748b; border: none; padding-bottom: 12px;">
              Periode Bulan: ${months[selectedMonth - 1]} ${selectedYear} | Kategori: ${recapCategory}
            </td>
          </tr>
          <tr><td colspan="${totalCols}" style="height: 8px; border: none;"></td></tr>
          <thead>
            <tr>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold;">No</th>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold;">Nama Lengkap</th>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold;">NIS / NIP</th>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold;">Kategori / Prodi</th>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">Hadir (H)</th>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">Sakit (S)</th>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">Izin (I)</th>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">Alpa (A)</th>
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">Total Pertemuan</th>
              ${isInstructorCategory ? '<th style="background-color: #be123c; color: white; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">Total Jam Mengajar</th>' : ''}
              <th style="background-color: #0f766e; color: white; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">% Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tr><td colspan="${totalCols}"></td></tr>
          <tr><td colspan="${totalCols}"></td></tr>
          <tr>
            <td colspan="4" style="font-size: 11px; color: #64748b;">
              Dibuat oleh,<br/>
              <b>Staf Administrasi LPK</b><br/><br/><br/><br/>
              _______________________<br/>
              Petugas Absensi
            </td>
            <td colspan="${isInstructorCategory ? 3 : 2}"></td>
            <td colspan="4" style="font-size: 11px; text-align: right;">
              Surabaya, ${dateString}<br/>
              <b>Mengetahui,</b><br/>
              <span style="color: #0f766e; font-weight: bold;">Direktur LPK Nandita Floating Hotel</span><br/><br/><br/><br/>
              <u><b>${schoolSettings?.direkturNama || "Dra. H. Nandita, M.M."}</b></u><br/>
              NIP: ${schoolSettings?.direkturNip || "19720815 199803 2 001"}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Absensi_${recapCategory}_${months[selectedMonth - 1]}_${selectedYear}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderRecapView = () => {
    return (
      <div className="flex flex-col h-full bg-white text-gray-800 overflow-auto" id="recap-view-container">
        {/* Printable area style injection */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-recap-area, #print-recap-area * {
              visibility: visible;
            }
            #print-recap-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              color: black;
              padding: 0px;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Excel Recap Control Ribbon */}
        <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between shadow-sm no-print">
          <div className="flex flex-wrap items-center gap-2">
            {/* Month select */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 font-bold font-mono">BULAN:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year select */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 font-bold font-mono">TAHUN:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Category selection */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 font-bold font-mono">KATEGORI:</span>
              <select
                value={recapCategory}
                onChange={(e) => setRecapCategory(e.target.value as any)}
                className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
              >
                {viewMode === "Siswa" ? (
                  <option value="Siswa">Siswa (Buku Induk)</option>
                ) : (
                  <>
                    <option value="Semua">Semua (Staf & Instruktur)</option>
                    <option value="Staf">Staf Operasional</option>
                    <option value="Instruktur">Instruktur / Pengajar</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama..."
                value={recapSearchTerm}
                onChange={(e) => setRecapSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-40 focus:outline-none bg-white"
              />
            </div>

            {/* Print Action */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-3 py-1.5 rounded transition shadow-sm cursor-pointer"
              title="Cetak format laporan resmi mengetahui direktur LPK"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>

            {/* Export Excel Action */}
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded transition shadow-sm cursor-pointer"
              title="Ekspor ke berkas Microsoft Excel (.xls)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>

        {/* Formula Bar simulation for Recap */}
        <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-500 no-print">
          <div className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-gray-700">
            FX_RECAP
          </div>
          <div className="text-gray-400 font-bold">fx</div>
          <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate">
            =SUM_ATTENDANCE(MONTH: "{months[selectedMonth - 1]}", YEAR: {selectedYear}, CATEGORY: "{recapCategory}", TOTAL_ROWS: {recapData.length})
          </div>
        </div>

        {/* Printable Report Wrapper */}
        <div className="flex-grow p-6 bg-slate-50/50" id="print-area-container">
          <div 
            id="print-recap-area" 
            className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-xl p-8 shadow-sm print:border-0 print:shadow-none print:p-0"
          >
            {/* Official Report Header (Kop Surat LPK) */}
            <div 
              className={`flex pb-4 mb-6 border-b-4 border-double border-teal-800 ${
                schoolSettings?.kopSuratPosisi === "Tengah"
                  ? "flex-col items-center space-y-3"
                  : schoolSettings?.kopSuratPosisi === "Kanan"
                  ? "flex-row-reverse space-x-6 space-x-reverse items-center"
                  : "flex-row items-center space-x-6"
              }`}
              id="recap-kop-surat"
            >
              <div className="flex-shrink-0">
                <NanditaLogo logoUrl={schoolSettings?.logoUrl} variant="icon" height={76} />
              </div>
              <div className={`flex-grow ${
                schoolSettings?.kopSuratPosisi === "Tengah" || schoolSettings?.kopSuratPosisi === "LogoKiri_TeksTengah"
                  ? "text-center flex flex-col items-center"
                  : schoolSettings?.kopSuratPosisi === "Kanan"
                  ? "text-right flex flex-col items-end"
                  : "text-left"
              }`}>
                <h1 className="text-xl font-bold text-teal-900 tracking-tight leading-none uppercase">
                  {schoolSettings?.namaLembaga || "LPK NANDITA FLOATING HOTEL"}
                </h1>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mt-1.5 italic">
                  {schoolSettings?.tagline || "Floating Hotel School, Perhotelan & Kapal Pesiar"}
                </p>
                <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">
                  {schoolSettings?.alamat || "Jl. Raya Floating Hotel No. 88, Kawasan Pendidikan Maritim"}
                </p>
                <div className={`text-[9px] text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 ${
                  schoolSettings?.kopSuratPosisi === "Tengah" || schoolSettings?.kopSuratPosisi === "LogoKiri_TeksTengah"
                    ? "justify-center"
                    : schoolSettings?.kopSuratPosisi === "Kanan"
                    ? "justify-end"
                    : "justify-start"
                }`}>
                  <span><strong>Telp:</strong> {schoolSettings?.noTelepon || "-"}</span>
                  <span><strong>Email:</strong> {schoolSettings?.email || "-"}</span>
                  <span><strong>Website:</strong> {schoolSettings?.website || "-"}</span>
                </div>
                <div className={`text-[9px] text-teal-800 font-bold mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 ${
                  schoolSettings?.kopSuratPosisi === "Tengah" || schoolSettings?.kopSuratPosisi === "LogoKiri_TeksTengah"
                    ? "justify-center"
                    : schoolSettings?.kopSuratPosisi === "Kanan"
                    ? "justify-end"
                    : "justify-start"
                }`}>
                  <span><strong>No. Izin LPK:</strong> {schoolSettings?.nomorIzin || "KEP. 421.9/3024/436.7.15/2026"}</span>
                  <span>|</span>
                  <span><strong>Akreditasi:</strong> {schoolSettings?.akreditasi || "Terakreditasi A (Sangat Baik) - LA-LPK"}</span>
                </div>
              </div>
              <div className={`text-right flex-shrink-0 print:hidden ${schoolSettings?.kopSuratPosisi === "Tengah" ? "mt-2" : ""}`}>
                <span className="text-[10px] font-mono font-bold bg-teal-50 border border-teal-200 text-teal-800 px-2.5 py-1 rounded-full">
                  REKAP PRESENSI
                </span>
                <p className="text-[9px] font-mono text-gray-400 mt-1.5">
                  ID: ABS-REP-{selectedYear}{monthStr}
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
                LAPORAN REKAPITULASI KEHADIRAN & ABSENSI
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Periode Bulan: <strong className="text-gray-700">{months[selectedMonth - 1]} {selectedYear}</strong> | Kategori: <strong className="text-gray-700">{recapCategory}</strong>
              </p>
            </div>

            {/* Main Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-teal-800 text-white font-mono text-[10px] uppercase">
                    <th className="border border-teal-900 px-2 py-2 text-center w-8">No</th>
                    <th className="border border-teal-900 px-3 py-2">Nama Lengkap</th>
                    <th className="border border-teal-900 px-3 py-2 w-28">NIP / NIS</th>
                    <th className="border border-teal-900 px-3 py-2 w-32">Kategori / Prodi</th>
                    <th className="border border-teal-900 px-2 py-2 text-center w-14 text-emerald-100">Hadir</th>
                    <th className="border border-teal-900 px-2 py-2 text-center w-14 text-amber-100">Sakit</th>
                    <th className="border border-teal-900 px-2 py-2 text-center w-14 text-blue-100">Izin</th>
                    <th className="border border-teal-900 px-2 py-2 text-center w-14 text-red-100">Alpa</th>
                    <th className="border border-teal-900 px-2 py-2 text-center w-16">Total</th>
                    {(recapCategory === "Instruktur" || recapCategory === "Semua") && (
                      <th className="border border-teal-900 px-2 py-2 text-center w-24 text-rose-100">Total Jam</th>
                    )}
                    <th className="border border-teal-900 px-2 py-2 text-center w-16">% Hadir</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[11px] divide-y divide-gray-200">
                  {recapData.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition">
                      <td className="border border-gray-300 px-2 py-2 text-center text-gray-400 font-mono">{idx + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 font-sans font-bold text-gray-900">{row.nama}</td>
                      <td className="border border-gray-300 px-3 py-2 text-gray-600">{row.identity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-gray-500 font-sans">{row.subcat}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center font-bold text-green-700">{row.hadir}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center text-amber-600">{row.sakit}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center text-blue-600">{row.izin}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center font-bold text-red-600">{row.alpa}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">{row.total}</td>
                      {(recapCategory === "Instruktur" || recapCategory === "Semua") && (
                        <td className="border border-gray-300 px-2 py-2 text-center font-bold text-rose-700 bg-rose-50/20">
                          {row.kategori === "Instruktur" ? `${row.totalJamMengajar} Jam` : "-"}
                        </td>
                      )}
                      <td className={`border border-gray-300 px-2 py-2 text-center font-bold ${
                        row.persen >= 80 ? 'text-green-700 bg-green-50/50' : 'text-red-600 bg-red-50/50'
                      }`}>{row.persen}%</td>
                    </tr>
                  ))}
                  {recapData.length === 0 && (
                    <tr>
                      <td colSpan={recapCategory === "Instruktur" || recapCategory === "Semua" ? 11 : 10} className="border border-gray-300 px-4 py-8 text-center text-gray-400 bg-gray-50 italic">
                        Tidak ada data kehadiran yang tercatat untuk kriteria di atas pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signature Section */}
            <div className="mt-12 flex justify-between text-xs font-sans px-4">
              <div>
                <p className="text-gray-500">Dibuat oleh,</p>
                <p className="font-bold text-gray-800 mt-1">Staf Administrasi LPK</p>
                <div className="h-20"></div>
                <div className="border-b border-gray-400 w-44"></div>
                <p className="text-gray-400 text-[10px] mt-1">Petugas Absensi</p>
              </div>
              
              <div className="text-right">
                <p className="text-gray-500">
                  Surabaya, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="font-bold text-gray-800 mt-1">Mengetahui,</p>
                <p className="font-bold text-teal-900">Direktur LPK Nandita Floating Hotel</p>
                
                <div className="h-20 flex items-center justify-end">
                  <div className="border border-dashed border-teal-600/35 text-teal-600/40 text-[9px] rounded-md px-3 py-1 font-mono uppercase rotate-1 tracking-wider scale-95 select-none print:opacity-40">
                    LPK NANDITA FLOATING HOTEL
                  </div>
                </div>
                
                <p className="font-bold text-gray-900 underline text-sm">
                  {schoolSettings?.direkturNama || "Dra. H. Nandita, M.M."}
                </p>
                <p className="text-gray-500 text-[10px] mt-0.5">
                  NIP. {schoolSettings?.direkturNip || "19720815 199803 2 001"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="absensi-sheet-container">
      {/* Sub Tab Switcher */}
      <div className="bg-slate-100 border-b border-gray-200 px-4 py-1.5 flex items-center justify-between no-print">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveSubTab("harian")}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded font-medium transition cursor-pointer ${
              activeSubTab === "harian"
                ? "bg-white border border-gray-200 text-teal-800 shadow-sm"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <List className="w-3.5 h-3.5 text-teal-700" />
            <span>Presensi Harian</span>
          </button>
          <button
            onClick={() => setActiveSubTab("rekap")}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded font-medium transition cursor-pointer ${
              activeSubTab === "rekap"
                ? "bg-white border border-gray-200 text-teal-800 shadow-sm"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>Rekapitulasi Absensi (Buku Bulanan)</span>
          </button>
        </div>
        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
          {viewMode === "Siswa" ? "Absensi Siswa" : "Absensi Instruktur & Staf"}
        </div>
      </div>

      {activeSubTab === "rekap" ? renderRecapView() : (
        <>
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
        <table className={`w-full text-left border-collapse ${viewMode === "Instruktur" ? "min-w-[1200px]" : "min-w-[900px]"}`}>
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
                  <th className="px-3 py-1 border-r border-gray-300 w-32 text-center text-rose-700 font-bold bg-rose-50/30">Jam Mengajar (I)</th>
                </>
              )}
              <th className="px-3 py-1 border-r border-gray-300">Keterangan / Alasan ({viewMode === "Instruktur" ? "J" : "G"})</th>
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
                      <td className="px-3 py-2 border-r border-gray-300 text-center text-rose-700 font-bold bg-rose-50/10">
                        {record.kategori === "Instruktur" && record.status === AbsensiStatus.Hadir
                          ? `${calculateTeachingHours(record.jamMasuk, record.jamSelesai)} Jam`
                          : "-"
                        }
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
                <td colSpan={viewMode === "Instruktur" ? 12 : 9} className="text-center py-10 text-gray-400 bg-gray-50">
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
    </>
  )}

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
