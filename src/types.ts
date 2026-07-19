/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProgramStudi {
  Perhotelan = "Perhotelan",
  KapalPesiar = "Kapal Pesiar",
  CulinaryArts = "Culinary Arts",
  CabinCrew = "Cabin Crew"
}

export enum Gender {
  LakiLaki = "Laki-laki",
  Perempuan = "Perempuan"
}

export enum SiswaStatus {
  Aktif = "Aktif",
  Lulus = "Lulus",
  Cuti = "Cuti",
  Keluar = "Keluar"
}

export enum StaffRole {
  Staf = "Staf",
  Instruktur = "Instruktur",
  Manajemen = "Manajemen"
}

export enum AbsensiStatus {
  Hadir = "Hadir",
  Sakit = "Sakit",
  Izin = "Izin",
  Alpa = "Alpa"
}

export enum JobLocationType {
  DalamNegeri = "Dalam Negeri",
  LuarNegeri = "Luar Negeri"
}

export enum JobStatus {
  Daftar = "Daftar",
  Interview = "Interview",
  Lolos = "Lolos",
  Berangkat = "Berangkat",
  Ditolak = "Ditolak"
}

export interface Siswa {
  id: string; // Unique ID, e.g. SIS-001
  nama: string;
  nis: string; // Nomor Induk Siswa
  tempatLahir: string;
  tanggalLahir: string;
  gender: Gender;
  alamat: string;
  noHp: string;
  programStudi: ProgramStudi;
  angkatan: string;
  tanggalDaftar: string;
  status: SiswaStatus;
  // Extended Buku Induk fields (optional for backwards compatibility)
  nik?: string;
  agama?: string;
  pendidikanTerakhir?: string;
  namaAyah?: string;
  pekerjaanAyah?: string;
  namaIbu?: string;
  pekerjaanIbu?: string;
  noHpOrangTua?: string;
  tinggiBadan?: string;
  beratBadan?: string;
  catatanKesehatan?: string;
  // Academic grades and graduation predicate
  nilaiHousekeeping?: string;
  nilaiFBService?: string;
  nilaiCulinaryArt?: string;
  nilaiBahasaInggris?: string;
  nilaiBahasaTurki?: string;
  predikatKelulusan?: string;
}

export interface Staff {
  id: string; // STF-001
  nama: string;
  nip: string; // Nomor Induk Pegawai
  role: StaffRole;
  spesialisasi: string; // e.g. "Food & Beverage", "Housekeeping", "Bahasa Inggris"
  noHp: string;
  alamat: string;
  status: "Aktif" | "Non-Aktif";
  gajiPokok: number;
}

export interface Absensi {
  id: string; // ABS-001
  tanggal: string; // YYYY-MM-DD
  targetId: string; // ID of Siswa, Staf, or Instruktur
  nama: string;
  kategori: "Siswa" | "Staf" | "Instruktur";
  status: AbsensiStatus;
  keterangan: string;
  jamMasuk?: string; // Jam masuk mengajar (Guru/Staf)
  jamSelesai?: string; // Jam selesai mengajar (Guru/Staf)
}

export interface Sertifikat {
  id: string; // CERT-001
  siswaId: string;
  siswaNama: string;
  namaKompetensi: string; // e.g. "Table Manners & Fine Dining", "Basic Safety Training (BST)"
  nomorSertifikat: string;
  tanggalTerbit: string;
  tanggalKadaluarsa: string;
  nilai: string; // e.g. "Sangat Baik (A)", "A+", "Lulus"
  penerbit: string; // LPK Nandita Floating Hotel or external agency
}

export interface KeuanganSiswa {
  id: string; // KEU-001
  siswaId: string;
  siswaNama: string;
  totalBiaya: number; // Tuition fees
  totalBayar: number; // Total payments made
  piutang: number; // totalBiaya - totalBayar (calculated)
  statusBayar: "Lunas" | "Belum Lunas" | "Belum Bayar";
  pembayaranTerakhir: string;
}

