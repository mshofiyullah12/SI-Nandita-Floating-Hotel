/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KeuanganSiswa, PembayaranLog, Siswa, SchoolSettings, JobRegister, JobLocationType, JobStatus } from "../types";
import { formatRupiah } from "../utils";
import { Plus, Search, DollarSign, History, AlertCircle, Receipt, Trash2, Check, ExternalLink, MessageSquare } from "lucide-react";
import { formatPaymentNotification, formatReceivableNotification, WhatsAppNotification } from "../utils/whatsapp";

interface KeuanganSheetProps {
  keuangan: KeuanganSiswa[];
  pembayaranLog: PembayaranLog[];
  siswa: Siswa[];
  jobs?: JobRegister[];
  onAddPayment: (newPayment: PembayaranLog) => void;
  onDeletePayment: (paymentId: string) => void;
  onUpdateBiayaSiswa: (keuanganSiswaId: string, newTotalBiaya: number) => void;
  onAddKeuanganAccount: (newAccount: KeuanganSiswa) => void;
  onUpdateJobRegister?: (updatedJob: JobRegister) => void;
  onAddJobRegister?: (newJob: JobRegister) => void;
  onTriggerWhatsApp?: (notif: WhatsAppNotification) => void;
  schoolSettings?: SchoolSettings;
}

