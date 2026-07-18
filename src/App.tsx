/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Siswa, 
  Staff, 
  Absensi, 
  Sertifikat, 
  KeuanganSiswa, 
  PembayaranLog, 
  Payroll, 
  JobRegister, 
  SchoolSettings,
  AbsensiStatus,
  JobStatus,
  Gender,
  SiswaStatus,
  StaffRole,
  UserAccount,
  TagihanSiswa,
  PendapatanLain,
  PengeluaranKas,
  UtangPegawai
} from "./types";
import {
  initialSchoolSettings,
  initialSiswa,
  initialStaff,
  initialAbsensi,
  initialSertifikat,
  initialKeuanganSiswa,
  initialPembayaranLog,
  initialPayroll,
  initialJobRegister,
  initialUsers,
  initialTagihan,
  initialPendapatanLain,
  initialPengeluaranKas,
  initialUtangPegawai,
  defaultJenisPendapatan,
  defaultKatPengeluaran
} from "./defaultData";
import ExcelDashboard from "./components/ExcelDashboard";
import { exportAllToExcel } from "./utils/excelExport";
import SiswaSheet from "./components/SiswaSheet";
import StaffSheet from "./components/StaffSheet";
import AbsensiSheet from "./components/AbsensiSheet";
import SertifikatSheet from "./components/SertifikatSheet";
import KeuanganSheet from "./components/KeuanganSheet";
import GajiPayrollSheet from "./components/GajiPayrollSheet";
import JobRegisterSheet from "./components/JobRegisterSheet";
import SettingsSheet from "./components/SettingsSheet";

// New Components
import LoginView from "./components/LoginView";
import UserAccountSheet from "./components/UserAccountSheet";
import TagihanSiswaSheet from "./components/TagihanSiswaSheet";
import PendapatanPengeluaranSheet from "./components/PendapatanPengeluaranSheet";
import UtangPegawaiSheet from "./components/UtangPegawaiSheet";
import LaporanKeuanganSheet from "./components/LaporanKeuanganSheet";
import SiswaTagihanSheet from "./components/SiswaTagihanSheet";
import SiswaRiwayatSheet from "./components/SiswaRiwayatSheet";
import WhatsAppModal from "./components/WhatsAppModal";
import GoogleSheetsSync from "./components/GoogleSheetsSync";
import { WhatsAppNotification } from "./utils/whatsapp";
import NanditaLogo from "./components/NanditaLogo";

