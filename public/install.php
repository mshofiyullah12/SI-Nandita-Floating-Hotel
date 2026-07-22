<?php
/**
 * Auto-Installer & Deployment Verification Script for Hostinger Subdomain
 * App: Sistem Manajemen LPK / Sekolah
 */

header('Content-Type: text/html; charset=utf-8');

$currentDir = __DIR__;
$htaccessFile = $currentDir . '/.htaccess';
$indexFile = $currentDir . '/index.html';

$action = isset($_GET['action']) ? $_GET['action'] : '';
$msg = '';
$msgType = 'info';

// Action Handler
if ($action === 'create_htaccess') {
    $htaccessContent = "<IfModule mod_rewrite.c>\n";
    $htaccessContent .= "  RewriteEngine On\n";
    $htaccessContent .= "  RewriteBase /\n";
    $htaccessContent .= "  RewriteRule ^index\\.html$ - [L]\n";
    $htaccessContent .= "  RewriteCond %{REQUEST_FILENAME} !-f\n";
    $htaccessContent .= "  RewriteCond %{REQUEST_FILENAME} !-d\n";
    $htaccessContent .= "  RewriteRule . /index.html [L]\n";
    $htaccessContent .= "</IfModule>\n\n";
    $htaccessContent .= "# Header & Cache Optimization\n";
    $htaccessContent .= "<IfModule mod_headers.c>\n";
    $htaccessContent .= "  Header set Access-Control-Allow-Origin \"*\"\n";
    $htaccessContent .= "  <FilesMatch \"\\.(html|htm)$\">\n";
    $htaccessContent .= "    Header set Cache-Control \"no-cache, no-store, must-revalidate\"\n";
    $htaccessContent .= "  </FilesMatch>\n";
    $htaccessContent .= "</IfModule>\n";

    if (@file_put_contents($htaccessFile, $htaccessContent)) {
        $msg = "File .htaccess berhasil dibuat dan dikonfigurasi otomatis!";
        $msgType = "success";
    } else {
        $msg = "Gagal membuat file .htaccess. Pastikan izin folder (chmod 755) sudah sesuai di Hostinger.";
        $msgType = "error";
    }
} elseif ($action === 'delete_installer') {
    if (@unlink(__FILE__)) {
        header("Location: index.html");
        exit;
    } else {
        $msg = "Gagal menghapus file install.php otomatis. Silakan hapus secara manual dari Hostinger File Manager.";
        $msgType = "error";
    }
}

// System Checks
$hasIndex = file_exists($indexFile);
$hasHtaccess = file_exists($htaccessFile);
$phpVersion = phpversion();
$serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? 'Hostinger Web Server';
$subdomainHost = $_SERVER['HTTP_HOST'] ?? 'Subdomain Hostinger';
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto-Installer Hostinger - Aplikasi LPK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
    </style>
</head>
<body class="p-4 md:p-8 min-h-screen flex items-center justify-center">
    <div class="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <!-- Header -->
        <div class="bg-[#001f3f] p-6 text-white text-center relative">
            <div class="inline-block p-3 bg-amber-400/20 rounded-2xl mb-3 border border-amber-400/30">
                <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 2 0 012 2v6a2 2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
            </div>
            <h1 class="text-xl md:text-2xl font-extrabold">Auto-Installer Subdomain Hostinger</h1>
            <p class="text-xs text-slate-300 mt-1">Verifikasi & Pengaturan Otomatis Web App LPK</p>
        </div>

        <!-- Notification Banner -->
        <?php if ($msg): ?>
            <div class="m-6 mb-0 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between <?php echo $msgType === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'; ?>">
                <span><?php echo htmlspecialchars($msg); ?></span>
            </div>
        <?php endif; ?>

        <div class="p-6 md:p-8 space-y-6">
            <!-- Server Info -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div class="flex justify-between border-b border-slate-200/60 pb-2">
                    <span class="text-slate-500 font-semibold">Domain / Subdomain:</span>
                    <span class="font-bold text-slate-800"><?php echo htmlspecialchars($subdomainHost); ?></span>
                </div>
                <div class="flex justify-between border-b border-slate-200/60 pb-2">
                    <span class="text-slate-500 font-semibold">Protokol Web:</span>
                    <span class="font-bold <?php echo $protocol === 'https' ? 'text-emerald-600' : 'text-amber-600'; ?>"><?php echo strtoupper($protocol); ?> <?php echo $protocol === 'https' ? '✓ (Aman/SSL Active)' : '(Disarankan Aktifkan SSL di hPanel)'; ?></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500 font-semibold">Web Server:</span>
                    <span class="font-mono text-slate-700"><?php echo htmlspecialchars($serverSoftware); ?></span>
                </div>
            </div>

            <!-- Status Checklist -->
            <div class="space-y-3">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Pemeriksaan Komponen App</h3>
                
                <!-- Index.html Check -->
                <div class="p-4 rounded-2xl border flex items-center justify-between <?php echo $hasIndex ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'; ?>">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs <?php echo $hasIndex ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'; ?>">
                            <?php echo $hasIndex ? '✓' : '✕'; ?>
                        </div>
                        <div>
                            <p class="font-bold text-xs text-slate-800">File Utama (index.html)</p>
                            <p class="text-[11px] text-slate-500"><?php echo $hasIndex ? 'Tersedia di folder subdomain' : 'File index.html tidak ditemukan!'; ?></p>
                        </div>
                    </div>
                    <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full <?php echo $hasIndex ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'; ?>">
                        <?php echo $hasIndex ? 'Ready' : 'Missing'; ?>
                    </span>
                </div>

                <!-- .htaccess Check -->
                <div class="p-4 rounded-2xl border flex items-center justify-between <?php echo $hasHtaccess ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'; ?>">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs <?php echo $hasHtaccess ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'; ?>">
                            <?php echo $hasHtaccess ? '✓' : '!'; ?>
                        </div>
                        <div>
                            <p class="font-bold text-xs text-slate-800">Routing Subdomain (.htaccess)</p>
                            <p class="text-[11px] text-slate-500"><?php echo $hasHtaccess ? 'Aturan SPA rewrite aktif untuk Hostinger' : 'Belum dibuat. Diperlukan agar tidak error 404 saat refresh page.'; ?></p>
                        </div>
                    </div>
                    <?php if (!$hasHtaccess): ?>
                        <a href="?action=create_htaccess" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition">
                            Buat Otomatis
                        </a>
                    <?php else: ?>
                        <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                            Aktif
                        </span>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 border-t border-slate-100 space-y-3">
                <?php if ($hasIndex): ?>
                    <a href="index.html" class="w-full py-3.5 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center space-x-2">
                        <span>Buka Aplikasi LPK Sekarang</span>
                        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </a>
                    
                    <a href="?action=delete_installer" onclick="return confirm('Hapus file install.php agar aplikasi langsung berjalan penuh?')" class="block text-center text-xs text-rose-600 hover:text-rose-800 font-bold transition pt-2">
                        Bersihkan & Hapus File Installer Ini (install.php)
                    </a>
                <?php else: ?>
                    <div class="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs text-center">
                        Silakan unggah hasil build folder <b>dist</b> ke folder subdomain Anda di Hostinger File Manager.
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <div class="bg-slate-50 p-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            Sistem Manajemen LPK & Sekolah • Hostinger Subdomain Auto-Deployer
        </div>
    </div>
</body>
</html>
