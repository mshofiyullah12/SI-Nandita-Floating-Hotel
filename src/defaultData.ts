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
  bankNama: "Bank Mandiri",
  bankRekening: "142-00-1234567-8",
  bankAtasNama: "LPK NANDITA FLOATING HOTEL"
};

export const initialSiswa: Siswa[] = [
  {
    id: "SIS-001",
    nama: "Rian Hidayat",
    nis: "202601001",
    tempatLahir: "Surabaya",
    tanggalLahir: "2004-05-14",
    gender: Gender.LakiLaki,
    alamat: "Sidoarjo, Jawa Timur",
    noHp: "081234567801",
    programStudi: ProgramStudi.KapalPesiar,
    angkatan: "Angkatan 12",
    tanggalDaftar: "2026-01-10",
    status: SiswaStatus.Aktif
  },
  {
    id: "SIS-002",
    nama: "Siti Aminah",
    nis: "202601002",
    tempatLahir: "Semarang",
    tanggalLahir: "2005-08-22",
    gender: Gender.Perempuan,
    alamat: "Kendal, Jawa Tengah",
    noHp: "082345678902",
    programStudi: ProgramStudi.Perhotelan,
    angkatan: "Angkatan 12",
    tanggalDaftar: "2026-01-12",
    status: SiswaStatus.Aktif
  },
  {
    id: "SIS-003",
    nama: "Gusti Bagus Putu",
    nis: "202601003",
    tempatLahir: "Denpasar",
    tanggalLahir: "2004-11-03",
    gender: Gender.LakiLaki,
    alamat: "Kuta, Bali",
    noHp: "085739112233",
    programStudi: ProgramStudi.CabinCrew,
    angkatan: "Angkatan 11",
    tanggalDaftar: "2025-07-05",
    status: SiswaStatus.Lulus
  },
  {
    id: "SIS-004",
    nama: "Amalia Putri",
    nis: "202601004",
    tempatLahir: "Yogyakarta",
    tanggalLahir: "2005-02-18",
    gender: Gender.Perempuan,
    alamat: "Sleman, DIY",
    noHp: "089876543210",
    programStudi: ProgramStudi.CulinaryArts,
    angkatan: "Angkatan 12",
    tanggalDaftar: "2026-01-15",
    status: SiswaStatus.Aktif
  },
  {
    id: "SIS-005",
    nama: "Fadillah Ramadhan",
    nis: "202601005",
    tempatLahir: "Jakarta",
    tanggalLahir: "2004-10-29",
    gender: Gender.LakiLaki,
    alamat: "Depok, Jawa Barat",
    noHp: "081299887766",
    programStudi: ProgramStudi.KapalPesiar,
    angkatan: "Angkatan 12",
    tanggalDaftar: "2026-01-15",
    status: SiswaStatus.Aktif
  }
];

export const initialStaff: Staff[] = [
  {
    id: "STF-001",
    nama: "Budi Santoso",
    nip: "197804152005011002",
    role: StaffRole.Instruktur,
    spesialisasi: "F&B Service & Cruise Ship Management",
    noHp: "081223344556",
    alamat: "Surabaya, Jawa Timur",
    status: "Aktif",
    gajiPokok: 6500000
  },
  {
    id: "STF-002",
    nama: "Agnes Monica Siahaan",
    nip: "198511022012082003",
    role: StaffRole.Instruktur,
    spesialisasi: "Housekeeping & Laundry Operation",
    noHp: "081334455667",
    alamat: "Sidoarjo, Jawa Timur",
    status: "Aktif",
    gajiPokok: 6200000
  },
  {
    id: "STF-003",
    nama: "Irwan Hermawan",
    nip: "198006122008041001",
    role: StaffRole.Manajemen,
    spesialisasi: "Kepala Administrasi & Akademik",
    noHp: "081122334455",
    alamat: "Gresik, Jawa Timur",
    status: "Aktif",
    gajiPokok: 7500000
  },
  {
    id: "STF-004",
    nama: "Dewi Lestari",
    nip: "199201102021022002",
    role: StaffRole.Staf,
    spesialisasi: "Staf Administrasi & Keuangan",
    noHp: "085233449900",
    alamat: "Mojokerto, Jawa Timur",
    status: "Aktif",
    gajiPokok: 4500000
  },
  {
    id: "STF-005",
    nama: "Chef Ronald Wijaya",
    nip: "198107192015011005",
    role: StaffRole.Instruktur,
    spesialisasi: "Culinary Arts & Galley Operations",
    noHp: "081244556677",
    alamat: "Surabaya, Jawa Timur",
    status: "Aktif",
    gajiPokok: 7000000
  }
];

