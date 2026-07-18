import React from "react";
import { TagihanSiswa, KeuanganSiswa, UserAccount } from "../types";
import { formatRupiah } from "../utils";
import { Receipt, Wallet, AlertCircle, CheckCircle2, CreditCard, Building } from "lucide-react";

interface SiswaTagihanSheetProps {
  currentUser: UserAccount;
  tagihanList: TagihanSiswa[];
  keuangan: KeuanganSiswa[];
}

export default function SiswaTagihanSheet({
  currentUser,
  tagihanList,
  keuangan,
}: SiswaTagihanSheetProps) {
  // 1. Get student profile & financial data
  const studentId = currentUser.siswaId || "";
  const myKeuangan = keuangan.find((k) => k.siswaId === studentId);
  const myTagihanList = tagihanList.filter((t) => t.siswaId === studentId);

  // 2. Calculations for aggregated financial summary
  const programBiaya = myKeuangan ? myKeuangan.totalBiaya : 0;
  const programTelahBayar = myKeuangan ? myKeuangan.totalBayar : 0;
  const programPiutang = myKeuangan ? myKeuangan.piutang : 0;

  const tagihanLainTotal = myTagihanList.reduce((acc, t) => acc + t.jumlah, 0);
  const tagihanLainLunas = myTagihanList
    .filter((t) => t.status === "Lunas")
    .reduce((acc, t) => acc + t.jumlah, 0);
  const tagihanLainBelumLunas = myTagihanList
    .filter((t) => t.status === "Belum Lunas")
    .reduce((acc, t) => acc + t.jumlah, 0);

  // Grand totals as requested
  const totalTagihan = programBiaya + tagihanLainTotal;
  const totalTelahBayar = programTelahBayar + tagihanLainLunas;
  const totalPiutang = programPiutang + tagihanLainBelumLunas;

  return (
    <div className="flex-1 overflow-auto p-6 bg-grid font-sans">
      {/* Header section */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono tracking-widest text-[#001f3f] font-bold uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Siswa Portal
          </span>
          <span className="text-xs font-mono text-slate-400">ID: {studentId}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-950 font-display mt-2 flex items-center">
          <Receipt className="w-5 h-5 text-[#001f3f] mr-2" />
          Tagihan Saya
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Halaman resmi rincian keuangan, program pendidikan, dan biaya administrasi Anda di LPK Nandita.
        </p>
      </div>

      {/* KPI Ringkasan Utama Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
        {/* 1. Total Tagihan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Total Tagihan
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black font-mono text-slate-900 mt-3">
            {formatRupiah(totalTagihan)}
          </h3>
          <div className="text-[10px] font-mono text-slate-500 mt-2 space-y-0.5 border-t border-slate-100 pt-2">
            <div className="flex justify-between">
              <span>Program Pendidikan:</span>
              <span className="font-bold text-slate-700">{formatRupiah(programBiaya)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tagihan Tambahan:</span>
              <span className="font-bold text-slate-700">{formatRupiah(tagihanLainTotal)}</span>
            </div>
          </div>
        </div>

        {/* 2. Total Telah Dibayar */}
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Total Telah Dibayar
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black font-mono text-emerald-800 mt-3">
            {formatRupiah(totalTelahBayar)}
          </h3>
          <div className="text-[10px] font-mono text-slate-500 mt-2 space-y-0.5 border-t border-emerald-100/50 pt-2">
            <div className="flex justify-between">
              <span>Setoran Program:</span>
              <span className="font-bold text-emerald-700">{formatRupiah(programTelahBayar)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pembayaran Tagihan:</span>
              <span className="font-bold text-emerald-700">{formatRupiah(tagihanLainLunas)}</span>
            </div>
          </div>
        </div>

        {/* 3. Total Piutang */}
        <div className={`rounded-2xl p-5 shadow-sm hover:shadow-md transition border ${
          totalPiutang > 0 
            ? "bg-amber-50/50 border-amber-200" 
            : "bg-teal-50/40 border-teal-100"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Total Piutang (Sisa)
            </span>
            <div className={`p-2 rounded-xl ${
              totalPiutang > 0 ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-2xl font-black font-mono mt-3 ${
            totalPiutang > 0 ? "text-amber-800" : "text-teal-800"
          }`}>
            {formatRupiah(totalPiutang)}
          </h3>
          <div className="text-[10px] font-mono text-slate-500 mt-2 space-y-0.5 border-t border-slate-200/50 pt-2">
            <div className="flex justify-between">
              <span>Tunggakan Program:</span>
              <span className={`font-bold ${totalPiutang > 0 ? "text-amber-700" : "text-teal-700"}`}>
                {formatRupiah(programPiutang)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tunggakan Tagihan:</span>
              <span className={`font-bold ${totalPiutang > 0 ? "text-amber-700" : "text-teal-700"}`}>
                {formatRupiah(tagihanLainBelumLunas)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Billing Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h4 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
            📋 Rincian Item Tagihan Aktif Anda
          </h4>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded border border-slate-200">
            TOTAL DATA: {myTagihanList.length + (myKeuangan ? 1 : 0)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase">
                <th className="px-4 py-3 font-semibold">Tipe / Kode</th>
                <th className="px-4 py-3 font-semibold">Deskripsi Tagihan</th>
                <th className="px-4 py-3 font-semibold text-center">Tanggal Pembebanan</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Jumlah Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {/* Program Tuition Row */}
              {myKeuangan && (
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[10px] text-indigo-700 font-bold">
                    [PROGRAM]
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-bold text-slate-900 block">Biaya Pendidikan Utama (SPP & Pelatihan)</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Biaya wajib kurikulum program studi yang diikuti hingga lulus & berangkat kerja.
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-500">
                    Mulai Daftar
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      myKeuangan.statusBayar === "Lunas"
                        ? "bg-emerald-100 text-emerald-800"
                        : myKeuangan.statusBayar === "Belum Lunas"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {myKeuangan.statusBayar === "Lunas" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {myKeuangan.statusBayar}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(programBiaya)}
                  </td>
                </tr>
              )}

              {/* Other Custom Bills Rows */}
              {myTagihanList.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[10px] text-amber-700 font-bold">
                    {t.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-bold text-slate-900 block">{t.namaTagihan}</span>
                      {t.deskripsi && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{t.deskripsi}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-500">
                    {t.tanggalTagihan}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === "Lunas"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {t.status === "Lunas" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(t.jumlah)}
                  </td>
                </tr>
              ))}

              {myTagihanList.length === 0 && !myKeuangan && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Tidak ditemukan data tagihan untuk akun Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Instruction Section */}
      <div className="mt-6 bg-[#001f3f]/5 border border-[#001f3f]/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-[#001f3f]/10 text-[#001f3f] rounded-xl flex-shrink-0 mt-0.5">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wide">
              ℹ️ Cara Pembayaran Tagihan LPK Nandita
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Untuk melakukan cicilan atau pelunasan, silakan mengunjungi loket keuangan kampus LPK Nandita atau transfer ke rekening resmi Bank BCA LPK Nandita. Setelah transfer, harap serahkan bukti pembayaran ke bagian Administrasi & Keuangan untuk diperbarui di sistem.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs text-center font-mono text-[11px] text-[#001f3f] font-semibold">
            BCA: 018-912-8800 <br />
            <span className="text-[9px] text-slate-400 font-sans block mt-0.5 font-normal">A.N LPK NANDITA INDONESIA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
