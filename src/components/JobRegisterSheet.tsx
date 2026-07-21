/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { JobRegister, Siswa, ProgramStudi, JobLocationType, JobStatus, KeuanganSiswa, PembayaranLog, SchoolSettings } from "../types";
import { Plus, Search, Trash2, Ship, Building, Briefcase, Globe, Edit, DollarSign, Receipt, MessageSquare, Wallet } from "lucide-react";
import { formatRupiah } from "../utils";
import { formatPaymentNotification, formatReceivableNotification, WhatsAppNotification } from "../utils/whatsapp";

interface JobRegisterSheetProps {
  jobs: JobRegister[];
  siswa: Siswa[];
  keuangan?: KeuanganSiswa[];
  pembayaranLog?: PembayaranLog[];
  onAddJobRegister: (newJob: JobRegister) => void;
  onUpdateJobRegister: (updatedJob: JobRegister) => void;
  onDeleteJobRegister: (id: string) => void;
  onAddPayment?: (newPayment: PembayaranLog) => void;
  onAddKeuanganAccount?: (newAccount: KeuanganSiswa) => void;
  onTriggerWhatsApp?: (notif: WhatsAppNotification) => void;
  schoolSettings?: SchoolSettings;
}

export default function JobRegisterSheet({
  jobs,
  siswa,
  keuangan = [],
  pembayaranLog = [],
  onAddJobRegister,
  onUpdateJobRegister,
  onDeleteJobRegister,
  onAddPayment,
  onAddKeuanganAccount,
  onTriggerWhatsApp,
  schoolSettings
}: JobRegisterSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [isExternal, setIsExternal] = useState(false);
  const [selectedSiswaId, setSelectedSiswaId] = useState("");
  const [externalSiswaNama, setExternalSiswaNama] = useState("");
  const [externalNoHp, setExternalNoHp] = useState("");
  const [externalProgramStudi, setExternalProgramStudi] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [positionName, setPositionName] = useState("");
  const [locationType, setLocationType] = useState<JobLocationType>(JobLocationType.LuarNegeri);
  const [countryCity, setCountryCity] = useState("Miami, USA");
  const [salaryEstimate, setSalaryEstimate] = useState("USD 1,500 / month");
  const [regDate, setRegDate] = useState(new Date().toISOString().split("T")[0]);
  const [jobStatus, setJobStatus] = useState<JobStatus>(JobStatus.Daftar);

  // Financial fields for placement
  const [biayaPemberangkatan, setBiayaPemberangkatan] = useState<number>(0);
  const [feePemberangkatanPT, setFeePemberangkatanPT] = useState<number>(0);
  const [totalBayarExternal, setTotalBayarExternal] = useState<number>(0);

  // Filter
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.siswaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.namaPerusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.posisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.programStudi && String(j.programStudi).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = filterLocation === "All" || j.lokasiTipe === filterLocation;
    const matchesStatus = filterStatus === "All" || j.status === filterStatus;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const resetForm = () => {
    setSelectedSiswaId("");
    setCompanyName("");
    setPositionName("");
    setLocationType(JobLocationType.LuarNegeri);
    setCountryCity("Miami, USA");
    setSalaryEstimate("USD 1,500 / month");
    setRegDate(new Date().toISOString().split("T")[0]);
    setJobStatus(JobStatus.Daftar);
    setIsExternal(false);
    setExternalSiswaNama("");
    setExternalNoHp("");
    setExternalProgramStudi("");
    setBiayaPemberangkatan(0);
    setFeePemberangkatanPT(0);
    setTotalBayarExternal(0);
    setIsEditMode(false);
    setEditingJobId(null);
  };

  const handleOpenEdit = (job: JobRegister) => {
    setEditingJobId(job.id);
    setIsEditMode(true);
    setIsExternal(!!job.isExternal);
    
    if (job.isExternal) {
      setExternalSiswaNama(job.siswaNama);
      setExternalNoHp(job.noHpExternal || "");
      setExternalProgramStudi(String(job.programStudi));
      setSelectedSiswaId("");
    } else {
      setSelectedSiswaId(job.siswaId);
      setExternalSiswaNama("");
      setExternalNoHp("");
      setExternalProgramStudi("");
    }

    setCompanyName(job.namaPerusahaan);
    setPositionName(job.posisi);
    setLocationType(job.lokasiTipe);
    setCountryCity(job.negaraKota);
    setSalaryEstimate(job.gajiPerkiraan);
    setRegDate(job.tanggalDaftar);
    setJobStatus(job.status);
    setBiayaPemberangkatan(job.biayaPemberangkatan || 0);
    setFeePemberangkatanPT(job.feePemberangkatanPT || 0);
    setTotalBayarExternal(job.totalBayarExternal || 0);
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isExternal && !selectedSiswaId) {
      alert("Pilih siswa terlebih dahulu!");
      return;
    }
    if (isExternal && !externalSiswaNama.trim()) {
      alert("Nama siswa eksternal wajib diisi!");
      return;
    }
    if (!companyName.trim() || !positionName.trim()) {
      alert("Nama Perusahaan dan Posisi wajib diisi!");
      return;
    }

    let targetSiswaNama = "";
    let targetSiswaId = "";
    let targetProgramStudi = "";

    if (isExternal) {
      targetSiswaNama = externalSiswaNama.trim();
      targetSiswaId = `EXT-${Date.now().toString().slice(-4)}`;
      targetProgramStudi = externalProgramStudi.trim() || "Eksternal LPK";
    } else {
      const targetSiswa = siswa.find(s => s.id === selectedSiswaId);
      if (!targetSiswa) return;
      targetSiswaNama = targetSiswa.nama;
      targetSiswaId = selectedSiswaId;
      targetProgramStudi = targetSiswa.programStudi;
    }

    if (isEditMode && editingJobId) {
      const updatedRecord: JobRegister = {
        id: editingJobId,
        siswaId: isExternal ? (jobs.find(j => j.id === editingJobId)?.siswaId || targetSiswaId) : selectedSiswaId,
        siswaNama: targetSiswaNama,
        programStudi: targetProgramStudi,
        namaPerusahaan: companyName,
        posisi: positionName,
        lokasiTipe: locationType,
        negaraKota: countryCity,
        gajiPerkiraan: salaryEstimate,
        tanggalDaftar: regDate,
        status: jobStatus,
        isExternal,
        noHpExternal: isExternal ? externalNoHp : undefined,
        biayaPemberangkatan: isExternal ? Number(biayaPemberangkatan) : undefined,
        feePemberangkatanPT: Number(feePemberangkatanPT),
        totalBayarExternal: isExternal ? Number(totalBayarExternal) : undefined
      };
      onUpdateJobRegister(updatedRecord);
    } else {
      const newRecord: JobRegister = {
        id: `JOB-${Date.now().toString().slice(-4)}`,
        siswaId: targetSiswaId,
        siswaNama: targetSiswaNama,
        programStudi: targetProgramStudi,
        namaPerusahaan: companyName,
        posisi: positionName,
        lokasiTipe: locationType,
        negaraKota: countryCity,
        gajiPerkiraan: salaryEstimate,
        tanggalDaftar: regDate,
        status: jobStatus,
        isExternal,
        noHpExternal: isExternal ? externalNoHp : undefined,
        biayaPemberangkatan: isExternal ? Number(biayaPemberangkatan) : undefined,
        feePemberangkatanPT: Number(feePemberangkatanPT),
        totalBayarExternal: isExternal ? 0 : undefined
      };
      onAddJobRegister(newRecord);

      // Auto create financial account if external student and callback provided
      if (isExternal && onAddKeuanganAccount) {
        const totalCost = Number(biayaPemberangkatan) || 0;
        const initialPaid = 0;
        const newKeu: KeuanganSiswa = {
          id: `KEU-${Date.now().toString().slice(-4)}`,
          siswaId: targetSiswaId,
          siswaNama: targetSiswaNama,
          totalBiaya: totalCost,
          totalBayar: initialPaid,
          piutang: totalCost,
          statusBayar: totalCost === 0 ? "Lunas" : "Belum Bayar",
          pembayaranTerakhir: "-"
        };
        onAddKeuanganAccount(newKeu);
      }
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleQuickPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetailJob) return;

    const payVal = Number(quickPayAmount) || 0;
    if (payVal <= 0) {
      alert("Masukkan nominal setoran pembayaran!");
      return;
    }

    const currentPaid = activeDetailJob.totalBayarExternal || 0;
    const newTotalPaid = currentPaid + payVal;

    // Update JobRegister
    const updatedJob: JobRegister = {
      ...activeDetailJob,
      totalBayarExternal: newTotalPaid
    };
    onUpdateJobRegister(updatedJob);

    // Sync KeuanganSiswa
    const matchingKeu = keuangan.find(k => k.siswaId === activeDetailJob.siswaId || k.siswaNama === activeDetailJob.siswaNama);
    let keuId = matchingKeu?.id;

    if (matchingKeu) {
      const totalCost = activeDetailJob.biayaPemberangkatan || matchingKeu.totalBiaya || 0;
      const updatedTotalBayar = (matchingKeu.totalBayar || 0) + payVal;
      const newPiutang = Math.max(totalCost - updatedTotalBayar, 0);

      matchingKeu.totalBayar = updatedTotalBayar;
      matchingKeu.piutang = newPiutang;
      matchingKeu.statusBayar = newPiutang <= 0 ? "Lunas" : "Belum Lunas";
      matchingKeu.pembayaranTerakhir = quickPayDate;
    } else if (onAddKeuanganAccount) {
      const totalCost = activeDetailJob.biayaPemberangkatan || 0;
      const newPiutang = Math.max(totalCost - newTotalPaid, 0);
      const newKeu: KeuanganSiswa = {
        id: `KEU-${Date.now().toString().slice(-4)}`,
        siswaId: activeDetailJob.siswaId,
        siswaNama: activeDetailJob.siswaNama,
        totalBiaya: totalCost,
        totalBayar: newTotalPaid,
        piutang: newPiutang,
        statusBayar: newPiutang <= 0 ? "Lunas" : "Belum Lunas",
        pembayaranTerakhir: quickPayDate
      };
      onAddKeuanganAccount(newKeu);
      keuId = newKeu.id;
    }

    // Add Payment Log
    if (onAddPayment) {
      const newLog: PembayaranLog = {
        id: `PAY-${Date.now().toString().slice(-4)}`,
        keuanganSiswaId: keuId || `KEU-${activeDetailJob.id}`,
        siswaNama: activeDetailJob.siswaNama,
        tanggalBayar: quickPayDate,
        jumlahBayar: payVal,
        metodeBayar: "Transfer Bank",
        keterangan: quickPayNotes || "Setoran Angsuran Siswa Eksternal"
      };
      onAddPayment(newLog);
    }

    // Trigger WhatsApp notification if available
    if (onTriggerWhatsApp) {
      const msg = formatPaymentNotification(
        activeDetailJob.siswaNama,
        payVal,
        quickPayNotes,
        schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
        schoolSettings?.waTemplatePembayaran
      );
      onTriggerWhatsApp({
        recipientName: activeDetailJob.siswaNama,
        phone: activeDetailJob.noHpExternal || "",
        category: "Pembayaran Setoran",
        message: msg
      });
    }

    alert(`Setoran Rp ${payVal.toLocaleString("id-ID")} berhasil dicatat & disinkronkan!`);
    setIsQuickPayOpen(false);
    setActiveDetailJob(updatedJob);
  };

  const handleDirectStatusChange = (jobRecord: JobRegister, nextStatus: JobStatus) => {
    onUpdateJobRegister({
      ...jobRecord,
      status: nextStatus
    });
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="job-sheet-container">
      {/* Quick placement stats */}
      <div className="bg-sky-50 border-b border-gray-200 p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white border border-sky-200 p-2 rounded shadow-sm">
          <span className="text-[9px] font-bold text-sky-800 uppercase block">Karir Luar Negeri (Kapal Pesiar/Hotel)</span>
          <span className="text-sm font-bold font-mono block text-gray-950">
            {jobs.filter(j => j.lokasiTipe === JobLocationType.LuarNegeri).length} Pendaftar
          </span>
        </div>
        <div className="bg-white border border-blue-200 p-2 rounded shadow-sm">
          <span className="text-[9px] font-bold text-blue-800 uppercase block">Karir Dalam Negeri (Hotel Nasional)</span>
          <span className="text-sm font-bold font-mono block text-gray-950">
            {jobs.filter(j => j.lokasiTipe === JobLocationType.DalamNegeri).length} Pendaftar
          </span>
        </div>
        <div className="bg-white border border-emerald-200 p-2 rounded shadow-sm">
          <span className="text-[9px] font-bold text-emerald-800 uppercase block">Total Sukses Placed (Lolos & Berangkat)</span>
          <span className="text-sm font-bold font-mono block text-green-700">
            {jobs.filter(j => j.status === JobStatus.Lolos || j.status === JobStatus.Berangkat).length} Siswa
          </span>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              resetForm();
              setIsExternal(true);
              setIsFormOpen(true);
            }}
            className="bg-amber-700 hover:bg-amber-800 text-white text-xs px-3 py-2 rounded font-bold shadow-sm flex items-center space-x-1 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Buka Rekening Siswa Eksternal</span>
          </button>
          <button
            id="btn-add-job-reg"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="bg-sky-800 hover:bg-sky-950 text-white text-xs px-3 py-2 rounded font-bold shadow-sm flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Siswa ke Lowongan</span>
          </button>
        </div>
      </div>

      {/* Excel Ribbon */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectedRowId && (
            <>
              <button
                id="btn-edit-job"
                onClick={() => {
                  const job = jobs.find(j => j.id === selectedRowId);
                  if (job) handleOpenEdit(job);
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded border border-blue-200 font-semibold flex items-center space-x-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Data Terpilih</span>
              </button>
              <button
                id="btn-delete-job"
                onClick={() => {
                  if (confirm("Hapus baris pendaftaran kerja ini?")) {
                    onDeleteJobRegister(selectedRowId);
                    setSelectedRowId(null);
                  }
                }}
                className="bg-red-50 hover:bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded border border-red-200 font-semibold"
              >
                Hapus Baris Terpilih
              </button>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa, perusahaan, posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-48 focus:outline-none bg-white"
            />
          </div>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none bg-white"
          >
            <option value="All">Semua Lokasi</option>
            <option value={JobLocationType.DalamNegeri}>Dalam Negeri</option>
            <option value={JobLocationType.LuarNegeri}>Luar Negeri (Internasional/Kapal)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none bg-white"
          >
            <option value="All">Semua Status Karir</option>
            {Object.values(JobStatus).map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-600">
        <div className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-gray-700 min-w-[50px] text-center">
          {selectedRowId ? `JOB-${jobs.findIndex(j => j.id === selectedRowId) + 1}` : "A1"}
        </div>
        <div className="text-gray-400 font-bold">fx</div>
        <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
          {selectedRowId 
            ? `=JOB_FUNNEL(STUDENT: "${jobs.find(j => j.id === selectedRowId)?.siswaNama}", COMPANY: "${jobs.find(j => j.id === selectedRowId)?.namaPerusahaan}", POSITION: "${jobs.find(j => j.id === selectedRowId)?.posisi}", LOC: "${jobs.find(j => j.id === selectedRowId)?.lokasiTipe}", STATUS: "${jobs.find(j => j.id === selectedRowId)?.status}")`
            : "Formula Bar: Formula merekam progress rekrutmen alumni dan siswa LPK Nandita di jaringan hotel & kapal pesiar mitra."
          }
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="flex-grow overflow-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-mono text-gray-500">
              <th className="w-10 text-center border-r border-gray-300 select-none py-1">#</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32">ID Daftar</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Siswa (A)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36">Asal Program Studi (B)</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Perusahaan / Kapal (C)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-44">Posisi Dilamar (D)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36">Tipe Lokasi (E)</th>
              <th className="px-3 py-1 border-r border-gray-300">Negara/Kota (F)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36 text-right">Biaya Proses / Berangkat</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36 text-right">Fee PT (DN/LN)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36 text-right">Sisa Tagihan (Eksternal)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36 text-center">Status Perekrutan (G)</th>
              <th className="px-3 py-1 text-center w-28">Tanggal Daftar</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono text-gray-700">
            {filteredJobs.map((job, index) => {
              const isSelected = selectedRowId === job.id;
              const sisaTagihan = job.isExternal ? (Number(job.biayaPemberangkatan || 0) - Number(job.totalBayarExternal || 0)) : 0;
              return (
                <tr
                  key={job.id}
                  onClick={() => setSelectedRowId(job.id)}
                  className={`border-b border-gray-200 cursor-pointer select-none hover:bg-sky-50/20 ${
                    isSelected ? "bg-sky-100/60 border-2 border-sky-600" : ""
                  }`}
                >
                  <td className="w-10 text-center bg-gray-50 border-r border-gray-300 text-[10px] text-gray-400 py-2.5">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-bold">
                    {job.id}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-gray-950">
                    <div className="flex flex-col">
                      <span>{job.siswaNama}</span>
                      {job.isExternal ? (
                        <span className="inline-block bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 w-max font-sans">
                          Siswa Eksternal LPK {job.noHpExternal ? `(${job.noHpExternal})` : ""}
                        </span>
                      ) : (
                        <span className="inline-block bg-sky-100 text-sky-800 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 w-max font-sans">
                          Siswa Internal LPK
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-sans">
                    {job.programStudi}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-medium text-sky-950 flex items-center">
                    {job.lokasiTipe === JobLocationType.LuarNegeri ? (
                      <Ship className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                    ) : (
                      <Building className="w-3.5 h-3.5 text-teal-600 mr-1.5 flex-shrink-0" />
                    )}
                    {job.namaPerusahaan}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-gray-800">
                    {job.posisi}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.lokasiTipe === JobLocationType.LuarNegeri ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {job.lokasiTipe}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-sans">
                    {job.negaraKota}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right font-mono text-gray-800">
                    {job.isExternal && job.biayaPemberangkatan !== undefined ? (
                      <span className="font-bold text-teal-700">{formatRupiah(job.biayaPemberangkatan)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right font-mono text-gray-800">
                    {job.feePemberangkatanPT !== undefined && job.feePemberangkatanPT > 0 ? (
                      <span className="font-bold text-indigo-700">{formatRupiah(job.feePemberangkatanPT)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right font-mono">
                    {job.isExternal ? (
                      <div className="flex items-center justify-end space-x-1.5">
                        <span className={`font-bold ${sisaTagihan > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatRupiah(sisaTagihan)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDetailJob(job);
                          }}
                          className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-white font-sans font-bold rounded hover:bg-black cursor-pointer"
                        >
                          Rincian
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <select
                      value={job.status}
                      onChange={(e) => handleDirectStatusChange(job, e.target.value as JobStatus)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border focus:outline-none ${
                        job.status === JobStatus.Berangkat ? "bg-indigo-600 text-white border-indigo-700" :
                        job.status === JobStatus.Lolos ? "bg-green-100 text-green-800 border-green-300" :
                        job.status === JobStatus.Interview ? "bg-amber-100 text-amber-800 border-amber-300" :
                        job.status === JobStatus.Daftar ? "bg-gray-100 text-gray-800 border-gray-300" :
                        "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      {Object.values(JobStatus).map(s => (
                        <option key={s} value={s} className="bg-white text-gray-800">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center text-gray-500">
                    {job.tanggalDaftar}
                  </td>
                </tr>
              );
            })}
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-10 text-gray-400 bg-gray-50">
                  Tidak ada baris data pendaftaran karir siswa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div>Total Lowongan Karir Aktif: {filteredJobs.length} Pendaftaran</div>
        <div>LPK Nandita Career Center & Placement Registry</div>
      </div>

      {/* Add / Edit Job Pendaftaran Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-4 border-b border-gray-200 bg-sky-800 text-white rounded-t-lg flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-sm">
                {isEditMode ? "Edit Pendaftaran & Penempatan Kerja" : "Daftarkan Karir & Penempatan Siswa"}
              </h3>
              <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-white hover:text-gray-200">✕</button>
            </div>
            
            <form onSubmit={handleSaveForm} className="p-4 space-y-4">
              {/* Tipe Siswa Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kategori Keanggotaan Siswa *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExternal(false)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                      !isExternal 
                        ? "bg-sky-100 border-sky-400 text-sky-800" 
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Siswa Internal LPK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExternal(true)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                      isExternal 
                        ? "bg-amber-100 border-amber-400 text-amber-800" 
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Siswa Eksternal LPK
                  </button>
                </div>
              </div>

              {/* Dynamic Student fields */}
              {!isExternal ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Siswa Internal LPK *</label>
                  <select
                    required
                    value={selectedSiswaId}
                    onChange={(e) => setSelectedSiswaId(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    disabled={isEditMode}
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {siswa.map(s => (
                      <option key={s.id} value={s.id}>{s.nama} ({s.nis} - {s.programStudi})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50/50 p-3 rounded border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Informasi Siswa External</span>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Nama Lengkap Siswa Eksternal *</label>
                    <input
                      type="text"
                      required
                      value={externalSiswaNama}
                      onChange={(e) => setExternalSiswaNama(e.target.value)}
                      placeholder="e.g. Ahmad Suherman"
                      className="w-full border border-gray-300 bg-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">No. WhatsApp/HP</label>
                      <input
                        type="text"
                        value={externalNoHp}
                        onChange={(e) => setExternalNoHp(e.target.value)}
                        placeholder="e.g. 08123456789"
                        className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Program Studi / Minat</label>
                      <input
                        type="text"
                        value={externalProgramStudi}
                        onChange={(e) => setExternalProgramStudi(e.target.value)}
                        placeholder="e.g. Perhotelan / Crew"
                        className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Perusahaan Penerima / Kapal Pesiar *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Royal Caribbean Cruises, Hilton Hotel Bali"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Posisi / Jabatan Pekerjaan *</label>
                <input
                  type="text"
                  required
                  value={positionName}
                  onChange={(e) => setPositionName(e.target.value)}
                  placeholder="e.g. Assistant Cook, Cabin Steward, Bartender"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              {/* Placement Sector DN/LN and Career Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bagian Penempatan Kerja</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as JobLocationType)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    {Object.values(JobLocationType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status Perekrutan</label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value as JobStatus)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    {Object.values(JobStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Negara / Kota Penempatan</label>
                  <input
                    type="text"
                    value={countryCity}
                    onChange={(e) => setCountryCity(e.target.value)}
                    placeholder="e.g. Miami, Florida - USA"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimasi Gaji / Upah</label>
                  <input
                    type="text"
                    value={salaryEstimate}
                    onChange={(e) => setSalaryEstimate(e.target.value)}
                    placeholder="e.g. USD 1,500 / month"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* Financial Placements Fields (Sync with Keuangan & Tunggakan) */}
              <div className="border border-teal-200 bg-teal-50/40 p-3 rounded space-y-3">
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Rincian Finansial Pemberangkatan</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      {isExternal ? "Biaya Pemberangkatan (Siswa) *" : "Biaya Pemberangkatan (Khusus Eksternal)"}
                    </label>
                    <input
                      type="number"
                      required={isExternal}
                      disabled={!isExternal}
                      value={biayaPemberangkatan || ""}
                      onChange={(e) => setBiayaPemberangkatan(Number(e.target.value))}
                      placeholder={isExternal ? "e.g. 25000000" : "Hanya siswa eksternal"}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Fee Dari PT / Perusahaan (Rp)</label>
                    <input
                      type="number"
                      value={feePemberangkatanPT || ""}
                      onChange={(e) => setFeePemberangkatanPT(Number(e.target.value))}
                      placeholder="e.g. 5000000"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                {isExternal && isEditMode && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Jumlah Terbayar Oleh Siswa Eksternal (Rp)</label>
                    <input
                      type="number"
                      value={totalBayarExternal || ""}
                      onChange={(e) => setTotalBayarExternal(Number(e.target.value))}
                      placeholder="e.g. 15000000"
                      className="w-full border border-teal-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Registrasi Lowongan</label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); resetForm(); }}
                  className="px-4 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-sky-800 text-white rounded hover:bg-sky-900 font-semibold shadow-sm"
                >
                  {isEditMode ? "Simpan Perubahan" : "Daftarkan Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Financial & Payment Log Modal */}
      {activeDetailJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-[#001f3f] text-white p-4 flex justify-between items-center border-b border-slate-700">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded">
                    {activeDetailJob.isExternal ? "Siswa Eksternal Job" : "Siswa Internal LPK"}
                  </span>
                  <span className="text-xs font-mono text-slate-300">ID: {activeDetailJob.id}</span>
                </div>
                <h3 className="text-base font-bold font-display mt-1">
                  Rincian & Tunggakan Keuangan: {activeDetailJob.siswaNama}
                </h3>
              </div>
              <button
                onClick={() => setActiveDetailJob(null)}
                className="text-slate-300 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Nama Siswa:</span>
                    <p className="font-bold text-slate-900">{activeDetailJob.siswaNama}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">No. HP / WA:</span>
                    <p className="font-bold text-slate-900">{activeDetailJob.noHpExternal || "-"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Mitra Perusahaan / Kapal:</span>
                    <p className="font-bold text-slate-900">{activeDetailJob.namaPerusahaan}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Posisi:</span>
                    <p className="font-bold text-slate-900">{activeDetailJob.posisi}</p>
                  </div>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              {(() => {
                const totalCost = activeDetailJob.biayaPemberangkatan || 0;
                const totalPaid = activeDetailJob.totalBayarExternal || 0;
                const arrears = Math.max(totalCost - totalPaid, 0);
                const isLunas = arrears <= 0;

                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <span className="text-[10px] text-blue-700 uppercase font-mono font-bold block">Total Biaya Pemberangkatan</span>
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
                  const matchingKeu = keuangan.find(k => k.siswaId === activeDetailJob.siswaId || k.siswaNama === activeDetailJob.siswaNama);
                  const logs = matchingKeu
                    ? pembayaranLog.filter(p => p.keuanganSiswaId === matchingKeu.id)
                    : pembayaranLog.filter(p => p.siswaNama === activeDetailJob.siswaNama);

                  if (logs.length === 0) {
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-xs text-slate-400">
                        Belum ada riwayat setoran tercatat.
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

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center">
              <button
                onClick={() => {
                  const totalCost = activeDetailJob.biayaPemberangkatan || 0;
                  const totalPaid = activeDetailJob.totalBayarExternal || 0;
                  const arrears = Math.max(totalCost - totalPaid, 0);
                  const msg = formatReceivableNotification(
                    activeDetailJob.siswaNama,
                    totalCost,
                    arrears,
                    schoolSettings?.namaLembaga || "LPK Nandita Floating Hotel",
                    schoolSettings?.waTemplateTagihanSiswa
                  );
                  if (onTriggerWhatsApp) {
                    onTriggerWhatsApp({
                      recipientName: activeDetailJob.siswaNama,
                      phone: activeDetailJob.noHpExternal || "",
                      category: "Tunggakan Siswa Eksternal",
                      message: msg
                    });
                  }
                }}
                disabled={!activeDetailJob.noHpExternal}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Rincian WA</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const totalCost = activeDetailJob.biayaPemberangkatan || 0;
                    const totalPaid = activeDetailJob.totalBayarExternal || 0;
                    const arrears = Math.max(totalCost - totalPaid, 0);
                    setQuickPayAmount(arrears);
                    setIsQuickPayOpen(true);
                  }}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700 flex items-center space-x-1 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Input Setoran / Bayar</span>
                </button>
                <button
                  onClick={() => setActiveDetailJob(null)}
                  className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-300 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment Form Modal */}
      {isQuickPayOpen && activeDetailJob && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm animate-scale-in">
            <div className="p-4 border-b border-gray-200 bg-amber-700 text-white rounded-t-lg">
              <h3 className="font-bold text-xs uppercase font-mono">Input Setoran Pembayaran Siswa</h3>
            </div>
            <form onSubmit={handleQuickPaymentSubmit} className="p-4 space-y-3">
              <p className="text-xs text-gray-500">
                Catat setoran pembayaran untuk siswa <strong>{activeDetailJob.siswaNama}</strong>.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Jumlah Setoran (Rp) *</label>
                <input
                  type="number"
                  required
                  value={quickPayAmount || ""}
                  onChange={(e) => setQuickPayAmount(Number(e.target.value))}
                  placeholder="e.g. 5000000"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Tanggal Bayar</label>
                <input
                  type="date"
                  required
                  value={quickPayDate}
                  onChange={(e) => setQuickPayDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  value={quickPayNotes}
                  onChange={(e) => setQuickPayNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsQuickPayOpen(false)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-amber-700 text-white rounded font-bold hover:bg-amber-800 cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
