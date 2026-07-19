import React, { useState } from "react";
import { PembayaranLog, PendapatanLain, PengeluaranKas, Payroll, UtangPegawai, SchoolSettings } from "../types";
import { FileText, Printer, BarChart2, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

interface LaporanKeuanganSheetProps {
  pembayaranLog: PembayaranLog[];
  pendapatanLain: PendapatanLain[];
  pengeluaranKas: PengeluaranKas[];
  payrollList: Payroll[];
  utangList: UtangPegawai[];
  schoolSettings: SchoolSettings;
}

export default function LaporanKeuanganSheet({
  pembayaranLog,
  pendapatanLain,
  pengeluaranKas,
  payrollList,
  utangList,
  schoolSettings,
}: LaporanKeuanganSheetProps) {
  const [reportType, setReportType] = useState<"arus_kas" | "laba_rugi">("arus_kas");
  
  // Filtering states
  const [filterMonth, setFilterMonth] = useState<string>("07"); // Default July
  const [filterYear, setFilterYear] = useState<string>("2026"); // Default 2026
  const [isAllTime, setIsAllTime] = useState<boolean>(false);

  // Helper to filter dates based on selected Month/Year
  const isDateInPeriod = (dateStr: string) => {
    if (isAllTime) return true;
    if (!dateStr || dateStr === "-") return false;
    // Format is YYYY-MM-DD
    const parts = dateStr.split("-");
    if (parts.length < 2) return false;
    return parts[0] === filterYear && parts[1] === filterMonth;
  };

  // Helper to format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // --- ARUS KAS CALCULATIONS ---
  // Inflows
  const inflowTuition = pembayaranLog
    .filter((p) => isDateInPeriod(p.tanggalBayar))
    .reduce((acc, p) => acc + p.jumlahBayar, 0);

  const inflowOther = pendapatanLain
    .filter((p) => isDateInPeriod(p.tanggal))
    .reduce((acc, p) => acc + p.jumlah, 0);

  // Get employee loan installments (cicilan) cash inflows
  const inflowLoanPaybacks = utangList.reduce((acc, u) => {
    const cicilanPeriod = u.riwayatCicilan
      .filter((c) => isDateInPeriod(c.tanggal))
      .reduce((sum, c) => sum + c.jumlah, 0);
    return acc + cicilanPeriod;
  }, 0);

  const totalInflow = inflowTuition + inflowOther + inflowLoanPaybacks;

  // Outflows
  const outflowSalaries = payrollList
    .filter((p) => p.statusGaji === "Dibayar" && isDateInPeriod(p.tanggalBayar))
    .reduce((acc, p) => acc + p.totalGaji, 0);

  const outflowOperating = pengeluaranKas
    .filter((e) => isDateInPeriod(e.tanggal))
    .reduce((acc, e) => acc + e.jumlah, 0);

  // New employee loans given out
  const outflowLoansGiven = utangList
    .filter((u) => isDateInPeriod(u.tanggalPinjam))
    .reduce((acc, u) => acc + u.jumlahPinjam, 0);

  const totalOutflow = outflowSalaries + outflowOperating + outflowLoansGiven;
  const netCashFlow = totalInflow - totalOutflow;

  // --- LABA RUGI CALCULATIONS ---
  // Revenues
  const revTuition = inflowTuition; // Realised tuition revenues
  const revOther = inflowOther;
  const totalRevenues = revTuition + revOther;

  // Expenses
  const expSalaries = payrollList
    .filter((p) => p.statusGaji === "Dibayar" && isDateInPeriod(p.tanggalBayar))
    .reduce((acc, p) => acc + p.totalGaji, 0);
  const expOperating = outflowOperating;
  const totalExpenses = expSalaries + expOperating;

  const netProfitLoss = totalRevenues - totalExpenses;

  // Printable Report Handler
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const periodLabel = isAllTime 
      ? "Semua Periode Transaksi" 
      : `Periode: ${new Date(`${filterYear}-${filterMonth}-01`).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`;

    let reportBodyHtml = "";

    if (reportType === "arus_kas") {
      reportBodyHtml = `
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 30px;">Laporan Arus Kas (Cash Flow Statement)</h3>
        <p style="text-align: center; font-style: italic; font-size: 13px; color: #555; margin-top: -20px;">${periodLabel}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 13px;">
          <tr style="background-color: #001f3f; color: white; font-weight: bold;">
            <th style="padding: 12px 10px; text-align: left;">DESKRIPSI AKTIVITAS KAS</th>
            <th style="padding: 12px 10px; text-align: right;">NOMINAL (IDR)</th>
          </tr>
          
          <tr style="border-bottom: 2px solid #333; background-color: #f1f5f9;">
            <td style="padding: 10px; font-weight: bold; text-transform: uppercase;">1. Arus Kas Masuk (Penerimaan Inflow)</td>
            <td></td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Penerimaan SPP & Biaya Pendidikan Siswa</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(inflowTuition)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Pendapatan Lain-lain (Sewa, Donasi, Kemitraan)</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(inflowOther)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Penerimaan Pengembalian Cicilan Pegawai</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(inflowLoanPaybacks)}</td>
          </tr>
          <tr style="font-weight: bold; border-top: 1px solid #ddd; background-color: #f8fafc;">
            <td style="padding: 10px; padding-left: 15px;">TOTAL ALIRAN KAS MASUK</td>
            <td style="padding: 10px; text-align: right; font-family: monospace; color: #10b981;">${formatRupiah(totalInflow)}</td>
          </tr>

          <tr style="border-bottom: 2px solid #333; background-color: #f1f5f9; margin-top: 20px;">
            <td style="padding: 10px; font-weight: bold; text-transform: uppercase;">2. Arus Kas Keluar (Pengeluaran Outflow)</td>
            <td></td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Beban Gaji Staf & Instruktur (Payroll)</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(outflowSalaries)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Beban Operasional LPK (Listrik, Wifi, Praktik, dll)</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(outflowOperating)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Pengeluaran Dana Pinjaman/Kasbon Pegawai</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(outflowLoansGiven)}</td>
          </tr>
          <tr style="font-weight: bold; border-top: 1px solid #ddd; background-color: #f8fafc;">
            <td style="padding: 10px; padding-left: 15px;">TOTAL ALIRAN KAS KELUAR</td>
            <td style="padding: 10px; text-align: right; font-family: monospace; color: #ef4444;">(${formatRupiah(totalOutflow)})</td>
          </tr>

          <tr style="font-weight: bold; border-top: 3px double #333; background-color: #f1f5f9; font-size: 14px;">
            <td style="padding: 12px 10px; text-transform: uppercase;">3. Saldo Arus Kas Bersih (Net Cash Flow)</td>
            <td style="padding: 12px 10px; text-align: right; font-family: monospace; color: ${netCashFlow >= 0 ? "#10b981" : "#ef4444"};">
              ${formatRupiah(netCashFlow)}
            </td>
          </tr>
        </table>
      `;
    } else {
      reportBodyHtml = `
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 30px;">Laporan Laba Rugi (Profit & Loss Statement)</h3>
        <p style="text-align: center; font-style: italic; font-size: 13px; color: #555; margin-top: -20px;">${periodLabel}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 13px;">
          <tr style="background-color: #001f3f; color: white; font-weight: bold;">
            <th style="padding: 12px 10px; text-align: left;">DESKRIPSI POS KEUANGAN</th>
            <th style="padding: 12px 10px; text-align: right;">NOMINAL (IDR)</th>
          </tr>
          
          <tr style="border-bottom: 2px solid #333; background-color: #f1f5f9;">
            <td style="padding: 10px; font-weight: bold; text-transform: uppercase;">I. Pendapatan Operasional (Revenues)</td>
            <td></td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Pendapatan SPP & Pendidikan LPK</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(revTuition)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Pendapatan Non-SPP (Sewa & Kemitraan)</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(revOther)}</td>
          </tr>
          <tr style="font-weight: bold; border-top: 1px solid #ddd; background-color: #f8fafc;">
            <td style="padding: 10px; padding-left: 15px;">TOTAL PENDAPATAN OPERASIONAL</td>
            <td style="padding: 10px; text-align: right; font-family: monospace; color: #10b981;">${formatRupiah(totalRevenues)}</td>
          </tr>

          <tr style="border-bottom: 2px solid #333; background-color: #f1f5f9;">
            <td style="padding: 10px; font-weight: bold; text-transform: uppercase;">II. Beban Operasional (Expenses)</td>
            <td></td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Beban Gaji, Bonus & Potongan Staf</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(expSalaries)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; padding-left: 25px;">Beban Operasional Kelas & Praktik Lapangan</td>
            <td style="padding: 10px; text-align: right; font-family: monospace;">${formatRupiah(expOperating)}</td>
          </tr>
          <tr style="font-weight: bold; border-top: 1px solid #ddd; background-color: #f8fafc;">
            <td style="padding: 10px; padding-left: 15px;">TOTAL BEBAN OPERASIONAL</td>
            <td style="padding: 10px; text-align: right; font-family: monospace; color: #ef4444;">(${formatRupiah(totalExpenses)})</td>
          </tr>

          <tr style="font-weight: bold; border-top: 3px double #333; background-color: #f1f5f9; font-size: 14px;">
            <td style="padding: 12px 10px; text-transform: uppercase;">III. Laba / Rugi Bersih Sebelum Pajak (Net Income)</td>
            <td style="padding: 12px 10px; text-align: right; font-family: monospace; color: ${netProfitLoss >= 0 ? "#10b981" : "#ef4444"};">
              ${formatRupiah(netProfitLoss)}
            </td>
          </tr>
        </table>
      `;
    }

    const primaryColor = schoolSettings.warnaUtama || "#001f3f";
    const alignment = schoolSettings.kopSuratPosisi || "Kiri";

    const logoHtml = schoolSettings.logoUrl && schoolSettings.logoUrl.trim() !== "" 
      ? `<img src="${schoolSettings.logoUrl}" style="max-height: 80px; max-width: 80px; object-fit: contain;" />`
      : `<svg viewBox="0 0 100 100" width="80" height="80" style="display: inline-block;">
          <path d="M 50,5 Q 77,16 87,27 Q 89,60 50,95 Q 11,60 13,27 Q 23,16 50,5 Z" fill="${primaryColor}" stroke="#b89047" stroke-width="2"/>
          <circle cx="50" cy="45" r="18" fill="none" stroke="#b89047" stroke-width="1.5"/>
          <text x="50" y="50" font-family="Georgia, serif" font-weight="bold" font-size="10" fill="#ffffff" text-anchor="middle">NFH</text>
          <path d="M 30,55 Q 50,65 70,55" fill="none" stroke="#b89047" stroke-width="1.5"/>
        </svg>`;

    const textHtml = `
      <div class="header-align-${alignment}">
        <div class="school-name" style="color: ${primaryColor};">${schoolSettings.namaLembaga}</div>
        <div class="school-tagline">${schoolSettings.tagline}</div>
        <div class="school-address">${schoolSettings.alamat}</div>
        <div class="school-contact">
          Telp: ${schoolSettings.noTelepon} | Email: ${schoolSettings.email} | Website: ${schoolSettings.website || "-"}
        </div>
        <div class="school-legal">
          No. Izin LPK: ${schoolSettings.nomorIzin || "KEP. 421.9/3024/436.7.15/2026"} &nbsp;|&nbsp; Akreditasi: ${schoolSettings.akreditasi || "-"}
        </div>
      </div>
    `;

    let headerContentHtml = "";
    if (alignment === "Tengah") {
      headerContentHtml = `
        <tr>
          <td style="text-align: center; vertical-align: middle; padding-bottom: 10px;">
            <div style="margin-bottom: 12px; display: inline-block;">${logoHtml}</div>
            ${textHtml}
          </td>
        </tr>
      `;
    } else if (alignment === "Kanan") {
      headerContentHtml = `
        <tr>
          <td style="vertical-align: middle; padding-right: 15px;">
            ${textHtml}
          </td>
          <td style="width: 90px; vertical-align: middle; padding-left: 15px; text-align: right;">
            ${logoHtml}
          </td>
        </tr>
      `;
    } else { // Default Kiri
      headerContentHtml = `
        <tr>
          <td style="width: 90px; vertical-align: middle; padding-right: 15px;">
            ${logoHtml}
          </td>
          <td style="vertical-align: middle;">
            ${textHtml}
          </td>
        </tr>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${reportType === "arus_kas" ? "Laporan Arus Kas" : "Laporan Laba Rugi"}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; margin: 40px; }
            .header-table { width: 100%; border-bottom: 4px double ${primaryColor}; padding-bottom: 12px; margin-bottom: 25px; border-collapse: collapse; }
            .school-name { font-size: 20px; font-weight: bold; text-transform: uppercase; line-height: 1.2; font-family: 'Georgia', serif; }
            .school-tagline { font-size: 11px; color: #b45309; font-weight: bold; text-transform: uppercase; margin-top: 3px; font-style: italic; }
            .school-address { font-size: 10px; color: #4b5563; margin-top: 4px; line-height: 1.4; }
            .school-contact { font-size: 9px; color: #6b7280; margin-top: 1px; }
            .school-legal { font-size: 9px; color: ${primaryColor}; margin-top: 3px; font-family: monospace; font-weight: bold; }
            .header-align-Tengah { text-align: center; }
            .header-align-Kanan { text-align: right; }
            .header-align-Kiri { text-align: left; }
            .signature-section { margin-top: 60px; float: right; width: 250px; text-align: center; font-size: 13px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            ${headerContentHtml}
          </table>

          ${reportBodyHtml}

          <div class="signature-section">
            <p>Mengetahui,</p>
            <p style="font-weight: bold; text-transform: uppercase; margin-top: 60px;">${schoolSettings.direkturNama}</p>
            <p style="font-size: 11px; color: #555; border-top: 1px solid #777; padding-top: 3px; font-family: monospace;">
              ${schoolSettings.direkturNip || "DIREKTUR LPK"}
            </p>
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-grid font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#001f3f] font-bold uppercase bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Row 141-160: Laporan Keuangan
          </span>
          <h2 className="text-xl font-bold text-slate-950 font-display mt-2 flex items-center">
            <FileText className="w-5 h-5 text-[#001f3f] mr-2" />
            Pusat Cetak Laporan Keuangan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ekstrak data arus kas masuk/keluar, hitung laba bersih operasional LPK, serta cetak dokumen akuntansi formal.
          </p>
        </div>

        <button
          id="btn-print-laporan"
          onClick={handlePrint}
          className="mt-4 md:mt-0 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center w-max"
        >
          <Printer className="w-4 h-4 mr-1.5 text-white" />
          Cetak PDF / Print Laporan
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="my-6 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Toggle Report Type */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setReportType("arus_kas")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              reportType === "arus_kas" ? "bg-white text-[#001f3f] shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            📊 Laporan Arus Kas
          </button>
          <button
            onClick={() => setReportType("laba_rugi")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              reportType === "laba_rugi" ? "bg-white text-[#001f3f] shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            📈 Laporan Laba Rugi
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAllTime(!isAllTime)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isAllTime 
                ? "bg-slate-800 text-white border-slate-800" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isAllTime ? "📅 Saring per Bulan" : "📅 Tampilkan Semua Waktu"}
          </button>

          {!isAllTime && (
            <div className="flex items-center space-x-2">
              <select
                id="report-month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
              >
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktiber</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>

              <select
                id="report-year"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* CORE EXCEL TABLE RENDER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-4xl mx-auto">
        
        {/* Letterhead Preview */}
        <div className="border-b-2 border-slate-900 pb-5 mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
              {schoolSettings.namaLembaga}
            </h1>
            <p className="text-xs text-slate-500 italic mt-0.5">{schoolSettings.tagline}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              {schoolSettings.alamat} | Telp: {schoolSettings.noTelepon}
            </p>
          </div>
          <div className="text-right md:border-l md:border-slate-200 md:pl-6">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Metode Pencatatan</span>
            <span className="text-xs font-bold text-slate-700 block bg-slate-100 rounded-full px-3 py-1 mt-1 border border-slate-200">
              Cash Basis (Kas Riil)
            </span>
          </div>
        </div>

        {/* 1. CASH FLOW PREVIEW */}
        {reportType === "arus_kas" ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Laporan Arus Kas Terpadu
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {isAllTime 
                  ? "Rentang: Semua Periode Log" 
                  : `Periode: ${new Date(`${filterYear}-${filterMonth}-01`).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`}
              </p>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Deskripsi Aktivitas Kas</th>
                  <th className="py-3 px-4 text-right">Nominal (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                
                {/* INFLOWS */}
                <tr className="bg-emerald-50/25 border-b border-emerald-100/50">
                  <td className="py-3 px-4 font-bold text-emerald-800 uppercase tracking-wide">
                    1. Arus Kas Masuk (Penerimaan Inflow)
                  </td>
                  <td></td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Penerimaan SPP & Biaya Pendidikan Siswa</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(inflowTuition)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Pendapatan Lain-lain (Sewa, Donasi, Kemitraan)</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(inflowOther)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Penerimaan Pengembalian Cicilan Pegawai</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(inflowLoanPaybacks)}</td>
                </tr>
                <tr className="bg-emerald-50/10 font-bold">
                  <td className="py-3 px-4 pl-6 text-emerald-700">TOTAL ARUS KAS MASUK</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700">{formatRupiah(totalInflow)}</td>
                </tr>

                {/* OUTFLOWS */}
                <tr className="bg-red-50/25 border-b border-red-100/50">
                  <td className="py-3 px-4 font-bold text-red-800 uppercase tracking-wide">
                    2. Arus Kas Keluar (Pengeluaran Outflow)
                  </td>
                  <td></td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Beban Gaji Staf & Instruktur (Payroll Gaji)</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(outflowSalaries)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Beban Operasional LPK (Listrik, Wifi, Praktik, dll)</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(outflowOperating)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Pengeluaran Kasbon/Pinjaman Baru Karyawan</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(outflowLoansGiven)}</td>
                </tr>
                <tr className="bg-red-50/10 font-bold">
                  <td className="py-3 px-4 pl-6 text-red-600">TOTAL ARUS KAS KELUAR</td>
                  <td className="py-3 px-4 text-right font-mono text-red-600">({formatRupiah(totalOutflow)})</td>
                </tr>

                {/* NET */}
                <tr className="bg-slate-100 font-bold text-sm border-t-2 border-slate-300">
                  <td className="py-3.5 px-4 text-slate-800 uppercase tracking-wider">3. Saldo Arus Kas Bersih (Net Cash Flow)</td>
                  <td className={`py-3.5 px-4 text-right font-mono text-sm ${netCashFlow >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {formatRupiah(netCashFlow)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* 2. PROFIT & LOSS PREVIEW */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Laporan Laba Rugi Operasional
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {isAllTime 
                  ? "Rentang: Semua Periode" 
                  : `Periode: ${new Date(`${filterYear}-${filterMonth}-01`).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`}
              </p>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Deskripsi Pos Keuangan</th>
                  <th className="py-3 px-4 text-right">Nominal (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                
                {/* REVENUE */}
                <tr className="bg-emerald-50/25 border-b border-emerald-100/50">
                  <td className="py-3 px-4 font-bold text-emerald-800 uppercase tracking-wide">
                    I. Pendapatan Operasional (Revenues)
                  </td>
                  <td></td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Pendapatan SPP & Uang Sekolah Siswa</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(revTuition)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Pendapatan Non-SPP (Kemitraan, Sewa Ruang, dll)</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(revOther)}</td>
                </tr>
                <tr className="bg-emerald-50/10 font-bold">
                  <td className="py-3 px-4 pl-6 text-emerald-700">TOTAL REVENUES</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700">{formatRupiah(totalRevenues)}</td>
                </tr>

                {/* EXPENSES */}
                <tr className="bg-red-50/25 border-b border-red-100/50">
                  <td className="py-3 px-4 font-bold text-red-800 uppercase tracking-wide">
                    II. Beban Operasional (Expenses)
                  </td>
                  <td></td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Beban Gaji Staf, Instruktur & Manajemen</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(expSalaries)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 pl-8 text-slate-700 font-medium">Beban Kelas & Pembelian Bahan Praktik</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800">{formatRupiah(expOperating)}</td>
                </tr>
                <tr className="bg-red-50/10 font-bold">
                  <td className="py-3 px-4 pl-6 text-red-600">TOTAL EXPENSES</td>
                  <td className="py-3 px-4 text-right font-mono text-red-600">({formatRupiah(totalExpenses)})</td>
                </tr>

                {/* NET MARGIN */}
                <tr className="bg-slate-100 font-bold text-sm border-t-2 border-slate-300">
                  <td className="py-3.5 px-4 text-slate-800 uppercase tracking-wider">III. Laba Bersih Operasional (Net Profit)</td>
                  <td className={`py-3.5 px-4 text-right font-mono text-sm ${netProfitLoss >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {formatRupiah(netProfitLoss)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Manager Signature block */}
        <div className="mt-12 flex justify-end">
          <div className="text-center w-52 text-xs font-sans">
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-900 uppercase mt-12">{schoolSettings.direkturNama}</p>
            <div className="h-px bg-slate-400 w-full mt-1"></div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">{schoolSettings.direkturNip || "DIREKTUR LPK"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
