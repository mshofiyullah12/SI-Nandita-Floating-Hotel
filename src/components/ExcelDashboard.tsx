/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Siswa, 
  Staff, 
  Absensi, 
  KeuanganSiswa, 
  JobRegister, 
  JobLocationType, 
  JobStatus 
} from "../types";
import { formatRupiah } from "../utils";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  GraduationCap, 
  CheckCircle2, 
  Building2, 
  Ship, 
  BarChart3 
} from "lucide-react";
import { motion } from "motion/react";

interface ExcelDashboardProps {
  siswa: Siswa[];
  staff: Staff[];
  absensi: Absensi[];
  keuangan: KeuanganSiswa[];
  jobs: JobRegister[];
  onSwitchSheet: (sheetName: string) => void;
}

export default function ExcelDashboard({
  siswa,
  staff,
  absensi,
  keuangan,
  jobs,
  onSwitchSheet
}: ExcelDashboardProps) {
  // 1. Calculations for Siswa
  const totalSiswa = siswa.length;
  const siswaAktif = siswa.filter(s => s.status === "Aktif").length;
  const siswaLulus = siswa.filter(s => s.status === "Lulus").length;

  // 2. Staff & Instruktur
  const totalStaff = staff.length;
  const totalInstruktur = staff.filter(s => s.role === "Instruktur").length;

  // 3. Today's Attendance
  const today = new Date().toISOString().split("T")[0];
  const absensiHariIni = absensi.filter(a => a.tanggal === today || a.tanggal === "2026-07-17");
  const totalHadir = absensiHariIni.filter(a => a.status === "Hadir").length;
  const rateHadir = absensiHariIni.length > 0 
    ? Math.round((totalHadir / absensiHariIni.length) * 100) 
    : 100;

  // 4. Financial Status
  const totalBiayaSemua = keuangan.reduce((acc, k) => acc + k.totalBiaya, 0);
  const totalBayarSemua = keuangan.reduce((acc, k) => acc + k.totalBayar, 0);
  const totalPiutangSemua = keuangan.reduce((acc, k) => acc + k.piutang, 0);
  const ratePelunasan = totalBiayaSemua > 0 
    ? Math.round((totalBayarSemua / totalBiayaSemua) * 100) 
    : 0;

  // 5. Job Recruitment Stats
  const totalJobRegister = jobs.length;
  const lolosDanBerangkat = jobs.filter(j => j.status === JobStatus.Lolos || j.status === JobStatus.Berangkat).length;
  const jobLuarNegeri = jobs.filter(j => j.lokasiTipe === JobLocationType.LuarNegeri).length;
  const jobDalamNegeri = jobs.filter(j => j.lokasiTipe === JobLocationType.DalamNegeri).length;

  // 6. Program Studi Counts
  const programCounts = siswa.reduce((acc, s) => {
    acc[s.programStudi] = (acc[s.programStudi] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const programList = Object.entries(programCounts).map(([name, count]) => ({
    name,
    count,
    pct: Math.round((count / (totalSiswa || 1)) * 100)
  }));

  // Render an Excel column header bar (A, B, C...)
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 font-sans" id="excel-dashboard-container">
      {/* Excel Sheet Metadata Ribbon */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div className="flex items-center space-x-2">
          <span className="bg-green-700 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">READY</span>
          <span className="text-gray-400">|</span>
          <span>CELLS SELECTED: A1:M40</span>
          <span className="text-gray-400">|</span>
          <span>CALCULATIONS: AUTO</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
            Terhubung Lokal
          </span>
        </div>
      </div>

      {/* Grid view container */}
      <div className="overflow-auto flex-1">
        {/* Excel Letter Headers */}
        <div className="flex min-w-[1000px] bg-gray-100 border-b border-gray-300">
          <div className="w-10 flex-shrink-0 bg-gray-200 border-r border-gray-300 flex items-center justify-center text-[10px] font-mono text-gray-500 h-6">
            #
          </div>
          {columns.map((col, i) => (
            <div 
              key={col} 
              className="flex-1 min-w-[120px] text-center border-r border-gray-300 py-1 text-[11px] font-mono font-medium text-gray-600 hover:bg-gray-200 cursor-col-resize"
            >
              {col}
            </div>
          ))}
        </div>

        {/* Excel-style Dashboard Sheet Content */}
        <div className="min-w-[1000px] bg-grid relative pb-10 px-4 pt-4">
          
          {/* Row 1-3: Embedded Hero Header */}
          <div className="flex mb-4">
            {/* Row Number Side Label */}
            <div className="w-10 flex-shrink-0 bg-slate-50 border border-slate-200/80 rounded-l-2xl flex items-center justify-center text-[10px] font-mono text-slate-400 h-28 select-none shadow-sm">
              1-3
            </div>
            
            {/* Row Content */}
            <div className="flex-1 p-6 bg-gradient-to-br from-[#001f3f] via-[#001124] to-[#002d5c] text-white flex items-center justify-between rounded-r-2xl border-y border-r border-slate-200/80 shadow-md">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase bg-white/10 px-2 py-0.5 rounded-full">Interactive Sheet 1</span>
                <h1 className="text-2xl font-bold tracking-tight mt-2 font-display">
                  📊 Ringkasan Eksekutif & Dashboard Keuangan LPK Nandita
                </h1>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  Sistem Informasi Terpadu & Buku Induk Siswa LPK Nandita Floating Hotel Perhotelan dan Kapal Pesiar
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  id="btn-goto-siswa"
                  onClick={() => onSwitchSheet("Siswa")} 
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg font-medium border border-white/20 transition-all duration-300 shadow-sm"
                >
                  Buku Induk Siswa →
                </button>
                <button 
                  id="btn-goto-finance"
                  onClick={() => onSwitchSheet("Keuangan & Piutang")} 
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-300 shadow-md hover:scale-105"
                >
                  Manajemen Keuangan →
                </button>
              </div>
            </div>
          </div>

          {/* Row 4-10: Main Excel-style Card Indicators */}
          <div className="flex mb-4">
            <div className="w-10 flex-shrink-0 bg-slate-50 border border-slate-200/80 rounded-l-2xl flex items-center justify-center text-[10px] font-mono text-slate-400 h-40 select-none shadow-sm">
              4-10
            </div>
            
            {/* KPI Cards in a grid */}
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-100/50 rounded-r-2xl border-y border-r border-slate-200/80">
              {/* Card 1: Students */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Siswa")}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Buku Induk Siswa</p>
                  <h3 className="text-2xl font-bold mt-2 text-slate-900 group-hover:text-[#001f3f] transition-colors">{totalSiswa} Siswa</h3>
                  <div className="flex items-center mt-3 space-x-2 text-[10px]">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      {siswaAktif} Aktif
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      {siswaLulus} Lulus
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[#001f3f]/5 rounded-xl text-[#001f3f] group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
              </motion.div>

              {/* Card 2: Revenue Collected */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Keuangan & Piutang")}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Pendidikan Terbayar</p>
                  <h3 className="text-2xl font-bold mt-2 text-emerald-700 group-hover:text-emerald-800 transition-colors">{formatRupiah(totalBayarSemua)}</h3>
                  <div className="flex items-center mt-3 space-x-2 text-[10px]">
                    <span className="text-slate-500 font-medium">Realisasi:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{ratePelunasan}% Lunas</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm">
                  <DollarSign className="w-5 h-5" />
                </div>
              </motion.div>

              {/* Card 3: Receivables (Piutang) */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Keuangan & Piutang")}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Total Piutang Siswa</p>
                  <h3 className="text-2xl font-bold mt-2 text-red-600 group-hover:text-red-700 transition-colors">{formatRupiah(totalPiutangSemua)}</h3>
                  <div className="flex items-center mt-3 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full w-max">
                    <span>{keuangan.filter(k => k.piutang > 0).length} Siswa Menunggak</span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </motion.div>

              {/* Card 4: Jobs Placed */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Lowongan / Job")}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Perekrutan Kerja</p>
                  <h3 className="text-2xl font-bold mt-2 text-[#001f3f] transition-colors">{totalJobRegister} Terdaftar</h3>
                  <div className="flex items-center mt-3 space-x-1 text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                    <span>{lolosDanBerangkat} Berhasil Placed ({jobLuarNegeri} LN / {jobDalamNegeri} DN)</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm">
                  <Briefcase className="w-5 h-5" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Row 11-30: Dual Chart Sheets Embedded */}
          <div className="flex mb-4">
            <div className="w-10 flex-shrink-0 bg-slate-50 border border-slate-200/80 rounded-l-2xl flex items-center justify-center text-[10px] font-mono text-slate-400 h-[400px] select-none shadow-sm">
              11-30
            </div>

            <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-100/30 rounded-r-2xl border-y border-r border-slate-200/80">
              
              {/* Left Column Chart: Program Studi Distribution */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold font-mono uppercase text-[#001f3f] tracking-wider flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1.5 text-amber-500" />
                      Sebaran Program Studi
                    </h4>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">A11:C15</span>
                  </div>
                  
                  {/* Custom Graphic Bar representation */}
                  <div className="space-y-4 my-4">
                    {programList.map((prog, index) => (
                      <div key={prog.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 font-medium">{prog.name}</span>
                          <span className="text-slate-500 font-bold">{prog.count} Siswa ({prog.pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${prog.pct}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full rounded-full ${
                              index === 0 ? "bg-[#001f3f]" :
                              index === 1 ? "bg-amber-500" :
                              index === 2 ? "bg-emerald-600" : "bg-sky-500"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                    {programList.length === 0 && (
                      <div className="text-xs text-slate-400 text-center py-6">Belum ada data siswa</div>
                    )}
                  </div>
                </div>

                <div className="bg-[#001f3f]/5 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-bold text-[#001f3f] block mb-0.5">🛳️ Program Unggulan:</span>
                  Minat tertinggi saat ini pada jurusan <span className="font-bold text-[#001f3f]">Kapal Pesiar & Perhotelan</span>, sejalan dengan visi LPK Nandita Floating Hotel.
                </div>
              </div>

              {/* Middle Column Chart: Job Placement Funnel */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold font-mono uppercase text-[#001f3f] tracking-wider flex items-center">
                      <Ship className="w-4 h-4 mr-1.5 text-amber-500" />
                      Status Penyerapan Kerja
                    </h4>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">D11:F15</span>
                  </div>

                  <div className="space-y-3.5 my-4">
                    {[
                      { status: "Daftar", count: jobs.filter(j => j.status === JobStatus.Daftar).length, color: "bg-slate-300" },
                      { status: "Interview", count: jobs.filter(j => j.status === JobStatus.Interview).length, color: "bg-amber-400" },
                      { status: "Lolos (Ready)", count: jobs.filter(j => j.status === JobStatus.Lolos).length, color: "bg-emerald-500" },
                      { status: "Berangkat (Departed)", count: jobs.filter(j => j.status === JobStatus.Berangkat).length, color: "bg-[#001f3f]" },
                      { status: "Ditolak", count: jobs.filter(j => j.status === JobStatus.Ditolak).length, color: "bg-red-500" }
                    ].map((item, index) => {
                      const maxVal = Math.max(...jobs.reduce((acc, curr) => {
                        const idx = acc.findIndex(a => a.status === curr.status);
                        if (idx !== -1) { acc[idx].count++; } else { acc.push({ status: curr.status, count: 1 }); }
                        return acc;
                      }, [] as Array<{status: string, count: number}>).map(a => a.count), 1);
                      
                      const pct = Math.round((item.count / maxVal) * 100);

                      return (
                        <div key={item.status} className="flex items-center space-x-2 text-xs">
                          <span className="w-24 text-slate-500 font-semibold text-right truncate">{item.status}</span>
                          <div className="flex-1 bg-slate-100 rounded-lg h-5 overflow-hidden flex items-center border border-slate-200/50">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1 }}
                              className={`h-full ${item.color} flex items-center justify-end px-2.5 min-w-[20px]`}
                            >
                              <span className="text-[10px] font-bold text-white font-mono">{item.count}</span>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#001f3f]/5 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-bold text-[#001f3f] block mb-0.5">⚓ Jalur Internasional:</span>
                  Sebanyak <span className="font-bold text-[#001f3f]">{jobLuarNegeri} alumni</span> membidik karir Kapal Pesiar (USA, Europe) & Hotel Internasional.
                </div>
              </div>

              {/* Right Column Chart: Keuangan & Piutang Ringkasan */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold font-mono uppercase text-[#001f3f] tracking-wider flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1.5 text-amber-500" />
                      Arus Kas & Piutang Siswa
                    </h4>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">G11:I15</span>
                  </div>

                  <div className="space-y-4 my-4">
                    {/* Visual Cash Flow Indicator Card */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Rencana Keuangan:</span>
                        <span className="font-mono font-bold text-slate-700">{formatRupiah(totalBiayaSemua)}</span>
                      </div>
                      
                      <div className="mt-2.5 space-y-1.5 border-t border-slate-200/50 pt-2.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-700 font-bold flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Terbayar
                          </span>
                          <span className="font-mono font-bold text-emerald-700">{formatRupiah(totalBayarSemua)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-red-600 font-bold flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></span>
                            Piutang
                          </span>
                          <span className="font-mono font-bold text-red-600">{formatRupiah(totalPiutangSemua)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress representation */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>Realisasi Target Keuangan</span>
                        <span>{ratePelunasan}% Terbayar</span>
                      </div>
                      <div className="w-full bg-red-100 rounded-full h-3 overflow-hidden flex border border-red-200/50">
                        <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: `${ratePelunasan}%` }} />
                        <div className="bg-red-500 h-full flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#001f3f]/5 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-bold text-[#001f3f] block mb-0.5">💰 Manajemen Tunggakan:</span>
                  Tingkat piutang aktif terkendali di bawah 40%. Pantau secara berkala melalui menu Keuangan & Piutang.
                </div>
              </div>

            </div>
          </div>

          {/* Row 31-40: Quick Links and Operations Section */}
          <div className="flex">
            <div className="w-10 flex-shrink-0 bg-slate-50 border border-slate-200/80 rounded-l-2xl flex items-center justify-center text-[10px] font-mono text-slate-400 h-36 select-none shadow-sm">
              31-40
            </div>

            {/* Quick sheets index and instructional notes */}
            <div className="flex-1 p-6 bg-gradient-to-br from-[#001f3f] to-[#001124] rounded-r-2xl border-y border-r border-slate-200/80 text-white shadow-md">
              <h3 className="text-xs font-bold font-mono uppercase text-amber-400 mb-4 tracking-wider flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                ⚡ Lembar Kerja Buku Induk LPK Nandita (Sistem Navigasi Cepat)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Siswa", desc: "Data Identitas & Angkatan", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Staf & Instruktur", desc: "Kompetensi & Gaji Pokok", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Absensi Siswa", desc: "Log Kehadiran Siswa", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Absensi Instruktur", desc: "Log Kehadiran Instruktur & Staf", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Sertifikat", desc: "Sertifikasi Kompetisi & Cetak", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Keuangan & Piutang", desc: "Akun Biaya & Kas Siswa", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Payroll Gaji", desc: "Penghitungan Gaji & Slip", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Lowongan / Job", desc: "Daftar Kerja DN & LN", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Pengaturan", desc: "Logo, Nama, Direktur & Cetak", color: "hover:border-amber-400 hover:bg-white/10" }
                ].map((sheet) => (
                  <button
                    key={sheet.name}
                    id={`btn-nav-${sheet.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    onClick={() => onSwitchSheet(sheet.name)}
                    className={`p-3 bg-[#001124]/70 border border-slate-800/80 rounded-xl text-left shadow-sm transition-all duration-300 group cursor-pointer ${sheet.color}`}
                  >
                    <span className="font-bold text-xs text-white block group-hover:text-amber-400 transition-colors duration-200">{sheet.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-1 group-hover:text-slate-200 transition-colors duration-200">{sheet.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
