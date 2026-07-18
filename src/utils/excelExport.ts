/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from "xlsx";
import { 
  Siswa, 
  Staff, 
  Absensi, 
  KeuanganSiswa, 
  TagihanSiswa, 
  Payroll, 
  JobRegister, 
  UtangPegawai, 
  PendapatanLain, 
  PengeluaranKas,
  PembayaranLog
} from "../types";

interface ExportExcelParams {
  siswa: Siswa[];
  staff: Staff[];
  absensi: Absensi[];
  keuangan: KeuanganSiswa[];
  tagihan: TagihanSiswa[];
  payroll: Payroll[];
  jobs: JobRegister[];
  utangList: UtangPegawai[];
  pendapatanLain: PendapatanLain[];
  pengeluaranKas: PengeluaranKas[];
  pembayaranLog: PembayaranLog[];
  namaLembaga: string;
}

export function exportAllToExcel({
  siswa,
  staff,
  absensi,
  keuangan,
  tagihan,
  payroll,
  jobs,
  utangList,
  pendapatanLain,
  pengeluaranKas,
  pembayaranLog,
  namaLembaga
}: ExportExcelParams) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. SHEET: RINGKASAN (EXECUTIVE SUMMARY)
  const statsSummary = [
    { "Kategori Ringkasan": "Nama Lembaga", "Nilai / Statistik": namaLembaga, "Keterangan": "LPK Resmi Perhotelan & Kapal Pesiar" },
    { "Kategori Ringkasan": "Total Siswa Terdaftar", "Nilai / Statistik": siswa.length, "Keterangan": `${siswa.filter(s => s.status === "Aktif").length} Aktif, ${siswa.filter(s => s.status === "Lulus").length} Lulus` },
    { "Kategori Ringkasan": "Total Staf & Instruktur", "Nilai / Statistik": staff.length, "Keterangan": `${staff.filter(s => s.role === "Instruktur").length} Instruktur Aktif` },
    { "Kategori Ringkasan": "Total Penerimaan SPP & Biaya", "Nilai / Statistik": keuangan.reduce((sum, k) => sum + k.totalBayar, 0), "Keterangan": "Akumulasi pembayaran masuk dari siswa" },
    { "Kategori Ringkasan": "Total Piutang Siswa", "Nilai / Statistik": keuangan.reduce((sum, k) => sum + k.piutang, 0), "Keterangan": "Sisa tagihan yang belum dilunasi siswa" },
    { "Kategori Ringkasan": "Total Invoices Tagihan Tambahan", "Nilai / Statistik": tagihan.length, "Keterangan": `Dengan total nominal Rp ${tagihan.reduce((sum, t) => sum + t.jumlah, 0).toLocaleString("id-ID")}` },
    { "Kategori Ringkasan": "Total Lowongan/Penempatan", "Nilai / Statistik": jobs.length, "Keterangan": `${jobs.filter(j => j.status === "Lolos" || j.status === "Berangkat").length} Siswa berhasil ditempatkan` },
    { "Kategori Ringkasan": "Total Kas Pendapatan Lain", "Nilai / Statistik": pendapatanLain.reduce((sum, p) => sum + p.jumlah, 0), "Keterangan": "Sumber pendapatan non-akademik" },
    { "Kategori Ringkasan": "Total Kas Pengeluaran Operasional", "Nilai / Statistik": pengeluaranKas.reduce((sum, p) => sum + p.jumlah, 0), "Keterangan": "Biaya operasional kantor dan promosi" },
    { "Kategori Ringkasan": "Sisa Pinjaman Pegawai", "Nilai / Statistik": utangList.reduce((sum, u) => sum + u.sisaUtang, 0), "Keterangan": "Piutang LPK dari kas pinjaman staf" },
    { "Kategori Ringkasan": "Waktu Ekspor", "Nilai / Statistik": new Date().toLocaleString("id-ID"), "Keterangan": "Diekspor secara otomatis melalui Excel Master LPK" }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(statsSummary);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan LPK");

  // 2. SHEET: BUKU INDUK SISWA
  const formattedSiswa = siswa.map((s, idx) => ({
    "No": idx + 1,
    "ID Siswa": s.id,
    "Nama Lengkap": s.nama,
    "NIS (Nomor Induk)": s.nis,
    "NIK": s.nik || "-",
    "Jenis Kelamin": s.gender,
    "Tempat Lahir": s.tempatLahir,
    "Tanggal Lahir": s.tanggalLahir,
    "No. Handphone": s.noHp,
    "Alamat Rumah": s.alamat,
    "Program Studi": s.programStudi,
    "Angkatan": s.angkatan,
    "Tanggal Daftar": s.tanggalDaftar,
    "Status": s.status,
    "Agama": s.agama || "-",
    "Pendidikan Terakhir": s.pendidikanTerakhir || "-",
    "Nama Ayah": s.namaAyah || "-",
    "Pekerjaan Ayah": s.pekerjaanAyah || "-",
    "Nama Ibu": s.namaIbu || "-",
    "Pekerjaan Ibu": s.pekerjaanIbu || "-",
    "No. HP Orang Tua": s.noHpOrangTua || "-",
    "Tinggi Badan (cm)": s.tinggiBadan || "-",
    "Berat Badan (kg)": s.beratBadan || "-",
    "Catatan Kesehatan": s.catatanKesehatan || "Sehat Walafiat"
  }));
  const wsSiswa = XLSX.utils.json_to_sheet(formattedSiswa);
  XLSX.utils.book_append_sheet(wb, wsSiswa, "Buku Induk Siswa");

  // 3. SHEET: STAF & INSTRUKTUR
  const formattedStaff = staff.map((st, idx) => ({
    "No": idx + 1,
    "ID Pegawai": st.id,
    "Nama Lengkap": st.nama,
    "NIP / NIDN": st.nip,
    "Jabatan / Role": st.role,
    "Spesialisasi Kompetensi": st.spesialisasi,
    "No. WhatsApp": st.noHp,
    "Alamat Lengkap": st.alamat,
    "Status Kepegawaian": st.status,
    "Gaji Pokok Bulanan (Rp)": st.gajiPokok
  }));
  const wsStaff = XLSX.utils.json_to_sheet(formattedStaff);
  XLSX.utils.book_append_sheet(wb, wsStaff, "Staf & Instruktur");

  // 4. SHEET: ABSENSI KESELURUHAN
  const formattedAbsensi = absensi.map((a, idx) => ({
    "No": idx + 1,
    "ID Absen": a.id,
    "Tanggal": a.tanggal,
    "ID Personil": a.targetId,
    "Nama Lengkap": a.nama,
    "Kategori": a.kategori,
    "Status Presensi": a.status,
    "Jam Masuk Mengajar": a.jamMasuk || "-",
    "Jam Selesai Mengajar": a.jamSelesai || "-",
    "Keterangan Tambahan": a.keterangan || "-"
  }));
  const wsAbsensi = XLSX.utils.json_to_sheet(formattedAbsensi);
  XLSX.utils.book_append_sheet(wb, wsAbsensi, "Log Absensi");

  // 5. SHEET: KEUANGAN SPP SISWA
  const formattedKeuangan = keuangan.map((k, idx) => {
    const matchingSiswa = siswa.find(s => s.id === k.siswaId);
    return {
      "No": idx + 1,
      "ID Akun Keuangan": k.id,
      "ID Siswa": k.siswaId,
      "Nama Siswa": k.siswaNama,
      "Program Studi": matchingSiswa?.programStudi || "-",
      "Angkatan": matchingSiswa?.angkatan || "-",
      "Total Kewajiban Biaya (Rp)": k.totalBiaya,
      "Total Sudah Bayar (Rp)": k.totalBayar,
      "Sisa Piutang (Rp)": k.piutang,
      "Status Pelunasan": k.statusBayar,
      "Tanggal Pembayaran Terakhir": k.pembayaranTerakhir
    };
  });
  const wsKeuangan = XLSX.utils.json_to_sheet(formattedKeuangan);
  XLSX.utils.book_append_sheet(wb, wsKeuangan, "Keuangan SPP");

  // 6. SHEET: LOG PEMBAYARAN RINCI
  const formattedPembayaranLog = pembayaranLog.map((log, idx) => ({
    "No": idx + 1,
    "ID Transaksi": log.id,
    "ID Akun Keuangan": log.keuanganSiswaId,
    "Nama Siswa": log.siswaNama,
    "Tanggal Pembayaran": log.tanggalBayar,
    "Jumlah Pembayaran (Rp)": log.jumlahBayar,
    "Metode Pembayaran": log.metodeBayar,
    "Keterangan/Catatan": log.keterangan
  }));
  const wsPembayaran = XLSX.utils.json_to_sheet(formattedPembayaranLog);
  XLSX.utils.book_append_sheet(wb, wsPembayaran, "Log Transaksi Masuk");

  // 7. SHEET: INVOICES & TAGIHAN SISWA
  const formattedTagihan = tagihan.map((t, idx) => ({
    "No": idx + 1,
    "ID Tagihan": t.id,
    "ID Siswa": t.siswaId,
    "Nama Siswa": t.siswaNama,
    "Nama Tagihan": t.namaTagihan,
    "Nominal Tagihan (Rp)": t.jumlah,
    "Tanggal Terbit": t.tanggalTagihan,
    "Status": t.status,
    "Keterangan Deskripsi": t.deskripsi || "-"
  }));
  const wsTagihan = XLSX.utils.json_to_sheet(formattedTagihan);
  XLSX.utils.book_append_sheet(wb, wsTagihan, "Tagihan Lain Siswa");

  // 8. SHEET: PAYROLL & GAJI PEGAWAI
  const formattedPayroll = payroll.map((p, idx) => ({
    "No": idx + 1,
    "ID Slip Gaji": p.id,
    "ID Pegawai": p.staffId,
    "Nama Pegawai": p.staffNama,
    "Jabatan": p.role,
    "Bulan Penggajian": p.bulan,
    "Gaji Pokok (Rp)": p.gajiPokok,
    "Tunjangan (Rp)": p.tunjangan,
    "Lembur & Bonus (Rp)": p.lemburBonus,
    "Potongan Kas/Keterlambatan (Rp)": p.potongan,
    "Total Gaji Bersih (Rp)": p.totalGaji,
    "Tanggal Transfer / Bayar": p.tanggalBayar,
    "Status Pembayaran": p.statusGaji
  }));
  const wsPayroll = XLSX.utils.json_to_sheet(formattedPayroll);
  XLSX.utils.book_append_sheet(wb, wsPayroll, "Payroll Gaji");

  // 9. SHEET: LOWONGAN KERJA & PLACEMENT
  const formattedJobs = jobs.map((j, idx) => ({
    "No": idx + 1,
    "ID Registrasi Job": j.id,
    "ID Siswa": j.siswaId,
    "Nama Siswa": j.siswaNama,
    "Program Studi": j.programStudi,
    "Nama Perusahaan": j.namaPerusahaan,
    "Posisi Pekerjaan": j.posisi,
    "Jenis Lokasi": j.lokasiTipe,
    "Kota & Negara Penempatan": j.negaraKota,
    "Perkiraan Gaji Ditawarkan": j.gajiPerkiraan,
    "Tanggal Pendaftaran": j.tanggalDaftar,
    "Status Rekrutmen": j.status
  }));
  const wsJobs = XLSX.utils.json_to_sheet(formattedJobs);
  XLSX.utils.book_append_sheet(wb, wsJobs, "Penempatan Kerja");

  // 10. SHEET: UTANG PEGAWAI / KAS BON
  const formattedUtang = utangList.map((u, idx) => ({
    "No": idx + 1,
    "ID Pinjaman": u.id,
    "ID Pegawai": u.staffId,
    "Nama Pegawai": u.staffNama,
    "Tanggal Peminjaman": u.tanggalPinjam,
    "Jumlah Pinjaman Awal (Rp)": u.jumlahPinjam,
    "Total Sudah Dicicil (Rp)": u.totalBayar,
    "Sisa Utang / Kas Bon (Rp)": u.sisaUtang,
    "Tujuan Pinjaman": u.deskripsi,
    "Status Pelunasan": u.status,
    "Jumlah Kali Cicil": u.riwayatCicilan.length
  }));
  const wsUtang = XLSX.utils.json_to_sheet(formattedUtang);
  XLSX.utils.book_append_sheet(wb, wsUtang, "Kas Bon Pegawai");

  // Generate Excel File
  const filename = `Buku_Induk_LPK_Nandita_Master_Excel_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
