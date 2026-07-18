/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Payroll, Staff, StaffRole } from "../types";
import { formatRupiah } from "../utils";
import { Plus, Trash2, Printer, Search, DollarSign, Receipt, CreditCard } from "lucide-react";
import { formatSalaryNotification, WhatsAppNotification } from "../utils/whatsapp";

interface GajiPayrollSheetProps {
  payroll: Payroll[];
  staff: Staff[];
  onAddPayroll: (newPayroll: Payroll) => void;
  onDeletePayroll: (payrollId: string) => void;
  schoolSettings: {
    namaLembaga: string;
    alamat: string;
    direkturNama: string;
  };
  onTriggerWhatsApp?: (notif: WhatsAppNotification) => void;
}

export default function GajiPayrollSheet({
  payroll,
  staff,
  onAddPayroll,
  onDeletePayroll,
  schoolSettings,
  onTriggerWhatsApp
}: GajiPayrollSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("All");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Form & Slip views
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activePrintPayslip, setActivePrintPayslip] = useState<Payroll | null>(null);

  // Form states
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [bulan, setBulan] = useState("Juli 2026");
  const [gajiPokok, setGajiPokok] = useState<number>(5000000);
  const [tunjangan, setTunjangan] = useState<number>(500000);
  const [lemburBonus, setLemburBonus] = useState<number>(300000);
  const [potongan, setPotongan] = useState<number>(100000);
  const [statusGaji, setStatusGaji] = useState<"Dibayar" | "Pending">("Dibayar");

  // Filter
  const filteredPayroll = payroll.filter(p => {
    const matchesSearch = p.staffNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === "All" || p.bulan === filterMonth;
    return matchesSearch && matchesMonth;
  });

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
    const selected = staff.find(s => s.id === staffId);
    if (selected) {
      setGajiPokok(selected.gajiPokok);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      alert("Pegawai harus dipilih!");
      return;
    }

    const selected = staff.find(s => s.id === selectedStaffId);
    if (!selected) return;

    // Check duplicate pay for same staff on same month
    const duplicate = payroll.find(p => p.staffId === selectedStaffId && p.bulan === bulan);
    if (duplicate) {
      alert(`Gaji untuk ${selected.nama} pada bulan ${bulan} sudah dihitung!`);
      return;
    }

    const netSalary = gajiPokok + tunjangan + lemburBonus - potongan;

    const newRecord: Payroll = {
      id: `PAYR-${Date.now().toString().slice(-4)}`,
      staffId: selectedStaffId,
      staffNama: selected.nama,
      role: selected.role,
      bulan: bulan,
      gajiPokok: gajiPokok,
      tunjangan: tunjangan,
      lemburBonus: lemburBonus,
      potongan: potongan,
      totalGaji: netSalary,
      tanggalBayar: statusGaji === "Dibayar" ? new Date().toISOString().split("T")[0] : "-",
      statusGaji: statusGaji
    };

    onAddPayroll(newRecord);
    setIsFormOpen(false);

    // Trigger WhatsApp notification for payroll transfer/payout
    if (statusGaji === "Dibayar" && onTriggerWhatsApp) {
      const phone = selected.noHp || "";
      const msg = formatSalaryNotification(
        selected.nama,
        selected.role,
        bulan,
        gajiPokok,
        tunjangan,
        lemburBonus,
        potongan,
        netSalary,
        new Date().toISOString().split("T")[0]
      );
      onTriggerWhatsApp({
        recipientName: selected.nama,
        phone,
        category: "Gaji & Payroll",
        message: msg
      });
    }

    // Reset
    setSelectedStaffId("");
    setTunjangan(500000);
    setLemburBonus(300000);
    setPotongan(100000);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="payroll-sheet-container">
      {/* Excel Tool Ribbon */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            id="btn-add-payroll"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center space-x-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Hitung Gaji Bulanan (Baris)</span>
          </button>

          <button
            id="btn-print-slip"
            disabled={!selectedRowId}
            onClick={() => {
              const selected = payroll.find(p => p.id === selectedRowId);
              if (selected) setActivePrintPayslip(selected);
            }}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-bold ${
              selectedRowId 
                ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Slip Gaji Resmi</span>
          </button>

          {selectedRowId && (
            <button
              id="btn-delete-payroll"
              onClick={() => {
                if (confirm("Hapus baris hitungan gaji ini?")) {
                  onDeletePayroll(selectedRowId);
                  setSelectedRowId(null);
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs px-2.5 py-1.5 rounded border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama pegawai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-48 focus:outline-none bg-white"
            />
          </div>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none bg-white"
          >
            <option value="All">Semua Periode Bulan</option>
            <option value="Juni 2026">Juni 2026</option>
            <option value="Juli 2026">Juli 2026</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Formula Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-600">
        <div className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-gray-700 min-w-[50px] text-center">
          {selectedRowId ? `PAYR-${payroll.findIndex(p => p.id === selectedRowId) + 1}` : "A1"}
        </div>
        <div className="text-gray-400 font-bold">fx</div>
        <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
          {selectedRowId 
            ? `=PAYROLL(NAME: "${payroll.find(p => p.id === selectedRowId)?.staffNama}", MONTH: "${payroll.find(p => p.id === selectedRowId)?.bulan}", FORMULA_TAKE_HOME: [Pokok + Tunjangan + Lembur - Potongan] = ${payroll.find(p => p.id === selectedRowId)?.totalGaji})`
            : "Formula Bar: Formula Payroll menghitung otomatis Take Home Pay berdasarkan [Gaji Pokok + Tunjangan + Lembur/Bonus - Potongan]."
          }
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-grow overflow-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-mono text-gray-500">
              <th className="w-10 text-center border-r border-gray-300 select-none py-1">#</th>
              <th className="px-3 py-1 border-r border-gray-300 w-28">ID Gaji</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Pegawai (A)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32 font-bold text-purple-800">Bulan Periode (B)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36 text-right">Gaji Pokok (C)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32 text-right">Tunjangan (D)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32 text-right">Lembur/Bonus (E)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-28 text-right text-red-600">Potongan (F)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36 text-right text-purple-900 font-bold">Take Home Pay (G)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-28 text-center">Status</th>
              <th className="px-3 py-1 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono text-gray-700">
            {filteredPayroll.map((pay, index) => {
              const isSelected = selectedRowId === pay.id;
              return (
                <tr
                  key={pay.id}
                  onClick={() => setSelectedRowId(pay.id)}
                  onDoubleClick={() => setActivePrintPayslip(pay)}
                  className={`border-b border-gray-200 cursor-pointer select-none hover:bg-purple-50/20 ${
                    isSelected ? "bg-purple-100/60 border-2 border-purple-600" : ""
                  }`}
                >
                  <td className="w-10 text-center bg-gray-50 border-r border-gray-300 text-[10px] text-gray-400 py-2.5">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-bold">
                    {pay.id}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-gray-950">
                    {pay.staffNama} <span className="text-[10px] text-gray-400">({pay.role})</span>
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-purple-800 font-semibold text-center">
                    {pay.bulan}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right">
                    {formatRupiah(pay.gajiPokok)}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right text-green-700">
                    {formatRupiah(pay.tunjangan)}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right text-green-700">
                    {formatRupiah(pay.lemburBonus)}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right text-red-600">
                    {formatRupiah(pay.potongan)}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right text-purple-950 font-bold bg-purple-50/20">
                    {formatRupiah(pay.totalGaji)}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      pay.statusGaji === "Dibayar" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {pay.statusGaji}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center flex items-center justify-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePrintPayslip(pay);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded font-sans font-bold cursor-pointer"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>Slip Gaji</span>
                    </button>
                    {pay.statusGaji === "Dibayar" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetStaff = staff.find(s => s.id === pay.staffId || s.nama === pay.staffNama);
                          const phone = targetStaff ? targetStaff.noHp : "";
                          const msg = formatSalaryNotification(
                            pay.staffNama,
                            pay.role,
                            pay.bulan,
                            pay.gajiPokok,
                            pay.tunjangan,
                            pay.lemburBonus,
                            pay.potongan,
                            pay.totalGaji,
                            pay.tanggalBayar !== "-" ? pay.tanggalBayar : new Date().toISOString().split("T")[0]
                          );
                          if (onTriggerWhatsApp) {
                            onTriggerWhatsApp({
                              recipientName: pay.staffNama,
                              phone,
                              category: "Gaji & Payroll",
                              message: msg
                            });
                          }
                        }}
                        className="inline-flex items-center px-2 py-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-sans font-bold cursor-pointer"
                        title="Kirim Slip Gaji via WhatsApp"
                      >
                        <span>WA Gaji</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredPayroll.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-10 text-gray-400 bg-gray-50">
                  Belum ada data penggajian bulanan staf & instruktur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div>Total Rows: {filteredPayroll.length}</div>
        <div>LPK Nandita Employee Payroll Ledger</div>
      </div>

      {/* Add Payroll Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-4 border-b border-gray-200 bg-purple-800 text-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold text-sm">Hitung Gaji Bulanan Pegawai</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white">✕</button>
            </div>
            
            <form onSubmit={handleSaveForm} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Pegawai *</label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => handleStaffSelect(e.target.value)}
                  className="w-full border border-gray-300 bg-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {staff.filter(s => s.status === "Aktif").map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Periode Gaji</label>
                  <select
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs"
                  >
                    <option value="Juni 2026">Juni 2026</option>
                    <option value="Juli 2026">Juli 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status Pembayaran</label>
                  <select
                    value={statusGaji}
                    onChange={(e) => setStatusGaji(e.target.value as "Dibayar" | "Pending")}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs"
                  >
                    <option value="Dibayar">Dibayar (Lunas)</option>
                    <option value="Pending">Pending (Ditunda)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    required
                    value={gajiPokok}
                    onChange={(e) => setGajiPokok(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">* Mengikuti Master Data Staf</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tunjangan Jabatan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={tunjangan}
                    onChange={(e) => setTunjangan(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lembur & Bonus (Rp)</label>
                  <input
                    type="number"
                    required
                    value={lemburBonus}
                    onChange={(e) => setLemburBonus(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Potongan Kerja / BPJS (Rp)</label>
                  <input
                    type="number"
                    required
                    value={potongan}
                    onChange={(e) => setPotongan(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
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
                  className="px-4 py-1.5 text-xs bg-purple-800 text-white rounded hover:bg-purple-900 font-semibold"
                >
                  Proses Hitung
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slip Gaji Visual Print Mockup Overlay */}
      {activePrintPayslip && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4 overflow-y-auto" id="slip-print-overlay">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-1 my-10 relative">
            
            {/* Control panel inside modal (non-printable) */}
            <div className="bg-gray-100 px-6 py-3 rounded-t flex items-center justify-between border-b border-gray-200 print:hidden">
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Format Slip Gaji Resmi LPK Nandita Floating Hotel</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1 bg-purple-700 hover:bg-purple-800 text-white text-xs px-3 py-1.5 rounded font-bold shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF Slip</span>
                </button>
                <button
                  onClick={() => setActivePrintPayslip(null)}
                  className="text-gray-500 hover:text-gray-800 text-xs px-2.5 py-1.5 rounded hover:bg-gray-200"
                >
                  Tutup [X]
                </button>
              </div>
            </div>

            {/* Payslip body (printable) */}
            <div className="p-10 bg-white text-gray-800 font-sans" id="printable-payslip">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4">
                <div className="text-left">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">{schoolSettings.namaLembaga}</h2>
                  <p className="text-[10px] text-gray-500 max-w-sm mt-0.5">{schoolSettings.alamat}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-base font-bold uppercase tracking-wider text-purple-900">SLIP GAJI PEGAWAI</h3>
                  <p className="text-xs font-mono font-bold mt-1 text-gray-500">Ref: {activePrintPayslip.id}</p>
                </div>
              </div>

              {/* Employee Metadata */}
              <div className="grid grid-cols-2 gap-4 my-6 text-xs border-b border-gray-200 pb-4">
                <div className="space-y-1">
                  <p className="text-gray-500">Nama Lengkap:</p>
                  <p className="font-bold text-gray-900 text-sm">{activePrintPayslip.staffNama}</p>
                  <p className="text-gray-500 mt-2">Kategori Jabatan:</p>
                  <p className="font-semibold text-purple-900">{activePrintPayslip.role}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-gray-500">Periode Gaji:</p>
                  <p className="font-bold text-gray-900">{activePrintPayslip.bulan}</p>
                  <p className="text-gray-500 mt-2">Tanggal Pembayaran:</p>
                  <p className="font-semibold text-gray-800 font-mono">{activePrintPayslip.tanggalBayar}</p>
                </div>
              </div>

              {/* Pay Item Breakdown */}
              <div className="grid grid-cols-2 gap-8 text-xs my-6">
                {/* Income column */}
                <div className="space-y-3">
                  <h4 className="font-bold border-b border-gray-300 pb-1 text-green-700 uppercase">PENERIMAAN (INCOME)</h4>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gaji Pokok:</span>
                    <span className="font-mono font-semibold text-gray-800">{formatRupiah(activePrintPayslip.gajiPokok)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tunjangan Jabatan:</span>
                    <span className="font-mono font-semibold text-gray-800">{formatRupiah(activePrintPayslip.tunjangan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lembur / Bonus Khusus:</span>
                    <span className="font-mono font-semibold text-gray-800">{formatRupiah(activePrintPayslip.lemburBonus)}</span>
                  </div>
                </div>

                {/* Deductions column */}
                <div className="space-y-3">
                  <h4 className="font-bold border-b border-gray-300 pb-1 text-red-600 uppercase">POTONGAN (DEDUCTION)</h4>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BPJS / Pajak / Kas:</span>
                    <span className="font-mono font-semibold text-red-600">{formatRupiah(activePrintPayslip.potongan)}</span>
                  </div>
                  <div className="flex justify-between mt-1 pt-2 border-t border-gray-100">
                    <span className="text-gray-500 italic">Total Potongan:</span>
                    <span className="font-mono font-bold text-red-600">{formatRupiah(activePrintPayslip.potongan)}</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Summary */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 flex justify-between items-center my-6">
                <div>
                  <span className="text-xs font-bold text-purple-900 block uppercase">Jumlah Bersih Diterima (Take Home Pay)</span>
                  <span className="text-[10px] text-gray-400">Telah dibayarkan via transfer bank</span>
                </div>
                <span className="font-mono text-lg font-bold text-purple-950">{formatRupiah(activePrintPayslip.totalGaji)}</span>
              </div>

              {/* Footer signatures */}
              <div className="grid grid-cols-2 gap-10 mt-10 pt-4 border-t border-gray-200 text-center text-xs">
                <div>
                  <p className="text-gray-500">Penerima Gaji,</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="font-serif italic text-gray-400">[ Tanda Tangan ]</span>
                  </div>
                  <p className="font-bold text-gray-800 border-t border-gray-200 pt-1 w-40 mx-auto">
                    {activePrintPayslip.staffNama}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Bendahara LPK Nandita,</p>
                  <div className="h-12 flex items-center justify-center relative">
                    <span className="font-serif italic text-teal-700 font-bold select-none transform -rotate-3 text-sm">
                      [ Bendahara LPK ]
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 border-t border-gray-200 pt-1 w-40 mx-auto">
                    Dewi Lestari
                  </p>
                </div>
              </div>

            </div>

            {/* Print tips */}
            <div className="bg-gray-50 px-6 py-3 rounded-b text-center text-xs text-gray-500 border-t border-gray-200 print:hidden">
              Tip: Gunakan pintasan **CTRL + P** untuk mencetak slip ini. Format diatur pas untuk ukuran kertas A5 / Letter.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
