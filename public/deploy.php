<?php
/**
 * Auto Extract & Deploy Script for Hostinger Subdomain
 * Upload this file along with dist.zip to public_html/subdomain/
 * then open subdomain.yourdomain.com/deploy.php in browser.
 */

header('Content-Type: text/html; charset=utf-8');

$zipFiles = glob('*.zip');
$extracted = false;
$msg = '';

if (isset($_POST['extract_file'])) {
    $targetZip = $_POST['extract_file'];
    if (file_exists($targetZip) && pathinfo($targetZip, PATHINFO_EXTENSION) === 'zip') {
        $zip = new ZipArchive;
        if ($zip->open($targetZip) === TRUE) {
            $zip->extractTo(__DIR__);
            $zip->close();
            $extracted = true;
            $msg = "File '$targetZip' berhasil diekstrak!";
            
            // Delete zip file after extract if requested
            if (isset($_POST['delete_zip'])) {
                @unlink($targetZip);
            }
        } else {
            $msg = "Gagal mengekstrak file ZIP. Pastikan ekstensi ZipArchive aktif di PHP Hostinger.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto Deploy Zip - Hostinger Subdomain</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body class="p-4 md:p-8 min-h-screen bg-slate-50 flex items-center justify-center font-sans">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div class="bg-[#001f3f] p-5 text-white text-center">
            <h1 class="text-lg font-bold">Auto Unzip & Deploy Hostinger</h1>
            <p class="text-xs text-slate-300">Ekstrak otomatis file ZIP hasil build</p>
        </div>

        <div class="p-6 space-y-4">
            <?php if ($msg): ?>
                <div class="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                    <?php echo htmlspecialchars($msg); ?>
                </div>
            <?php endif; ?>

            <?php if (empty($zipFiles)): ?>
                <div class="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500">
                    Tidak ditemukan file <b>.zip</b> di folder ini.<br>
                    Unggah file <b>dist.zip</b> atau <b>app.zip</b> ke folder subdomain ini via Hostinger File Manager.
                </div>
            <?php else: ?>
                <form method="POST" class="space-y-3">
                    <label class="block text-xs font-bold text-slate-700">Pilih File ZIP untuk Diekstrak:</label>
                    <select name="extract_file" class="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50 font-bold text-slate-800">
                        <?php foreach ($zipFiles as $file): ?>
                            <option value="<?php echo htmlspecialchars($file); ?>"><?php echo htmlspecialchars($file); ?></option>
                        <?php endforeach; ?>
                    </select>

                    <label class="flex items-center space-x-2 text-xs text-slate-600 font-medium pt-1">
                        <input type="checkbox" name="delete_zip" value="1" checked class="rounded text-[#001f3f]">
                        <span>Hapus file ZIP setelah selesai diekstrak</span>
                    </label>

                    <button type="submit" class="w-full py-3 bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer">
                        Ekstrak Sekarang & Buka App
                    </button>
                </form>
            <?php endif; ?>

            <div class="pt-3 border-t border-slate-100 text-center">
                <a href="install.php" class="text-xs font-bold text-amber-600 hover:underline">Ke Halaman Auto-Installer (install.php) &rarr;</a>
            </div>
        </div>
    </div>
</body>
</html>