export const initialAbsensi: Absensi[] = [
  // Today's Date or representative dates (e.g. 2026-07-17)
  {
    id: "ABS-001",
    tanggal: "2026-07-17",
    targetId: "SIS-001",
    nama: "Rian Hidayat",
    kategori: "Siswa",
    status: AbsensiStatus.Hadir,
    keterangan: "Tepat waktu"
  },
  {
    id: "ABS-002",
    tanggal: "2026-07-17",
    targetId: "SIS-002",
    nama: "Siti Aminah",
    kategori: "Siswa",
    status: AbsensiStatus.Izin,
    keterangan: "Acara keluarga penting"
  },
  {
    id: "ABS-003",
    tanggal: "2026-07-17",
    targetId: "SIS-004",
    nama: "Amalia Putri",
    kategori: "Siswa",
    status: AbsensiStatus.Hadir,
    keterangan: "Tepat waktu"
  },
  {
    id: "ABS-004",
    tanggal: "2026-07-17",
    targetId: "SIS-005",
    nama: "Fadillah Ramadhan",
    kategori: "Siswa",
    status: AbsensiStatus.Sakit,
    keterangan: "Demam, surat dokter"
  },
  {
    id: "ABS-005",
    tanggal: "2026-07-17",
    targetId: "STF-001",
    nama: "Budi Santoso",
    kategori: "Instruktur",
    status: AbsensiStatus.Hadir,
    keterangan: "Mengajar materi Food Service",
    jamMasuk: "08:00",
    jamSelesai: "11:30"
  },
  {
    id: "ABS-006",
    tanggal: "2026-07-17",
    targetId: "STF-002",
    nama: "Agnes Monica Siahaan",
    kategori: "Instruktur",
    status: AbsensiStatus.Hadir,
    keterangan: "Mengajar materi Housekeeping",
    jamMasuk: "09:00",
    jamSelesai: "12:00"
  },
  {
    id: "ABS-007",
    tanggal: "2026-07-17",
    targetId: "STF-003",
    nama: "Irwan Hermawan",
    kategori: "Staf",
    status: AbsensiStatus.Hadir,
    keterangan: "Dinas Kantor",
    jamMasuk: "08:00",
    jamSelesai: "16:00"
  },
  {
    id: "ABS-008",
    tanggal: "2026-07-17",
    targetId: "STF-004",
    nama: "Dewi Lestari",
    kategori: "Staf",
    status: AbsensiStatus.Hadir,
    keterangan: "Melayani pembayaran siswa",
    jamMasuk: "08:00",
    jamSelesai: "16:00"
  }
];

export const initialSertifikat: Sertifikat[] = [
  {
    id: "CERT-001",
    siswaId: "SIS-003",
    siswaNama: "Gusti Bagus Putu",
    namaKompetensi: "Basic Safety Training (BST)",
    nomorSertifikat: "BST-LPKN-12931-2025",
    tanggalTerbit: "2025-11-20",
    tanggalKadaluarsa: "2030-11-20",
    nilai: "Sangat Baik (A)",
    penerbit: "LPK Nandita & Syahbandar Utama"
  },
  {
    id: "CERT-002",
    siswaId: "SIS-003",
    siswaNama: "Gusti Bagus Putu",
    namaKompetensi: "Food & Beverage Captain Competency",
    nomorSertifikat: "FBC-LPKN-0912-2025",
    tanggalTerbit: "2025-12-15",
    tanggalKadaluarsa: "2028-12-15",
    nilai: "A+",
    penerbit: "LPK Nandita Floating Hotel"
  },
  {
    id: "CERT-003",
    siswaId: "SIS-001",
    siswaNama: "Rian Hidayat",
    namaKompetensi: "Table Manners & Fine Dining Etiquette",
    nomorSertifikat: "TM-LPKN-22003-2026",
    tanggalTerbit: "2026-04-05",
    tanggalKadaluarsa: "Unlimited",
    nilai: "Memuaskan (B+)",
    penerbit: "LPK Nandita Floating Hotel"
  }
];