export default function KeuanganSheet({
  keuangan,
  pembayaranLog,
  siswa,
  jobs = [],
  onAddPayment,
  onDeletePayment,
  onUpdateBiayaSiswa,
  onAddKeuanganAccount,
  onUpdateJobRegister,
  onAddJobRegister,
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

  // New account state (Internal vs External)
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [accountCategory, setAccountCategory] = useState<"internal" | "external">("internal");
  const [newAccSiswaId, setNewAccSiswaId] = useState("");
  const [newAccTotalBiaya, setNewAccTotalBiaya] = useState(15000000);

  // External student specific account creation form fields
  const [selectedExtJobId, setSelectedExtJobId] = useState<string>("");
  const [extNama, setExtNama] = useState("");
  const [extNoHp, setExtNoHp] = useState("");
  const [extCompany, setExtCompany] = useState("");
  const [extPosition, setExtPosition] = useState("");
  const [extLocationType, setExtLocationType] = useState<JobLocationType>(JobLocationType.LuarNegeri);
  const [extBiayaPemberangkatan, setExtBiayaPemberangkatan] = useState<number>(15000000);
  const [extFeePT, setExtFeePT] = useState<number>(3000000);
  const [extDP, setExtDP] = useState<number>(0);

  const handleSelectExtJob = (jobId: string) => {
    setSelectedExtJobId(jobId);
    if (!jobId) {
      setExtNama("");
      setExtNoHp("");
      setExtCompany("");
      setExtPosition("");
      setExtBiayaPemberangkatan(15000000);
      setExtFeePT(3000000);
      setExtDP(0);
      return;
    }
    const targetJob = jobs.find(j => j.id === jobId);
    if (targetJob) {
      setExtNama(targetJob.siswaNama);
      setExtNoHp(targetJob.noHpExternal || "");
      setExtCompany(targetJob.namaPerusahaan);
      setExtPosition(targetJob.posisi);
      setExtLocationType(targetJob.lokasiTipe);
      setExtBiayaPemberangkatan(targetJob.biayaPemberangkatan || 15000000);
      setExtFeePT(targetJob.feePemberangkatanPT || 3000000);
      setExtDP(targetJob.totalBayarExternal || 0);
    }
  };

  // Detail Modal State for External Student Rincian & Tunggakan
  const [activeExternalDetailJob, setActiveExternalDetailJob] = useState<JobRegister | null>(null);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(3000000);
  const [payMethod, setPayMethod] = useState("Transfer BCA");
  const [payNotes, setPayNotes] = useState("Angsuran Pembayaran");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

  // Biaya Update State
  const [targetBiayaValue, setTargetBiayaValue] = useState<number>(0);

  // External Student and PT Placement States
  const [showExternal, setShowExternal] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  const [activeExternalJob, setActiveExternalJob] = useState<JobRegister | null>(null);
  const [externalPayAmount, setExternalPayAmount] = useState<number>(0);
  const [externalPayNotes, setExternalPayNotes] = useState("Pembayaran Biaya Pemberangkatan");
  const [externalPayDate, setExternalPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [isExternalPaymentFormOpen, setIsExternalPaymentFormOpen] = useState(false);

  // Filters for Internal
  const filteredKeuangan = keuangan.filter(k => {
    const matchesSearch = k.siswaNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || k.statusBayar === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filters and metrics for External
  const externalJobs = (jobs || []).filter(j => j.isExternal);
  const filteredExternalJobs = externalJobs.filter(j => {
    const matchesSearch = 
      j.siswaNama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      j.namaPerusahaan.toLowerCase().includes(searchTerm.toLowerCase());
    const isLunas = (Number(j.biayaPemberangkatan || 0) - Number(j.totalBayarExternal || 0)) <= 0;
    const statusBayar = isLunas ? "Lunas" : (Number(j.totalBayarExternal || 0) > 0 ? "Belum Lunas" : "Belum Bayar");
    const matchesStatus = filterStatus === "All" || statusBayar === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick metrics
  const totalRencana = keuangan.reduce((acc, k) => acc + k.totalBiaya, 0);
  const totalRealisasi = keuangan.reduce((acc, k) => acc + k.totalBayar, 0);
  const totalPiutangActive = keuangan.reduce((acc, k) => acc + k.piutang, 0);

  const totalRencanaExternal = externalJobs.reduce((acc, j) => acc + (j.biayaPemberangkatan || 0), 0);
  const totalRealisasiExternal = externalJobs.reduce((acc, j) => acc + (j.totalBayarExternal || 0), 0);
  const totalPiutangExternal = totalRencanaExternal - totalRealisasiExternal;

  const totalFeePTDalamNegeri = (jobs || []).filter(j => j.lokasiTipe === JobLocationType.DalamNegeri).reduce((acc, j) => acc + (j.feePemberangkatanPT || 0), 0);
  const totalFeePTLuarNegeri = (jobs || []).filter(j => j.lokasiTipe === JobLocationType.LuarNegeri).reduce((acc, j) => acc + (j.feePemberangkatanPT || 0), 0);
  const totalFeePTAll = totalFeePTDalamNegeri + totalFeePTLuarNegeri;

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

    if (accountCategory === "internal") {
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
    } else {
      // External Student Account Creation
      if (!extNama.trim()) {
        alert("Nama siswa eksternal wajib diisi!");
        return;
      }
      if (!extCompany.trim() || !extPosition.trim()) {
        alert("Nama Perusahaan dan Posisi Lowongan wajib diisi!");
        return;
      }

      const regDate = new Date().toISOString().split("T")[0];
      const initialPaid = Number(extDP) || 0;
      const totalCost = Number(extBiayaPemberangkatan) || 0;
      const remainingPiutang = Math.max(totalCost - initialPaid, 0);

      let targetSiswaId = `EXT-${Date.now().toString().slice(-4)}`;
      let keuAccId = `KEU-${Date.now().toString().slice(-4)}`;

      if (selectedExtJobId) {
        const existingJob = jobs.find(j => j.id === selectedExtJobId);
        if (existingJob) {
          targetSiswaId = existingJob.siswaId;

          // Check if already has account
          const duplicate = keuangan.find(k => k.siswaId === existingJob.siswaId || k.siswaNama === existingJob.siswaNama);
          if (duplicate) {
            alert(`Siswa eksternal ${existingJob.siswaNama} sudah memiliki rekening keuangan!`);
            return;
          }

          // Update existing job record with latest financial metrics
          if (onUpdateJobRegister) {
            onUpdateJobRegister({
              ...existingJob,
              biayaPemberangkatan: totalCost,
              feePemberangkatanPT: Number(extFeePT) || 0,
              totalBayarExternal: initialPaid
            });
          }
        }
      } else {
        // Create new JobRegister entry for External candidate
        const jobRegId = `JOB-${Date.now().toString().slice(-4)}`;
        const newJob: JobRegister = {
          id: jobRegId,
          siswaId: targetSiswaId,
          siswaNama: extNama.trim(),
          programStudi: "Eksternal LPK",
          namaPerusahaan: extCompany.trim(),
          posisi: extPosition.trim(),
          lokasiTipe: extLocationType,
          negaraKota: extLocationType === JobLocationType.LuarNegeri ? "Luar Negeri" : "Dalam Negeri",
          gajiPerkiraan: "-",
          tanggalDaftar: regDate,
          status: JobStatus.Daftar,
          isExternal: true,
          noHpExternal: extNoHp.trim(),
          biayaPemberangkatan: totalCost,
          feePemberangkatanPT: Number(extFeePT) || 0,
          totalBayarExternal: initialPaid
        };

        if (onAddJobRegister) {
          onAddJobRegister(newJob);
        }
      }

      // Create KeuanganSiswa record
      const newKeu: KeuanganSiswa = {
        id: keuAccId,
        siswaId: targetSiswaId,
        siswaNama: extNama.trim(),
        totalBiaya: totalCost,
        totalBayar: initialPaid,
        piutang: remainingPiutang,
        statusBayar: remainingPiutang <= 0 ? "Lunas" : initialPaid > 0 ? "Belum Lunas" : "Belum Bayar",
        pembayaranTerakhir: initialPaid > 0 ? regDate : "-"
      };

      onAddKeuanganAccount(newKeu);

      // Log initial payment DP if > 0
      if (initialPaid > 0) {
        const newPayment: PembayaranLog = {
          id: `PAY-${Date.now().toString().slice(-4)}`,
          keuanganSiswaId: keuAccId,
          siswaNama: extNama.trim(),
          tanggalBayar: regDate,
          jumlahBayar: initialPaid,
          metodeBayar: "Transfer Bank",
          keterangan: "Uang Muka (DP) Pembukaan Rekening Pemberangkatan Eksternal"
        };
        onAddPayment(newPayment);
      }

      setIsAccountFormOpen(false);
      // Reset form fields
      setSelectedExtJobId("");
      setExtNama("");
      setExtNoHp("");
      setExtCompany("");
      setExtPosition("");
      setExtBiayaPemberangkatan(15000000);
      setExtFeePT(3000000);
      setExtDP(0);
    }
  };

  const handleRecordExternalPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExternalJob) return;

    if (externalPayAmount <= 0) {
      alert("Jumlah pembayaran harus lebih besar dari Rp 0!");
      return;
    }

    const remaining = (activeExternalJob.biayaPemberangkatan || 0) - (activeExternalJob.totalBayarExternal || 0);
    if (externalPayAmount > remaining) {
      if (!confirm(`Jumlah pembayaran (${formatRupiah(externalPayAmount)}) melebihi sisa tunggakan (${formatRupiah(remaining)}). Tetap lanjutkan?`)) {
        return;
      }
    }

    const nextPaid = (activeExternalJob.totalBayarExternal || 0) + externalPayAmount;
    const updatedJob: JobRegister = {
      ...activeExternalJob,
      totalBayarExternal: nextPaid
    };

    if (onUpdateJobRegister) {
      onUpdateJobRegister(updatedJob);
    }

    // Also find and update / create KeuanganSiswa record to keep in perfect sync!
    let matchingKeu = keuangan.find(k => k.siswaId === activeExternalJob.siswaId || k.siswaNama === activeExternalJob.siswaNama);
    let keuId = matchingKeu?.id;

    if (matchingKeu) {
      const newTotalPaid = matchingKeu.totalBayar + externalPayAmount;
      const newPiutang = Math.max(matchingKeu.totalBiaya - newTotalPaid, 0);
      // Update account state via onUpdateBiayaSiswa logic or onAddPayment
      const newPayment: PembayaranLog = {
        id: `PAY-${Date.now().toString().slice(-4)}`,
        keuanganSiswaId: matchingKeu.id,
        siswaNama: activeExternalJob.siswaNama,
        tanggalBayar: externalPayDate,
        jumlahBayar: externalPayAmount,
        metodeBayar: "Transfer Bank",
        keterangan: externalPayNotes || "Angsuran Pembayaran Eksternal"
      };
      onAddPayment(newPayment);
    } else {
      // Create new KeuanganSiswa for this external student
      keuId = `KEU-${Date.now().toString().slice(-4)}`;
      const totalCost = activeExternalJob.biayaPemberangkatan || 0;
      const newKeu: KeuanganSiswa = {
        id: keuId,
        siswaId: activeExternalJob.siswaId,
        siswaNama: activeExternalJob.siswaNama,
        totalBiaya: totalCost,
        totalBayar: nextPaid,
        piutang: Math.max(totalCost - nextPaid, 0),
        statusBayar: (totalCost - nextPaid) <= 0 ? "Lunas" : "Belum Lunas",
        pembayaranTerakhir: externalPayDate
      };
      onAddKeuanganAccount(newKeu);

      const newPayment: PembayaranLog = {
        id: `PAY-${Date.now().toString().slice(-4)}`,
        keuanganSiswaId: keuId,
        siswaNama: activeExternalJob.siswaNama,
        tanggalBayar: externalPayDate,
        jumlahBayar: externalPayAmount,
        metodeBayar: "Transfer Bank",
        keterangan: externalPayNotes || "Angsuran Pembayaran Eksternal"
      };
      onAddPayment(newPayment);
    }
    
    // Trigger WA notification for external student if onTriggerWhatsApp is defined
    if (onTriggerWhatsApp) {
      const currentRemainingPiutang = Math.max((updatedJob.biayaPemberangkatan || 0) - nextPaid, 0);
      
      const msg = formatPaymentNotification(
        updatedJob.siswaNama,
        externalPayAmount,
        externalPayNotes,
        externalPayDate,
        currentRemainingPiutang,
        schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
        schoolSettings?.waTemplatePembayaran
      );

      onTriggerWhatsApp({
        recipientName: updatedJob.siswaNama,
        phone: updatedJob.noHpExternal || "",
        category: "Pembayaran Siswa",
        message: msg
      });
    }

    setIsExternalPaymentFormOpen(false);
    setActiveExternalJob(null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="keuangan-sheet-container">
      {/* KPI ribbon bar in financial sheet */}
      <div className="bg-teal-50 border-b border-gray-200 p-3 space-y-3 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white border border-teal-200 p-2.5 rounded shadow-sm">
            <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">Rencana Biaya (Internal)</span>
            <span className="text-sm font-mono font-bold text-gray-900 mt-1 block">{formatRupiah(totalRencana)}</span>
          </div>
          <div className="bg-white border border-emerald-200 p-2.5 rounded shadow-sm">
            <span className="text-[10px] font-mono text-emerald-700 uppercase block font-bold">Dana Masuk (Internal)</span>
            <span className="text-sm font-mono font-bold text-green-700 mt-1 block">{formatRupiah(totalRealisasi)}</span>
          </div>
          <div className="bg-white border border-red-200 p-2.5 rounded shadow-sm">
            <span className="text-[10px] font-mono text-red-700 uppercase block font-bold">Tunggakan Siswa (Internal)</span>
            <span className="text-sm font-mono font-bold text-red-600 mt-1 block">{formatRupiah(totalPiutangActive)}</span>
          </div>
          {showExternal ? (
            <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200 p-2.5 rounded shadow-sm">
              <span className="text-[10px] font-mono text-indigo-700 uppercase block font-bold">Total Fee Dari PT (DN / LN)</span>
              <span className="text-sm font-mono font-bold text-indigo-800 mt-1 block">{formatRupiah(totalFeePTAll)}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center p-1 bg-white border border-dashed border-teal-300 rounded shadow-sm">
              <button
                id="btn-create-fin-account"
                onClick={() => setIsAccountFormOpen(true)}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs px-4 py-2 rounded font-bold shadow-sm flex items-center space-x-1.5 w-full justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Buka Rekening Siswa</span>
              </button>
            </div>
          )}
        </div>

        {showExternal && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
            <div className="bg-amber-50/50 border border-amber-200 p-2.5 rounded shadow-sm">
              <span className="text-[10px] font-mono text-amber-800 uppercase block font-bold">Rencana Biaya (Eksternal)</span>
              <span className="text-sm font-mono font-bold text-amber-900 mt-1 block">{formatRupiah(totalRencanaExternal)}</span>
            </div>
            <div className="bg-white border border-amber-200 p-2.5 rounded shadow-sm">
              <span className="text-[10px] font-mono text-amber-700 uppercase block font-bold">Dana Masuk (Eksternal)</span>
              <span className="text-sm font-mono font-bold text-green-700 mt-1 block">{formatRupiah(totalRealisasiExternal)}</span>
            </div>
            <div className="bg-white border border-red-200 p-2.5 rounded shadow-sm">
              <span className="text-[10px] font-mono text-red-700 uppercase block font-bold">Tunggakan Siswa (Eksternal)</span>
              <span className="text-sm font-mono font-bold text-red-600 mt-1 block">{formatRupiah(totalPiutangExternal)}</span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              {activeTab === "internal" ? (
                <button
                  id="btn-create-fin-account"
                  onClick={() => setIsAccountFormOpen(true)}
                  className="bg-teal-800 hover:bg-teal-900 text-white text-xs px-3 py-2 rounded font-bold shadow-sm flex items-center space-x-1 w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buka Rekening Siswa</span>
                </button>
              ) : (
                <div className="text-[11px] text-gray-500 italic bg-amber-50 px-3 py-2 rounded border border-amber-200 w-full text-center font-sans">
                  Mencakup rincian biaya penempatan & keberangkatan
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Switcher & Toggle Filter */}
        <div className="flex items-center justify-between border-b border-gray-200 pt-2 flex-wrap gap-2">
          <div className="flex space-x-1">
            <button
              onClick={() => {
                setActiveTab("internal");
                setFilterStatus("All");
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x transition-all ${
                activeTab === "internal"
                  ? "bg-white border-gray-300 text-teal-800 border-b-2 border-b-white -mb-[1px]"
                  : "bg-gray-100/60 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              Siswa Internal (Spp & Biaya Pendidikan LPK)
            </button>
            {showExternal && (
              <button
                onClick={() => {
                  setActiveTab("external");
                  setFilterStatus("All");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x transition-all ${
                  activeTab === "external"
                    ? "bg-white border-gray-300 text-amber-800 border-b-2 border-b-white -mb-[1px]"
                    : "bg-gray-100/60 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                Siswa Eksternal & Fee PT (Biaya Proses & Penempatan)
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2 pb-2 pr-1">
            <label className="inline-flex items-center space-x-2 text-xs font-bold text-teal-900 cursor-pointer bg-white hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 shadow-xs select-none transition-colors">
              <input
                type="checkbox"
                checked={showExternal}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setShowExternal(checked);
                  if (!checked && activeTab === "external") {
                    setActiveTab("internal");
                  }
                }}
                className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span className="font-sans">Tampilkan Transaksi Siswa Eksternal</span>
            </label>
          </div>
        </div>
      </div>

      {activeTab === "internal" ? (
        <>
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
          <div className="flex-grow overflow-auto bg-gray-50/50">
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
        </>
      ) : (
        <>
          {/* External Placements Tool Bar */}
          <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                id="btn-pay-external"
                disabled={!selectedRowId || !jobs.some(j => j.id === selectedRowId && j.isExternal)}
                onClick={() => {
                  const job = jobs.find(j => j.id === selectedRowId && j.isExternal);
                  if (job) {
                    setActiveExternalJob(job);
                    setExternalPayAmount(Number(job.biayaPemberangkatan || 0) - Number(job.totalBayarExternal || 0));
                    setIsExternalPaymentFormOpen(true);
                  }
                }}
                className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-bold ${
                  selectedRowId && jobs.some(j => j.id === selectedRowId && j.isExternal)
                    ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm animate-pulse"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Input Pembayaran Siswa Eksternal (B)</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari siswa / perusah..."
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

          {/* Spreadsheet Formula Bar for External Placements */}
          <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-600">
            <div className="bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-bold text-amber-800 min-w-[50px] text-center">
              {selectedRowId ? `EXT-${jobs.findIndex(j => j.id === selectedRowId) + 1}` : "A1"}
            </div>
            <div className="text-gray-400 font-bold">fx</div>
            <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
              {selectedRowId && jobs.find(j => j.id === selectedRowId && j.isExternal)
                ? `=EXT_PLACEMENT(BIAYA_DIPROSES: ${formatRupiah(jobs.find(j => j.id === selectedRowId)?.biayaPemberangkatan || 0)}, SUDAH_BAYAR: ${formatRupiah(jobs.find(j => j.id === selectedRowId)?.totalBayarExternal || 0)}, SISA: ${formatRupiah((jobs.find(j => j.id === selectedRowId)?.biayaPemberangkatan || 0) - (jobs.find(j => j.id === selectedRowId)?.totalBayarExternal || 0))}, COMMISSION_FEE_PT: ${formatRupiah(jobs.find(j => j.id === selectedRowId)?.feePemberangkatanPT || 0)})`
                : "Formula Bar: Formula memantau realisasi pembayaran biaya penempatan siswa luar jaringan LPK Nandita."
              }
            </div>
          </div>

          {/* Table Ledger view for External Placements */}
          <div className="flex-grow overflow-auto bg-gray-50/50">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-200 text-xs font-mono text-amber-800">
                  <th className="w-10 text-center border-r border-amber-200 select-none py-1">#</th>
                  <th className="px-3 py-1 border-r border-amber-200 w-32">ID Daftar</th>
                  <th className="px-3 py-1 border-r border-amber-200">Nama Siswa Eksternal (A)</th>
                  <th className="px-3 py-1 border-r border-amber-200">Mitra Perusahaan / Kapal (B)</th>
                  <th className="px-3 py-1 border-r border-amber-200 w-32 text-center">Bagian Penempatan</th>
                  <th className="px-3 py-1 border-r border-amber-200 w-44 text-right">Biaya Pemberangkatan (C)</th>
                  <th className="px-3 py-1 border-r border-amber-200 w-40 text-right text-emerald-700">Telah Dibayar (D)</th>
                  <th className="px-3 py-1 border-r border-amber-200 w-40 text-right text-red-600">Sisa Tunggakan (E)</th>
                  <th className="px-3 py-1 border-r border-amber-200 w-40 text-right text-indigo-700">Fee PT Mitra</th>
                  <th className="px-3 py-1 border-r border-amber-200 w-28 text-center">Status Rekrut</th>
                  <th className="px-3 py-1 text-center w-40">Aksi Pembayaran</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {filteredExternalJobs.map((job, index) => {
                  const isSelected = selectedRowId === job.id;
                  const sisaTunggakan = Number(job.biayaPemberangkatan || 0) - Number(job.totalBayarExternal || 0);
                  const isLunas = sisaTunggakan <= 0;
                  const statusBayar = isLunas ? "Lunas" : (Number(job.totalBayarExternal || 0) > 0 ? "Belum Lunas" : "Belum Bayar");
                  return (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedRowId(job.id)}
                      className={`border-b border-gray-200 cursor-pointer select-none hover:bg-amber-50/10 ${
                        isSelected ? "bg-amber-100/60 border-2 border-amber-600" : ""
                      }`}
                    >
                      <td className="w-10 text-center bg-gray-50 border-r border-gray-200 text-[10px] text-gray-400 py-2.5">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200 font-bold text-gray-600">
                        {job.id}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200 font-sans font-semibold text-gray-950">
                        <div className="flex flex-col">
                          <span>{job.siswaNama}</span>
                          <span className="text-[10px] text-gray-500">{job.noHpExternal || "Tidak ada No.HP"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200 font-sans text-gray-800">
                        <div className="flex flex-col">
                          <span className="font-semibold">{job.namaPerusahaan}</span>
                          <span className="text-[10px] text-gray-500">{job.posisi}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.lokasiTipe === JobLocationType.LuarNegeri ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {job.lokasiTipe}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200 text-right font-semibold text-gray-800">
                        {formatRupiah(job.biayaPemberangkatan || 0)}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200 text-right font-semibold text-emerald-700">
                        {formatRupiah(job.totalBayarExternal || 0)}
                      </td>
                      <td className={`px-3 py-2 border-r border-gray-200 text-right font-bold ${sisaTunggakan > 0 ? "text-red-600 bg-red-50/20" : "text-green-700"}`}>
                        {formatRupiah(sisaTunggakan)}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200 text-right font-semibold text-indigo-700">
                        {formatRupiah(job.feePemberangkatanPT || 0)}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200 text-center font-sans text-[10px] font-bold text-gray-600">
                        {job.status}
                      </td>
                      <td className="px-3 py-2 text-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveExternalDetailJob(job);
                          }}
                          className="px-2 py-0.5 text-[10px] bg-[#001f3f] text-white font-sans font-semibold rounded hover:bg-slate-900 cursor-pointer"
                        >
                          Rincian & Tunggakan
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveExternalJob(job);
                            setExternalPayAmount(sisaTunggakan);
                            setIsExternalPaymentFormOpen(true);
                          }}
                          className="px-2 py-0.5 text-[10px] bg-amber-600 text-white font-sans font-semibold rounded hover:bg-amber-700 cursor-pointer"
                        >
                          Bayar
                        </button>
                        {sisaTunggakan > 0 && job.noHpExternal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const msg = formatReceivableNotification(
                                job.siswaNama,
                                job.biayaPemberangkatan || 0,
                                sisaTunggakan,
                                schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
                                schoolSettings?.waTemplateTagihanSiswa
                              );
                              if (onTriggerWhatsApp) {
                                onTriggerWhatsApp({
                                  recipientName: job.siswaNama,
                                  phone: job.noHpExternal || "",
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
                {filteredExternalJobs.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-gray-400 bg-gray-50">
                      Tidak ada rincian dana keberangkatan siswa eksternal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
            <div>Total Data Keuangan Eksternal: {filteredExternalJobs.length} Pendaftaran</div>
            <div>LPK Nandita Placement Revenue Ledger</div>
          </div>
        </>
      )}

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

      {/* Account Creation Modal (Internal & Eksternal) */}
      {isAccountFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-teal-800 text-white rounded-t-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Buka Rekening Keuangan Siswa</h3>
                <p className="text-[10px] text-teal-100 mt-0.5">Buat akun pos tagihan untuk Siswa Internal LPK atau Siswa Eksternal Job Placement</p>
              </div>
              <button onClick={() => setIsAccountFormOpen(false)} className="text-white hover:text-gray-200">✕</button>
            </div>

            {/* Category Toggle Header */}
            <div className="bg-gray-100 p-2 border-b border-gray-200 flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => setAccountCategory("internal")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  accountCategory === "internal"
                    ? "bg-teal-800 text-white shadow"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Siswa Internal LPK
              </button>
              <button
                type="button"
                onClick={() => setAccountCategory("external")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  accountCategory === "external"
                    ? "bg-amber-700 text-white shadow"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Siswa Eksternal LPK
              </button>
            </div>
            
            <form onSubmit={handleCreateAccountSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
              {accountCategory === "internal" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Siswa Internal Aktif *</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nominal Biaya Pendidikan (Rp)</label>
                    <input
                      type="number"
                      required
                      value={newAccTotalBiaya}
                      onChange={(e) => setNewAccTotalBiaya(Number(e.target.value))}
                      placeholder="15000000"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-xs text-amber-900 mb-2">
                    Buka rekening untuk siswa eksternal. Anda dapat memilih siswa yang sudah terdaftar di <strong>Job Register / Lowongan</strong> atau mendaftarkan siswa eksternal baru.
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-bold text-amber-900 mb-1">Pilih Siswa Eksternal Aktif (dari Job Register)</label>
                    <select
                      value={selectedExtJobId}
                      onChange={(e) => handleSelectExtJob(e.target.value)}
                      className="w-full border border-amber-300 bg-amber-50/50 rounded px-2.5 py-1.5 text-xs font-bold text-amber-950 focus:outline-none"
                    >
                      <option value="">-- (+ Input / Daftar Siswa Eksternal Baru) --</option>
                      {jobs.filter(j => j.isExternal).map(j => {
                        const hasAccount = keuangan.some(k => k.siswaId === j.siswaId || k.siswaNama === j.siswaNama);
                        return (
                          <option key={j.id} value={j.id} disabled={hasAccount}>
                            {j.siswaNama} - {j.namaPerusahaan} ({j.posisi}) {hasAccount ? "[Akun Rekening Sudah Ada]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nama Siswa Eksternal *</label>
                      <input
                        type="text"
                        required
                        value={extNama}
                        onChange={(e) => setExtNama(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">No. HP / WhatsApp</label>
                      <input
                        type="text"
                        value={extNoHp}
                        onChange={(e) => setExtNoHp(e.target.value)}
                        placeholder="081234567890"
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Mitra Perusahaan / Kapal *</label>
                      <input
                        type="text"
                        required
                        value={extCompany}
                        onChange={(e) => setExtCompany(e.target.value)}
                        placeholder="Contoh: Royal Caribbean / PT Maritime"
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Posisi Lowongan *</label>
                      <input
                        type="text"
                        required
                        value={extPosition}
                        onChange={(e) => setExtPosition(e.target.value)}
                        placeholder="Contoh: Housekeeping Steward"
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Lokasi Penempatan</label>
                    <select
                      value={extLocationType}
                      onChange={(e) => setExtLocationType(e.target.value as JobLocationType)}
                      className="w-full border border-gray-300 bg-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value={JobLocationType.LuarNegeri}>Luar Negeri (Kapal Pesiar / Hotel Intl)</option>
                      <option value={JobLocationType.DalamNegeri}>Dalam Negeri (Hotel / Resort Lokal)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-3 mt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Biaya Pemberangkatan (Rp) *</label>
                      <input
                        type="number"
                        required
                        value={extBiayaPemberangkatan}
                        onChange={(e) => setExtBiayaPemberangkatan(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Fee PT Mitra (Rp)</label>
                      <input
                        type="number"
                        value={extFeePT}
                        onChange={(e) => setExtFeePT(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Uang Muka / DP (Rp)</label>
                      <input
                        type="number"
                        value={extDP}
                        onChange={(e) => setExtDP(Number(e.target.value))}
                        placeholder="0"
                        className="w-full border border-emerald-400 bg-emerald-50 rounded px-2 py-1.5 text-xs font-bold text-emerald-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 flex justify-end space-x-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAccountFormOpen(false)}
                  className="px-4 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs text-white rounded font-bold cursor-pointer ${
                    accountCategory === "internal" ? "bg-teal-800 hover:bg-teal-900" : "bg-amber-700 hover:bg-amber-800"
                  }`}
                >
                  {accountCategory === "internal" ? "Buka Rekening Internal" : "Buka Rekening Eksternal & Sync Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* External Student Payment Modal */}
      {isExternalPaymentFormOpen && activeExternalJob && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm animate-scale-in">
            <div className="p-4 border-b border-gray-200 bg-amber-700 text-white rounded-t-lg">
              <h3 className="font-bold text-xs uppercase font-mono">Input Setoran Siswa Eksternal</h3>
            </div>
            <form onSubmit={handleRecordExternalPaymentSubmit} className="p-4 space-y-3">
              <p className="text-xs text-gray-500">
                Catat angsuran / pelunasan biaya proses keberangkatan untuk siswa eksternal <strong>{activeExternalJob.siswaNama}</strong>.
              </p>
              
              <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex justify-between">
                  <span>Total Biaya:</span>
                  <span className="font-bold font-mono">{formatRupiah(activeExternalJob.biayaPemberangkatan || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sudah Dibayar:</span>
                  <span className="font-bold font-mono text-emerald-700">{formatRupiah(activeExternalJob.totalBayarExternal || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-amber-200 pt-1 mt-1">
                  <span>Sisa Tunggakan:</span>
                  <span className="font-bold font-mono text-red-600">
                    {formatRupiah((activeExternalJob.biayaPemberangkatan || 0) - (activeExternalJob.totalBayarExternal || 0))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Jumlah Setoran (Rp) *</label>
                <input
                  type="number"
                  required
                  value={externalPayAmount || ""}
                  onChange={(e) => setExternalPayAmount(Number(e.target.value))}
                  placeholder="e.g. 5000000"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Tanggal Bayar</label>
                <input
                  type="date"
                  required
                  value={externalPayDate}
                  onChange={(e) => setExternalPayDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Keterangan Pembayaran</label>
                <input
                  type="text"
                  value={externalPayNotes}
                  onChange={(e) => setExternalPayNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsExternalPaymentFormOpen(false);
                    setActiveExternalJob(null);
                  }}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-500 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-amber-700 text-white rounded font-bold hover:bg-amber-800"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Modal: Rincian & Tunggakan Siswa Eksternal */}
      {activeExternalDetailJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-[#001f3f] text-white p-4 flex justify-between items-center border-b border-slate-700">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded">
                    Siswa Eksternal Job
                  </span>
                  <span className="text-xs font-mono text-slate-300">ID: {activeExternalDetailJob.id}</span>
                </div>
                <h3 className="text-base font-bold font-display mt-1">
                  Rincian & Tunggakan Keuangan: {activeExternalDetailJob.siswaNama}
                </h3>
              </div>
              <button
                onClick={() => setActiveExternalDetailJob(null)}
                className="text-slate-300 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Student & Job Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Nama Siswa:</span>
                    <p className="font-bold text-slate-900">{activeExternalDetailJob.siswaNama}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">No. WhatsApp / HP:</span>
                    <p className="font-bold text-slate-900">{activeExternalDetailJob.noHpExternal || "-"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Mitra Perusahaan / Kapal:</span>
                    <p className="font-bold text-slate-900">{activeExternalDetailJob.namaPerusahaan}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Posisi Lowongan:</span>
                    <p className="font-bold text-slate-900">{activeExternalDetailJob.posisi}</p>
                  </div>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              {(() => {
                const totalCost = activeExternalDetailJob.biayaPemberangkatan || 0;
                const totalPaid = activeExternalDetailJob.totalBayarExternal || 0;
                const arrears = Math.max(totalCost - totalPaid, 0);
                const isLunas = arrears <= 0;

                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <span className="text-[10px] text-blue-700 uppercase font-mono font-bold block">Total Biaya Proses</span>
                      <span className="text-base font-black font-mono text-blue-900">{formatRupiah(totalCost)}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                      <span className="text-[10px] text-emerald-700 uppercase font-mono font-bold block">Telah Dibayar</span>
                      <span className="text-base font-black font-mono text-emerald-900">{formatRupiah(totalPaid)}</span>
                    </div>
                    <div className={`p-3 rounded-lg border ${isLunas ? "bg-teal-50 border-teal-200" : "bg-red-50 border-red-200"}`}>
                      <span className={`text-[10px] uppercase font-mono font-bold block ${isLunas ? "text-teal-700" : "text-red-700"}`}>
                        {isLunas ? "Status Pelunasan" : "Sisa Tunggakan"}
                      </span>
                      <span className={`text-base font-black font-mono ${isLunas ? "text-teal-900" : "text-red-800"}`}>
                        {isLunas ? "LUNAS" : formatRupiah(arrears)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment History Log */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase font-mono mb-2 flex items-center">
                  <Receipt className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                  Riwayat Setoran / Angsuran Masuk
                </h4>
                {(() => {
                  const matchingKeu = keuangan.find(k => k.siswaId === activeExternalDetailJob.siswaId || k.siswaNama === activeExternalDetailJob.siswaNama);
                  const logs = matchingKeu
                    ? pembayaranLog.filter(p => p.keuanganSiswaId === matchingKeu.id)
                    : pembayaranLog.filter(p => p.siswaNama === activeExternalDetailJob.siswaNama);

                  if (logs.length === 0) {
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-xs text-slate-400">
                        Belum ada riwayat setoran tercatat untuk siswa eksternal ini.
                      </div>
                    );
                  }

                  return (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="p-2">#</th>
                            <th className="p-2">Tanggal</th>
                            <th className="p-2">Metode</th>
                            <th className="p-2 text-right">Jumlah Setoran</th>
                            <th className="p-2">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {logs.map((log, i) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="p-2 text-slate-400">{i + 1}</td>
                              <td className="p-2 text-slate-700">{log.tanggalBayar}</td>
                              <td className="p-2 text-slate-600">{log.metodeBayar}</td>
                              <td className="p-2 text-right font-bold text-emerald-700">{formatRupiah(log.jumlahBayar)}</td>
                              <td className="p-2 text-slate-500 truncate max-w-[150px]">{log.keterangan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center">
              <button
                onClick={() => {
                  const totalCost = activeExternalDetailJob.biayaPemberangkatan || 0;
                  const totalPaid = activeExternalDetailJob.totalBayarExternal || 0;
                  const arrears = Math.max(totalCost - totalPaid, 0);
                  const msg = formatReceivableNotification(
                    activeExternalDetailJob.siswaNama,
                    totalCost,
                    arrears,
                    schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
                    schoolSettings?.waTemplateTagihanSiswa
                  );
                  if (onTriggerWhatsApp) {
                    onTriggerWhatsApp({
                      recipientName: activeExternalDetailJob.siswaNama,
                      phone: activeExternalDetailJob.noHpExternal || "",
                      category: "Tunggakan Siswa",
                      message: msg
                    });
                  }
                }}
                disabled={!activeExternalDetailJob.noHpExternal}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Rincian WA</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const totalCost = activeExternalDetailJob.biayaPemberangkatan || 0;
                    const totalPaid = activeExternalDetailJob.totalBayarExternal || 0;
                    const arrears = Math.max(totalCost - totalPaid, 0);
                    setActiveExternalJob(activeExternalDetailJob);
                    setExternalPayAmount(arrears);
                    setIsExternalPaymentFormOpen(true);
                  }}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700 flex items-center space-x-1 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Input Setoran / Bayar</span>
                </button>
                <button
                  onClick={() => setActiveExternalDetailJob(null)}
                  className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-300 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
