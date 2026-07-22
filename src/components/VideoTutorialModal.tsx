import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, X, Monitor, CheckCircle2, FileText, ArrowRight, Sparkles, AlertTriangle } from "lucide-react";

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Step {
  id: number;
  time: string;
  title: string;
  desc: string;
  narrative: string;
  badge: string;
  screenType: "hpanel" | "compress" | "filemanager" | "deploy" | "install";
}

const STEPS: Step[] = [
  {
    id: 1,
    time: "0:00 - 0:25",
    title: "1. Membuat Subdomain di hPanel Hostinger",
    desc: "Masuk ke hPanel > Menu Domains > Subdomains > Ketik nama 'lpk' > Klik Create Subdomain.",
    narrative: "Langkah pertama, masuk ke akun hPanel Hostinger Anda. Buka menu Domains lalu pilih Subdomains. Ketik nama subdomain Anda misalnya 'lpk', lalu klik Create. Folder otomatis dibuat di public_html/lpk.",
    badge: "hPanel Hostinger",
    screenType: "hpanel",
  },
  {
    id: 2,
    time: "0:25 - 0:45",
    title: "2. Kompres File Build (dist.zip)",
    desc: "Buka folder hasil build 'dist/'. Seleksi semua file (termasuk index.html, install.php, deploy.php, .htaccess) lalu Zip menjadi 'dist.zip'.",
    narrative: "Langkah kedua, buka folder hasil build aplikasi Anda. Didalamnya sudah lengkap dengan file index.html, install.php, deploy.php, dan .htaccess. Kompres seluruh file tersebut menjadi dist.zip.",
    badge: "Kompresi ZIP",
    screenType: "compress",
  },
  {
    id: 3,
    time: "0:45 - 1:10",
    title: "3. Unggah ke Hostinger File Manager",
    desc: "Buka File Manager > Masuk ke folder public_html/lpk/ > Upload file dist.zip dan deploy.php.",
    narrative: "Langkah ketiga, buka Hostinger File Manager dan masuk ke folder subdomain Anda. Unggah file dist.zip dan deploy.php langsung ke folder tersebut.",
    badge: "File Manager",
    screenType: "filemanager",
  },
  {
    id: 4,
    time: "1:10 - 1:35",
    title: "4. Jalankan Auto-Unzip (deploy.php)",
    desc: "Buka browser ke URL: https://lpk.domainanda.com/deploy.php > Klik 'Ekstrak Sekarang & Buka App'.",
    narrative: "Langkah keempat, buka tab baru di browser lalu ketik domainanda.com/deploy.php. Klik tombol Ekstrak Sekarang. Script akan menguraikan dist.zip otomatis dalam waktu 2 detik!",
    badge: "Auto Deployer",
    screenType: "deploy",
  },
  {
    id: 5,
    time: "1:35 - 2:00",
    title: "5. Jalankan Verifikasi (install.php) & Buka App",
    desc: "Buka URL: https://lpk.domainanda.com/install.php > Verifikasi .htaccess & perbaiki layar putih otomatis.",
    narrative: "Langkah terakhir, buka domainanda.com/install.php untuk mengaktifkan aturan .htaccess penangkal error 404 dan perbaikan layar putih otomatis. Aplikasi LPK Anda kini resmi online!",
    badge: "Auto Installer",
    screenType: "install",
  },
];

