import React, { useRef, useState } from "react";
import { Download, Printer, X, FileText, CheckCircle2, ShieldCheck, Globe, Server, Cpu, ArrowRight } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PanduanInstallPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PanduanInstallPDFModal: React.FC<PanduanInstallPDFModalProps> = ({ isOpen, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);

    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("Panduan-Instalasi-Hostinger-Subdomain-LPK.pdf");
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      alert("Terjadi kesalahan saat mengunduh PDF. Silakan gunakan tombol 'Cetak / Print PDF' sebagai alternatif.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto border border-slate-200">
        
        {/* MODAL HEADER */}
        <div className="bg-[#001f3f] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400/20 text-amber-400 rounded-xl border border-amber-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base">Panduan Resmi Instalasi Subdomain Hostinger</h2>
              <p className="text-xs text-slate-300">Dokumen Modul Deployment & File Auto-Installer (Format PDF Ready)</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
              title="Cetak PDF via Browser"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak / Print PDF</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#001f3f] font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? "Proses PDF..." : "Unduh PDF (Instan)"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY / PDF CONTENT CONTAINER */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex-1 space-y-6">
          <div
            ref={contentRef}
            className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 text-slate-800 font-sans max-w-3xl mx-auto space-y-8"
            id="printable-pdf-document"
          >
            {/* DOCUMENT HEADER / LETTERHEAD */}
            <div className="border-b-2 border-[#001f3f] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-900 rounded-lg text-[10px] font-extrabold font-mono uppercase tracking-wider mb-2">
                  Dokumentasi Teknis Server v2.5
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#001f3f] leading-tight">
                  PANDUAN INSTALASI & DEPLOYMENT
                </h1>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  Sistem Informasi Manajemen LPK / Sekolah (Hostinger Subdomain Edition)
                </p>
              </div>

              <div className="text-left sm:text-right text-[11px] text-slate-500 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p><strong>Target Platform:</strong> Hostinger hPanel</p>
                <p><strong>Rute Target:</strong> Subdomain (Public_html/subdomain)</p>
                <p><strong>Tanggal Rilis:</strong> {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>

            {/* RINGKASAN REKAPITULASI FILE BANYAK DIPAKAI */}
            <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-purple-950 uppercase font-mono tracking-wider flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-purple-700" />
                Fitur Auto-Installer Bawaan (Sudah Termasuk Dalam Build)
              </h3>
              <p className="text-xs text-purple-900 leading-relaxed">
                Aplikasi ini dilengkapi dengan paket installer otomatis khusus Hostinger subdomain untuk mempermudah eksekusi tanpa konfigurasi server manual yang rumit:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3 rounded-xl border border-purple-100 text-xs">
                  <div className="font-bold text-purple-950 font-mono text-[11px]">install.php</div>
                  <div className="text-[10px] text-slate-500 mt-1">Auto-installer & pembuat file .htaccess otomatis di hPanel.</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-purple-100 text-xs">
                  <div className="font-bold text-amber-950 font-mono text-[11px]">deploy.php</div>
                  <div className="text-[10px] text-slate-500 mt-1">Script ekstraksi otomatis dist.zip langsung di server Hostinger.</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-purple-100 text-xs">
                  <div className="font-bold text-slate-950 font-mono text-[11px]">.htaccess</div>
                  <div className="text-[10px] text-slate-500 mt-1">Konfigurasi URL Rewrite SPA React pencegah error 404 refresh.</div>
                </div>
              </div>
            </div>

            {/* LANGKAH DEMI LANGKAH INSTALASI */}
            <div className="space-y-6">
              <h2 className="text-sm font-extrabold text-[#001f3f] uppercase font-mono tracking-wider border-b border-slate-200 pb-2">
                LANGKAH-LANGKAH DEPLOYMENT (STEP BY STEP)
              </h2>

              {/* STEP 1 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#001f3f] text-white font-bold text-xs flex items-center justify-center font-mono">1</span>
                  <h3 className="font-bold text-xs text-slate-900 uppercase">Membuat Subdomain di hPanel Hostinger</h3>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>1. Login ke akun <strong>Hostinger hPanel</strong> (hpanel.hostinger.com).</p>
                  <p>2. Buka menu <strong>Domains</strong> &rarr; klik <strong>Subdomains</strong>.</p>
                  <p>3. Masukkan nama subdomain pilihan Anda (contoh: <code className="bg-slate-100 px-1 rounded font-mono font-bold text-purple-800">lpk</code> atau <code className="bg-slate-100 px-1 rounded font-mono font-bold text-purple-800">sekolah</code>).</p>
                  <p>4. Klik tombol <strong>Create Subdomain</strong>. Hostinger akan otomatis membuat folder target di <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800 font-bold">public_html/lpk</code>.</p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#001f3f] text-white font-bold text-xs flex items-center justify-center font-mono">2</span>
                  <h3 className="font-bold text-xs text-slate-900 uppercase">Mengompres File Build (dist.zip)</h3>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>1. Unduh atau export hasil build aplikasi (folder <code className="font-mono font-bold text-slate-800">dist/</code>).</p>
                  <p>2. Pastikan file <code className="font-mono text-purple-800 font-bold">install.php</code>, <code className="font-mono text-amber-800 font-bold">deploy.php</code>, dan <code className="font-mono text-slate-800 font-bold">index.html</code> ada di dalam folder tersebut.</p>
                  <p>3. Kompres seluruh isi di dalam folder tersebut menjadi satu file bernama <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold text-amber-900">dist.zip</code>.</p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#001f3f] text-white font-bold text-xs flex items-center justify-center font-mono">3</span>
                  <h3 className="font-bold text-xs text-slate-900 uppercase">Upload & Ekstrak Otomatis di Hostinger File Manager</h3>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>1. Masuk ke <strong>Hostinger File Manager</strong> &rarr; buka folder subdomain (<code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">public_html/lpk/</code>).</p>
                  <p>2. Unggah file <code className="font-bold text-amber-800 font-mono">dist.zip</code> dan <code className="font-bold text-amber-800 font-mono">deploy.php</code> ke dalam folder tersebut.</p>
                  <p>3. Buka browser Anda dan akses URL ekstraksi otomatis:</p>
                  <div className="bg-slate-900 text-amber-400 font-mono text-xs p-3 rounded-xl font-bold my-1 border border-slate-800">
                    https://lpk.domainanda.com/deploy.php
                  </div>
                  <p>4. Klik tombol <strong>"Ekstrak Sekarang & Buka App"</strong>. Semua file aplikasi akan langsung terurai sempurna tanpa error timeout.</p>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#001f3f] text-white font-bold text-xs flex items-center justify-center font-mono">4</span>
                  <h3 className="font-bold text-xs text-slate-900 uppercase">Menjalankan Verifikasi Router (.htaccess Auto-Installer)</h3>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>1. Akses halaman installer di browser:</p>
                  <div className="bg-slate-900 text-purple-300 font-mono text-xs p-3 rounded-xl font-bold my-1 border border-slate-800">
                    https://lpk.domainanda.com/install.php
                  </div>
                  <p>2. Klik tombol <strong>"Buat Otomatis"</strong> jika file <code className="font-mono text-purple-700 font-bold">.htaccess</code> belum ada.</p>
                  <p>3. Klik tombol <strong>"Bersihkan & Hapus File Installer Ini"</strong> untuk keamanan server Anda.</p>
                </div>
              </div>

              {/* STEP 5 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#001f3f] text-white font-bold text-xs flex items-center justify-center font-mono">5</span>
                  <h3 className="font-bold text-xs text-slate-900 uppercase">Aktivasi SSL / HTTPS Gratis Hostinger</h3>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>1. Di hPanel Hostinger, buka menu <strong>Security</strong> &rarr; <strong>SSL</strong>.</p>
                  <p>2. Pilih subdomain Anda lalu klik <strong>Install SSL (Let's Encrypt Free)</strong>.</p>
                  <p>3. Aktifkan opsi <strong>HTTPS Redirection</strong> untuk memastikan semua pengunjung menggunakan koneksi terenkripsi aman.</p>
                </div>
              </div>
            </div>

            {/* TROUBLESHOOTING BOX */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center">
                <Server className="w-4 h-4 mr-1.5 text-slate-700" />
                Penyelesaian Masalah (Troubleshooting Guide)
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <strong className="text-rose-700">Masalah: Refresh Halaman Mengakibatkan Error 404 (Not Found)</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <em>Solusi:</em> Pastikan file <code className="font-mono font-bold">.htaccess</code> telah terbuat di folder subdomain. Jalankan <code className="font-mono font-bold">install.php</code> untuk membuat file <code className="font-mono font-bold">.htaccess</code> secara otomatis.
                  </p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <strong className="text-amber-700">Masalah: Tampilan Blank Putih Saat Diakses</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <em>Solusi:</em> Pastikan file <code className="font-mono font-bold">index.html</code> terletak persis di dalam folder subdomain (bukan di dalam subfolder ekstraksi sekunder seperti <code className="font-mono font-bold">public_html/lpk/dist/index.html</code>).
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER METADATA */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono">
              <p>© {new Date().getFullYear()} Tim Pengembang Sistem Informasi LPK. Hak Cipta Dilindungi.</p>
              <p>Hostinger Subdomain Deployer Module • Document ID: INST-HST-{Math.floor(100000 + Math.random() * 900000)}</p>
            </div>

          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Format PDF standar A4 siap cetak & disimpan.</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cetak / Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-5 py-2 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{isGenerating ? "Menyiapkan PDF..." : "Unduh PDF Sekarang"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