export const initialKeuanganSiswa: KeuanganSiswa[] = [
  {
    id: "KEU-001",
    siswaId: "SIS-001",
    siswaNama: "Rian Hidayat",
    totalBiaya: 18500000,
    totalBayar: 12000000,
    piutang: 6500000,
    statusBayar: "Belum Lunas",
    pembayaranTerakhir: "2026-06-10"
  },
  {
    id: "KEU-002",
    siswaId: "SIS-002",
    siswaNama: "Siti Aminah",
    totalBiaya: 15000000,
    totalBayar: 15000000,
    piutang: 0,
    statusBayar: "Lunas",
    pembayaranTerakhir: "2026-05-15"
  },
  {
    id: "KEU-003",
    siswaId: "SIS-003",
    siswaNama: "Gusti Bagus Putu",
    totalBiaya: 19000000,
    totalBayar: 19000000,
    piutang: 0,
    statusBayar: "Lunas",
    pembayaranTerakhir: "2025-11-10"
  },
  {
    id: "KEU-004",
    siswaId: "SIS-004",
    siswaNama: "Amalia Putri",
    totalBiaya: 16500000,
    totalBayar: 5000000,
    piutang: 11500000,
    statusBayar: "Belum Lunas",
    pembayaranTerakhir: "2026-02-01"
  },
  {
    id: "KEU-005",
    siswaId: "SIS-005",
    siswaNama: "Fadillah Ramadhan",
    totalBiaya: 18500000,
    totalBayar: 0,
    piutang: 18500000,
    statusBayar: "Belum Bayar",
    pembayaranTerakhir: "-"
  }
];

export const initialPembayaranLog: PembayaranLog[] = [
  {
    id: "PAY-001",
    keuanganSiswaId: "KEU-001",
    siswaNama: "Rian Hidayat",
    tanggalBayar: "2026-01-11",
    jumlahBayar: 5000000,
    metodeBayar: "Transfer BCA",
    keterangan: "Pembayaran DP Pendaftaran"
  },
  {
    id: "PAY-002",
    keuanganSiswaId: "KEU-001",
    siswaNama: "Rian Hidayat",
    tanggalBayar: "2026-06-10",
    jumlahBayar: 7000000,
    metodeBayar: "Cash",
    keterangan: "Angsuran Pendidikan ke-2"
  },
  {
    id: "PAY-003",
    keuanganSiswaId: "KEU-002",
    siswaNama: "Siti Aminah",
    tanggalBayar: "2026-01-12",
    jumlahBayar: 7500000,
    metodeBayar: "Transfer Mandiri",
    keterangan: "Pembayaran Tahap 1"
  },
  {
    id: "PAY-004",
    keuanganSiswaId: "KEU-002",
    siswaNama: "Siti Aminah",
    tanggalBayar: "2026-05-15",
    jumlahBayar: 7500000,
    metodeBayar: "Transfer Mandiri",
    keterangan: "Pelunasan Biaya Pendidikan"
  },
  {
    id: "PAY-005",
    keuanganSiswaId: "KEU-004",
    siswaNama: "Amalia Putri",
    tanggalBayar: "2026-02-01",
    jumlahBayar: 5000000,
    metodeBayar: "Transfer BNI",
    keterangan: "Pembayaran Uang Muka"
  }
];

export const initialPayroll: Payroll[] = [
  {
    id: "PAYR-001",
    staffId: "STF-001",
    staffNama: "Budi Santoso",
    role: StaffRole.Instruktur,
    bulan: "Juni 2026",
    gajiPokok: 6500000,
    tunjangan: 1200000,
    lemburBonus: 800000,
    potongan: 200000,
    totalGaji: 8300000,
    tanggalBayar: "2026-06-28",
    statusGaji: "Dibayar"
  },
  {
    id: "PAYR-002",
    staffId: "STF-002",
    staffNama: "Agnes Monica Siahaan",
    role: StaffRole.Instruktur,
    bulan: "Juni 2026",
    gajiPokok: 6200000,
    tunjangan: 1000000,
    lemburBonus: 500000,
    potongan: 150000,
    totalGaji: 7550000,
    tanggalBayar: "2026-06-28",
    statusGaji: "Dibayar"
  },
  {
    id: "PAYR-003",
    staffId: "STF-003",
    staffNama: "Irwan Hermawan",
    role: StaffRole.Manajemen,
    bulan: "Juni 2026",
    gajiPokok: 7500000,
    tunjangan: 1500000,
    lemburBonus: 0,
    potongan: 250000,
    totalGaji: 8750000,
    tanggalBayar: "2026-06-28",
    statusGaji: "Dibayar"
  },
  {
    id: "PAYR-004",
    staffId: "STF-004",
    staffNama: "Dewi Lestari",
    role: StaffRole.Staf,
    bulan: "Juni 2026",
    gajiPokok: 4500000,
    tunjangan: 500000,
    lemburBonus: 300000,
    potongan: 100000,
    totalGaji: 5200000,
    tanggalBayar: "2026-06-28",
    statusGaji: "Dibayar"
  }
];