export interface PembayaranLog {
  id: string; // PAY-001
  keuanganSiswaId: string;
  siswaNama: string;
  tanggalBayar: string;
  jumlahBayar: number;
  metodeBayar: string; // Cash, Transfer Bank, dll.
  keterangan: string;
}

export interface Payroll {
  id: string; // PAYR-001
  staffId: string;
  staffNama: string;
  role: StaffRole;
  bulan: string; // e.g. "Juli 2026"
  gajiPokok: number;
  tunjangan: number;
  lemburBonus: number;
  potongan: number;
  totalGaji: number; // GajiPokok + Tunjangan + LemburBonus - Potongan
  tanggalBayar: string;
  statusGaji: "Dibayar" | "Pending";
}

export interface JobRegister {
  id: string; // JOB-001
  siswaId: string;
  siswaNama: string;
  programStudi: ProgramStudi;
  namaPerusahaan: string; // e.g. "Royal Caribbean", "Hilton Hotel Jakarta"
  posisi: string; // e.g. "Assistant Cook", "Steward", "Bartender"
  lokasiTipe: JobLocationType;
  negaraKota: string; // e.g. "Miami, USA", "Bali, Indonesia"
  gajiPerkiraan: string; // e.g. "USD 1,500 / month"
  tanggalDaftar: string;
  status: JobStatus;
}

export interface SchoolSettings {
  namaLembaga: string;
  tagline: string;
  alamat: string;
  noTelepon: string;
  email: string;
  website: string;
  direkturNama: string;
  direkturNip: string;
  logoUrl: string; // SVG data or image URL
  warnaUtama: string; // Primary hex color code
  akreditasi?: string; // LPK Accreditation info
  nomorIzin?: string; // LPK School License number
  kopSuratPosisi?: "Kiri" | "Tengah" | "Kanan" | "LogoKiri_TeksTengah"; // Alignment of the letterhead (Kiri = left, Tengah = center, Kanan = right, LogoKiri_TeksTengah = logo on left but text is centered)
  // Bank transfer details
  bankNama?: string;
  bankRekening?: string;
  bankAtasNama?: string;
  googleSpreadsheetId?: string;
  autoSyncEnabled?: boolean;
  waTemplatePembayaran?: string;
  waTemplateTagihanSiswa?: string;
  waTemplateGaji?: string;
  waTemplateDanaMasuk?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  nama: string;
  role: "Admin" | "Staf" | "Keuangan" | "Instruktur" | "Siswa";
  status: "Aktif" | "Non-Aktif";
  password?: string;
  allowedTabs?: string[];
  siswaId?: string; // Menghubungkan akun ke ID Siswa jika rolenya Siswa
}

export interface TagihanSiswa {
  id: string;
  siswaId: string;
  siswaNama: string;
  namaTagihan: string; // e.g. "Pendaftaran", "Uang Gedung", "Seragam", "Sertifikasi", "Sewa Mess"
  jumlah: number;
  tanggalTagihan: string;
  status: "Lunas" | "Belum Lunas";
  deskripsi: string;
}

export interface PendapatanLain {
  id: string;
  tanggal: string;
  kategori: string; // e.g. "Sewa Ruangan", "Kemitraan", "Sertifikasi Luar", "Lain-lain"
  jumlah: number;
  keterangan: string;
  penerima: string;
}

export interface PengeluaranKas {
  id: string;
  tanggal: string;
  kategori: string; // e.g. "Alat Tulis", "Listrik", "Promosi", "Transportasi", "Lain-lain"
  jumlah: number;
  keterangan: string;
  penanggungJawab: string;
}

export interface UtangPegawai {
  id: string;
  staffId: string;
  staffNama: string;
  tanggalPinjam: string;
  jumlahPinjam: number;
  totalBayar: number;
  sisaUtang: number; // calculated: jumlahPinjam - totalBayar
  deskripsi: string;
  status: "Belum Lunas" | "Lunas";
  riwayatCicilan: {
    id: string;
    tanggal: string;
    jumlah: number;
    keterangan: string;
  }[];
}