export const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = STEPS[currentStepIndex];

  // Narration Speech Synthesis
  const speakNarrative = (text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // stop previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      speakNarrative(currentStep.narrative);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (currentStepIndex < STEPS.length - 1) {
              setCurrentStepIndex((idx) => idx + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 2; // ~5 seconds per step
        });
      }, 100);
      timerRef.current = interval;
      return () => clearInterval(interval);
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isPlaying, currentStepIndex, isMuted]);

  if (!isOpen) return null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepSelect = (index: number) => {
    setCurrentStepIndex(index);
    setProgress(0);
    if (isPlaying) {
      speakNarrative(STEPS[index].narrative);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col max-h-[92vh] my-auto">
        
        {/* PLAYER HEADER */}
        <div className="bg-slate-900 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white">Video Tutorial Interactive: Deploy Hostinger</h2>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-500/30">HD 1080p</span>
              </div>
              <p className="text-xs text-slate-400">Simulasi Panduan Langkah Mengonlinekan Subdomain LPK</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsPlaying(false);
              if ("speechSynthesis" in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN VIDEO DISPLAY SCREEN */}
        <div className="relative bg-slate-950 aspect-video w-full overflow-hidden flex flex-col justify-between p-4 sm:p-6 border-b border-slate-800">
          
          {/* Simulated Screen Content based on step */}
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            
            {/* SCREEN TYPE 1: HPANEL */}
            {currentStep.screenType === "hpanel" && (
              <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                    <span className="font-bold text-xs text-white">Hostinger hPanel &gt; Subdomains</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">hpanel.hostinger.com</span>
                </div>
                <div className="space-y-3">
                  <label className="text-xs text-slate-400 font-semibold block">Create a New Subdomain:</label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input type="text" readOnly value="lpk" className="w-full bg-slate-800 border border-purple-500/50 rounded-xl px-3 py-2 text-xs text-purple-300 font-bold font-mono" />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">.domainanda.com</span>
                    </div>
                    <button className="bg-purple-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg animate-pulse flex items-center space-x-1">
                      <span>Create</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Folder otomatis terbuat: <b>public_html/lpk/</b></span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN TYPE 2: COMPRESS */}
            {currentStep.screenType === "compress" && (
              <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-xs text-white">File Explorer &gt; Folder dist/</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">Archive Manager</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-purple-500/30 text-purple-300 flex items-center justify-between">
                    <span>📄 index.html</span>
                    <span className="text-[10px] text-slate-500">Root App</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-purple-500/30 text-purple-300 flex items-center justify-between">
                    <span>📄 install.php</span>
                    <span className="text-[10px] text-slate-500">Installer</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-amber-500/30 text-amber-300 flex items-center justify-between">
                    <span>📄 deploy.php</span>
                    <span className="text-[10px] text-slate-500">Unzipper</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-slate-300 flex items-center justify-between">
                    <span>📄 .htaccess</span>
                    <span className="text-[10px] text-slate-500">Routing</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                  <span className="text-xs font-bold text-amber-300">📦 Kompres seluruh isi menjadi &rarr; dist.zip</span>
                </div>
              </div>
            )}

            {/* SCREEN TYPE 3: FILE MANAGER */}
            {currentStep.screenType === "filemanager" && (
              <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-xs text-white">Hostinger File Manager &gt; public_html/lpk/</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">Upload Progress</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-800 rounded-xl border border-purple-500/40 flex items-center justify-between text-xs">
                    <span className="font-mono text-purple-300">📦 dist.zip (3.2 MB)</span>
                    <span className="text-emerald-400 font-bold">100% Uploaded ✓</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-amber-500/40 flex items-center justify-between text-xs">
                    <span className="font-mono text-amber-300">📄 deploy.php (4 KB)</span>
                    <span className="text-emerald-400 font-bold">100% Uploaded ✓</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN TYPE 4: DEPLOY */}
            {currentStep.screenType === "deploy" && (
              <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 animate-fade-in">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-amber-400 flex items-center justify-between">
                  <span>https://lpk.domainanda.com/deploy.php</span>
                  <span className="text-[10px] text-emerald-400">HTTP 200 OK</span>
                </div>
                <div className="p-4 bg-slate-800/90 rounded-2xl border border-amber-500/30 text-center space-y-3">
                  <p className="text-xs font-bold text-white">Auto Unzip & Extract Helper</p>
                  <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg animate-bounce">
                    Ekstrak Sekarang & Buka App
                  </button>
                  <p className="text-[10px] text-emerald-400 font-mono">✓ Ekstraksi Selesai! Subfolder dist/ otomatis diatur ke root.</p>
                </div>
              </div>
            )}

            {/* SCREEN TYPE 5: INSTALL */}
            {currentStep.screenType === "install" && (
              <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 animate-fade-in">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-purple-300 flex items-center justify-between">
                  <span>https://lpk.domainanda.com/install.php</span>
                  <span className="text-[10px] text-emerald-400">Ready</span>
                </div>
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                  <span className="text-2xl">🎉</span>
                  <h4 className="font-extrabold text-xs text-white">Aplikasi LPK Resmi Online & Siap Digunakan!</h4>
                  <p className="text-[11px] text-emerald-300">Routing .htaccess aktif & bebas error layar putih.</p>
                </div>
              </div>
            )}

            {/* Subtitle / Narration Banner overlay */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                Narasikan Suara:
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                "{currentStep.narrative}"
              </p>
            </div>

          </div>

        </div>

        {/* CONTROLS & TIMELINE SEEKER */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3">
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden cursor-pointer relative">
            <div
              className="bg-gradient-to-r from-purple-500 to-amber-400 h-full transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${((currentStepIndex + progress / 100) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Player Button Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlayPause}
                className="p-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold transition flex items-center justify-center cursor-pointer"
                title={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                title="Putar Ulang dari Awal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (currentStepIndex < STEPS.length - 1) {
                    handleStepSelect(currentStepIndex + 1);
                  }
                }}
                disabled={currentStepIndex === STEPS.length - 1}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition disabled:opacity-40 cursor-pointer"
                title="Langkah Berikutnya"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl transition cursor-pointer ${isMuted ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                title={isMuted ? "Unmute Suara Narasi" : "Mute Suara Narasi"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Langkah <strong className="text-amber-400">{currentStepIndex + 1}</strong> dari {STEPS.length}
            </div>
          </div>
        </div>

        {/* STEP SELECTION TABS */}
        <div className="p-4 bg-slate-950 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => handleStepSelect(idx)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition text-left flex flex-col space-y-1 cursor-pointer ${
                  currentStepIndex === idx
                    ? "bg-[#001f3f] text-white ring-2 ring-amber-400 border border-slate-700"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span className="text-[10px] font-mono text-amber-400 font-extrabold">{step.badge}</span>
                <span className="truncate max-w-[140px] text-slate-200">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