import { 
  BarChart2, 
  BookOpen, 
  Briefcase, 
  CalendarDays, 
  Coins, 
  Award, 
  Users2, 
  Settings2, 
  Anchor, 
  Ship, 
  ChevronRight, 
  Download, 
  RefreshCcw,
  CheckSquare,
  LogOut,
  Shield,
  Receipt,
  TrendingUp,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  // 1. Core State Hooks
  const [activeSheet, setActiveSheet] = useState<string>("Dashboard & Ringkasan");
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(initialSchoolSettings);
  const [siswa, setSiswa] = useState<Siswa[]>(initialSiswa);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [absensi, setAbsensi] = useState<Absensi[]>(initialAbsensi);
  const [sertifikat, setSertifikat] = useState<Sertifikat[]>(initialSertifikat);
  const [keuangan, setKeuangan] = useState<KeuanganSiswa[]>(initialKeuanganSiswa);
  const [pembayaranLog, setPembayaranLog] = useState<PembayaranLog[]>(initialPembayaranLog);
  const [payroll, setPayroll] = useState<Payroll[]>(initialPayroll);
  const [jobs, setJobs] = useState<JobRegister[]>(initialJobRegister);

  // New states for requested additions
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(initialUsers);
  const [tagihan, setTagihan] = useState<TagihanSiswa[]>(initialTagihan);
  const [pendapatanLain, setPendapatanLain] = useState<PendapatanLain[]>(initialPendapatanLain);
  const [pengeluaranKas, setPengeluaranKas] = useState<PengeluaranKas[]>(initialPengeluaranKas);
  const [utangPegawai, setUtangPegawai] = useState<UtangPegawai[]>(initialUtangPegawai);
  const [jenisPendapatan, setJenisPendapatan] = useState<string[]>(defaultJenisPendapatan);
  const [katPengeluaran, setKatPengeluaran] = useState<string[]>(defaultKatPengeluaran);

  // Custom added custom spreadsheet tabs (notes sheet, etc.)
  const [customTabs, setCustomTabs] = useState<string[]>([]);
  const [pendingWhatsApp, setPendingWhatsApp] = useState<WhatsAppNotification | null>(null);

  // 2. Local Storage Sync
  useEffect(() => {
    // Attempt to load existing state
    const storedSettings = localStorage.getItem("lpk_settings");
    const storedSiswa = localStorage.getItem("lpk_siswa");
    const storedStaff = localStorage.getItem("lpk_staff");
    const storedAbsensi = localStorage.getItem("lpk_absensi");
    const storedSertifikat = localStorage.getItem("lpk_sertifikat");
    const storedKeuangan = localStorage.getItem("lpk_keuangan");
    const storedPayments = localStorage.getItem("lpk_payments");
    const storedPayroll = localStorage.getItem("lpk_payroll");
    const storedJobs = localStorage.getItem("lpk_jobs");
    const storedCustomTabs = localStorage.getItem("lpk_custom_tabs");

    // Load new states
    const storedUsers = localStorage.getItem("lpk_users");
    const storedTagihan = localStorage.getItem("lpk_tagihan");
    const storedPendapatanLain = localStorage.getItem("lpk_pendapatan_lain");
    const storedPengeluaranKas = localStorage.getItem("lpk_pengeluaran_kas");
    const storedUtangPegawai = localStorage.getItem("lpk_utang_pegawai");
    const storedJenisPendapatan = localStorage.getItem("lpk_jenis_pendapatan");
    const storedKatPengeluaran = localStorage.getItem("lpk_kat_pengeluaran");

    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      if (!parsed.akreditasi) {
        parsed.akreditasi = "Terakreditasi A (Sangat Baik) - LA-LPK";
      }
      setSchoolSettings(parsed);
    }
    if (storedSiswa) setSiswa(JSON.parse(storedSiswa));
    if (storedStaff) setStaff(JSON.parse(storedStaff));
    if (storedAbsensi) setAbsensi(JSON.parse(storedAbsensi));
    if (storedSertifikat) setSertifikat(JSON.parse(storedSertifikat));
    if (storedKeuangan) setKeuangan(JSON.parse(storedKeuangan));
    if (storedPayments) setPembayaranLog(JSON.parse(storedPayments));
    if (storedPayroll) setPayroll(JSON.parse(storedPayroll));
    if (storedJobs) setJobs(JSON.parse(storedJobs));
    if (storedCustomTabs) setCustomTabs(JSON.parse(storedCustomTabs));

    if (storedUsers) setUserAccounts(JSON.parse(storedUsers));
    if (storedTagihan) setTagihan(JSON.parse(storedTagihan));
    if (storedPendapatanLain) setPendapatanLain(JSON.parse(storedPendapatanLain));
    if (storedPengeluaranKas) setPengeluaranKas(JSON.parse(storedPengeluaranKas));
    if (storedUtangPegawai) setUtangPegawai(JSON.parse(storedUtangPegawai));
    if (storedJenisPendapatan) setJenisPendapatan(JSON.parse(storedJenisPendapatan));
    if (storedKatPengeluaran) setKatPengeluaran(JSON.parse(storedKatPengeluaran));
  }, []);

  // Helper to persist everything
  const saveAllToLocalStorage = (
    nextSettings = schoolSettings,
    nextSiswa = siswa,
    nextStaff = staff,
    nextAbsensi = absensi,
    nextSertifikat = sertifikat,
    nextKeuangan = keuangan,
    nextPayments = pembayaranLog,
    nextPayroll = payroll,
    nextJobs = jobs,
    nextCustomTabs = customTabs,
    nextUsers = userAccounts,
    nextTagihan = tagihan,
    nextPendapatanLain = pendapatanLain,
    nextPengeluaranKas = pengeluaranKas,
    nextUtangPegawai = utangPegawai,
    nextJenisPendapatan = jenisPendapatan,
    nextKatPengeluaran = katPengeluaran
  ) => {
    localStorage.setItem("lpk_settings", JSON.stringify(nextSettings));
    localStorage.setItem("lpk_siswa", JSON.stringify(nextSiswa));
    localStorage.setItem("lpk_staff", JSON.stringify(nextStaff));
    localStorage.setItem("lpk_absensi", JSON.stringify(nextAbsensi));
    localStorage.setItem("lpk_sertifikat", JSON.stringify(nextSertifikat));
    localStorage.setItem("lpk_keuangan", JSON.stringify(nextKeuangan));
    localStorage.setItem("lpk_payments", JSON.stringify(nextPayments));
    localStorage.setItem("lpk_payroll", JSON.stringify(nextPayroll));
    localStorage.setItem("lpk_jobs", JSON.stringify(nextJobs));
    localStorage.setItem("lpk_custom_tabs", JSON.stringify(nextCustomTabs));

    localStorage.setItem("lpk_users", JSON.stringify(nextUsers));
    localStorage.setItem("lpk_tagihan", JSON.stringify(nextTagihan));
    localStorage.setItem("lpk_pendapatan_lain", JSON.stringify(nextPendapatanLain));
    localStorage.setItem("lpk_pengeluaran_kas", JSON.stringify(nextPengeluaranKas));
    localStorage.setItem("lpk_utang_pegawai", JSON.stringify(nextUtangPegawai));
    localStorage.setItem("lpk_jenis_pendapatan", JSON.stringify(nextJenisPendapatan));
    localStorage.setItem("lpk_kat_pengeluaran", JSON.stringify(nextKatPengeluaran));
  };

  // 3. Mutation Operations

  // SISWA
  const handleAddSiswa = (newSiswa: Siswa) => {
    const updated = [...siswa, newSiswa];
    setSiswa(updated);
    
    // Automatically create empty financial account for this new student
    const newKeuanganAcc: KeuanganSiswa = {
      id: `KEU-${Date.now().toString().slice(-4)}`,
      siswaId: newSiswa.id,
      siswaNama: newSiswa.nama,
      totalBiaya: 15000000, // Default tuition
      totalBayar: 0,
      piutang: 15000000,
      statusBayar: "Belum Bayar",
      pembayaranTerakhir: "-"
    };
    const updatedKeuangan = [...keuangan, newKeuanganAcc];
    setKeuangan(updatedKeuangan);

    saveAllToLocalStorage(schoolSettings, updated, staff, absensi, sertifikat, updatedKeuangan);
  };

  const handleUpdateSiswa = (updatedSiswa: Siswa) => {
    const updated = siswa.map(s => s.id === updatedSiswa.id ? updatedSiswa : s);
    setSiswa(updated);

    // Sync name to other related tables if changed
    const updatedKeuangan = keuangan.map(k => k.siswaId === updatedSiswa.id ? { ...k, siswaNama: updatedSiswa.nama } : k);
    setKeuangan(updatedKeuangan);

    const updatedCerts = sertifikat.map(c => c.siswaId === updatedSiswa.id ? { ...c, siswaNama: updatedSiswa.nama } : c);
    setSertifikat(updatedCerts);

    const updatedJobs = jobs.map(j => j.siswaId === updatedSiswa.id ? { ...j, siswaNama: updatedSiswa.nama, programStudi: updatedSiswa.programStudi } : j);
    setJobs(updatedJobs);

    const updatedAbs = absensi.map(a => a.targetId === updatedSiswa.id ? { ...a, nama: updatedSiswa.nama } : a);
    setAbsensi(updatedAbs);

    saveAllToLocalStorage(schoolSettings, updated, staff, updatedAbs, updatedCerts, updatedKeuangan, pembayaranLog, payroll, updatedJobs);
  };

  const handleDeleteSiswa = (id: string) => {
    const updated = siswa.filter(s => s.id !== id);
    setSiswa(updated);
    
    // Delete financial accounts as well
    const updatedKeuangan = keuangan.filter(k => k.siswaId !== id);
    setKeuangan(updatedKeuangan);

    saveAllToLocalStorage(schoolSettings, updated, staff, absensi, sertifikat, updatedKeuangan);
  };

  const handleBulkSiswaImport = (siswaList: Siswa[]) => {
    const merged = [...siswa, ...siswaList];
    setSiswa(merged);

    // Create financial accounts for imported students
    const newAccounts = siswaList.map(s => ({
      id: `KEU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      siswaId: s.id,
      siswaNama: s.nama,
      totalBiaya: 15000000,
      totalBayar: 0,
      piutang: 15000000,
      statusBayar: "Belum Bayar" as const,
      pembayaranTerakhir: "-"
    }));
    const mergedKeuangan = [...keuangan, ...newAccounts];
    setKeuangan(mergedKeuangan);

    saveAllToLocalStorage(schoolSettings, merged, staff, absensi, sertifikat, mergedKeuangan);
  };

  // STAFF & INSTRUCTORS
  const handleAddStaff = (newStaff: Staff) => {
    const updated = [...staff, newStaff];
    setStaff(updated);
    saveAllToLocalStorage(schoolSettings, siswa, updated);
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    const updated = staff.map(s => s.id === updatedStaff.id ? updatedStaff : s);
    setStaff(updated);

    const updatedAbs = absensi.map(a => a.targetId === updatedStaff.id ? { ...a, nama: updatedStaff.nama } : a);
    setAbsensi(updatedAbs);

    saveAllToLocalStorage(schoolSettings, siswa, updated, updatedAbs);
  };

  const handleDeleteStaff = (id: string) => {
    const updated = staff.filter(s => s.id !== id);
    setStaff(updated);
    saveAllToLocalStorage(schoolSettings, siswa, updated);
  };

  const handleBulkStaffImport = (staffList: Staff[]) => {
    const merged = [...staff, ...staffList];
    setStaff(merged);
    saveAllToLocalStorage(schoolSettings, siswa, merged);
  };

  // ABSENSI
  const handleAddAbsensi = (newAbsensi: Absensi) => {
    const updated = [...absensi, newAbsensi];
    setAbsensi(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, updated);
  };

  const handleUpdateAbsensi = (updatedAbsensi: Absensi) => {
    const updated = absensi.map(a => a.id === updatedAbsensi.id ? updatedAbsensi : a);
    setAbsensi(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, updated);
  };

  const handleDeleteAbsensi = (id: string) => {
    const updated = absensi.filter(a => a.id !== id);
    setAbsensi(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, updated);
  };

  const handleBulkGenerateAbsensi = (date: string, category: "Siswa" | "Staf/Instruktur") => {
    const newLogs: Absensi[] = [];

    if (category === "Siswa") {
      siswa.filter(s => s.status === "Aktif").forEach(s => {
        // Only if no log exists for this student on this day
        if (!absensi.some(a => a.tanggal === date && a.targetId === s.id)) {
          newLogs.push({
            id: `ABS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            tanggal: date,
            targetId: s.id,
            nama: s.nama,
            kategori: "Siswa",
            status: AbsensiStatus.Hadir,
            keterangan: "Hadir Otomatis"
          });
        }
      });
    } else {
      staff.filter(st => st.status === "Aktif").forEach(st => {
        if (!absensi.some(a => a.tanggal === date && a.targetId === st.id)) {
          newLogs.push({
            id: `ABS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            tanggal: date,
            targetId: st.id,
            nama: st.nama,
            kategori: st.role === StaffRole.Instruktur ? "Instruktur" : "Staf",
            status: AbsensiStatus.Hadir,
            keterangan: "Hadir Otomatis",
            jamMasuk: "08:00",
            jamSelesai: "12:00"
          });
        }
      });
    }

    if (newLogs.length === 0) {
      alert("Semua personel aktif sudah memiliki log absensi untuk tanggal ini!");
      return;
    }

    const updated = [...absensi, ...newLogs];
    setAbsensi(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, updated);
  };

  // SERTIFIKAT
  const handleAddSertifikat = (newCert: Sertifikat) => {
    const updated = [...sertifikat, newCert];
    setSertifikat(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, updated);
  };

  const handleDeleteSertifikat = (id: string) => {
    const updated = sertifikat.filter(c => c.id !== id);
    setSertifikat(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, updated);
  };

  // KEUANGAN (BIAYA & PEMBAYARAN)
  const handleAddPaymentLog = (newPayment: PembayaranLog) => {
    const updatedPayments = [...pembayaranLog, newPayment];
    setPembayaranLog(updatedPayments);

    // Dynamically recalculate tuition account details
    const updatedKeuangan = keuangan.map(acc => {
      if (acc.id === newPayment.keuanganSiswaId) {
        const nextPaid = acc.totalBayar + newPayment.jumlahBayar;
        const nextPiutang = Math.max(acc.totalBiaya - nextPaid, 0);
        return {
          ...acc,
          totalBayar: nextPaid,
          piutang: nextPiutang,
          statusBayar: nextPiutang === 0 ? ("Lunas" as const) : ("Belum Lunas" as const),
          pembayaranTerakhir: newPayment.tanggalBayar
        };
      }
      return acc;
    });

    setKeuangan(updatedKeuangan);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, updatedKeuangan, updatedPayments);
  };

  const handleDeletePaymentLog = (paymentId: string) => {
    const deletedLog = pembayaranLog.find(p => p.id === paymentId);
    if (!deletedLog) return;

    const updatedPayments = pembayaranLog.filter(p => p.id !== paymentId);
    setPembayaranLog(updatedPayments);

    // Revert calculations on student account
    const updatedKeuangan = keuangan.map(acc => {
      if (acc.id === deletedLog.keuanganSiswaId) {
        const nextPaid = Math.max(acc.totalBayar - deletedLog.jumlahBayar, 0);
        const nextPiutang = acc.totalBiaya - nextPaid;
        return {
          ...acc,
          totalBayar: nextPaid,
          piutang: nextPiutang,
          statusBayar: nextPaid === 0 ? ("Belum Bayar" as const) : ("Belum Lunas" as const),
          pembayaranTerakhir: updatedPayments.filter(p => p.keuanganSiswaId === acc.id).slice(-1)[0]?.tanggalBayar || "-"
        };
      }
      return acc;
    });

    setKeuangan(updatedKeuangan);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, updatedKeuangan, updatedPayments);
  };

  const handleResetPayments = () => {
    const emptyPayments: PembayaranLog[] = [];
    setPembayaranLog(emptyPayments);

    const updatedKeuangan = keuangan.map(acc => ({
      ...acc,
      totalBayar: 0,
      piutang: acc.totalBiaya,
      statusBayar: "Belum Bayar" as const,
      pembayaranTerakhir: "-"
    }));

    setKeuangan(updatedKeuangan);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, updatedKeuangan, emptyPayments);
  };

  const handleUpdateBiayaSiswa = (keuanganSiswaId: string, newTotalBiaya: number) => {
    const updatedKeuangan = keuangan.map(acc => {
      if (acc.id === keuanganSiswaId) {
        const nextPiutang = Math.max(newTotalBiaya - acc.totalBayar, 0);
        return {
          ...acc,
          totalBiaya: newTotalBiaya,
          piutang: nextPiutang,
          statusBayar: nextPiutang === 0 
            ? ("Lunas" as const) 
            : (acc.totalBayar > 0 ? ("Belum Lunas" as const) : ("Belum Bayar" as const))
        };
      }
      return acc;
    });

    setKeuangan(updatedKeuangan);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, updatedKeuangan);
  };

  const handleAddKeuanganAccount = (newAccount: KeuanganSiswa) => {
    const updated = [...keuangan, newAccount];
    setKeuangan(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, updated);
  };

  // PAYROLL (GAJI)
  const handleAddPayroll = (newPayroll: Payroll) => {
    const updated = [...payroll, newPayroll];
    setPayroll(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, updated);
  };

  const handleDeletePayroll = (payrollId: string) => {
    const updated = payroll.filter(p => p.id !== payrollId);
    setPayroll(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, updated);
  };

  // JOBS (PENDAFTARAN KERJA)
  const handleAddJobRegister = (newJob: JobRegister) => {
    const updated = [...jobs, newJob];
    setJobs(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, updated);
  };

  const handleUpdateJobRegister = (updatedJob: JobRegister) => {
    const updated = jobs.map(j => j.id === updatedJob.id ? updatedJob : j);
    setJobs(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, updated);
  };

  const handleDeleteJobRegister = (id: string) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, updated);
  };

  // USER ACCOUNTS ACTIONS
  const handleAddUser = (user: UserAccount) => {
    const updated = [...userAccounts, user];
    setUserAccounts(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, updated);
  };

  const handleUpdateUser = (user: UserAccount) => {
    const updated = userAccounts.map(u => u.id === user.id ? user : u);
    setUserAccounts(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, updated);
  };

  const handleDeleteUser = (id: string) => {
    const updated = userAccounts.filter(u => u.id !== id);
    setUserAccounts(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, updated);
  };

  // TAGIHAN SISWA ACTIONS
  const handleAddTagihan = (newTagihan: TagihanSiswa) => {
    const updated = [...tagihan, newTagihan];
    setTagihan(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, updated);
  };

  const handleDeleteTagihan = (id: string) => {
    const updated = tagihan.filter(t => t.id !== id);
    setTagihan(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, updated);
  };

  const handleMarkTagihanAsPaid = (id: string) => {
    const targetTagihan = tagihan.find(t => t.id === id);
    if (!targetTagihan) return;

    // Mark lunas
    const updatedTagihan = tagihan.map(t => t.id === id ? { ...t, status: "Lunas" as const } : t);
    setTagihan(updatedTagihan);

    // Automatically record this as a payment in the pembayaranLog so it reflects under finance
    let studentKeuangan = keuangan.find(k => k.siswaId === targetTagihan.siswaId);
    let updatedKeuangan = keuangan;
    
    if (!studentKeuangan) {
      const newKeuanganAcc: KeuanganSiswa = {
        id: `KEU-${Date.now().toString().slice(-4)}`,
        siswaId: targetTagihan.siswaId,
        siswaNama: targetTagihan.siswaNama,
        totalBiaya: targetTagihan.jumlah,
        totalBayar: 0,
        piutang: targetTagihan.jumlah,
        statusBayar: "Belum Bayar",
        pembayaranTerakhir: "-"
      };
      studentKeuangan = newKeuanganAcc;
      updatedKeuangan = [...keuangan, newKeuanganAcc];
    }

    const nextPaymentLog: PembayaranLog = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      keuanganSiswaId: studentKeuangan.id,
      siswaNama: targetTagihan.siswaNama,
      tanggalBayar: new Date().toISOString().split("T")[0],
      jumlahBayar: targetTagihan.jumlah,
      metodeBayar: "Kas / Tunai",
      keterangan: `Pelunasan tagihan: ${targetTagihan.namaTagihan}`
    };

    const updatedPayments = [...pembayaranLog, nextPaymentLog];
    setPembayaranLog(updatedPayments);

    // Recalculate keuangan account
    const finalKeuangan = updatedKeuangan.map(acc => {
      if (acc.id === studentKeuangan!.id) {
        const nextPaid = acc.totalBayar + targetTagihan.jumlah;
        const nextPiutang = Math.max(acc.totalBiaya - nextPaid, 0);
        return {
          ...acc,
          totalBayar: nextPaid,
          piutang: nextPiutang,
          statusBayar: nextPiutang === 0 ? "Lunas" as const : "Belum Lunas" as const,
          pembayaranTerakhir: nextPaymentLog.tanggalBayar
        };
      }
      return acc;
    });

    setKeuangan(finalKeuangan);
    saveAllToLocalStorage(
      schoolSettings, siswa, staff, absensi, sertifikat, finalKeuangan, updatedPayments, payroll, jobs, customTabs, userAccounts, updatedTagihan
    );
  };

  // PENDAPATAN LAIN ACTIONS
  const handleAddPendapatanLain = (item: PendapatanLain) => {
    const updated = [...pendapatanLain, item];
    setPendapatanLain(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, updated);
  };

  const handleDeletePendapatanLain = (id: string) => {
    const updated = pendapatanLain.filter(p => p.id !== id);
    setPendapatanLain(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, updated);
  };

  // PENGELUARAN KAS ACTIONS
  const handleAddPengeluaranKas = (item: PengeluaranKas) => {
    const updated = [...pengeluaranKas, item];
    setPengeluaranKas(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, updated);
  };

  const handleDeletePengeluaranKas = (id: string) => {
    const updated = pengeluaranKas.filter(e => e.id !== id);
    setPengeluaranKas(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, updated);
  };

  // CATEGORIES ACTIONS
  const handleAddJenisPendapatan = (cat: string) => {
    const updated = [...jenisPendapatan, cat];
    setJenisPendapatan(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, pengeluaranKas, utangPegawai, updated);
  };

  const handleDeleteJenisPendapatan = (cat: string) => {
    const updated = jenisPendapatan.filter(c => c !== cat);
    setJenisPendapatan(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, pengeluaranKas, utangPegawai, updated);
  };

  const handleAddKatPengeluaran = (cat: string) => {
    const updated = [...katPengeluaran, cat];
    setKatPengeluaran(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, pengeluaranKas, utangPegawai, jenisPendapatan, updated);
  };

  const handleDeleteKatPengeluaran = (cat: string) => {
    const updated = katPengeluaran.filter(c => c !== cat);
    setKatPengeluaran(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, pengeluaranKas, utangPegawai, jenisPendapatan, updated);
  };

  // UTANG PEGAWAI ACTIONS
  const handleAddUtangPegawai = (loan: UtangPegawai) => {
    const updated = [...utangPegawai, loan];
    setUtangPegawai(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, pengeluaranKas, updated);
  };

  const handleDeleteUtangPegawai = (id: string) => {
    const updated = utangPegawai.filter(u => u.id !== id);
    setUtangPegawai(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, pengeluaranKas, updated);
  };

  const handleAddCicilanPegawai = (loanId: string, cicilan: { id: string; tanggal: string; jumlah: number; keterangan: string }) => {
    const updated = utangPegawai.map(loan => {
      if (loan.id === loanId) {
        const nextPaid = loan.totalBayar + cicilan.jumlah;
        const nextSisa = Math.max(loan.jumlahPinjam - nextPaid, 0);
        return {
          ...loan,
          totalBayar: nextPaid,
          sisaUtang: nextSisa,
          status: nextSisa === 0 ? ("Lunas" as const) : ("Belum Lunas" as const),
          riwayatCicilan: [...loan.riwayatCicilan, cicilan]
        };
      }
      return loan;
    });
    setUtangPegawai(updated);
    saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, customTabs, userAccounts, tagihan, pendapatanLain, pengeluaranKas, updated);
  };

  // SCHOOL SETTINGS
  const handleUpdateSettings = (newSettings: SchoolSettings) => {
    setSchoolSettings(newSettings);
    saveAllToLocalStorage(newSettings);
  };

  const handleResetToDefault = () => {
    setSchoolSettings(initialSchoolSettings);
    setSiswa(initialSiswa);
    setStaff(initialStaff);
    setAbsensi(initialAbsensi);
    setSertifikat(initialSertifikat);
    setKeuangan(initialKeuanganSiswa);
    setPembayaranLog(initialPembayaranLog);
    setPayroll(initialPayroll);
    setJobs(initialJobRegister);
    setCustomTabs([]);

    localStorage.clear();
    alert("Semua database disetel ulang ke bawaan awal!");
  };

  // Quick Action to simulate adding a custom Blank Excel Sheet (for taking arbitrary notes)
  const handleAddBlankSheet = () => {
    const sheetName = prompt("Masukkan nama lembar kerja (sheet) baru:");
    if (sheetName) {
      if (customTabs.includes(sheetName)) {
        alert("Nama sheet sudah ada!");
        return;
      }
      const updated = [...customTabs, sheetName];
      setCustomTabs(updated);
      setActiveSheet(sheetName);
      saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, updated);
    }
  };

  const handleExportAllExcel = () => {
    exportAllToExcel({
      siswa,
      staff,
      absensi,
      keuangan,
      tagihan,
      payroll,
      jobs,
      utangList: utangPegawai,
      pendapatanLain,
      pengeluaranKas,
      pembayaranLog,
      namaLembaga: schoolSettings.namaLembaga
    });
  };

  // 4. Render Active Sheet Component
  const renderActiveSheet = () => {
    switch (activeSheet) {
      case "Dashboard & Ringkasan":
        return (
          <ExcelDashboard 
            siswa={siswa}
            staff={staff}
            absensi={absensi}
            keuangan={keuangan}
            jobs={jobs}
            pembayaranLog={pembayaranLog}
            pendapatanLain={pendapatanLain}
            pengeluaranKas={pengeluaranKas}
            payroll={payroll}
            utangPegawai={utangPegawai}
            onSwitchSheet={(name) => setActiveSheet(name)}
            onExportExcel={handleExportAllExcel}
          />
        );
      case "Siswa":
        return (
          <SiswaSheet 
            siswa={siswa}
            onAddSiswa={handleAddSiswa}
            onUpdateSiswa={handleUpdateSiswa}
            onDeleteSiswa={handleDeleteSiswa}
            onBulkSiswaImport={handleBulkSiswaImport}
          />
        );
      case "Staf & Instruktur":
        return (
          <StaffSheet 
            staff={staff}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            onBulkStaffImport={handleBulkStaffImport}
          />
        );
      case "Absensi Siswa":
        return (
          <AbsensiSheet 
            absensi={absensi}
            siswa={siswa}
            staff={staff}
            onAddAbsensi={handleAddAbsensi}
            onUpdateAbsensi={handleUpdateAbsensi}
            onDeleteAbsensi={handleDeleteAbsensi}
            onBulkGenerateAbsensi={handleBulkGenerateAbsensi}
            viewMode="Siswa"
          />
        );
      case "Absensi Instruktur":
        return (
          <AbsensiSheet 
            absensi={absensi}
            siswa={siswa}
            staff={staff}
            onAddAbsensi={handleAddAbsensi}
            onUpdateAbsensi={handleUpdateAbsensi}
            onDeleteAbsensi={handleDeleteAbsensi}
            onBulkGenerateAbsensi={handleBulkGenerateAbsensi}
            viewMode="Instruktur"
          />
        );
      case "Sertifikat":
        return (
          <SertifikatSheet 
            sertifikat={sertifikat}
            siswa={siswa}
            onAddSertifikat={handleAddSertifikat}
            onDeleteSertifikat={handleDeleteSertifikat}
            schoolSettings={schoolSettings}
          />
        );
      case "Keuangan & Piutang":
        return (
          <KeuanganSheet 
            keuangan={keuangan}
            pembayaranLog={pembayaranLog}
            siswa={siswa}
            onAddPayment={handleAddPaymentLog}
            onDeletePayment={handleDeletePaymentLog}
            onUpdateBiayaSiswa={handleUpdateBiayaSiswa}
            onAddKeuanganAccount={handleAddKeuanganAccount}
            onTriggerWhatsApp={(notif) => setPendingWhatsApp(notif)}
          />
        );
      case "Payroll Gaji":
        return (
          <GajiPayrollSheet 
            payroll={payroll}
            staff={staff}
            onAddPayroll={handleAddPayroll}
            onDeletePayroll={handleDeletePayroll}
            schoolSettings={schoolSettings}
            onTriggerWhatsApp={(notif) => setPendingWhatsApp(notif)}
          />
        );
      case "Lowongan / Job":
        return (
          <JobRegisterSheet 
            jobs={jobs}
            siswa={siswa}
            onAddJobRegister={handleAddJobRegister}
            onUpdateJobRegister={handleUpdateJobRegister}
            onDeleteJobRegister={handleDeleteJobRegister}
          />
        );
      case "Data Pengguna":
        return (
          <UserAccountSheet
            userAccounts={userAccounts}
            siswaList={siswa}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case "Tagihan Siswa":
        return (
          <TagihanSiswaSheet
            tagihanList={tagihan}
            siswaList={siswa}
            onAddTagihan={handleAddTagihan}
            onDeleteTagihan={handleDeleteTagihan}
            onMarkAsPaid={handleMarkTagihanAsPaid}
            onTriggerWhatsApp={(notif) => setPendingWhatsApp(notif)}
          />
        );
      case "Kas Operasional":
        return (
          <PendapatanPengeluaranSheet
            pendapatanLain={pendapatanLain}
            pengeluaranKas={pengeluaranKas}
            pembayaranLog={pembayaranLog}
            jenisPendapatan={jenisPendapatan}
            katPengeluaran={katPengeluaran}
            onAddPendapatanLain={handleAddPendapatanLain}
            onDeletePendapatanLain={handleDeletePendapatanLain}
            onAddPengeluaranKas={handleAddPengeluaranKas}
            onDeletePengeluaranKas={handleDeletePengeluaranKas}
            onAddJenisPendapatan={handleAddJenisPendapatan}
            onDeleteJenisPendapatan={handleDeleteJenisPendapatan}
            onAddKatPengeluaran={handleAddKatPengeluaran}
            onDeleteKatPengeluaran={handleDeleteKatPengeluaran}
            onTriggerWhatsApp={(notif) => setPendingWhatsApp(notif)}
            onResetPembayaranLog={handleResetPayments}
          />
        );
      case "Utang Pegawai":
        return (
          <UtangPegawaiSheet
            utangList={utangPegawai}
            staffList={staff}
            onAddUtang={handleAddUtangPegawai}
            onDeleteUtang={handleDeleteUtangPegawai}
            onAddCicilan={handleAddCicilanPegawai}
          />
        );
      case "Laporan Keuangan":
        return (
          <LaporanKeuanganSheet
            pembayaranLog={pembayaranLog}
            pendapatanLain={pendapatanLain}
            pengeluaranKas={pengeluaranKas}
            payrollList={payroll}
            utangList={utangPegawai}
            schoolSettings={schoolSettings}
          />
        );
      case "Pengaturan":
        return (
          <SettingsSheet 
            settings={schoolSettings}
            onUpdateSettings={handleUpdateSettings}
            onResetToDefault={handleResetToDefault}
          />
        );
      case "Integrasi Google Sheets":
        return (
          <GoogleSheetsSync
            siswa={siswa}
            staff={staff}
            absensi={absensi}
            keuangan={keuangan}
            pendapatanLain={pendapatanLain}
            pengeluaranKas={pengeluaranKas}
            tagihan={tagihan}
          />
        );
      case "Tagihan Saya":
        return (
          <SiswaTagihanSheet
            currentUser={currentUser!}
            tagihanList={tagihan}
            keuangan={keuangan}
          />
        );
      case "Riwayat Pembayaran":
        return (
          <SiswaRiwayatSheet
            currentUser={currentUser!}
            pembayaranLog={pembayaranLog}
            keuangan={keuangan}
          />
        );
      default:
        // Render custom blank sheet with notes/textarea
        return (
          <div className="p-8 space-y-4 bg-white h-full overflow-auto text-gray-800" id="custom-blank-sheet">
            <h3 className="text-sm font-bold font-mono text-teal-800 flex items-center space-x-1.5">
              <CheckSquare className="w-4 h-4" />
              <span>Lembar Kerja Kosong: {activeSheet}</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Gunakan sheet kosong ini untuk menulis catatan, to-do list harian LPK, atau coretan kas kecil.
            </p>
            <textarea
              className="w-full h-[350px] border border-gray-300 rounded-lg p-4 text-xs font-mono bg-amber-50/10 focus:outline-none focus:ring-1 focus:ring-teal-700"
              placeholder="Tulis catatan akuntansi atau log kerja harian di sini..."
              defaultValue={`Catatan Harian LPK Nandita - ${activeSheet}\nTanggal: ${new Date().toLocaleDateString("id-ID")}\n---------------------------\n1.`}
            />
          </div>
        );
    }
  };

  // Base list of core sheets
  const coreSheets = [
    { name: "Dashboard & Ringkasan", icon: BarChart2 },
    { name: "Siswa", icon: Users2 },
    { name: "Staf & Instruktur", icon: BookOpen },
    { name: "Absensi Siswa", icon: CalendarDays },
    { name: "Absensi Instruktur", icon: CalendarDays },
    { name: "Sertifikat", icon: Award },
    { name: "Keuangan & Piutang", icon: Coins },
    { name: "Tagihan Siswa", icon: Receipt },
    { name: "Kas Operasional", icon: TrendingUp },
    { name: "Utang Pegawai", icon: Coins },
    { name: "Payroll Gaji", icon: Coins },
    { name: "Lowongan / Job", icon: Briefcase },
    { name: "Laporan Keuangan", icon: FileText },
    { name: "Integrasi Google Sheets", icon: FileSpreadsheet },
    { name: "Data Pengguna", icon: Shield },
    { name: "Pengaturan", icon: Settings2 },
    // Student specific tabs
    { name: "Tagihan Saya", icon: Receipt },
    { name: "Riwayat Pembayaran", icon: Coins }
  ];

  // Filter sheets list based on logged-in user role or custom permitted tabs
  const allowedCoreSheets = coreSheets.filter(sheet => {
    if (!currentUser) return false;
    
    // Siswa role can ONLY see student-specific tabs
    if (currentUser.role === "Siswa") {
      return ["Tagihan Saya", "Riwayat Pembayaran"].includes(sheet.name);
    }
    
    // Other roles CANNOT see student-specific tabs
    if (["Tagihan Saya", "Riwayat Pembayaran"].includes(sheet.name)) {
      return false;
    }

    // Admin has full access to everything
    if (currentUser.role === "Admin") return true;
    
    // Custom granular permissions defined on the user account
    if (currentUser.allowedTabs && currentUser.allowedTabs.length > 0) {
      return currentUser.allowedTabs.includes(sheet.name);
    }
    
    // Fallback role presets
    if (currentUser.role === "Instruktur") {
      return ["Absensi Siswa", "Absensi Instruktur"].includes(sheet.name);
    }
    
    // General restrictions for Staf/Keuangan
    if (currentUser.role === "Keuangan") {
      return !["Data Pengguna", "Pengaturan"].includes(sheet.name);
    }
    if (currentUser.role === "Staf") {
      return !["Data Pengguna", "Pengaturan"].includes(sheet.name);
    }
    return true;
  });

  // Redirect to first allowed sheet if the current sheet is restricted
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const isAllowed = allowedCoreSheets.some(s => s.name === activeSheet) || customTabs.includes(activeSheet);
      if (!isAllowed && allowedCoreSheets.length > 0) {
        setActiveSheet(allowedCoreSheets[0].name);
      }
    }
  }, [activeSheet, currentUser, isLoggedIn, customTabs]);

  if (!isLoggedIn) {
    return (
      <LoginView
        userAccounts={userAccounts}
        logoUrl={schoolSettings.logoUrl}
        onLogin={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          // Set first available allowed sheet
          if (user.role === "Instruktur") {
            setActiveSheet("Absensi Siswa");
          } else if (user.role === "Siswa") {
            setActiveSheet("Tagihan Saya");
          } else if (user.allowedTabs && user.allowedTabs.length > 0) {
            setActiveSheet(user.allowedTabs[0]);
          } else {
            setActiveSheet("Dashboard & Ringkasan");
          }
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100" style={{ "--primary-color": schoolSettings.warnaUtama } as React.CSSProperties}>
      
      {/* BRAND HEADER BANNER */}
      <header className="text-white flex-shrink-0 flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-white/10" style={{ backgroundColor: schoolSettings.warnaUtama }}>
        <div className="flex items-center space-x-4">
          
          {/* Stunning Crisp SVG Logo */}
          <div className="flex-shrink-0">
            <NanditaLogo variant="icon" height={56} logoUrl={schoolSettings.logoUrl} />
          </div>

          <div className="text-left">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-bold tracking-wide uppercase font-sans">
                {schoolSettings.namaLembaga}
              </h1>
              <span className="hidden sm:inline-block bg-amber-400 text-teal-950 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                EXCEL MASTER v2.0
              </span>
            </div>
            <p className="text-xs text-white/80 font-medium italic mt-0.5">
              {schoolSettings.tagline}
            </p>
          </div>
        </div>

        {/* User Info & Institutional Statistics */}
        <div className="flex flex-wrap items-center gap-4 mt-3 md:mt-0">
          {currentUser && (
            <div className="flex items-center space-x-2.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-sm">
              <div className="text-right">
                <span className="text-[10px] text-white/70 block font-mono">PENGGUNA</span>
                <span className="text-xs font-bold text-amber-300 block">{currentUser.username} ({currentUser.role})</span>
              </div>
              <button 
                id="btn-logout"
                onClick={() => {
                  setIsLoggedIn(false);
                  setCurrentUser(null);
                }}
                className="bg-red-500/80 hover:bg-red-600 text-white rounded-lg p-1.5 transition ml-1"
                title="Log Out dari Sistem"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="hidden lg:flex items-center space-x-4 border-l border-white/20 pl-4">
            <div className="text-right">
              <span className="text-[10px] text-white/75 uppercase tracking-wider block">Akreditasi</span>
              <span className="text-xs font-bold text-amber-400 font-sans block max-w-[200px] truncate" title={schoolSettings.akreditasi || "Grade A"}>
                {schoolSettings.akreditasi || "Grade A"}
              </span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-right">
              <span className="text-[10px] text-white/75 uppercase tracking-wider block">Penyerapan Kerja</span>
              <span className="text-xs font-bold text-white block">
                {Math.round((jobs.filter(j => j.status === JobStatus.Berangkat || j.status === JobStatus.Lolos).length / (siswa.length || 1)) * 100)}%
              </span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-right">
              <span className="text-[10px] text-white/75 uppercase tracking-wider block">Total Penerimaan Kas</span>
              <span className="text-xs font-bold font-mono text-green-300 block">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(keuangan.reduce((acc, k) => acc + k.totalBayar, 0))}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORK AREA */}
      <main className="flex-1 overflow-hidden bg-white relative flex flex-col">
        {renderActiveSheet()}
      </main>

      {/* BOTTOM EXCEL TAB SHEET BAR (Pure spreadsheet workbook style) */}
      <footer className="bg-gray-100 border-t border-gray-300 px-3 py-1 flex items-center justify-between flex-shrink-0 text-xs text-gray-600 select-none">
        <div className="flex items-center space-x-0.5 overflow-x-auto max-w-full pb-0.5" id="sheet-selector-tabs">
          
          {/* Excel Navigation Indicator */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 flex-shrink-0 text-gray-400">
            <ChevronRight className="w-4 h-4" />
          </div>

          {/* Render core sheets */}
          {allowedCoreSheets.map((sheet) => {
            const IconComponent = sheet.icon;
            const isActive = activeSheet === sheet.name;
            return (
              <button
                key={sheet.name}
                id={`tab-sheet-${sheet.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() => setActiveSheet(sheet.name)}
                style={isActive ? { borderTopColor: schoolSettings.warnaUtama, color: schoolSettings.warnaUtama } : {}}
                className={`px-3 py-1.5 flex items-center space-x-1.5 border-r border-gray-300 font-semibold transition cursor-pointer text-[11px] ${
                  isActive 
                    ? "bg-white border-t-2 border-b border-b-transparent shadow-inner" 
                    : "hover:bg-gray-200 text-slate-500 bg-gray-100 border-b border-b-gray-300"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" style={isActive ? { color: schoolSettings.warnaUtama } : { color: "#94a3b8" }} />
                <span>{sheet.name}</span>
              </button>
            );
          })}

          {/* Render custom added sheet tabs */}
          {customTabs.map((tabName) => {
            const isActive = activeSheet === tabName;
            return (
              <button
                key={tabName}
                onClick={() => setActiveSheet(tabName)}
                style={isActive ? { borderTopColor: schoolSettings.warnaUtama, color: schoolSettings.warnaUtama } : {}}
                className={`px-3 py-1.5 flex items-center space-x-1.5 border-r border-gray-300 font-semibold transition cursor-pointer text-[11px] ${
                  isActive 
                    ? "bg-white border-t-2 border-b border-b-transparent shadow-inner" 
                    : "hover:bg-gray-200 text-slate-500 bg-gray-100 border-b border-b-gray-300"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" style={isActive ? { color: schoolSettings.warnaUtama } : { color: "#94a3b8" }} />
                <span>{tabName}</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Hapus sheet "${tabName}"?`)) {
                      const updated = customTabs.filter(t => t !== tabName);
                      setCustomTabs(updated);
                      setActiveSheet("Dashboard & Ringkasan");
                      saveAllToLocalStorage(schoolSettings, siswa, staff, absensi, sertifikat, keuangan, pembayaranLog, payroll, jobs, updated);
                    }
                  }}
                  className="ml-1 text-red-500 hover:text-red-700 hover:bg-gray-200 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center font-bold"
                  title="Hapus Sheet"
                >
                  ✕
                </span>
              </button>
            );
          })}

          {/* Excel "+" Button to add sheet */}
          <button
            id="btn-add-excel-tab"
            onClick={handleAddBlankSheet}
            style={{ color: schoolSettings.warnaUtama }}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 font-bold border-r border-b border-b-gray-300 border-gray-300 transition cursor-pointer text-xs"
            title="Tambah Lembar Kerja Baru (Sheet)"
          >
            +
          </button>
        </div>

        {/* Micro System Notes */}
        <div className="hidden md:flex items-center space-x-2 font-mono text-[10px] text-gray-400 pr-2">
          <span>CAPS LOCK OFF</span>
          <span>|</span>
          <span>NUM LOCK ON</span>
        </div>
      </footer>

      {/* Reusable WhatsApp Dispatch Center Modal */}
      {pendingWhatsApp && (
        <WhatsAppModal
          notification={pendingWhatsApp}
          onClose={() => setPendingWhatsApp(null)}
        />
      )}
    </div>
  );
}
