import React from "react";
import { PembayaranLog, KeuanganSiswa, UserAccount } from "../types";
import { formatRupiah } from "../utils";
import { Coins, CheckSquare, Search, CreditCard, Receipt, Calendar } from "lucide-react";

interface SiswaRiwayatSheetProps {
  currentUser: UserAccount;
  pembayaranLog: PembayaranLog[];
  keuangan: KeuanganSiswa[];
}

export default function SiswaRiwayatSheet({
  currentUser,
  pembayaranLog,
  keuangan,
}: SiswaRiwayatSheetProps) {
  const studentId = currentUser.siswaId || "";
  const myKeuangan = keuangan.find((k) => k.siswaId === studentId);
  
  // Filter payments belonging to this student by matching either their keuanganSiswaId or their name
  const myPayments = pembayaranLog.filter((p) => {
    if (myKeuangan && p.keuanganSiswaId === myKeuangan.id) return true;
    return p.siswaNama.toLowerCase().trim() === currentUser.nama.toLowerCase().trim();
  });

  const totalSiswaBayar = myPayments.reduce((sum, p) => sum + p.jumlahBayar, 0);

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
          <Coins className="w-5 h-5 text-[#001f3f] mr-2" />
          Riwayat Pembayaran Saya
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Kumpulan bukti kuitansi digital, setoran cicilan, dan rincian transaksi pembayaran yang telah divalidasi oleh kasir LPK Nandita.
        </p>
      </div>

      {/* Summary KPI Card */}
      <div className="my-6 max-w-sm">
        <div className="bg-gradient-to-br from-[#001f3f] to-[#002d5c] text-white rounded-2xl p-5 shadow-md border border-white/5 relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
            <Coins className="w-28 h-28" />
          </div>
          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block font-bold">
            Total Setoran Terverifikasi
          </span>
          <h3 className="text-2xl font-black font-mono text-white mt-2 tracking-tight">
            {formatRupiah(totalSiswaBayar)}
          </h3>
          <p className="text-[10px] text-slate-300/90 mt-2 font-sans leading-relaxed">
            Akumulasi dana riil yang telah masuk ke pembukuan LPK Nandita atas nama Anda.
          </p>
        </div>
      </div>

      {/* Payments History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h4 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
            📊 Catatan Log Pembayaran Masuk
          </h4>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded border border-slate-200">
            TOTAL DATA KUITANSI: {myPayments.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase">
                <th className="px-4 py-3 font-semibold">No. Kuitansi</th>
                <th className="px-4 py-3 font-semibold">Keterangan Setoran</th>
                <th className="px-4 py-3 font-semibold text-center">Tanggal Setor</th>
                <th className="px-4 py-3 font-semibold text-center">Metode Bayar</th>
                <th className="px-4 py-3 font-semibold text-right">Jumlah Setoran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {myPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[10px] text-indigo-700 font-bold">
                    {p.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-bold text-slate-900 block">{p.keterangan || "Setoran Pembayaran Kurikulum"}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Referensi Buku: {p.keuanganSiswaId}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-500">
                    {p.tanggalBayar}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-100 font-mono">
                      {p.metodeBayar}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                    +{formatRupiah(p.jumlahBayar)}
                  </td>
                </tr>
              ))}

              {myPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Belum ditemukan catatan transaksi pembayaran atas nama Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
