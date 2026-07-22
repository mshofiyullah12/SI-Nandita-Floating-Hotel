/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  ProgramStudi,
  Gender,
  SiswaStatus,
  StaffRole,
  AbsensiStatus,
  JobLocationType,
  JobStatus,
  UserAccount,
  TagihanSiswa,
  PendapatanLain,
  PengeluaranKas,
  UtangPegawai
} from "./types";

export const initialSchoolSettings: SchoolSettings = {
  namaLembaga: "LPK Nandita Floating Hotel",
  tagline: "Pusat Pendidikan & Pelatihan Perhotelan dan Kapal Pesiar",
  alamat: "Jl. Raya Floating Hotel No. 88, Kawasan Pendidikan Maritim, Indonesia",
  noTelepon: "+62 821-3456-7890",
  email: "info@nanditafloatinghotel.com",
  website: "www.nanditafloatinghotel.com",
  direkturNama: "Nandita Wahyuni, M.Par.",
  direkturNip: "NIP. 19820512 201012 2 001",
  logoUrl: "", // We can render a fallback custom icon/logo in the UI
  warnaUtama: "#001f3f", // Navy-900 (Bento Grid Theme)
  akreditasi: "Terakreditasi A (Sangat Baik) - LA-LPK",
  nomorIzin: "KEP. 421.9/3024/436.7.15/2026",
  kopSuratPosisi: "Kiri",
  bankNama: "Bank Mandiri",
  bankRekening: "142-00-1234567-8",
  bankAtasNama: "LPK NANDITA FLOATING HOTEL",
  googleSpreadsheetId: "",
  autoSyncEnabled: false,
  waTemplatePembayaran: `*BUKTI PEMBAYARAN RESMI* ✅
{lembaga}

Yth. *{nama_siswa}*,
Terima kasih, pembayaran Anda telah berhasil kami terima dan verifikasi.

*Rincian Transaksi:*
- *Tanggal:* {tanggal}
- *Nominal:* {nominal}
- *Keterangan:* {keterangan}
- *Sisa Tunggakan Siswa:* {sisa_piutang}

Pembayaran ini telah tercatat secara otomatis di Buku Induk Siswa. Silakan hubungi bagian Administrasi jika ada pertanyaan.
_Pesan ini dikirim otomatis oleh Sistem Keuangan {lembaga}._`,
  waTemplateTagihanSiswa: `*PENGINGAT TUNGGAKAN SISWA* 📢
{lembaga}

Yth. *{nama_siswa}*,
Kami menginfokan ringkasan administrasi keuangan pendidikan Anda:

- *Total Biaya Pendidikan:* {total_biaya}
- *Sudah Dibayarkan:* {terbayar}
- *Sisa Tunggakan Siswa:* *{sisa_piutang}*

Mohon untuk segera melakukan pembayaran angsuran melalui transfer atau tunai ke bagian kasir LPK sebelum batas waktu program berakhir.
_Pesan ini dikirim otomatis oleh Sistem Keuangan {lembaga}._`,
  waTemplateGaji: `*SLIP GAJI BULANAN RESMI (WHATSAPP)* 💼
{lembaga}

Yth. *{nama_staf}* ({peran}),
Gaji Anda untuk periode *{bulan}* telah berhasil dibayarkan pada tanggal {tanggal}.

*Rincian Slip Gaji:*
- *Gaji Pokok:* {gaji_pokok}
- *Tunjangan Tetap:* {tunjangan}
- *Lembur & Bonus:* {lembur_bonus}
- *Potongan Kas:* -{potongan}
- *Take Home Pay:* *{take_home_pay}*

_Gaji telah ditransfer ke rekening terdaftar Anda. Terima kasih atas dedikasi dan profesionalisme Anda dalam memajukan {lembaga}!_`,
  waTemplateDanaMasuk: `*NOTIFIKASI UANG MASUK (TRANSFER)* 💰
{lembaga}

Telah diterima dana transfer masuk ke rekening lembaga:

- *Tanggal Penerimaan:* {tanggal}
- *Nominal:* *{nominal}*
- *Kategori:* {kategori}
- *Keterangan:* {keterangan}
- *Penerima Kas:* {penerima}

Dana telah diverifikasi aman dan dibukukan ke dalam Kas Operasional {lembaga}.`
};

export const initialSiswa: Siswa[] = [];

export const initialStaff: Staff[] = [];

export const initialAbsensi: Absensi[] = [];

export const initialSertifikat: Sertifikat[] = [];

export const initialKeuanganSiswa: KeuanganSiswa[] = [];

export const initialPembayaranLog: PembayaranLog[] = [];

export const initialPayroll: Payroll[] = [];

export const initialJobRegister: JobRegister[] = [];

export const initialUsers: UserAccount[] = [
  {
    id: "USR-001",
    username: "admin",
    nama: "Nandita Wahyuni, M.Par.",
    role: "Admin",
    status: "Aktif",
    password: "admin"
  },
  {
    id: "USR-002",
    username: "staf",
    nama: "Budi Santoso, S.Kom.",
    role: "Staf",
    status: "Aktif",
    password: "staf"
  },
  {
    id: "USR-003",
    username: "keuangan",
    nama: "Siti Rahmawati, A.Md.",
    role: "Keuangan",
    status: "Aktif",
    password: "keuangan"
  }
];

export const initialTagihan: TagihanSiswa[] = [];

export const initialPendapatanLain: PendapatanLain[] = [];

export const initialPengeluaranKas: PengeluaranKas[] = [];

export const initialUtangPegawai: UtangPegawai[] = [];

export const defaultJenisPendapatan = [
  "Uang Pangkal",
  "SPP Bulanan",
  "Ujian Kompetensi",
  "Sewa Ruangan",
  "Kemitraan",
  "Sertifikasi Luar",
  "Donasi & Hibah",
  "Lain-lain"
];

export const defaultKatPengeluaran = [
  "Alat Tulis & Kantor",
  "Bahan Praktik Kuliner",
  "Listrik & Internet",
  "Promosi & Brosur",
  "Sewa Mess & Gedung",
  "Pemeliharaan Peralatan",
  "Gaji & Lembur Staf",
  "Transportasi & Dinas",
  "Lain-lain"
];