export const initialJobRegister: JobRegister[] = [
  {
    id: "JOB-001",
    siswaId: "SIS-003",
    siswaNama: "Gusti Bagus Putu",
    programStudi: ProgramStudi.CabinCrew,
    namaPerusahaan: "Royal Caribbean International Cruises",
    posisi: "Cabin Steward",
    lokasiTipe: JobLocationType.LuarNegeri,
    negaraKota: "Miami, Florida - USA",
    gajiPerkiraan: "USD 1,650 / month",
    tanggalDaftar: "2026-01-20",
    status: JobStatus.Berangkat
  },
  {
    id: "JOB-002",
    siswaId: "SIS-001",
    siswaNama: "Rian Hidayat",
    programStudi: ProgramStudi.KapalPesiar,
    namaPerusahaan: "Carnival Cruise Line",
    posisi: "Assistant Food Server",
    lokasiTipe: JobLocationType.LuarNegeri,
    negaraKota: "Galveston, Texas - USA",
    gajiPerkiraan: "USD 1,400 / month",
    tanggalDaftar: "2026-06-15",
    status: JobStatus.Lolos
  },
  {
    id: "JOB-003",
    siswaId: "SIS-002",
    siswaNama: "Siti Aminah",
    programStudi: ProgramStudi.Perhotelan,
    namaPerusahaan: "The Ritz-Carlton Hotel Jakarta",
    posisi: "Front Office Receptionist",
    lokasiTipe: JobLocationType.DalamNegeri,
    negaraKota: "Jakarta, Indonesia",
    gajiPerkiraan: "IDR 6,500,000 / month",
    tanggalDaftar: "2026-06-20",
    status: JobStatus.Interview
  },
  {
    id: "JOB-004",
    siswaId: "SIS-004",
    siswaNama: "Amalia Putri",
    programStudi: ProgramStudi.CulinaryArts,
    namaPerusahaan: "Marina Bay Sands Hotel",
    posisi: "Commis Chef",
    lokasiTipe: JobLocationType.LuarNegeri,
    negaraKota: "Singapore",
    gajiPerkiraan: "SGD 2,200 / month",
    tanggalDaftar: "2026-07-02",
    status: JobStatus.Daftar
  }
];

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
  },
  {
    id: "USR-004",
    username: "siswa",
    nama: "Rian Hidayat",
    role: "Siswa",
    status: "Aktif",
    password: "siswa",
    siswaId: "SIS-001"
  },
  {
    id: "USR-005",
    username: "siti",
    nama: "Siti Aminah",
    role: "Siswa",
    status: "Aktif",
    password: "siti",
    siswaId: "SIS-002"
  }
];

export const initialTagihan: TagihanSiswa[] = [
  {
    id: "TAG-001",
    siswaId: "SIS-001",
    siswaNama: "Rian Hidayat",
    namaTagihan: "Uang Pendaftaran & Jas Almamater",
    jumlah: 1500000,
    tanggalTagihan: "2026-01-10",
    status: "Lunas",
    deskripsi: "Biaya pendaftaran awal beserta jas almamater angkatan 12"
  },
  {
    id: "TAG-002",
    siswaId: "SIS-001",
    siswaNama: "Rian Hidayat",
    namaTagihan: "SPP Bulanan - Tahap 1",
    jumlah: 4500000,
    tanggalTagihan: "2026-02-05",
    status: "Lunas",
    deskripsi: "Cicilan SPP pendidikan Kapal Pesiar tahap 1"
  },
  {
    id: "TAG-003",
    siswaId: "SIS-001",
    siswaNama: "Rian Hidayat",
    namaTagihan: "SPP Bulanan - Tahap 2",
    jumlah: 4500000,
    tanggalTagihan: "2026-04-05",
    status: "Belum Lunas",
    deskripsi: "Cicilan SPP pendidikan Kapal Pesiar tahap 2"
  },
  {
    id: "TAG-004",
    siswaId: "SIS-002",
    siswaNama: "Siti Aminah",
    namaTagihan: "Uang Pendaftaran & Jas Almamater",
    jumlah: 1500000,
    tanggalTagihan: "2026-01-12",
    status: "Lunas",
    deskripsi: "Uang pangkal pendaftaran"
  },
  {
    id: "TAG-005",
    siswaId: "SIS-003",
    siswaNama: "Yusuf Mansur",
    namaTagihan: "Uang Pendaftaran & Kursus Intensif",
    jumlah: 2500000,
    tanggalTagihan: "2026-02-15",
    status: "Belum Lunas",
    deskripsi: "Biaya tambahan kursus intensif percakapan bahasa Inggris maritim"
  }
];

