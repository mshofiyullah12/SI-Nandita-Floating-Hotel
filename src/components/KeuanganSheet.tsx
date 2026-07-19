/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KeuanganSiswa, PembayaranLog, Siswa, SchoolSettings } from "../types";
import { formatRupiah } from "../utils";
import { Plus, Search, DollarSign, History, AlertCircle, Receipt, Trash2 } from "lucide-react";
import { formatPaymentNotification, formatReceivableNotification, WhatsAppNotification } from "../utils/whatsapp";

interface KeuanganSheetProps {
  keuangan: KeuanganSiswa[];
  pembayaranLog: PembayaranLog[];
  siswa: Siswa[];
  onAddPayment: (newPayment: PembayaranLog) => void;
  onDeletePayment: (paymentId: string) => void;
  onUpdateBiayaSiswa: (keuanganSiswaId: string, newTotalBiaya: number) => void;
  onAddKeuanganAccount: (newAccount: KeuanganSiswa) => void;
  onTriggerWhatsApp?: (notif: WhatsAppNotification) => void;
  schoolSettings?: SchoolSettings;
}

export default function KeuanganSheet({
  keuangan,
  pembayaranLog,
  siswa,
  onAddPayment,
  onDeletePayment,
  onUpdateBiayaSiswa,
  onAddKeuanganAccount,
  onTriggerWhatsApp,
  schoolSettings
}: KeuanganSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Modal / Detail states
  const [activeAccountDetails, setActiveAccountDetails] = useState<KeuanganSiswa | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isBiayaFormOpen, setIsBiayaFormOpen] = useState(false);

  // New account state
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [newAccSiswaId, setNewAccSiswaId] = useState("");
  const [newAccTotalBiaya, setNewAccTotalBiaya] = useState(15000000);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(3000000);
  const [payMethod, setPayMethod] = useState("Transfer BCA");
  const [payNotes, setPayNotes] = useState("Angsuran Pembayaran");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

  // Biaya Update State
  const [targetBiayaValue, setTargetBiayaValue] = useState<number>(0);

  // Filters
  const filteredKeuangan = keuangan.filter(k => {
    const matchesSearch = k.siswaNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || k.statusBayar === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick metrics
  const totalRencana = keuangan.reduce((acc, k) => acc + k.totalBiaya, 0);
  const totalRealisasi = keuangan.reduce((acc, k) => acc + k.totalBayar, 0);
  const totalPiutangActive = keuangan.reduce((acc, k) => acc + k.piutang, 0);

  // Handler: Add Payment log
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccountDetails) return;

    if (payAmount <= 0) {
      alert("Jumlah pembayaran harus lebih besar dari Rp 0!");
      return;
    }

    if (payAmount > activeAccountDetails.piutang) {
      if (!confirm(`Peringatan: Jumlah pembayaran (${formatRupiah(payAmount)}) melebihi sisa tagihan (${formatRupiah(activeAccountDetails.piutang)}). Tetap lanjutkan?`)) {
        return;
      }
    }

    const newPayment: PembayaranLog = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      keuanganSiswaId: activeAccountDetails.id,
      siswaNama: activeAccountDetails.siswaNama,
      tanggalBayar: payDate,
      jumlahBayar: payAmount,
      metodeBayar: payMethod,
      keterangan: payNotes
    };

    onAddPayment(newPayment);
    setIsPaymentFormOpen(false);

    // Update active details state so it shows updated calculation instantly in modal
    const updatedAccount = keuangan.find(k => k.id === activeAccountDetails.id);
    let currentRemainingPiutang = Math.max(activeAccountDetails.totalBiaya - (activeAccountDetails.totalBayar + payAmount), 0);
    if (updatedAccount) {
      // Calculate optimistic update
      const optPaid = updatedAccount.totalBayar + payAmount;
      const optPiutang = Math.max(updatedAccount.totalBiaya - optPaid, 0);
      currentRemainingPiutang = optPiutang;
      setActiveAccountDetails({
        ...updatedAccount,
        totalBayar: optPaid,
        piutang: optPiutang,
        statusBayar: optPiutang === 0 ? "Lunas" : "Belum Lunas",
        pembayaranTerakhir: payDate
      });
    }

    // Dispatch WhatsApp Notification automatically if callback is available
    if (onTriggerWhatsApp) {
      const targetSiswa = siswa.find(s => s.nama === activeAccountDetails.siswaNama);
      const phone = targetSiswa ? targetSiswa.noHp : "";

      const msg = formatPaymentNotification(
        activeAccountDetails.siswaNama,
        payAmount,
        payNotes,
        payDate,
        currentRemainingPiutang,
        schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
        schoolSettings?.waTemplatePembayaran
      );
      
      onTriggerWhatsApp({
        recipientName: activeAccountDetails.siswaNama,
        phone,
        category: "Pembayaran Siswa",
        message: msg
      });
    }

    // Reset payment states
    setPayAmount(3000000);
    setPayNotes("Angsuran Pembayaran");
  };

  const handleUpdateBiayaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccountDetails) return;

    onUpdateBiayaSiswa(activeAccountDetails.id, targetBiayaValue);
    setIsBiayaFormOpen(false);

    const updatedAccount = keuangan.find(k => k.id === activeAccountDetails.id);
    if (updatedAccount) {
      setActiveAccountDetails({
        ...updatedAccount,
        totalBiaya: targetBiayaValue,
        piutang: Math.max(targetBiayaValue - updatedAccount.totalBayar, 0),
        statusBayar: (targetBiayaValue - updatedAccount.totalBayar) <= 0 ? "Lunas" : "Belum Lunas"
      });
    }
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccSiswaId) {
      alert("Pilih siswa terlebih dahulu!");
      return;
    }

    // Check if account already exists
    const duplicate = keuangan.find(k => k.siswaId === newAccSiswaId);
    if (duplicate) {
      alert("Akun keuangan siswa ini sudah terdaftar!");
      return;
    }

    const targetSiswa = siswa.find(s => s.id === newAccSiswaId);
    if (!targetSiswa) return;

    const newAcc: KeuanganSiswa = {
      id: `KEU-${Date.now().toString().slice(-4)}`,
      siswaId: newAccSiswaId,
      siswaNama: targetSiswa.nama,
      totalBiaya: Number(newAccTotalBiaya),
      totalBayar: 0,
      piutang: Number(newAccTotalBiaya),
      statusBayar: "Belum Bayar",
      pembayaranTerakhir: "-"
    };

    onAddKeuanganAccount(newAcc);
    setIsAccountFormOpen(false);
    setNewAccSiswaId("");
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="keuangan-sheet-container">
      {/* KPI ribbon bar in financial sheet */}
      <div className="bg-teal-50 border-b border-gray-200 p-3 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-inner">
        <div className="bg-white border border-teal-200 p-2.5 rounded shadow-sm">
          <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">Rencana Penerimaan Biaya</span>
          <span className="text-sm font-mono font-bold text-gray-900 mt-1 block">{formatRupiah(totalRencana)}</span>
        </div>
        <div className="bg-white border border-emerald-200 p-2.5 rounded shadow-sm">
          <span className="text-[10px] font-mono text-emerald-700 uppercase block font-bold">Dana Masuk (Realisasi)</span>
          <span className="text-sm font-mono font-bold text-green-700 mt-1 block">{formatRupiah(totalRealisasi)}</span>
        </div>
        <div className="bg-white border border-red-200 p-2.5 rounded shadow-sm">
          <span className="text-[10px] font-mono text-red-700 uppercase block font-bold">Total Tunggakan Siswa Aktif</span>
          <span className="text-sm font-mono font-bold text-red-600 mt-1 block">{formatRupiah(totalPiutangActive)}</span>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button
            id="btn-create-fin-account"
            onClick={() => setIsAccountFormOpen(true)}
            className="bg-teal-800 hover:bg-teal-900 text-white text-xs px-3 py-2 rounded font-bold shadow-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Buka Rekening Siswa</span>
          </button>
        </div>
      </div>

      {/* Excel Tool Bar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            id="btn-edit-biaya"
            disabled={!selectedRowId}
            onClick={() => {
              const selected = keuangan.find(k => k.id === selectedRowId);
              if (selected) {
                setActiveAccountDetails(selected);
                setTargetBiayaValue(selected.totalBiaya);
                setIsBiayaFormOpen(true);
              }
            }}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-semibold ${
              selectedRowId 
                ? "bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>Atur Nominal Biaya Pendidikan (A)</span>
          </button>

          <button
            id="btn-open-payment-log"
            disabled={!selectedRowId}
            onClick={() => {
              const selected = keuangan.find(k => k.id === selectedRowId);
              if (selected) {
                setActiveAccountDetails(selected);
              }
            }}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-bold ${
              selectedRowId 
                ? "bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-sm" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Rincian & Bayar Tunggakan Siswa</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-48 focus:outline-none bg-white"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none bg-white"
          >
            <option value="All">Semua Status Bayar</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum Lunas">Belum Lunas</option>
            <option value="Belum Bayar">Belum Bayar</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Formula Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-600">
        <div className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-gray-700 min-w-[50px] text-center">
          {selectedRowId ? `KEU-${keuangan.findIndex(k => k.id === selectedRowId) + 1}` : "A1"}
        </div>
        <div className="text-gray-400 font-bold">fx</div>
        <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
          {selectedRowId 
            ? `=REC_TAGIHAN(TOTAL_BIAYA: ${keuangan.find(k => k.id === selectedRowId)?.totalBiaya}, TOTAL_BAYAR: ${keuangan.find(k => k.id === selectedRowId)?.totalBayar}, SISA_TAGIHAN: [Formula: B${keuangan.findIndex(k => k.id === selectedRowId) + 2} - C${keuangan.findIndex(k => k.id === selectedRowId) + 2}] = ${keuangan.find(k => k.id === selectedRowId)?.piutang})`
            : "Formula Bar: Formula otomatis menghitung [Sisa Tagihan = Total Biaya - Total Bayar] secara dinamis."
          }
        </div>
      </div>

      {/* Table Ledger view */}
      <div className="flex-grow overflow-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-mono text-gray-500">
              <th className="w-10 text-center border-r border-gray-300 select-none py-1">#</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32">ID Akun</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Siswa / Pembayar (A)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-48 text-right">Total Biaya Pendidikan (B)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-44 text-right">Jumlah Terbayar (C)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-44 text-right text-red-600">Sisa Tunggakan Siswa (D)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32 text-center">Tgl Bayar Terakhir</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32 text-center">Status (E)</th>
              <th className="px-3 py-1 text-center w-28">Operasi</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {filteredKeuangan.map((acc, index) => {
              const isSelected = selectedRowId === acc.id;
              return (
                <tr
                  key={acc.id}
                  onClick={() => setSelectedRowId(acc.id)}
                  onDoubleClick={() => {
                    setActiveAccountDetails(acc);
                  }}
                  className={`border-b border-gray-200 cursor-pointer select-none hover:bg-teal-50/20 ${
                    isSelected ? "bg-teal-100/60 border-2 border-teal-600" : ""
                  }`}
                >
                  <td className="w-10 text-center bg-gray-50 border-r border-gray-300 text-[10px] text-gray-400 font-mono py-2.5">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-bold">
                    {acc.id}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-gray-950">
                    {acc.siswaNama}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right font-semibold text-gray-700">
                    {formatRupiah(acc.totalBiaya)}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right font-semibold text-emerald-700">
                    {formatRupiah(acc.totalBayar)}
                  </td>
                  <td className={`px-3 py-2 border-r border-gray-300 text-right font-bold ${
                    acc.piutang > 0 ? "text-red-600 bg-red-50/30" : "text-gray-500"
                  }`}>
                    {formatRupiah(acc.piutang)}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center text-gray-500">
                    {acc.pembayaranTerakhir}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      acc.statusBayar === "Lunas" ? "bg-green-100 text-green-800" :
                      acc.statusBayar === "Belum Lunas" ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {acc.statusBayar}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAccountDetails(acc);
                      }}
                      className="px-2 py-0.5 text-[10px] bg-teal-800 text-white font-sans font-semibold rounded hover:bg-teal-950 cursor-pointer"
                    >
                      Bayar
                    </button>
                    {acc.piutang > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetSiswa = siswa.find(s => s.id === acc.siswaId);
                          const phone = targetSiswa ? targetSiswa.noHp : "";
                          const msg = formatReceivableNotification(
                            acc.siswaNama,
                            acc.totalBiaya,
                            acc.piutang,
                            schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
                            schoolSettings?.waTemplateTagihanSiswa
                          );
                          if (onTriggerWhatsApp) {
                            onTriggerWhatsApp({
                              recipientName: acc.siswaNama,
                              phone,
                              category: "Tunggakan Siswa",
                              message: msg
                            });
                          }
                        }}
                        className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white font-sans font-semibold rounded hover:bg-emerald-700 cursor-pointer inline-flex items-center"
                        title="Kirim Tunggakan via WhatsApp"
                      >
                        WA Tunggakan
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredKeuangan.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400 bg-gray-50">
                  Tidak ada baris akun keuangan ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div>Total Data Keuangan: {filteredKeuangan.length} Siswa</div>
        <div>LPK Nandita Accounting General Ledger</div>
      </div>

      {/* Account Details & Payment History Modal */}
      {activeAccountDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 bg-teal-800 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Rincian Buku Kas Siswa</h3>
                <p className="text-[10px] text-teal-100">Siswa: {activeAccountDetails.siswaNama}</p>
              </div>
              <button 
                onClick={() => {
                  setActiveAccountDetails(null);
                  setIsPaymentFormOpen(false);
                }} 
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-grow overflow-y-auto space-y-5">
              {/* Financial Summary Card */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Tagihan</span>
                  <span className="font-mono text-xs font-semibold text-gray-800 mt-1 block">
                    {formatRupiah(activeAccountDetails.totalBiaya)}
                  </span>
                </div>
                <div className="text-center border-x border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Telah Dibayar</span>
                  <span className="font-mono text-xs font-bold text-emerald-700 mt-1 block">
                    {formatRupiah(activeAccountDetails.totalBayar)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Sisa Tunggakan Siswa</span>
                  <span className="font-mono text-xs font-bold text-red-600 mt-1 block">
                    {formatRupiah(activeAccountDetails.piutang)}
                  </span>
                </div>
              </div>

              {/* Payment Logs List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase flex items-center">
                    <History className="w-3.5 h-3.5 mr-1 text-teal-700" />
                    Riwayat Pembayaran Siswa
                  </h4>
                  {activeAccountDetails.piutang > 0 && !isPaymentFormOpen && (
                    <button
                      id="btn-trigger-pay"
                      onClick={() => setIsPaymentFormOpen(true)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold px-2 py-1 rounded"
                    >
                      + Catat Setoran Baru
                    </button>
                  )}
                </div>

                {/* Log list */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-gray-100 text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-1.5">No Referensi</th>
                        <th className="px-3 py-1.5">Tanggal</th>
                        <th className="px-3 py-1.5">Metode</th>
                        <th className="px-3 py-1.5">Keterangan</th>
                        <th className="px-3 py-1.5 text-right">Jumlah Setor</th>
                        <th className="px-3 py-1.5 text-center">Batal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pembayaranLog.filter(log => log.keuanganSiswaId === activeAccountDetails.id).map((log, i) => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-500 font-bold">{log.id}</td>
                          <td className="px-3 py-2 text-gray-600">{log.tanggalBayar}</td>
                          <td className="px-3 py-2 font-medium text-teal-800">{log.metodeBayar}</td>
                          <td className="px-3 py-2 text-gray-500">{log.keterangan}</td>
                          <td className="px-3 py-2 text-right font-bold text-green-700">{formatRupiah(log.jumlahBayar)}</td>
                          <td className="px-3 py-2 text-center flex items-center justify-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const targetSiswa = siswa.find(s => s.nama === log.siswaNama);
                                const phone = targetSiswa ? targetSiswa.noHp : "";
                                const msg = formatPaymentNotification(
                                  log.siswaNama,
                                  log.jumlahBayar,
                                  log.keterangan || "Pembayaran",
                                  log.tanggalBayar,
                                  activeAccountDetails.piutang,
                                  schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
                                  schoolSettings?.waTemplatePembayaran
                                );
                                if (onTriggerWhatsApp) {
                                  onTriggerWhatsApp({
                                    recipientName: log.siswaNama,
                                    phone,
                                    category: "Pembayaran Siswa",
                                    message: msg
                                  });
                                }
                              }}
                              className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-1 py-0.5 rounded text-[10px] font-sans font-bold cursor-pointer"
                              title="Kirim Kuitansi via WhatsApp"
                            >
                              WA Resi
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Apakah Anda yakin ingin membatalkan transaksi penyetoran ini?")) {
                                  onDeletePayment(log.id);
                                  // Update modal local state back
                                  const updated = keuangan.find(k => k.id === activeAccountDetails.id);
                                  if (updated) {
                                    const optPaid = Math.max(updated.totalBayar - log.jumlahBayar, 0);
                                    setActiveAccountDetails({
                                      ...updated,
                                      totalBayar: optPaid,
                                      piutang: updated.totalBiaya - optPaid,
                                      statusBayar: optPaid === 0 ? "Belum Bayar" : "Belum Lunas"
                                    });
                                  }
                                }
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded cursor-pointer"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pembayaranLog.filter(log => log.keuanganSiswaId === activeAccountDetails.id).length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-gray-400">
                            Belum ada riwayat transaksi pembayaran.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Collapsible Record New Payment Form */}
              {isPaymentFormOpen && (
                <form onSubmit={handleRecordPaymentSubmit} className="border border-emerald-300 rounded-lg p-4 bg-emerald-50/40 space-y-3 animate-slide-in">
                  <h4 className="text-xs font-bold text-teal-900 uppercase">Input Setoran Kas Baru</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600">Jumlah Pembayaran (Rp) *</label>
                      <input
                        type="number"
                        required
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full border border-emerald-300 bg-white rounded px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600">Tanggal Transaksi</label>
                      <input
                        type="date"
                        required
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                        className="w-full border border-emerald-300 bg-white rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600">Metode Bayar</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        className="w-full border border-emerald-300 bg-white rounded px-2 py-1 text-xs"
                      >
                        <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                        <option value="Transfer BCA">Transfer BCA</option>
                        <option value="Transfer BNI">Transfer BNI</option>
                        <option value="Tunai / Cash">Tunai / Cash</option>
                        <option value="Kartu Debit / EDC">Kartu Debit / EDC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600">Uraian / Keterangan</label>
                      <input
                        type="text"
                        value={payNotes}
                        onChange={(e) => setPayNotes(e.target.value)}
                        placeholder="e.g. Pembayaran Angsuran 1"
                        className="w-full border border-emerald-300 bg-white rounded px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-1.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPaymentFormOpen(false)}
                      className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-500 bg-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-emerald-700 text-white rounded font-bold hover:bg-emerald-800"
                    >
                      Simpan Transaksi Setoran
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-[10px] font-mono text-gray-400">Kas ID: {activeAccountDetails.id}</span>
              <button
                onClick={() => {
                  setActiveAccountDetails(null);
                  setIsPaymentFormOpen(false);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-4 py-1.5 rounded font-bold"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nominal Biaya Update Modal */}
      {isBiayaFormOpen && activeAccountDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-4 border-b border-gray-200 bg-teal-800 text-white rounded-t-lg">
              <h3 className="font-bold text-xs uppercase font-mono">Set Biaya Pendidikan Siswa</h3>
            </div>
            <form onSubmit={handleUpdateBiayaSubmit} className="p-4 space-y-3">
              <p className="text-xs text-gray-500">
                Ubah nominal total biaya program pendidikan untuk siswa <strong>{activeAccountDetails.siswaNama}</strong>.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Total Biaya Pendidikan (Rp)</label>
                <input
                  type="number"
                  required
                  value={targetBiayaValue}
                  onChange={(e) => setTargetBiayaValue(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBiayaFormOpen(false)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-teal-800 text-white rounded font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Creation Modal */}
      {isAccountFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-4 border-b border-gray-200 bg-teal-800 text-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold text-sm">Buka Rekening Pendidikan Siswa</h3>
              <button onClick={() => setIsAccountFormOpen(false)} className="text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreateAccountSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Siswa Aktif *</label>
                <select
                  required
                  value={newAccSiswaId}
                  onChange={(e) => setNewAccSiswaId(e.target.value)}
                  className="w-full border border-gray-300 bg-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswa.map(s => {
                    const hasAccount = keuangan.some(k => k.siswaId === s.id);
                    return (
                      <option key={s.id} value={s.id} disabled={hasAccount}>
                        {s.nama} ({s.nis}) {hasAccount ? "[Akun Sudah Ada]" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nominal Biaya Pendidikan Pendidikan (Rp)</label>
                <input
                  type="number"
                  required
                  value={newAccTotalBiaya}
                  onChange={(e) => setNewAccTotalBiaya(Number(e.target.value))}
                  placeholder="15000000"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAccountFormOpen(false)}
                  className="px-4 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-teal-800 text-white rounded hover:bg-teal-900 font-semibold"
                >
                  Buka Rekening Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
