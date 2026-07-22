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
  JobStatus,
  PembayaranLog,
  PendapatanLain,
  PengeluaranKas,
  Payroll,
  UtangPegawai
} from "../types";
import { formatRupiah } from "../utils";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Briefcase, 
  DollarSign, 
  GraduationCap, 
  CheckCircle2, 
  Building2, 
  Ship, 
  BarChart3,
  FileSpreadsheet,
  Download,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  UserPlus
} from "lucide-react";
import { motion } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface ExcelDashboardProps {
  siswa: Siswa[];
  staff: Staff[];
  absensi: Absensi[];
  keuangan: KeuanganSiswa[];
  jobs: JobRegister[];
  pembayaranLog?: PembayaranLog[];
  pendapatanLain?: PendapatanLain[];
  pengeluaranKas?: PengeluaranKas[];
  payroll?: Payroll[];
  utangPegawai?: UtangPegawai[];
  onSwitchSheet: (sheetName: string) => void;
  onExportExcel?: () => void;
  onAddUserClick?: () => void;
  currentUserRole?: string;
}

export default function ExcelDashboard({
  siswa,
  staff,
  absensi,
  keuangan,
  jobs,
  pembayaranLog = [],
  pendapatanLain = [],
  pengeluaranKas = [],
  payroll = [],
  utangPegawai = [],
  onSwitchSheet,
  onExportExcel,
  onAddUserClick,
  currentUserRole
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

  // 4b. Cash Book Summary (Saldo Kas Akhir, Total Pemasukan, Total Pengeluaran, Saldo/Defisit)
  const inflowSpp = pembayaranLog.reduce((acc, p) => acc + p.jumlahBayar, 0);
  const inflowLain = pendapatanLain.reduce((acc, p) => acc + p.jumlah, 0);
  const inflowUtang = utangPegawai.reduce((acc, u) => {
    const cicilan = (u.riwayatCicilan || []).reduce((sum, c) => sum + c.jumlah, 0);
    return acc + cicilan;
  }, 0);
  const totalPemasukan = inflowSpp + inflowLain + inflowUtang;

  const outflowOperasional = pengeluaranKas.reduce((acc, e) => acc + e.jumlah, 0);
  const outflowGaji = payroll
    .filter((p) => p.statusGaji === "Dibayar")
    .reduce((acc, p) => acc + p.totalGaji, 0);
  const outflowKasbon = utangPegawai.reduce((acc, u) => acc + u.jumlahPinjam, 0);
  const totalPengeluaran = outflowOperasional + outflowGaji + outflowKasbon;

  const saldoKasAkhir = totalPemasukan - totalPengeluaran;

  // 4c. Pendapatan Penempatan Kerja (External Students Placement)
  const externalJobs = jobs.filter(j => j.isExternal);
  const totalRencanaPenempatan = externalJobs.reduce((acc, j) => acc + (j.biayaPemberangkatan || 0), 0);
  const totalBayarPenempatan = externalJobs.reduce((acc, j) => acc + (j.totalBayarExternal || 0), 0);
  const totalPiutangPenempatan = Math.max(totalRencanaPenempatan - totalBayarPenempatan, 0);

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

  // 5b. Monthly Job Placements Trend (Lolos vs Berangkat)
  const getMonthIndex = (dateStr: string) => {
    if (!dateStr) return -1;
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      const m = parseInt(parts[1], 10);
      if (m >= 1 && m <= 12) return m - 1;
    }
    return -1;
  };

  const monthsIndo = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const placementTrendData = monthsIndo.map((monthName, idx) => {
    const monthJobs = jobs.filter(j => {
      const mIdx = getMonthIndex(j.tanggalDaftar);
      return mIdx === idx;
    });
    const lolosCount = monthJobs.filter(j => j.status === JobStatus.Lolos).length;
    const berangkatCount = monthJobs.filter(j => j.status === JobStatus.Berangkat).length;
    return {
      name: monthName.substring(0, 3), // short name for x-axis layout
      Lolos: lolosCount,
      Berangkat: berangkatCount
    };
  }).filter((_, idx) => idx <= 7); // Show Jan - Agt of the active year

  return (
    <div className="flex flex-col h-full bg-slate-50 text-gray-800 font-sans" id="excel-dashboard-container">
      {/* Top Banner Ribbon */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between text-xs text-slate-500 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">AKTIF</span>
          <span className="text-slate-300">|</span>
          <span className="font-medium text-slate-600">Sistem Informasi Terpadu LPK Nandita</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Terhubung Lokal
          </span>
        </div>
      </div>

      {/* Dynamic Dashboard View */}
      <div className="overflow-auto flex-1 bg-slate-50/50">
        <div className="max-w-7xl mx-auto pb-10 px-6 pt-6 space-y-6">
          
          {/* Row 1-3: Embedded Hero Header */}
          <div className="mb-4">
            {/* Row Content */}
            <div className="p-6 bg-gradient-to-br from-[#001f3f] via-[#001124] to-[#002d5c] text-white flex flex-col lg:flex-row items-start lg:items-center justify-between rounded-2xl border border-slate-200/80 shadow-md gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase bg-white/10 px-2.5 py-1 rounded-full">Sistem Terpadu</span>
                <h1 className="text-2xl font-bold tracking-tight mt-2 font-display">
                  📊 Ringkasan Eksekutif & Dashboard Keuangan LPK Nandita
                </h1>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  Sistem Informasi Terpadu & Buku Induk Siswa LPK Nandita Floating Hotel Perhotelan dan Kapal Pesiar
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button 
                  id="btn-goto-siswa"
                  onClick={() => onSwitchSheet("Siswa")} 
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl font-medium border border-white/20 transition-all duration-300 shadow-sm"
                >
                  Buku Induk Siswa →
                </button>
                <button 
                  id="btn-goto-laporan"
                  onClick={() => onSwitchSheet("Laporan Keuangan")} 
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-all duration-300 shadow-md hover:scale-105 flex items-center space-x-1.5"
                >
                  <BarChart3 className="w-4 h-4 text-teal-200" />
                  <span>Laporan Keuangan →</span>
                </button>
                <button 
                  id="btn-goto-kas"
                  onClick={() => onSwitchSheet("Kas Operasional")} 
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-all duration-300 shadow-md hover:scale-105 flex items-center space-x-1.5"
                >
                  <TrendingUp className="w-4 h-4 text-rose-200" />
                  <span>Pendapatan & Pengeluaran →</span>
                </button>
                <button 
                  id="btn-goto-finance"
                  onClick={() => onSwitchSheet("Keuangan & Tunggakan Siswa")} 
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs px-3.5 py-2 rounded-xl font-bold transition-all duration-300 shadow-md hover:scale-105"
                >
                  Manajemen Keuangan →
                </button>
                {onAddUserClick && currentUserRole === "Admin" && (
                  <button 
                    id="btn-add-user-dash"
                    onClick={onAddUserClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold border border-indigo-500/30 transition-all duration-300 shadow-md hover:scale-105 flex items-center space-x-1.5"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-200" />
                    <span>Tambah Pengguna</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 4-8: Executive Financial Dashboard (Saldo Kas Akhir, Pemasukan, Pengeluaran, Saldo/Defisit) */}
          <div className="mb-6">
            <div className="p-5 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 pb-3">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-[#001f3f]" />
                  <h2 className="text-xs font-bold font-mono uppercase text-[#001f3f] tracking-wider">
                    Ringkasan Eksekutif & Arus Kas Utama LPK Nandita
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Saldo Kas Akhir */}
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  saldoKasAkhir >= 0 
                    ? "bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-50" 
                    : "bg-rose-50/70 border-rose-200/80 hover:bg-rose-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      Saldo Kas Akhir
                    </span>
                    <Wallet className={`w-4 h-4 ${saldoKasAkhir >= 0 ? "text-emerald-600" : "text-rose-600"}`} />
                  </div>
                  <h3 className={`text-xl font-black font-mono mt-2 tracking-tight ${
                    saldoKasAkhir >= 0 ? "text-emerald-800" : "text-rose-800"
                  }`}>
                    {formatRupiah(saldoKasAkhir)}
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-1.5 font-sans leading-relaxed">
                    Total likuiditas kas aktif yang tersedia di rekening operasional lembaga saat ini.
                  </p>
                </div>

                {/* 2. Total Pemasukan */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#001f3f]/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      Total Pemasukan
                    </span>
                    <div className="flex items-center text-emerald-600 space-x-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-[9px] font-mono font-bold">IN</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-mono text-slate-900 mt-2 tracking-tight">
                    {formatRupiah(totalPemasukan)}
                  </h3>
                  <div className="text-[9px] text-slate-500 mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>• SPP Siswa:</span>
                      <span className="font-semibold text-slate-700">{formatRupiah(inflowSpp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Pend. Lain (Sewa, Donasi, Kemitraan):</span>
                      <span className="font-semibold text-slate-700">{formatRupiah(inflowLain)}</span>
                    </div>
                    {inflowUtang > 0 && (
                      <div className="flex justify-between">
                        <span>• Cicilan Staf:</span>
                        <span className="font-semibold text-slate-700">{formatRupiah(inflowUtang)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Total Pengeluaran */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#001f3f]/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      Total Pengeluaran
                    </span>
                    <div className="flex items-center text-rose-600 space-x-0.5">
                      <ArrowDownRight className="w-4 h-4" />
                      <span className="text-[9px] font-mono font-bold">OUT</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-mono text-slate-900 mt-2 tracking-tight">
                    {formatRupiah(totalPengeluaran)}
                  </h3>
                  <div className="text-[9px] text-slate-500 mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>• Gaji Pegawai:</span>
                      <span className="font-semibold text-slate-700">{formatRupiah(outflowGaji)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Operasional:</span>
                      <span className="font-semibold text-slate-700">{formatRupiah(outflowOperasional)}</span>
                    </div>
                    {outflowKasbon > 0 && (
                      <div className="flex justify-between">
                        <span>• Kas Bon:</span>
                        <span className="font-semibold text-slate-700">{formatRupiah(outflowKasbon)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Saldo/Defisit Status */}
                <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                  saldoKasAkhir >= 0 
                    ? "bg-[#001f3f]/5 border-[#001f3f]/20 hover:bg-[#001f3f]/10" 
                    : "bg-rose-50 border-rose-200 hover:bg-rose-100"
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                        Status Saldo / Defisit
                      </span>
                      {saldoKasAkhir >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    
                    <div className="mt-2.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase shadow-xs ${
                        saldoKasAkhir >= 0 
                          ? "bg-emerald-600 text-white" 
                          : "bg-rose-600 text-white"
                      }`}>
                        {saldoKasAkhir >= 0 ? "SURPLUS KAS" : "DEFISIT KAS"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 border-t border-slate-200/60 pt-2 text-[10px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Rasio Retensi Kas:</span>
                      <span className="font-mono font-bold text-[#001f3f]">
                        {totalPemasukan > 0 
                          ? Math.round((saldoKasAkhir / totalPemasukan) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 9-14: Main KPI Card Indicators */}
          <div className="mb-6">
            {/* KPI Cards in a grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-100/50 rounded-2xl border border-slate-200/80">
              {/* Card 1: Students */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Siswa")}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Buku Induk Siswa</p>
                  <h3 className="text-xl font-bold mt-2 text-slate-900 group-hover:text-[#001f3f] transition-colors">{totalSiswa} Siswa</h3>
                  <div className="flex items-center mt-3 space-x-2 text-[10px]">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      {siswaAktif} Aktif
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      {siswaLulus} Lulus
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[#001f3f]/5 rounded-xl text-[#001f3f] group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              </motion.div>

              {/* Card 2: Revenue Collected */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Keuangan & Tunggakan Siswa")}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Pendidikan Terbayar</p>
                  <h3 className="text-xl font-bold mt-2 text-emerald-700 group-hover:text-emerald-800 transition-colors">{formatRupiah(totalBayarSemua)}</h3>
                  <div className="flex items-center mt-3 space-x-2 text-[10px]">
                    <span className="text-slate-500 font-medium">Realisasi:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{ratePelunasan}% Lunas</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
              </motion.div>

              {/* Card 3: Receivables (Piutang) */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Keuangan & Tunggakan Siswa")}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Tunggakan Siswa</p>
                  <h3 className="text-xl font-bold mt-2 text-red-600 group-hover:text-red-700 transition-colors">{formatRupiah(totalPiutangSemua)}</h3>
                  <div className="flex items-center mt-3 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full w-max">
                    <span>{keuangan.filter(k => k.piutang > 0).length} Siswa Belum Lunas</span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </motion.div>

              {/* Card 4: Pendapatan Penempatan Kerja */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Keuangan & Tunggakan Siswa")}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-amber-700 uppercase tracking-wider font-semibold truncate">Penempatan Kerja (Eksternal)</p>
                  <h3 className="text-xl font-bold mt-2 text-amber-800 group-hover:text-amber-900 transition-colors truncate">
                    {formatRupiah(totalBayarPenempatan)}
                  </h3>
                  <div className="mt-3 space-y-1 text-[9px] text-slate-500 font-sans">
                    <div className="flex justify-between border-b border-slate-50 pb-0.5">
                      <span>Target:</span>
                      <span className="font-semibold font-mono text-slate-700">{formatRupiah(totalRencanaPenempatan)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tunggakan:</span>
                      <span className="font-semibold font-mono text-red-600">{formatRupiah(totalPiutangPenempatan)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm ml-2 shrink-0">
                  <Ship className="w-5 h-5" />
                </div>
              </motion.div>

              {/* Card 5: Jobs Placed */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between cursor-pointer group"
                onClick={() => onSwitchSheet("Lowongan / Job")}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Perekrutan Kerja</p>
                  <h3 className="text-xl font-bold mt-2 text-[#001f3f] transition-colors">{totalJobRegister} Terdaftar</h3>
                  <div className="flex items-center mt-3 space-x-1 text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                    <span>{lolosDanBerangkat} Lolos Placed ({jobLuarNegeri} LN)</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-[#001f3f] group-hover:text-amber-400 transition-all duration-300 shadow-sm shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Row 15-30: Dual Chart Sheets Embedded */}
          <div className="mb-6">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-100/30 rounded-2xl border border-slate-200/80">
              
              {/* Left Column Chart: Program Studi Distribution */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold font-mono uppercase text-[#001f3f] tracking-wider flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1.5 text-amber-500" />
                      Sebaran Program Studi
                    </h4>
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
                       Arus Kas & Tunggakan Siswa
                    </h4>
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
                            Tunggakan Siswa
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
                  Tingkat tunggakan siswa terkendali di bawah 40%. Pantau secara berkala melalui menu Keuangan & Tunggakan Siswa.
                </div>
              </div>

            </div>
          </div>

          {/* Row 15-30b: Recharts Placement Trend Chart */}
          <div className="mb-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-2 border-b border-slate-100 gap-2">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-[#001f3f] tracking-wider flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5 text-amber-500" />
                    Tren Penempatan Kerja per Bulan (Lolos vs Berangkat)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">
                    Visualisasi dinamika alumni yang dinyatakan Lolos seleksi siap berangkat vs yang sudah Berangkat ke negara penempatan.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-[10px] self-start md:self-auto font-sans">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 font-medium">Lolos ({jobs.filter(j => j.status === JobStatus.Lolos).length})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="text-slate-600 font-medium">Berangkat ({jobs.filter(j => j.status === JobStatus.Berangkat).length})</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={placementTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorLolos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBerangkat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Lolos" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorLolos)" 
                      name="Siswa Lolos"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Berangkat" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorBerangkat)" 
                      name="Siswa Berangkat"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 31-45: Quick Links and Operations Section */}
          <div className="mb-4">
            {/* Quick sheets index and instructional notes */}
            <div className="p-6 bg-gradient-to-br from-[#001f3f] to-[#001124] rounded-2xl border border-slate-200/80 text-white shadow-md">
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
                  { name: "Keuangan & Tunggakan Siswa", desc: "Akun Biaya & Kas Siswa", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Utang Pegawai", desc: "Sisa Pinjaman & Cicilan Staf", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Payroll Gaji", desc: "Penghitungan Gaji & Slip", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Lowongan / Job", displayName: "Job Register / Lowongan", desc: "Daftar Kerja DN & LN", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Integrasi Google Sheets", desc: "Sinkronisasi Cloud Drive", color: "hover:border-amber-400 hover:bg-white/10" },
                  { name: "Pengaturan", desc: "Logo, Nama, Direktur & Cetak", color: "hover:border-amber-400 hover:bg-white/10" }
                                 
                ].map((sheet) => (
                  <button
                    key={sheet.name}
                    id={`btn-nav-${sheet.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    onClick={() => onSwitchSheet(sheet.name)}
                    className={`p-3 bg-[#001124]/70 border border-slate-800/80 rounded-xl text-left shadow-sm transition-all duration-300 group cursor-pointer ${sheet.color}`}
                  >
                    <span className="font-bold text-xs text-white block group-hover:text-amber-400 transition-colors duration-200">{sheet.displayName || sheet.name}</span>
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