export const initialPendapatanLain: PendapatanLain[] = [
  {
    id: "INC-001",
    tanggal: "2026-07-01",
    kategori: "Sewa Ruangan",
    jumlah: 1200000,
    keterangan: "Sewa Aula Utama untuk acara sosialisasi agen kapal pesiar eksternal",
    penerima: "Siti Rahmawati"
  },
  {
    id: "INC-002",
    tanggal: "2026-07-05",
    kategori: "Kemitraan",
    jumlah: 3500000,
    keterangan: "Dana sponsor dari Meratus Line untuk pelatihan cadet magang",
    penerima: "Nandita Wahyuni"
  },
  {
    id: "INC-003",
    tanggal: "2026-07-10",
    kategori: "Sertifikasi Luar",
    jumlah: 1800000,
    keterangan: "Ujian kompetensi kuliner mandiri untuk 3 koki restoran lokal",
    penerima: "Siti Rahmawati"
  }
];

export const initialPengeluaranKas: PengeluaranKas[] = [
  {
    id: "EXP-001",
    tanggal: "2026-07-02",
    kategori: "Alat Tulis & Kantor",
    jumlah: 350000,
    keterangan: "Pembelian spidol whiteboard, kertas sertifikat HVS tebal, dan tinta printer",
    penanggungJawab: "Budi Santoso"
  },
  {
    id: "EXP-002",
    tanggal: "2026-07-04",
    kategori: "Bahan Praktik Kuliner",
    jumlah: 1450000,
    keterangan: "Bahan steak daging, seafood, bumbu, dan mentega untuk praktik Culinary Arts",
    penanggungJawab: "Chef Hermawan"
  },
  {
    id: "EXP-003",
    tanggal: "2026-07-08",
    kategori: "Listrik & Internet",
    jumlah: 850000,
    keterangan: "Tagihan WiFi Biznet 100Mbps dan token listrik gedung kelas praktik",
    penanggungJawab: "Budi Santoso"
  },
  {
    id: "EXP-004",
    tanggal: "2026-07-12",
    kategori: "Promosi & Brosur",
    jumlah: 600000,
    keterangan: "Cetak 500 lembar brosur pendaftaran siswa angkatan 13 dan pasang iklan FB",
    penanggungJawab: "Nandita Wahyuni"
  }
];

export const initialUtangPegawai: UtangPegawai[] = [
  {
    id: "DEB-001",
    staffId: "STF-001",
    staffNama: "Budi Santoso",
    tanggalPinjam: "2026-06-10",
    jumlahPinjam: 1500000,
    totalBayar: 500000,
    sisaUtang: 1000000,
    deskripsi: "Pinjaman darurat berobat anggota keluarga sakit",
    status: "Belum Lunas",
    riwayatCicilan: [
      {
        id: "CIC-001",
        tanggal: "2026-07-01",
        jumlah: 500000,
        keterangan: "Potong gaji bulan Juni 2026"
      }
    ]
  },
  {
    id: "DEB-002",
    staffId: "STF-002",
    staffNama: "Eka Rahmawati",
    tanggalPinjam: "2026-07-02",
    jumlahPinjam: 800000,
    totalBayar: 800000,
    sisaUtang: 0,
    deskripsi: "Kasbon pendaftaran sekolah anak",
    status: "Lunas",
    riwayatCicilan: [
      {
        id: "CIC-002",
        tanggal: "2026-07-05",
        jumlah: 800000,
        keterangan: "Bayar tunai via bendahara"
      }
    ]
  }
];

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

