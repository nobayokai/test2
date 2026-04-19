document.addEventListener("DOMContentLoaded", () => {

    // --- Logika Menu Hamburger untuk HP ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFk7IVzwswjikcWcWH40NhmUhLRdGH6D9TdkxGErEy3iPS9a3IRXudPEPVT83eXopN/exec";
    
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");
    
    const contentArea = document.getElementById("content-area");
    const navItems = document.querySelectorAll(".nav-item");
    const btnLogoutNav = document.getElementById("tombol-logout-nav");

    const firebaseConfig = {
        apiKey: "AIzaSyBySh9tWsx2BBbdyssFhnu5BAFIAznWAY4",
        authDomain: "cbt-sekolah-game.firebaseapp.com",
        databaseURL: "https://cbt-sekolah-game-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "cbt-sekolah-game",
        storageBucket: "cbt-sekolah-game.firebasestorage.app",
        messagingSenderId: "520964850395",
        appId: "1:520964850395:web:0162e043a74eb613ecc2fe"
    };

    // Inisialisasi Firebase (Hanya jika belum jalan)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const dbGame = firebase.database();
    

    // --- FUNGSI KOMPRESI GAMBAR (CLIENT-SIDE) ---
    // Menyusutkan ukuran gambar menggunakan HTML5 Canvas sebelum diupload
    window.compressImage = function(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    // Hitung rasio penyusutan
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height *= maxWidth / width));
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width *= maxHeight / height));
                            height = maxHeight;
                        }
                    }

                    // Gambar ulang ke dalam kanvas virtual
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Konversi menjadi Base64 JPEG yang sudah dikompres
                    const dataUrl = canvas.toDataURL("image/jpeg", quality);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }


    

    // --- TAMBAHKAN KODE INI UNTUK CEK SESI SAAT REFRESH ---
    const savedRole = sessionStorage.getItem("userRole");
    const savedName = sessionStorage.getItem("userName");
    if (savedRole) {
        // --- MUNCULKAN SAPAAN NAMA ---
        const greetingElem = document.getElementById("user-greeting");
        const namaElem = document.getElementById("nama-pengguna-aktif");
        if (greetingElem && namaElem && savedName) {
            namaElem.innerText = savedName; // Isi teks dengan nama
            greetingElem.style.display = "flex"; // Tampilkan wadahnya
        }
        // -----------------------------
        // Jika sudah login, sembunyikan tombol login di nav
        document.getElementById("tombol-login-nav").style.display = "none";
        document.getElementById("tombol-logout-nav").style.display = "block"; // Munculkan tombol logout
        // Sembunyikan menu Publik (Visi Misi & Profil)
        document.querySelector('[data-page="visi-misi"]').style.display = "none";
        document.querySelector('[data-page="profil"]').style.display = "none";
        
        // Jika role-nya guru, munculkan menu rapor
        if (savedRole.toLowerCase() === "guru") {
            const menuGuru = document.getElementById("menu-guru-dropdown");
            if (menuGuru) menuGuru.style.display = "";
           // Ganti pemunculan menu game menjadi ini:
            const menuGame = document.getElementById("menu-edu-game");
            if (menuGame) menuGame.style.display = "block";
        }
        if (savedRole.toLowerCase() === "siswa") {
            const menuLatihan = document.getElementById("menu-latihan");
            if (menuLatihan) menuLatihan.style.display = "block";
            const menuGame = document.getElementById("menu-edu-game");
            if (menuGame) menuGame.style.display = "block";
        }
    }
    // -----------------------------------------------------


    // Event Delegation untuk menangani form login yang dimuat dinamis
    contentArea.addEventListener("submit", async function(e) {
        if (e.target.id === "login-form") {
            e.preventDefault(); // Mencegah form reload halaman

            const userVal = document.getElementById("username").value;
            const passVal = document.getElementById("password").value;
            const btnLogin = document.getElementById("btn-login");
            const loginAlert = document.getElementById("login-alert");

            // Ubah tampilan tombol saat proses loading
            btnLogin.innerText = "Memeriksa...";
            btnLogin.disabled = true;
            loginAlert.style.display = "none";

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({ action: "login", username: userVal, password: passVal })
                });

                const result = await response.json();

                if (result.status === "sukses") {
                    loginAlert.style.backgroundColor = "#d1e7dd";
                    loginAlert.style.color = "#0f5132";
                    loginAlert.innerText = `Selamat datang, ${result.nama}! (Role: ${result.role})`;
                    loginAlert.style.display = "block";

                    // Simpan sesi login sederhana ke SessionStorage
                    sessionStorage.setItem("userRole", result.role);
                    sessionStorage.setItem("userName", result.nama);

                    // --- MUNCULKAN SAPAAN NAMA ---
                    const greetingElem = document.getElementById("user-greeting");
                    const namaElem = document.getElementById("nama-pengguna-aktif");
                    if (greetingElem && namaElem) {
                        namaElem.innerText = result.nama; // Isi teks dengan nama dari database
                        greetingElem.style.display = "flex"; // Tampilkan wadahnya
                    }

                    // Sembunyikan menu Publik saat berhasil login
                        document.querySelector('[data-page="visi-misi"]').style.display = "none";
                        document.querySelector('[data-page="profil"]').style.display = "none";

                    // --- TAMBAHKAN KODE INI ---
                    // Cek jika role adalah Guru (pastikan tulisan sesuai dengan database di Google Sheet)
                    if (result.role.toLowerCase() === "guru") {
                            const menuGuru = document.getElementById("menu-guru-dropdown");
                            if(menuGuru) menuGuru.style.display = "";
                            const menuGame = document.getElementById("menu-edu-game");
                            if (menuGame) menuGame.style.display = "block";
                        }
                        if (result.role.toLowerCase() === "siswa") {
                            const menuLatihan = document.getElementById("menu-latihan");
                            if(menuLatihan) menuLatihan.style.display = "block";
                            const menuGame = document.getElementById("menu-edu-game");
                            if (menuGame) menuGame.style.display = "block";
                        }
                    // Sembunyikan tombol login di navbar karena sudah masuk
                    document.getElementById("tombol-login-nav").style.display = "none";
                    document.getElementById("tombol-logout-nav").style.display = "block"; // Munculkan tombol logout
                    // --------------------------

                    // Arahkan ke halaman dashboard (bisa Anda buat nanti di pages/dashboard.html)
                    setTimeout(() => {
                        loadPage("beranda"); // Memuat halaman dashboard secara dinamis
                    }, 1500);

                } else {
                    // Jika gagal login
                    loginAlert.style.backgroundColor = "#f8d7da";
                    loginAlert.style.color = "#842029";
                    loginAlert.innerText = result.message;
                    loginAlert.style.display = "block";
                }
            } catch (error) {
                loginAlert.style.backgroundColor = "#f8d7da";
                loginAlert.style.color = "#842029";
                loginAlert.innerText = "Terjadi kesalahan koneksi.";
                loginAlert.style.display = "block";
            } finally {
                // Kembalikan tombol seperti semula
                btnLogin.innerText = "Masuk";
                btnLogin.disabled = false;
            }
        }
    });

    
        

    // Fungsi untuk memuat halaman
    async function loadPage(page) {
        try {
            contentArea.innerHTML = '<h3 style="text-align:center; padding:50px;">Memuat...</h3>';
            
            // LOGIKA KHUSUS UNTUK MENU RAPOR (Menggunakan Iframe)
            if (page === "nilai") {
                contentArea.innerHTML = `
                    <iframe 
                        src="Nilai/index.html" 
                        style="width: 100%; height: 85vh; border: none; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" 
                        title="Aplikasi e-Rapor">
                    </iframe>
                `;
                return; // Hentikan fungsi di sini agar tidak menjalankan fetch di bawah
            }
            
            // LOGIKA UNTUK HALAMAN LAIN (beranda, profil, dll)
            const response = await fetch(`pages/${page}.html`);
            
            if (!response.ok) {
                throw new Error("Halaman tidak ditemukan");
            }
            
            const html = await response.text();
            contentArea.innerHTML = html;

            // --- KUNCI PERBAIKAN: INISIALISASI CKEDITOR KHUSUS MENU BUAT SOAL ---
            if (page === "buat-soal") {
                // Hapus instance lama jika guru bolak-balik menu agar tidak error
                if (window.CKEDITOR && CKEDITOR.instances['bs-pertanyaan']) {
                    CKEDITOR.instances['bs-pertanyaan'].destroy(true);
                }
                // Sulap textarea biasa menjadi Editor Canggih
                if (window.CKEDITOR) {
                    CKEDITOR.replace('bs-pertanyaan', {
                        height: 500, // Tinggi kotak
                        // --- KUNCI PERBAIKAN: Matikan peringatan update ---
                        versionCheck: false,
                        // Atur tombol apa saja yang muncul di atas kotak (Toolbar)
                        toolbar: [
                            ['Bold', 'Italic', 'Underline', 'Strike'],
                            ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent'],
                            ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
                            ['Subscript', 'Superscript'],
                            ['Styles', 'Format', 'Font', 'FontSize'],
                            ['TextColor', 'BGColor']
                        ]
                    });
                }
            }
            // ---------------------------------------------------------------------

            // =========================================================
        // --- LOGIKA HALAMAN KARTU UJIAN & DENAH ---
        // =========================================================
        if (page === "kartu-ujian") {
            window.dataSiswaKartu = [];
            
            // Konfigurasi Default Penyimpanan Lokal (LocalStorage)
            let configKartu = JSON.parse(localStorage.getItem('config_kartu_ujian')) || {
                sekolah: "SMA NEGERI 1 CONTOH", alamat: "Jl. Pendidikan No. 123",
                judul: "PENILAIAN AKHIR SEMESTER", tahun: "2024/2025", logoUrl: "",
                kota: "Jakarta", tanggal: "25 November 2024", jabatan: "Ketua Panitia",
                namaTtd: "Budi Santoso, S.Pd", ttdUrl: "",
                jadwalUjian: "Senin, 25 Nov | 08.00-10.00 | Matematika\nSelasa, 26 Nov | 08.00-10.00 | B. Indonesia" // Default Jadwal
            };

            // Memuat Data Pengaturan ke Form
            function muatPengaturanForm() {
                document.getElementById("ku-sekolah").value = configKartu.sekolah;
                document.getElementById("ku-alamat").value = configKartu.alamat;
                document.getElementById("ku-judul").value = configKartu.judul;
                document.getElementById("ku-tahun").value = configKartu.tahun;
                document.getElementById("ku-kota").value = configKartu.kota;
                document.getElementById("ku-tanggal").value = configKartu.tanggal;
                document.getElementById("ku-jabatan").value = configKartu.jabatan;
                document.getElementById("ku-nama-ttd").value = configKartu.namaTtd;
                document.getElementById("ku-jadwal").value = configKartu.jadwalUjian || ""; // Munculkan jadwal

                if (configKartu.logoUrl) {
                    const img = document.getElementById("ku-preview-logo");
                    img.src = configKartu.logoUrl; img.style.display = "block";
                }
                if (configKartu.ttdUrl) {
                    const img = document.getElementById("ku-preview-ttd");
                    img.src = configKartu.ttdUrl; img.style.display = "block";
                }
            }
            muatPengaturanForm();

            // Menyimpan Pengaturan secara Real-time saat diketik
            window.simpanPengaturanKU = function() {
                configKartu.sekolah = document.getElementById("ku-sekolah").value;
                configKartu.alamat = document.getElementById("ku-alamat").value;
                configKartu.judul = document.getElementById("ku-judul").value;
                configKartu.tahun = document.getElementById("ku-tahun").value;
                configKartu.kota = document.getElementById("ku-kota").value;
                configKartu.tanggal = document.getElementById("ku-tanggal").value;
                configKartu.jabatan = document.getElementById("ku-jabatan").value;
                configKartu.namaTtd = document.getElementById("ku-nama-ttd").value;
                configKartu.jadwalUjian = document.getElementById("ku-jadwal").value; // Simpan jadwal
                localStorage.setItem('config_kartu_ujian', JSON.stringify(configKartu));
            };

            // Mengunggah Logo/Stempel menjadi Base64
            window.uploadGambarKU = function(input, tipe) {
                if (!input.files[0]) return;
                const reader = new FileReader();
                reader.onload = e => {
                    if (tipe === 'logo') {
                        configKartu.logoUrl = e.target.result;
                        document.getElementById("ku-preview-logo").src = e.target.result;
                        document.getElementById("ku-preview-logo").style.display = "block";
                    } else {
                        configKartu.ttdUrl = e.target.result;
                        document.getElementById("ku-preview-ttd").src = e.target.result;
                        document.getElementById("ku-preview-ttd").style.display = "block";
                    }
                    localStorage.setItem('config_kartu_ujian', JSON.stringify(configKartu));
                };
                reader.readAsDataURL(input.files[0]);
            };

            // --- FUNGSI MENGAMBIL DATA DARI GOOGLE SHEETS ---
            // --- FUNGSI MENGAMBIL DATA DARI GOOGLE SHEETS & FILTERING ---
            window.tarikDataSiswaKartu = async function() {
                const tbody = document.getElementById("ku-tbody-siswa");
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Menarik data dari server...</td></tr>`;
                
                try {
                    const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "get_siswa_kartu" }) });
                    const result = await response.json();
                    
                    if (result.status === "sukses") {
                        window.dataSiswaKartu = result.data;
                        
                        // 1. Ekstrak daftar ruang unik untuk Dropdown Filter
                        const filterRuang = document.getElementById("filter-ruang-kartu");
                        if (filterRuang) {
                            // Ambil nama ruang yang tidak duplikat, lalu urutkan
                            // Ubah jadi String dan urutkan dengan benar agar Ruang 1, 2, 10 urut (bukan 1, 10, 2)
                            const uniqueRuang = [...new Set(window.dataSiswaKartu.map(item => String(item.ruang).trim()))].filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
                            let optHtml = `<option value="">-- Semua Ruang --</option>`;
                            uniqueRuang.forEach(r => { optHtml += `<option value="${r}">Ruang ${r}</option>`; });
                            filterRuang.innerHTML = optHtml;
                        }

                        // 2. Render Tabel Secara Default (Tampilkan Semua)
                        window.renderTabelSiswaKartu(""); 
                    } else {
                        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Gagal: ${result.message}</td></tr>`;
                    }
                } catch (err) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Terjadi kesalahan jaringan.</td></tr>`;
                }
            };

            // FUNGSI RENDER TABEL BERDASARKAN FILTER
            window.renderTabelSiswaKartu = function(ruangFilter) {
                const tbody = document.getElementById("ku-tbody-siswa");
                if(!tbody) return;

                let filteredData = window.dataSiswaKartu;
                if (ruangFilter !== "") {
                    filteredData = window.dataSiswaKartu.filter(s => String(s.ruang).trim() === String(ruangFilter).trim());
                }

                let html = "";
                filteredData.forEach(s => {
                    let statusFoto = s.foto ? `<span style="color:#198754; font-weight:bold;"><i class="fa-solid fa-image"></i> Ada</span>` : `<span style="color:#dc3545;">Kosong</span>`;
                    html += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-family: monospace; font-weight: bold;">${s.noPeserta}</td>
                            <td style="padding: 10px; text-transform: uppercase;">${s.nama}</td>
                            <td style="padding: 10px;">${s.kelas}</td>
                            <td style="padding: 10px; font-weight: bold; color: #0d6efd;">${s.ruang}</td>
                            <td style="padding: 10px; text-align: center;">${statusFoto}</td>
                            <td style="padding: 10px; text-align: center;">
                                <button onclick="bukaModalEditSiswa('${s.noPeserta}')" style="background:#ffc107; color:black; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:4px;" title="Edit"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="hapusDataSiswa('${s.noPeserta}')" style="background:#dc3545; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>`;
                });
                tbody.innerHTML = html === "" ? `<tr><td colspan="6" style="text-align:center;">Data kosong di Google Sheets atau ruang tidak ditemukan.</td></tr>` : html;
            };

            // Pasang Event Listener ke Dropdown Filter agar tabel berubah saat dipilih
            document.getElementById("filter-ruang-kartu")?.addEventListener("change", (e) => {
                window.renderTabelSiswaKartu(e.target.value);
            });

            // Panggil otomatis saat menu dibuka
            tarikDataSiswaKartu();

            // --- FUNGSI MEMBUKA MODAL EDIT ---
            window.bukaModalEditSiswa = function(noPeserta) {
                const siswa = window.dataSiswaKartu.find(s => s.noPeserta === noPeserta);
                if(!siswa) return;
                
                document.getElementById("edit-s-nopes").value = siswa.noPeserta;
                document.getElementById("edit-s-nopes-asli").value = siswa.noPeserta;
                document.getElementById("edit-s-nama").value = siswa.nama;
                document.getElementById("edit-s-ttl").value = siswa.ttl || ""; // <-- UBAH INI
                document.getElementById("edit-s-kls").value = siswa.kelas;
                document.getElementById("edit-s-rng").value = siswa.ruang;
                document.getElementById("edit-s-foto").value = siswa.foto || "";
                
                document.getElementById("modal-edit-siswa").style.display = "flex";
            };

            // --- FUNGSI MENYIMPAN EDIT SISWA ---
            document.getElementById("btn-simpan-edit-siswa")?.addEventListener("click", async () => {
                const btn = document.getElementById("btn-simpan-edit-siswa");
                const noPeserta = document.getElementById("edit-s-nopes-asli").value;
                
                const payload = {
                    action: "update_siswa_kartu",
                    no_peserta: noPeserta,
                    nama: document.getElementById("edit-s-nama").value.trim().toUpperCase(),
                    ttl: document.getElementById("edit-s-ttl").value.trim(), // <-- UBAH INI
                    kelas: document.getElementById("edit-s-kls").value.trim(),
                    ruang: document.getElementById("edit-s-rng").value.trim(),
                    foto: document.getElementById("edit-s-foto").value.trim()
                };

                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;
                btn.disabled = true;

                try {
                    const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
                    const result = await response.json();
                    if(result.status === "sukses") {
                        alert("✅ Data peserta berhasil diperbarui!");
                        document.getElementById("modal-edit-siswa").style.display = "none";
                        tarikDataSiswaKartu(); // Refresh tabel
                    } else { alert("❌ Gagal memperbarui data."); }
                } catch(e) { alert("Terjadi kesalahan jaringan."); }
                finally { btn.innerHTML = `<i class="fa-solid fa-save"></i> Simpan`; btn.disabled = false; }
            });

            // --- FUNGSI MENGHAPUS SISWA ---
            window.hapusDataSiswa = async function(noPeserta) {
                if(!confirm(`Yakin ingin MENGHAPUS data siswa dengan No Peserta ${noPeserta} secara permanen?\n\n(Foto di Google Drive juga akan ikut terhapus)`)) return;
                
                // --- MUNCULKAN OVERLAY LOADING HAPUS ---
                const overlay = document.createElement("div");
                overlay.id = "loading-hapus-siswa";
                overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:999999; display:flex; justify-content:center; align-items:center;";
                overlay.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; width: 90%; max-width: 350px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <i class="fa-solid fa-trash-can fa-bounce" style="font-size: 50px; color: #dc3545; margin-bottom: 20px;"></i>
                        <h3 style="margin: 0; color: #333;">Menghapus Data...</h3>
                        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Membongkar data dan foto dari server.</p>
                    </div>`;
                document.body.appendChild(overlay);

                try {
                    const response = await fetch(SCRIPT_URL, { 
                        method: "POST", 
                        body: JSON.stringify({ action: "hapus_siswa_kartu", no_peserta: noPeserta }) 
                    });
                    const result = await response.json();
                    
                    // Hapus layar loading sebelum memunculkan alert
                    document.body.removeChild(overlay); 
                    
                    if(result.status === "sukses") {
                        alert("✅ Data peserta dan foto berhasil dihapus!");
                        tarikDataSiswaKartu(); // Refresh tabel
                    } else { alert("❌ Gagal menghapus data."); }
                } catch(e) { 
                    if(document.getElementById("loading-hapus-siswa")) document.body.removeChild(overlay);
                    alert("Terjadi kesalahan jaringan."); 
                }
            };

           // --- FUNGSI PENGUBAH LINK G-DRIVE MENJADI LINK GAMBAR NATIVE ---
            function formatDriveImage(url) {
                if (!url) return "";
                // Jika format bawaan export=view lama
                if (url.includes("drive.google.com/uc?export=view&id=")) {
                    const id = url.split("id=")[1];
                    return `https://drive.google.com/thumbnail?id=${id}`;
                }
                // Jika format drive.google.com/file/d/
                if (url.includes("drive.google.com/file/d/")) {
                    const id = url.split("/d/")[1].split("/")[0];
                    return `https://drive.google.com/thumbnail?id=${id}`;
                }
                // Jika sudah thumbnail (biarkan)
                if (url.includes("thumbnail?id=")) return url;
                
                return url; 
            }

            // ==========================================
            // --- LOGIKA RENDER CETAK ---
            // ==========================================
            // ==========================================
            // --- LOGIKA RENDER CETAK (DENGAN FILTER) ---
            // ==========================================
            window.bukaModePrint = function(jenis) {
                if (window.dataSiswaKartu.length === 0) { alert("Harap tarik data siswa terlebih dahulu!"); return; }
                
                // Ambil nilai dari filter ruang saat ini
                const ruangFilter = document.getElementById("filter-ruang-kartu").value;
                let dataCetak = window.dataSiswaKartu;
                
                // Jika Guru memilih ruang tertentu, saring datanya!
                if (ruangFilter !== "") {
                    dataCetak = window.dataSiswaKartu.filter(s => String(s.ruang).trim() === String(ruangFilter).trim());
                }

                // Cek jika ruang kosong
                if (dataCetak.length === 0) {
                    alert(`Tidak ada siswa di Ruang ${ruangFilter}!`);
                    return;
                }
                
                // --- KUNCI FITUR: TANYAKAN JUMLAH KOLOM DAN BARIS UNTUK DENAH ---
                let jmlKolom = 4;
                let jmlBaris = 5;
                
                if (jenis === 'denah') {
                    let inputKolom = prompt("Berapa jumlah KOLOM meja menyamping? (Standar: 4)", "4");
                    if (inputKolom === null) return; // Jika guru klik 'Batal'
                    
                    let inputBaris = prompt("Berapa jumlah BARIS meja ke belakang? (Standar: 5)", "5");
                    if (inputBaris === null) return;
                    
                    jmlKolom = parseInt(inputKolom) || 4;
                    jmlBaris = parseInt(inputBaris) || 5;
                }
                // -----------------------------------------------------------------

                document.getElementById("dashboard-kartu").style.display = "none";
                document.getElementById("print-view").style.display = "block";
                const container = document.getElementById("print-container");
                container.innerHTML = "";

                // Lempar data yang SUDAH DIFILTER ke pembuat kartu/denah
                if (jenis === 'kartu') renderKartuPeserta(container, dataCetak);
                else if (jenis === 'denah') renderDenahRuangan(container, dataCetak, jmlKolom, jmlBaris); 
            };

            window.tutupModePrint = function() {
                document.getElementById("print-view").style.display = "none";
                document.getElementById("dashboard-kartu").style.display = "block";
            };

            // 1. RENDER KARTU PESERTA (Gaya Tabel Bawah Baru)
            function renderKartuPeserta(container, dataSiswa) {
                const chunkSize = 8;
                for (let i = 0; i < dataSiswa.length; i += chunkSize) {
                    const chunk = dataSiswa.slice(i, i + chunkSize); 
                    
                    const page = document.createElement("div");
                    page.className = "page-sheet";
                    page.style.cssText = "background: white; width: 215mm; height: 330mm; padding: 10mm; box-sizing: border-box; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, 1fr); gap: 10px;";

                    chunk.forEach(s => {
                        const linkFoto = formatDriveImage(s.foto);
                        const elemenFoto = linkFoto ? `<img src="${linkFoto}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="width:100%; height:100%; background:#eee; display:flex; align-items:center; justify-content:center; color:#999; font-size:10px;">Foto 3x4</div>`;
                        const elemenLogo = configKartu.logoUrl ? `<img src="${configKartu.logoUrl}" style="height:35px; width:35px; object-fit:contain;">` : `<div style="height:35px; width:35px; background:#ddd; font-size:8px; display:flex; align-items:center; justify-content:center;">LOGO</div>`;
                        const elemenTtd = configKartu.ttdUrl ? `<img src="${configKartu.ttdUrl}" style="height:35px; object-fit:contain; margin: 2px 0;">` : `<div style="height:35px;"></div>`;

                       // --- LOGIKA PEMBUATAN TABEL JADWAL OTOMATIS ---
                        // --- LOGIKA PEMBUATAN TABEL JADWAL OTOMATIS (AUTO-SHRINK) ---
                        let barisJadwalRaw = configKartu.jadwalUjian ? configKartu.jadwalUjian.split('\n') : [];
                        let barisJadwal = barisJadwalRaw.filter(line => line.trim() !== "");
                        
                        // KUNCI PERBAIKAN: Deteksi jumlah baris untuk mengubah ukuran dinamis
                        let jmlBaris = barisJadwal.length;
                        let ukuranFont = "7.5px"; // Ukuran normal
                        let paddingSel = "3px";   // Jarak normal
                        
                        if (jmlBaris >= 10) {
                            ukuranFont = "5.5px"; // Sangat kecil untuk jadwal padat (Senin-Jumat full)
                            paddingSel = "1px";
                        } else if (jmlBaris >= 8) {
                            ukuranFont = "6px";
                            paddingSel = "1.5px";
                        } else if (jmlBaris >= 6) {
                            ukuranFont = "6.5px";
                            paddingSel = "2px";
                        }
                        
                        let htmlTabelJadwal = '';
                        if (jmlBaris > 0) {
                            htmlTabelJadwal = `<table style="width: 100%; border-collapse: collapse; font-size: ${ukuranFont}; text-align: center; border: 1px solid black;">
                                <tr><th colspan="3" style="border: 1px solid black; padding: ${paddingSel}; background: #f8f9fa;">Jadwal Ujian</th></tr>`;
                            
                            for(let r = 0; r < jmlBaris; r++) {
                                let cols = ["", "", ""];
                                let parts = barisJadwal[r].split('|').map(p => p.trim());
                                cols[0] = parts[0] || ""; cols[1] = parts[1] || ""; cols[2] = parts[2] || "";
                                
                                htmlTabelJadwal += `
                                    <tr>
                                        <td style="border: 1px solid black; padding: ${paddingSel}; width: 35%;">${cols[0]}</td>
                                        <td style="border: 1px solid black; padding: ${paddingSel}; width: 30%;">${cols[1]}</td>
                                        <td style="border: 1px solid black; padding: ${paddingSel}; width: 35%;">${cols[2]}</td>
                                    </tr>`;
                            }
                            htmlTabelJadwal += `</table>`;
                        }

                        // --- RENDER KESELURUHAN KARTU ---
                        page.innerHTML += `
                            <div style="border: 2px solid black; padding: 6px; display: flex; flex-direction: column; font-family: Arial, sans-serif; font-size: 10px; line-height: 1.2; overflow: hidden; position: relative; height: 100%;">
                                
                                <div style="display: flex; gap: 8px; border-bottom: 2px solid black; padding-bottom: 5px; margin-bottom: 5px;">
                                    ${elemenLogo}
                                    <div style="flex: 1; text-align: center;">
                                        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${configKartu.judul}</div>
                                        <div style="font-size: 13px; font-weight: bold;">${configKartu.sekolah}</div>
                                        <div style="font-size: 7px;">${configKartu.alamat}</div>
                                    </div>
                                    <div style="background: #f0f0f0; border: 1px solid #ccc; font-size: 18px; font-weight: bold; padding: 5px 10px; display: flex; align-items: center; justify-content: center;">
                                        ${s.ruang}
                                    </div>
                                </div>
                                
                                <div style="text-align: center; background: #eee; font-weight: bold; padding: 3px; border: 1px solid #ccc; margin-bottom: 8px; font-size: 11px;">
                                    KARTU PESERTA UJIAN ${configKartu.tahun}
                                </div>
                                
                                <table style="width: 100%; font-size: 11px; margin-bottom: 5px;">
                                    <tr><td style="width: 70px; font-weight: bold;">No. Peserta</td><td>: <span style="font-family: monospace; font-weight: bold;">${s.noPeserta}</span></td></tr>
                                    <tr><td style="font-weight: bold;">Nama</td><td>: <span style="text-transform: uppercase; font-weight: bold;">${s.nama}</span></td></tr>
                                    <tr><td style="font-weight: bold;">Tempat, Tgl Lahir</td><td>: <span style="text-transform: capitalize;">${s.ttl}</span></td></tr>
                                </table>
                                
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 5px; gap: 8px;">
                                    
                                    <div style="width: 60px; height: 80px; border: 1px solid black; overflow: hidden; flex-shrink: 0;">
                                        ${elemenFoto}
                                    </div>
                                    
                                    <div style="flex: 1; max-width: 180px;">
                                        ${htmlTabelJadwal}
                                    </div>
                                    
                                    <div style="width: 90px; font-size: 8px; flex-shrink: 0; text-align: left;">
                                        <div style="margin-bottom: 2px;">${configKartu.kota}, ${configKartu.tanggal}</div>
                                        <div>${configKartu.jabatan}</div>
                                        ${elemenTtd}
                                        <div style="text-decoration: underline; font-weight: bold;">${configKartu.namaTtd}</div>
                                    </div>
                                    
                                </div>
                            </div>
                        `;
                    });
                    container.appendChild(page);
                }
            }

            // 2. RENDER DENAH TEMPAT DUDUK (Formasi Dinamis)
            function renderDenahRuangan(container, dataSiswa, jmlKolom, jmlBaris) {
                
                // Hitung total kapasitas kursi di ruangan
                let maxKursi = jmlKolom * jmlBaris; 
                
                // Kelompokkan siswa yang SUDAH DIFILTER berdasarkan Ruang
                const siswaPerRuang = {};
                dataSiswa.forEach(s => {
                    if (!siswaPerRuang[s.ruang]) siswaPerRuang[s.ruang] = [];
                    siswaPerRuang[s.ruang].push(s);
                });

                Object.keys(siswaPerRuang).forEach(ruang => {
                    const siswaDiRuang = siswaPerRuang[ruang].slice(0, maxKursi); // Batasi siswa sesuai total kursi
                    
                    const page = document.createElement("div");
                    page.className = "page-sheet";
                    page.style.cssText = "background: white; width: 215mm; height: 330mm; padding: 10mm; box-sizing: border-box; font-family: Arial, sans-serif;";

                    // Header Denah
                    page.innerHTML = `
                        <div style="text-align: center; margin-bottom: 25px;">
                            <h2 style="margin:0; background: #0d6efd; color: white; padding: 5px; border: 2px solid black; border-bottom: none;">DENAH KURSI RUANG UJIAN ${ruang}</h2>
                            <h3 style="margin:0; background: #f8f9fa; padding: 5px; border: 2px solid black;">${configKartu.sekolah} - ${configKartu.judul} ${configKartu.tahun}</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; max-width: 500px; padding: 0 50px; box-sizing: border-box;">
                                <div style="border: 2px solid black; background: #ddd; padding: 15px; text-align: center; font-weight: bold; font-size: 14px;">Pengawas 1</div>
                                <div style="border: 2px solid black; background: #ddd; padding: 15px; text-align: center; font-weight: bold; font-size: 14px;">Pengawas 2</div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(${jmlKolom}, 1fr); gap: 15px; width: 100%; max-width: 700px; margin-top: 10px;" id="grid-denah-${ruang}">
                            </div>
                        </div>
                    `;
                    
                    container.appendChild(page);
                    
                    const gridTarget = document.getElementById(`grid-denah-${ruang}`);
                    for (let i = 0; i < maxKursi; i++) {
                        const s = siswaDiRuang[i];
                        if (s) {
                            const linkFoto = formatDriveImage(s.foto);
                            const fotoSiswa = linkFoto ? `<img src="${linkFoto}" style="width:55px; height:75px; object-fit:cover; border:1px solid #ccc; margin-bottom:5px;">` : `<div style="width:55px; height:75px; background:#eee; display:flex; align-items:center; justify-content:center; font-size:8px; color:#999; margin-bottom:5px;">No Foto</div>`;
                            
                            gridTarget.innerHTML += `
                                <div style="border: 2px solid black; padding: 5px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 130px; background: white;">
                                    ${fotoSiswa}
                                    <div style="font-size: 10px; font-weight: bold; font-family: monospace;">${s.noPeserta}</div>
                                    <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${s.nama}</div>
                                </div>
                            `;
                        } else {
                            gridTarget.innerHTML += `
                                <div style="border: 2px dashed #999; padding: 5px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 130px; background: #f9f9f9;">
                                    <div style="font-size: 14px; font-weight: bold; color: #ccc;">KOSONG</div>
                                </div>
                            `;
                        }
                    }
                });
            }

            window.tutupModePrint = function() {
                document.getElementById("print-view").style.display = "none";
                document.getElementById("dashboard-kartu").style.display = "block";
            };

            // ==========================================
            // --- LOGIKA UPLOAD & PREVIEW DATA SISWA ---
            // ==========================================
            window.previewDataSiswa = [];

            // 1. Kontrol Tab Panel Kanan
            document.querySelectorAll(".tab-siswa-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    document.querySelectorAll(".tab-siswa-btn").forEach(b => {
                        b.style.background = "#e9ecef"; b.style.color = "#333";
                    });
                    this.style.background = "#0d6efd"; this.style.color = "white";
                    
                    document.querySelectorAll(".tab-siswa-konten").forEach(k => k.style.display = "none");
                    document.getElementById(this.getAttribute("data-target")).style.display = "flex";
                });
            });

            // 2. Unduh Template Excel Siswa
            document.getElementById("btn-dl-template-siswa").addEventListener("click", () => {
                const ws_data = [
                    ["Nama Lengkap", "Nomor Peserta", "Tempat & Tgl Lahir", "Kelas", "Ruang"],
                    ["AHMAD DAHLAN", "001-10-A", "Jakarta, 01 Januari 2010", "X-A", "01"],
                    ["SITI AMINAH", "002-10-A", "Bandung, 15 Agustus 2010", "X-A", "01"]
                ];
                const ws = XLSX.utils.aoa_to_sheet(ws_data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Data_Siswa");
                XLSX.writeFile(wb, "Template_Data_Siswa.xlsx");
            });

            // 3. Baca File Excel
            document.getElementById("file-excel-siswa").addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1}); 
                    
                    window.previewDataSiswa = [];
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (row.length === 0 || !row[0]) continue; 
                        
                        window.previewDataSiswa.push({
                            id: Date.now() + i,
                            nama: row[0] || "", noPeserta: row[1] || "", ttl: row[2] || "", // <-- UBAH KE TTL
                            kelas: row[3] || "", ruang: row[4] || "",
                            imgBase64: "", imgMime: "", imgName: ""
                        });
                    }
                    renderPreviewSiswaTable();
                };
                reader.readAsArrayBuffer(file);
            });

            // 4. Render Tabel Preview Editable
            function renderPreviewSiswaTable() {
                const tbody = document.getElementById("body-preview-siswa");
                const areaPreview = document.getElementById("area-preview-siswa");
                
                if (window.previewDataSiswa.length === 0) {
                    areaPreview.style.display = "none"; return;
                }
                
                areaPreview.style.display = "flex";
                let html = "";
                
                window.previewDataSiswa.forEach((s, idx) => {
                    html += `
                        <tr id="row-siswa-${s.id}" style="border-bottom: 1px solid #ddd; background: ${idx % 2 === 0 ? 'white' : '#f8f9fa'};">
                            <td style="padding: 5px; text-align:center;">${idx + 1}</td>
                            <td style="padding: 5px;"><input type="text" value="${s.noPeserta}" class="s-nopes" style="width:100%; border:1px solid #ccc; padding:4px;"></td>
                            <td style="padding: 5px;"><input type="text" value="${s.nama}" class="s-nama" style="width:100%; border:1px solid #ccc; padding:4px; text-transform:uppercase;"></td>
                           <td style="padding: 5px;"><input type="text" value="${s.ttl}" class="s-ttl" style="width:100%; border:1px solid #ccc; padding:4px;"></td>
                            <td style="padding: 5px;"><input type="text" value="${s.kelas}" class="s-kls" style="width:50px; border:1px solid #ccc; padding:4px;"></td>
                            <td style="padding: 5px;"><input type="text" value="${s.ruang}" class="s-rng" style="width:50px; border:1px solid #ccc; padding:4px;"></td>
                            <td style="padding: 5px;">
                                <input type="file" class="s-img" accept="image/*" data-id="${s.id}" style="width:100px; font-size:10px;">
                                <div id="s-img-status-${s.id}" style="font-size:10px; color:#0d6efd; margin-top:2px;"></div>
                            </td>
                            <td style="padding: 5px; text-align:center;"><button onclick="hapusBarisSiswa(${s.id})" style="background:#dc3545; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;

                // Event Listener Kompresi Gambar Siswa (Sama seperti soal)
                document.querySelectorAll(".s-img").forEach(input => {
                    input.addEventListener("change", async function() {
                        const file = this.files[0];
                        const id = this.getAttribute("data-id");
                        const statusText = document.getElementById(`s-img-status-${id}`);
                        
                        if (file) {
                            statusText.innerText = "⏳ Mengompres..."; statusText.style.color = "#ffc107";
                            try {
                                const compressedDataUrl = await window.compressImage(file, 600, 800, 0.7); // Ukuran pass foto
                                const base64Data = compressedDataUrl.split(',')[1]; 
                                
                                const item = window.previewDataSiswa.find(x => x.id == id);
                                if(item) {
                                    item.imgBase64 = base64Data; item.imgMime = "image/jpeg"; 
                                    item.imgName = item.noPeserta + "_" + item.nama.replace(/\s+/g, '_') + ".jpg";
                                }
                                statusText.innerText = `✅ Siap`; statusText.style.color = "#198754";
                            } catch (err) {
                                statusText.innerText = "❌ Gagal"; statusText.style.color = "#dc3545";
                            }
                        }
                    });
                });
            }

            window.hapusBarisSiswa = function(id) {
                window.previewDataSiswa = window.previewDataSiswa.filter(x => x.id !== id);
                renderPreviewSiswaTable();
            };

            // 5. Simpan Massal ke Server
            document.getElementById("btn-simpan-siswa-massal").addEventListener("click", async function() {
                if(!confirm("Yakin ingin menyimpan data siswa ini ke Database? Foto akan otomatis terunggah ke Google Drive.")) return;

                const finalPayload = [];
                window.previewDataSiswa.forEach(s => {
                    const row = document.getElementById(`row-siswa-${s.id}`);
                    if(row) {
                        finalPayload.push({
                            nama: row.querySelector('.s-nama').value.toUpperCase(),
                            noPeserta: row.querySelector('.s-nopes').value,
                            ttl: row.querySelector('.s-ttl').value.toUpperCase(),
                            kelas: row.querySelector('.s-kls').value,
                            ruang: row.querySelector('.s-rng').value,
                            image_base64: s.imgBase64,
                            image_mime: s.imgMime,
                            image_name: s.imgName || (row.querySelector('.s-nopes').value + ".jpg")
                        });
                    }
                });

                if (finalPayload.length === 0) return;

                // Overlay Loading Progress Bar
                const overlay = document.createElement("div");
                overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:999999; display:flex; justify-content:center; align-items:center;";
                overlay.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; width: 90%; max-width: 400px;">
                        <i class="fa-solid fa-address-card fa-fade" style="font-size: 50px; color: #0d6efd; margin-bottom: 20px;"></i>
                        <h3 style="margin: 0 0 15px 0;">Menyimpan & Mengunggah Foto...</h3>
                        <div style="background: #e9ecef; border-radius: 8px; height: 25px; width: 100%; margin-bottom: 15px; overflow: hidden; border: 1px solid #ccc;">
                            <div id="prog-siswa-fill" style="background: #0d6efd; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                        </div>
                        <p id="prog-siswa-text" style="margin: 0; font-weight: bold;">0 / ${finalPayload.length} Siswa</p>
                    </div>`;
                document.body.appendChild(overlay);

                let suksesCount = 0; let gagalCount = 0;

                // Mengirim 1 per 1 agar Google Drive tidak timeout
                for (let i = 0; i < finalPayload.length; i++) {
                    try {
                        const response = await fetch(SCRIPT_URL, {
                            method: "POST",
                            body: JSON.stringify({ action: "simpan_siswa_massal", data_siswa: [finalPayload[i]] })
                        });
                        const result = await response.json();
                        if(result.status === "sukses") suksesCount++; else gagalCount++;
                    } catch (err) { gagalCount++; }

                    document.getElementById("prog-siswa-fill").style.width = Math.round(((i + 1) / finalPayload.length) * 100) + "%";
                    document.getElementById("prog-siswa-text").innerText = `${i + 1} / ${finalPayload.length} Siswa Tersimpan`;
                }

                setTimeout(() => {
                    document.body.removeChild(overlay);
                    if (gagalCount === 0) {
                        alert("✅ Sempurna! Semua data dan foto berhasil masuk database.");
                        document.getElementById("file-excel-siswa").value = "";
                        window.previewDataSiswa = [];
                        renderPreviewSiswaTable();
                        document.querySelector('.tab-siswa-btn[data-target="tab-siswa-db"]').click();
                        tarikDataSiswaKartu(); // Refresh tabel db
                    } else {
                        alert(`Selesai. ${suksesCount} berhasil, ${gagalCount} gagal diunggah.`);
                    }
                }, 600);
            });

            

            // 2. RENDER DENAH TEMPAT DUDUK (Per Ruang)
           
        }
       // =========================================================
        // --- LOGIKA EDU-GAME HUB (PUSAT PERMAINAN) ---
        // =========================================================
        if (page === "edu-game") {
            const role = sessionStorage.getItem("userRole");
            
            // 1. DEKLARASI FUNGSI DATABASE GURU (Anti Hoisting Error)
            window.muatDatabaseGameTabel = async function() {
                const tbody = document.getElementById("tbody-database-game");
                if(!tbody) return;
                tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:15px;">Mencari data...</td></tr>`;
                try {
                    const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "get_bank_kata" }) });
                    const result = await response.json();
                    if (result.status === "sukses") {
                        let html = "";
                        result.data.forEach(item => {
                            let cuplikanKata = item.kata.length > 30 ? item.kata.substring(0, 30) + "..." : item.kata;
                            html += `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 10px;">
                                        <b style="color: #0d6efd;">${item.kode}</b> - ${item.materi}<br>
                                        <small style="color:#666;">Isi: ${cuplikanKata}</small>
                                    </td>
                                    <td style="padding: 10px; text-align: center;">
                                        <button onclick="editDatabaseGame('${item.kode}', '${item.materi}', '${item.kata}')" style="background:#ffc107; border:none; padding:5px; border-radius:3px; cursor:pointer; margin-bottom:5px; width: 30px;"><i class="fa-solid fa-pen"></i></button>
                                        <button onclick="hapusDatabaseGame('${item.kode}')" style="background:#dc3545; color:white; border:none; padding:5px; border-radius:3px; cursor:pointer; width: 30px;"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>`;
                        });
                        tbody.innerHTML = html === "" ? `<tr><td colspan="2" style="text-align:center;">Belum ada materi.</td></tr>` : html;
                    }
                } catch (err) { tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:red;">Gagal memuat tabel.</td></tr>`; }
            };

            window.editDatabaseGame = function(kode, materi, kata) {
                document.querySelector('.tab-guru-btn[data-target="tab-buat-db"]').click();
                document.getElementById("db-kode").value = kode;
                document.getElementById("db-kode").disabled = true; 
                document.getElementById("db-nama").value = materi;
                document.getElementById("db-kata").value = kata;
                document.getElementById("db-mode").value = "edit";
                document.getElementById("judul-form-db").innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Materi: ${kode}`;
                document.getElementById("btn-batal-edit-db").style.display = "inline-block";
            };

            window.hapusDatabaseGame = async function(kode) {
                if(!confirm(`Yakin MENGHAPUS materi kode ${kode}?`)) return;
                try {
                    const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "hapus_bank_kata", kode: kode }) });
                    const result = await response.json();
                    if (result.status === "sukses") {
                        alert("✅ Materi berhasil dihapus!");
                        muatMateriDariSheet(); window.muatDatabaseGameTabel();
                    } else alert("❌ Gagal: " + result.message);
                } catch (err) { alert("Kesalahan jaringan."); }
            };

            async function muatMateriDariSheet() {
                try {
                    const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "get_bank_kata" }) });
                    const result = await response.json();
                    if (result.status === "sukses") {
                        window.bankKataGame = result.data; 
                        let html = `<option value="">-- Pilih Materi Database --</option>`;
                        result.data.forEach(item => { html += `<option value="${item.kode}">${item.materi}</option>`; });
                        document.getElementById("select-materi-game").innerHTML = html;
                    }
                } catch (err) { }
            }

            // 2. LOGIKA TAMPILAN GURU
            if (role && role.toLowerCase() === "guru") {
                document.getElementById("area-manajemen-guru").style.display = "block";
                muatMateriDariSheet(); 
                window.muatDatabaseGameTabel(); 
                
                document.querySelectorAll(".tab-guru-btn").forEach(btn => {
                    btn.addEventListener("click", function() {
                        document.querySelectorAll(".tab-guru-btn").forEach(b => {
                            b.style.background = "#e9ecef"; b.style.color = "#333";
                        });
                        this.style.background = "#198754"; this.style.color = "white";
                        document.querySelectorAll(".tab-guru-konten").forEach(k => k.style.display = "none");
                        document.getElementById(this.getAttribute("data-target")).style.display = "block";
                    });
                });
            }

            // SIMPAN DATABASE TABS
            const btnSimpanDB = document.getElementById("btn-simpan-db");
            if (btnSimpanDB) {
                btnSimpanDB.addEventListener("click", async () => {
                    const mode = document.getElementById("db-mode").value;
                    const kode = document.getElementById("db-kode").value.trim();
                    const nama = document.getElementById("db-nama").value.trim();
                    const kata = document.getElementById("db-kata").value.trim();
                    if (!kode || !nama || !kata) { alert("Harap isi semua kolom!"); return; }

                    btnSimpanDB.innerText = "Menyimpan..."; btnSimpanDB.disabled = true;
                    try {
                        const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: mode === "baru" ? "tambah_bank_kata" : "update_bank_kata", kode: kode, materi: nama, kata: kata }) });
                        const result = await response.json();
                        if (result.status === "sukses") {
                            alert("✅ Database tersimpan!");
                            document.getElementById("btn-batal-edit-db").click();
                            muatMateriDariSheet(); window.muatDatabaseGameTabel();
                            document.querySelector('.tab-guru-btn[data-target="tab-lihat-db"]').click();
                        } else alert("❌ Gagal: " + result.message);
                    } catch (err) { alert("Error koneksi."); } finally { btnSimpanDB.innerText = "Simpan Database"; btnSimpanDB.disabled = false; }
                });
            }
            document.getElementById("btn-batal-edit-db")?.addEventListener("click", (e) => {
                document.getElementById("db-kode").value = ""; document.getElementById("db-nama").value = ""; document.getElementById("db-kata").value = "";
                document.getElementById("db-kode").disabled = false; document.getElementById("db-mode").value = "baru";
                document.getElementById("judul-form-db").innerHTML = `<i class="fa-solid fa-file-circle-plus"></i> Tambah Materi Baru`; e.target.style.display = "none";
            });

            
            // 3. FUNGSI GURU BUAT ROOM CERDAS (TEBAK KATA / BALAP KETIK)
            const btnBuatRoom = document.getElementById("btn-buat-room");
            if (btnBuatRoom) {
                btnBuatRoom.addEventListener("click", () => {
                    const jenisGame = document.getElementById("select-jenis-game").value;
                    const kodeMateri = document.getElementById("select-materi-game").value;

                    // Jika BUKAN mode bebas, wajib pilih materi!
                    if (jenisGame !== "balap_ketik_free" && !kodeMateri) { 
                        alert("Pilih materi terlebih dahulu!"); 
                        return; 
                    }

                    const pinRoom = Math.floor(10000 + Math.random() * 90000).toString();
                    btnBuatRoom.innerText = "Membangun Room...";

                    try {
                        if (jenisGame === "balap_ketik_free") {
                            // MODE BEBAS
                            let targetKarakter = prompt("Masukkan Target Jumlah Huruf/Karakter untuk Finish.\n\nSaran: Ketik 300 sampai 1000 (1 Kata rata-rata = 5 huruf)", "500");
                            if (!targetKarakter || isNaN(targetKarakter)) { 
                                btnBuatRoom.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> BUAT ROOM SEKARANG`; 
                                return; 
                            }
                            
                            dbGame.ref('balap_rooms/' + pinRoom).set({ host: sessionStorage.getItem("userName"), materi: "Menyalin Teks Buku Bebas", mode: "free", target_karakter: parseInt(targetKarakter), status: "lobby", pemain: {}, pemenang: "" })
                            .then(() => { sessionStorage.setItem("active_balap_room", pinRoom); sessionStorage.setItem("is_balap_host", "true"); loadPage("arena-balap"); })
                            .catch(err => { alert("Koneksi ke server terputus."); btnBuatRoom.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> BUAT ROOM SEKARANG`; });
                            
                        } else {
                            // MODE DATABASE (Tebak Kata & Balap Ketik Biasa)
                            const materiDipilih = window.bankKataGame.find(x => String(x.kode) === String(kodeMateri));
                            
                            if (!materiDipilih) {
                                alert("Materi tidak ditemukan di sistem! Pastikan materi sudah ter-load dengan benar.");
                                btnBuatRoom.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> BUAT ROOM SEKARANG`;
                                return;
                            }

                            // Deklarasikan teksMentah di luar sini agar bisa dibaca oleh semua mode game
                            let teksMentah = materiDipilih.kata || materiDipilih.isi || "";
                            if (teksMentah.trim() === "") {
                                alert("Data kata pada materi ini kosong! Silakan periksa Database Excel Anda.");
                                btnBuatRoom.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> BUAT ROOM SEKARANG`;
                                return;
                            }

                            if (jenisGame === "tebak_kata") {
                                let arrayKataLengkap = teksMentah.split(",").map(k => k.trim());
                                let arrayAcak = (typeof acakUrutan === "function") ? acakUrutan([...arrayKataLengkap]) : arrayKataLengkap;
                                
                                dbGame.ref('rooms/' + pinRoom).set({ host: sessionStorage.getItem("userName"), materi: materiDipilih.materi, daftar_kata: arrayAcak, status: "lobby", pemain: {}, chat: {} })
                                .then(() => { sessionStorage.setItem("active_game_room", pinRoom); sessionStorage.setItem("is_game_host", "true"); loadPage("arena-bermain"); })
                                .catch(err => { alert("Gagal membuat room!"); btnBuatRoom.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> BUAT ROOM SEKARANG`; });
                                
                            
                            } else if (jenisGame === "balap_ketik") {
                                // (Kode balap ketik Anda yang sudah ada tetap di sini)
                                let teksBalapanUtuh = teksMentah; 
                                dbGame.ref('balap_rooms/' + pinRoom).set({ host: sessionStorage.getItem("userName"), materi: materiDipilih.materi, teks_balapan: teksBalapanUtuh, mode: "database", status: "lobby", pemain: {}, pemenang: "" })
                                .then(() => { sessionStorage.setItem("active_balap_room", pinRoom); sessionStorage.setItem("is_balap_host", "true"); loadPage("arena-balap"); })
                                .catch(err => { alert("Gagal membuat room!"); btnBuatRoom.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> BUAT ROOM SEKARANG`; });
                            
                            // --- TAMBAHKAN LOGIKA BATTLE ROYALE DI SINI ---
                            } else if (jenisGame === "battle_royale") {
                                // Pecah kata dari database menjadi array (peluru serangan)
                                let arrayPeluru = teksMentah.split(",").map(k => k.trim()).filter(k => k !== "");
                                // Acak urutan peluru agar tidak bisa ditebak
                                arrayPeluru = arrayPeluru.sort(() => Math.random() - 0.5);

                                dbGame.ref('balap_rooms/' + pinRoom).set({ 
                                    host: sessionStorage.getItem("userName"), 
                                    materi: materiDipilih.materi, 
                                    daftar_peluru: arrayPeluru, 
                                    indeks_peluru: 0, // Kata ke berapa yang sedang ditampilkan
                                    mode: "battle", 
                                    status: "lobby", 
                                    pemain: {}, 
                                    pemenang: "" 
                                })
                                .then(() => { sessionStorage.setItem("active_balap_room", pinRoom); sessionStorage.setItem("is_balap_host", "true"); loadPage("arena-balap"); })
                                .catch(err => { alert("Gagal membuat room!"); btnBuatRoom.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> BUAT ROOM SEKARANG`; });
                          
                                
                                // --- LOGIKA BUAT ROOM 3D SURVIVAL (FIXED: AMBIL DARI BANK_SOAL_3D) ---
                            } else if (jenisGame === "lantai_runtuh") {
                                
                                // 1. Tanya Kode Soal ke Guru
                                let kodePilihan = prompt("🎮 ARENA 3D SURVIVAL\n\nMasukkan KODE SOAL (Contoh: IPA-01).\n\nKosongkan lalu klik OK jika ingin menggunakan SEMUA SOAL di Bank_Soal_3D:", "");
                                
                                if (kodePilihan === null) return; 

                                // Ubah tombol jadi loading
                                let teksAwalTombol = btnBuatRoom.innerHTML;
                                btnBuatRoom.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menarik Data Bank_Soal_3D...`;
                                btnBuatRoom.disabled = true;

                                // 2. AMBIL DATA LANGSUNG (Bypass teksMentah)
                                fetch(SCRIPT_URL + "?action=getSoal3D")
                                .then(res => res.json())
                                .then(data => {
                                    
                                    let soalTersaring = data;
                                    kodePilihan = kodePilihan.trim().toUpperCase();
                                    
                                    // Saring berdasarkan Kode Soal dari Bank_Soal_3D
                                    if (kodePilihan !== "") {
                                        soalTersaring = data.filter(s => String(s.kode).toUpperCase() === kodePilihan);
                                    }

                                    if (soalTersaring.length === 0) {
                                        alert(`❌ Data Gagal Diambil! Soal dengan Kode "${kodePilihan}" tidak ditemukan di sheet 'Bank_Soal_3D'.`);
                                        btnBuatRoom.innerHTML = teksAwalTombol;
                                        btnBuatRoom.disabled = false;
                                        return;
                                    }

                                    // Acak soal
                                    soalTersaring = soalTersaring.sort(() => Math.random() - 0.5);

                                    // Konversi ke format Arena 3D
                                    let daftarSoal3D = soalTersaring.map(item => {
                                        let jwb = String(item.jawaban).trim().toUpperCase();
                                        let isBenar = (jwb === "B" || jwb === "BENAR");
                                        return {
                                            pertanyaan: item.pertanyaan,
                                            kiri: "SALAH",
                                            kanan: "BENAR",
                                            jawaban_benar: isBenar ? "kanan" : "kiri" 
                                        };
                                    });

                                    // 3. Simpan ke Firebase
                                    dbGame.ref('balap_rooms/' + pinRoom).set({ 
                                        host: sessionStorage.getItem("userName"), 
                                        materi: kodePilihan === "" ? "Semua Soal 3D" : ("Kode: " + kodePilihan), 
                                        daftar_soal: daftarSoal3D, 
                                        indeks_soal: 0,
                                        mode: "3d_survival", status: "lobby", pemain: {}, pemenang: "" 
                                    })
                                    .then(() => { 
                                        sessionStorage.setItem("active_3d_room", pinRoom); 
                                        sessionStorage.setItem("is_3d_host", "true"); 
                                        loadPage("arena-3d"); 
                                    });

                                })
                                .catch(err => {
                                    alert("❌ Koneksi Gagal! Pastikan Apps Script sudah di-deploy dengan action 'getSoal3D'.");
                                    btnBuatRoom.innerHTML = teksAwalTombol;
                                    btnBuatRoom.disabled = false;
                                });
                            }
                            
                        }
                    } catch (error) {
                        // Jaring pengaman: Jika terjadi error sistem, kembalikan teks tombol!
                        console.error("Error Game:", error);
                        alert("Terjadi kesalahan sistem saat membuat room. Coba lagi.");
                        btnBuatRoom.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> BUAT ROOM SEKARANG`;
                    }
                });
            }

            
            // 4. FUNGSI SISWA GABUNG CERDAS (SMART JOIN) - VERSI FIXED
            const btnGabung = document.getElementById("btn-gabung-game");
            if (btnGabung) {
                btnGabung.addEventListener("click", () => {
                    const pinMasuk = document.getElementById("input-pin-game").value.trim();
                    if (pinMasuk.length < 5) { alert("PIN tidak valid!"); return; }

                    btnGabung.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mendeteksi...`;
                    const myName = sessionStorage.getItem("userName");

                    // 1. Cek di jalur Tebak Kata
                    dbGame.ref('rooms/' + pinMasuk).once('value', (snapTK) => {
                        if (snapTK.exists()) {
                            dbGame.ref(`rooms/${pinMasuk}/pemain/${myName}`).set({ skor: 0, status: "menunggu" }).then(() => {
                                sessionStorage.setItem("active_game_room", pinMasuk);
                                sessionStorage.setItem("is_game_host", "false");
                                loadPage("arena-bermain");
                            });
                        } else {
                            // 2. Cek di jalur Balap Rooms (Bisa Balap Ketik, Battle, atau 3D Survival)
                            dbGame.ref('balap_rooms/' + pinMasuk).once('value', (snapBK) => {
                                if (snapBK.exists()) {
                                    const roomData = snapBK.val();
                                    
                                    // KUNCI PERBAIKAN: Cek Mode di dalam Database
                                    if (roomData.mode === "3d_survival") {
                                        // JIKA MODE 3D: Arahkan ke Arena 3D
                                        dbGame.ref(`balap_rooms/${pinMasuk}/pemain/${myName}`).set({ posisi: "tengah", hp: 1 }).then(() => {
                                            sessionStorage.setItem("active_3d_room", pinMasuk);
                                            sessionStorage.setItem("is_3d_host", "false");
                                            loadPage("arena-3d");
                                        });
                                    } else {
                                        // JIKA MODE BALAP/BATTLE: Arahkan ke Arena Balap
                                        let dataAwal = { progress: 0, nitro: false };
                                        if(roomData.mode === "battle") { dataAwal.hp = 100; dataAwal.isAttacking = false; }
                                        
                                        dbGame.ref(`balap_rooms/${pinMasuk}/pemain/${myName}`).set(dataAwal).then(() => {
                                            sessionStorage.setItem("active_balap_room", pinMasuk);
                                            sessionStorage.setItem("is_balap_host", "false");
                                            loadPage("arena-balap");
                                        });
                                    }
                                } else {
                                    alert("PIN Room tidak ditemukan!");
                                    btnGabung.innerHTML = `<i class="fa-solid fa-play"></i> MASUK ROOM`;
                                }
                            });
                        }
                    });
                });
            }

            // --- 5. FUNGSI MABAR OTOMATIS (PUBLIC MATCHMAKING & BOTS) ---
            const btnPublic3D = document.getElementById("btn-public-3d");
            if (btnPublic3D) {
                btnPublic3D.addEventListener("click", async () => {
                    const myName = sessionStorage.getItem("userName");
                    const teksAwal = btnPublic3D.innerHTML;
                    btnPublic3D.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mencari Lawan...`;
                    btnPublic3D.disabled = true;

                    // Cari room publik yang sedang terbuka (Lobby)
                    dbGame.ref('balap_rooms').once('value', async (snap) => {
                        let rooms = snap.val() || {};
                        let publicRoomId = null;

                        for (let key in rooms) {
                            // Cek jika ada room publik yang masih nunggu pemain
                            if (rooms[key].mode === "3d_survival_public" && rooms[key].status === "lobby") {
                                publicRoomId = key; break;
                            }
                        }

                        if (publicRoomId) {
                            // JIKA ADA: Gabung ke room tersebut
                            dbGame.ref(`balap_rooms/${publicRoomId}/pemain/${myName}`).set({ posisi: "tengah", hp: 1 }).then(() => {
                                sessionStorage.setItem("active_3d_room", publicRoomId);
                                sessionStorage.setItem("is_3d_host", "false"); // Pemain biasa (bukan shadow host)
                                loadPage("arena-3d");
                            });
                        } else {
                            // JIKA TIDAK ADA: Buat room publik baru & jadikan siswa ini "Shadow Host"
                            btnPublic3D.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Membangun Arena...`;
                            try {
                                const response = await fetch(SCRIPT_URL + "?action=getSoal3D");
                                const data = await response.json();
                                if (data.length === 0) {
                                    alert("Bank soal 3D di Google Sheets kosong!");
                                    btnPublic3D.innerHTML = teksAwal; btnPublic3D.disabled = false; return;
                                }
                                
                                // Acak soal dan konversi format
                                let soalAcak = data.sort(() => Math.random() - 0.5);
                                let daftarSoal3D = soalAcak.map(item => {
                                    let jwb = String(item.jawaban).trim().toUpperCase();
                                    return {
                                        pertanyaan: item.pertanyaan,
                                        kiri: "SALAH", kanan: "BENAR",
                                        jawaban_benar: (jwb === "B" || jwb === "BENAR") ? "kanan" : "kiri" 
                                    };
                                });

                                const newRoomId = "PUB_" + Math.floor(Math.random() * 99999);
                                dbGame.ref('balap_rooms/' + newRoomId).set({
                                    host: myName, 
                                    materi: "Public Auto-Match 🌍",
                                    daftar_soal: daftarSoal3D, indeks_soal: 0,
                                    mode: "3d_survival_public", status: "lobby",
                                    waktu_lobby: Date.now() + 30000, // Tunggu 30 Detik
                                    pemain: { [myName]: { posisi: "tengah", hp: 1 } },
                                    pemenang: ""
                                }).then(() => {
                                    sessionStorage.setItem("active_3d_room", newRoomId);
                                    // KUNCI: Dia jadi host agar device-nya menjalankan timer dan men-spawn Bot
                                    sessionStorage.setItem("is_3d_host", "true"); 
                                    loadPage("arena-3d");
                                });
                            } catch (e) {
                                alert("Gagal terhubung ke Database Bank_Soal_3D.");
                                btnPublic3D.innerHTML = teksAwal; btnPublic3D.disabled = false;
                            }
                        }
                    });
                });
            }
            
        }
        
        //--------------------------hapus sampai sini------------------------------------------------------
            
        } catch (error) {
            contentArea.innerHTML = `<h3 style="text-align:center; padding:50px; color:red;">Error 404: ${error.message}</h3>`;
        }
    }

    // Event listener untuk setiap menu navigasi
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault(); // Mencegah reload halaman browser
            const pageName = item.getAttribute("data-page");
            loadPage(pageName);
            
            // Opsional: Ubah URL agar terlihat rapi tanpa reload (History API)
            window.history.pushState({ page: pageName }, "", `#${pageName}`);
        });
    });

    // Muat halaman beranda secara default saat web pertama kali dibuka
    loadPage("beranda");

    if (btnLogoutNav) {
        btnLogoutNav.addEventListener("click", (e) => {
            e.preventDefault(); // Mencegah reload halaman
            
            // 1. Hapus data sesi dari browser
            sessionStorage.removeItem("userRole");
            sessionStorage.removeItem("userName");
            clearExamSession(); // Menghapus sesi ujian jika ada


            // --- SEMBUNYIKAN SAPAAN NAMA ---
            const greetingElem = document.getElementById("user-greeting");
            if (greetingElem) {
                greetingElem.style.display = "none";
                document.getElementById("nama-pengguna-aktif").innerText = ""; // Kosongkan namanya
            }
            
            // 2. Sembunyikan Menu Khusus Role
            // --- KUNCI PERBAIKAN: Sembunyikan ID Dropdown Guru yang baru ---
            const menuGuru = document.getElementById("menu-guru-dropdown");
            if (menuGuru) menuGuru.style.display = "none";

            const menuGame = document.getElementById("menu-edu-game");
            if (menuGame) menuGame.style.display = "none";
            
            const menuLatihan = document.getElementById("menu-latihan");
            if (menuLatihan) menuLatihan.style.display = "none"; 
            
            // 3. Munculkan Kembali Menu Publik (Visi Misi & Profil)
            const menuVisiMisi = document.querySelector('[data-page="visi-misi"]');
            if (menuVisiMisi) menuVisiMisi.style.display = "block";
            
            const menuProfil = document.querySelector('[data-page="profil"]');
            if (menuProfil) menuProfil.style.display = "block";
            
            // 4. Kembalikan Tombol Login & Sembunyikan Logout
            btnLogoutNav.style.display = "none";
            const btnLoginNav = document.getElementById("tombol-login-nav");
            if (btnLoginNav) btnLoginNav.style.display = "block";
            
            // Tutup menu hamburger jika sedang terbuka di HP
            if (navMenu) navMenu.classList.remove("active");
            
            alert("Anda telah berhasil keluar dari sistem.");
            loadPage("beranda");
        });
    }


   
    // --- KODE SISTEM UJIAN (LATIHAN TKA) ---
    // Variabel global untuk CBT
    // --- KODE SISTEM UJIAN (LATIHAN TKA) CBT PRO ---
    let currentExamCode = "";
    let loadedQuestions = [];
    let currentQuestionIndex = 0;
    let detailJawaban = {}; 
    let statusRagu = {}; // Menyimpan status ragu-ragu
    let examEndTime = null;
    let timerInterval = null;

    // Fungsi Fisher-Yates Shuffle
    function acakUrutan(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // Fungsi menyimpan sesi (Auto-Save ke Browser)
    function saveExamSession() {
        const sessionData = {
            code: currentExamCode,
            questions: loadedQuestions,
            currentIndex: currentQuestionIndex,
            answers: detailJawaban,
            ragu: statusRagu,
            endTime: examEndTime
        };
        sessionStorage.setItem("cbt_active_session", JSON.stringify(sessionData));
    }

    // Fungsi menghapus sesi ujian
    function clearExamSession() {
        sessionStorage.removeItem("cbt_active_session");
        clearInterval(timerInterval);
    }

    const originalLoadPage = loadPage;
    loadPage = async function(page) {
        await originalLoadPage(page); 
        
        if (page === "latihan") {
            const btnLanjut = document.getElementById("btn-lanjut-ujian");
            const inputKode = document.getElementById("kode-ujian");
            const tahapKode = document.getElementById("input-kode-container");
            const modalKonfirmasi = document.getElementById("modal-konfirmasi");
            const areaUjian = document.getElementById("area-ujian");

            // --- CEK SESI REFRESH ---
            // Jika ada ujian yang belum selesai, langsung muat!
            const savedSession = sessionStorage.getItem("cbt_active_session");
            if (savedSession) {
                const data = JSON.parse(savedSession);
                currentExamCode = data.code;
                loadedQuestions = data.questions;
                currentQuestionIndex = data.currentIndex;
                detailJawaban = data.answers;
                statusRagu = data.ragu;
                examEndTime = data.endTime;

                tahapKode.style.display = "none";
                areaUjian.style.display = "flex";
                
                mulaiTimer();
                renderGridNavigasi();
                displayQuestion(currentQuestionIndex);


                // --- TAMBAHKAN BLOK KODE INI ---
                // Paksa Blokir Layar jika siswa masuk via Refresh (F5)
                setTimeout(() => {
                    if (typeof tampilkanPeringatanPelanggaran === "function") {
                        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
                        if (!isFullscreen) {
                            tampilkanPeringatanPelanggaran();
                        }
                    }
                }, 500);
                // -------------------------------
            }

            // ALUR 1: Cek Kode (Dengan Pengecekan Status Ujian)
            if (btnLanjut && !savedSession) {
                btnLanjut.addEventListener("click", async () => {
                    const kodeDiminta = inputKode.value.trim().toUpperCase();
                    if(!kodeDiminta) return;
                    
                    btnLanjut.innerText = "Memeriksa Kelayakan...";
                    btnLanjut.disabled = true;
                    const errorElemen = document.getElementById("error-kode");
                    errorElemen.style.display = "none"; // Sembunyikan error sebelumnya

                    try {
                        // 1. CEK KE SERVER APAKAH SISWA SUDAH MENGERJAKAN?
                        const checkPayload = {
                            action: "cek_status_ujian",
                            nama_siswa: sessionStorage.getItem("userName"),
                            kode_soal: kodeDiminta
                        };

                        const checkResponse = await fetch(SCRIPT_URL, {
                            method: "POST",
                            body: JSON.stringify(checkPayload)
                        });
                        const checkResult = await checkResponse.json();

                        // Jika balasan server mengatakan "sudah"
                        if (checkResult.status === "sudah") {
                            errorElemen.innerText = "⛔ Maaf, Anda sudah pernah menyelesaikan ujian ini!";
                            errorElemen.style.display = "block";
                            btnLanjut.innerText = "Lanjut";
                            btnLanjut.disabled = false;
                            return; // Hentikan eksekusi di sini!
                        }

                        // 2. JIKA BELUM MENGERJAKAN, TARIK SOALNYA
                        const response = await fetch(SCRIPT_URL);
                        const semuaSoal = await response.json();
                        let soalSesuaiKode = semuaSoal.filter(soal => soal.kode.toUpperCase() === kodeDiminta);

                        if (soalSesuaiKode.length === 0) {
                            errorElemen.innerText = "Kode Ujian tidak ditemukan!";
                            errorElemen.style.display = "block";
                        } else {
                            currentExamCode = kodeDiminta; 
                            document.getElementById("label-kode-ujian").innerText = kodeDiminta; 
                            modalKonfirmasi.style.display = "flex"; 
                            // Acak soal dan simpan ke memory
                            loadedQuestions = acakUrutan(soalSesuaiKode); 
                        }
                    } catch (error) {
                        alert("Gagal terhubung ke server. Pastikan internet Anda stabil.");
                    } finally {
                        btnLanjut.innerText = "Lanjut";
                        btnLanjut.disabled = false;
                    }
                });
            }

            if (document.getElementById("btn-batal-mulai")) {
                document.getElementById("btn-batal-mulai").addEventListener("click", () => {
                    modalKonfirmasi.style.display = "none";
                });
            }

            // ALUR 2: Mulai Ujian Baru
            if (document.getElementById("btn-konfirmasi-mulai")) {
                document.getElementById("btn-konfirmasi-mulai").addEventListener("click", () => {
                    
                    // --- FITUR KEAMANAN: PAKSA MASUK FULLSCREEN ---
                    const elem = document.documentElement;
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen().catch(err => console.log(err));
                    } else if (elem.webkitRequestFullscreen) { /* Safari */
                        elem.webkitRequestFullscreen();
                    } else if (elem.msRequestFullscreen) { /* IE11 */
                        elem.msRequestFullscreen();
                    }
                    
                    modalKonfirmasi.style.display = "none"; 
                    tahapKode.style.display = "none"; 

                    currentQuestionIndex = 0; 
                    detailJawaban = {}; 
                    statusRagu = {};
                    
                    // Set waktu ujian: 120 menit dari sekarang
                    examEndTime = new Date().getTime() + (120 * 60 * 1000); 
                    
                    saveExamSession(); // Auto-save pertama kali
                    mulaiTimer();
                    renderGridNavigasi();
                    displayQuestion(0);
                    
                    areaUjian.style.display = "flex";
                });
            }

            // EVENT: Saat siswa menjawab di area soal (Auto-Save Realtime)
            document.getElementById("tempat-soal").addEventListener("input", () => {
                saveCurrentAnswer();
                renderGridNavigasi();
                saveExamSession();
            });

            // TOMBOL NAVIGASI
            document.getElementById("btn-sebelumnya").addEventListener("click", () => {
                if(currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    displayQuestion(currentQuestionIndex);
                    renderGridNavigasi();
                    saveExamSession();
                }
            });

            document.getElementById("btn-berikutnya").addEventListener("click", () => {
                if(currentQuestionIndex < loadedQuestions.length - 1) {
                    currentQuestionIndex++;
                    displayQuestion(currentQuestionIndex);
                    renderGridNavigasi();
                    saveExamSession();
                }
            });

            // TOMBOL RAGU-RAGU
            document.getElementById("btn-ragu").addEventListener("click", () => {
                const soalId = loadedQuestions[currentQuestionIndex].id;
                statusRagu[soalId] = !statusRagu[soalId]; // Toggle status
                
                document.getElementById("cb-ragu").checked = statusRagu[soalId];
                renderGridNavigasi();
                saveExamSession();
            });

           // TOMBOL SELESAI UJIAN
            document.getElementById("btn-selesai-ujian").addEventListener("click", () => {
                // 1. Matikan alarm anti-keluar sementara sebelum memunculkan popup!
                window.isSubmittingExam = true; 
                
                if(confirm("Apakah Anda yakin ingin menyelesaikan ujian? Jawaban tidak bisa diubah lagi.")) {
                    submitUjian(); 
                } else {
                    // 2. Jika batal submit, hidupkan alarm lagi
                    window.isSubmittingExam = false; 
                    
                    // Kembalikan siswa ke layar penuh (karena browser mengeluarkannya saat popup muncul)
                    const elem = document.documentElement;
                    let requestFS = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
                    if (requestFS) requestFS.call(elem).catch(()=>{});
                }
            });
        }

        
        // --- LOGIKA HALAMAN LIHAT SOAL ---
        if (page === "lihat-soal") {
            let allSoalData = [];
            const filterSelect = document.getElementById("filter-kode-soal");
            const tbody = document.getElementById("body-tabel-soal");
            
            // Elemen Kontrol Poin
            const kontrolEdit = document.getElementById("kontrol-edit-poin");
            const btnEditPoin = document.getElementById("btn-mode-edit-poin");
            const btnSimpanPoin = document.getElementById("btn-simpan-poin");
            const btnBatalPoin = document.getElementById("btn-batal-poin");

            async function fetchSemuaSoalUntukGuru() {
                try {
                    const response = await fetch(SCRIPT_URL);
                    allSoalData = await response.json();

                    const uniqueCodes = [...new Set(allSoalData.map(item => item.kode))];
                    
                    filterSelect.innerHTML = `<option value="">-- Pilih Kode Soal --</option>`;
                    uniqueCodes.forEach(kode => {
                        filterSelect.innerHTML += `<option value="${kode}">${kode}</option>`;
                    });
                } catch (error) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Gagal memuat data.</td></tr>`;
                }
            }

            window.renderTabelSoal = function(kode) {
                if (!kode) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; font-style: italic;">Silakan pilih kode soal di atas.</td></tr>`;
                    if (kontrolEdit) kontrolEdit.style.display = "none";
                    return;
                }

                if (kontrolEdit) {
                    kontrolEdit.style.display = "flex";
                    resetModeEdit(); // Selalu reset jika ganti kode ujian
                }

                const filteredSoal = allSoalData.filter(soal => soal.kode === kode);

                if (filteredSoal.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">Tidak ada soal yang ditemukan.</td></tr>`;
                    return;
                }

                let html = "";
                let totalPoin = 0; // Penghitung Awal

                filteredSoal.forEach((soal, index) => {
                    let previewPertanyaan = soal.pertanyaan.replace(/\[IMG:.*?\]/, "<br><span style='color:#198754; font-size:12px;'><i class='fa-solid fa-image'></i> [Dilengkapi Gambar]</span>");
                    let previewPilihan = soal.pilihan ? soal.pilihan.join(" | ") : "-";
                    let poinAngka = Number(soal.poin) || 0;
                    totalPoin += poinAngka;

                   html += `
                        <tr>
                            <td style="text-align:center;">${index + 1}</td>
                            <td>${soal.tipe}</td>
                            <td style="white-space: pre-wrap; text-align: justify;">${previewPertanyaan}</td>
                            <td>${previewPilihan}</td>
                            <td style="font-weight:bold; color:#198754;">${soal.kunci || "-"}</td>
                            <td style="text-align:center;">
                                <input type="number" class="input-poin-massal" data-pertanyaan="${soal.pertanyaan.replace(/"/g, '&quot;')}" value="${poinAngka}" disabled style="width: 60px; text-align: center; border: 1px solid transparent; background: transparent; font-weight: bold; font-size: 15px; color: #000; outline: none;">
                            </td>
                            <td style="text-align:center;">
                                <button class="btn-hapus-soal" id="btn-hapus-${soal.id}" onclick="hapusSoal('${soal.kode}', \`${soal.pertanyaan.replace(/`/g, "\\`")}\`, '${soal.id}')">
                                    <i class="fa-solid fa-trash-can"></i> Hapus
                                </button>
                            </td>
                        </tr>
                    `;
                });

                // Tambahkan Baris Total Poin di Paling Bawah Tabel
                html += `
                    <tr style="background-color: #e9ecef;">
                        <td colspan="5" style="text-align: right; font-weight: bold; font-size: 15px;">TOTAL KESELURUHAN POIN :</td>
                        <td style="text-align: center; font-weight: bold; font-size: 20px; color: #0d6efd;" id="total-poin-teks">${totalPoin}</td>
                        <td></td>
                    </tr>
                `;

                tbody.innerHTML = html;
            };

            if(filterSelect) filterSelect.addEventListener("change", (e) => renderTabelSoal(e.target.value));

            // --- FUNGSI EDIT POIN MASSAL ---
            function resetModeEdit() {
                if(btnEditPoin) btnEditPoin.style.display = "inline-block";
                if(btnSimpanPoin) btnSimpanPoin.style.display = "none";
                if(btnBatalPoin) btnBatalPoin.style.display = "none";
                document.querySelectorAll(".input-poin-massal").forEach(input => {
                    input.disabled = true;
                    input.style.border = "1px solid transparent";
                    input.style.background = "transparent";
                });
            }

            if (btnEditPoin) {
                btnEditPoin.addEventListener("click", () => {
                    btnEditPoin.style.display = "none";
                    btnSimpanPoin.style.display = "inline-block";
                    btnBatalPoin.style.display = "inline-block";
                    
                    // Buka gembok semua kolom poin
                    document.querySelectorAll(".input-poin-massal").forEach(input => {
                        input.disabled = false;
                        input.style.border = "1px solid #ccc";
                        input.style.background = "#fff";
                        input.style.borderRadius = "4px";
                    });
                });
            }

            if (btnBatalPoin) {
                btnBatalPoin.addEventListener("click", () => renderTabelSoal(filterSelect.value)); // Kembalikan ke asal
            }

            // MENDETEKSI PERUBAHAN ANGKA SECARA REALTIME
            if (tbody) {
                tbody.addEventListener("input", (e) => {
                    if (e.target.classList.contains("input-poin-massal")) {
                        let totalSkorBaru = 0;
                        document.querySelectorAll(".input-poin-massal").forEach(input => {
                            totalSkorBaru += (Number(input.value) || 0);
                        });
                        const teksTotal = document.getElementById("total-poin-teks");
                        if (teksTotal) {
                            teksTotal.innerText = totalSkorBaru;
                            // Beri peringatan warna jika total bukan 100
                            teksTotal.style.color = (totalSkorBaru === 100) ? "#198754" : "#dc3545"; 
                        }
                    }
                });
            }

            // MENYIMPAN POIN KE DATABASE SERVER
            if (btnSimpanPoin) {
                btnSimpanPoin.addEventListener("click", async () => {
                    const inputs = document.querySelectorAll(".input-poin-massal");
                    let dataUpdate = [];
                    let totalPengecekan = 0;
                    
                    inputs.forEach(input => {
                        let angka = Number(input.value) || 0;
                        totalPengecekan += angka;
                        dataUpdate.push({
                            pertanyaan: input.getAttribute("data-pertanyaan"),
                            poin: angka
                        });
                    });

                    // Peringatan jika poin tidak genap 100
                    if (totalPengecekan !== 100) {
                        const yakin = confirm(`Peringatan!\nTotal poin saat ini adalah ${totalPengecekan} (Standar biasanya 100).\n\nApakah Anda yakin ingin tetap menyimpannya?`);
                        if(!yakin) return;
                    }

                    btnSimpanPoin.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;
                    btnSimpanPoin.disabled = true;

                    try {
                        const payload = {
                            action: "update_poin_massal",
                            kode_soal: filterSelect.value,
                            data_poin: dataUpdate
                        };

                        const response = await fetch(SCRIPT_URL, {
                            method: "POST",
                            body: JSON.stringify(payload)
                        });
                        const result = await response.json();

                        if(result.status === "sukses") {
                            alert("✅ Semua Poin berhasil diperbarui!");
                            await fetchSemuaSoalUntukGuru(); // Sinkronkan dengan data terbaru
                            renderTabelSoal(filterSelect.value); // Segarkan tampilan
                        } else {
                            alert("❌ Gagal menyimpan: " + result.message);
                            resetModeEdit();
                        }
                    } catch (error) {
                        alert("Terjadi kesalahan jaringan.");
                        resetModeEdit();
                    } finally {
                        btnSimpanPoin.innerHTML = `<i class="fa-solid fa-save"></i> Simpan Perubahan`;
                        btnSimpanPoin.disabled = false;
                    }
                });
            }

            // Fungsi Hapus Soal 
            window.hapusSoal = async function(kode, pertanyaan, rowId) {
                const konfirmasi = confirm(`🚨 PERINGATAN!\n\nApakah Anda yakin ingin MENGHAPUS soal ini?\nData dan gambar soal akan dihapus secara permanen dari server.`);
                if (!konfirmasi) return;

                // --- MUNCULKAN OVERLAY LOADING HAPUS ---
                const overlay = document.createElement("div");
                overlay.id = "loading-hapus-soal";
                overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:999999; display:flex; justify-content:center; align-items:center;";
                overlay.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; width: 90%; max-width: 350px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <i class="fa-solid fa-trash-can fa-bounce" style="font-size: 50px; color: #dc3545; margin-bottom: 20px;"></i>
                        <h3 style="margin: 0; color: #333;">Menghapus Soal...</h3>
                        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Membuang soal dan gambar dari server.</p>
                    </div>`;
                document.body.appendChild(overlay);

                try {
                    const payload = { action: "hapus_soal", kode_soal: kode, pertanyaan: pertanyaan };
                    const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
                    const result = await response.json();
                    
                    // Hapus layar loading sebelum memunculkan alert
                    document.body.removeChild(overlay); 

                    if(result.status === "sukses") {
                        alert("✅ Soal berhasil dihapus dari Database!");
                        await fetchSemuaSoalUntukGuru(); 
                        renderTabelSoal(document.getElementById("filter-kode-soal").value);
                    } else {
                        alert("❌ Gagal menghapus soal: " + result.message);
                    }
                } catch (error) {
                    if(document.getElementById("loading-hapus-soal")) document.body.removeChild(overlay);
                    alert("Terjadi kesalahan sistem saat mencoba menghapus.");
                }
            };

            // Panggil data pertama kali
            fetchSemuaSoalUntukGuru();
        }


        // --- LOGIKA HALAMAN HASIL UJIAN ---
        if (page === "hasil-ujian") {
            window.allHasilData = []; // Simpan di global agar bisa diakses tombol Print
            const filterSelect = document.getElementById("filter-hasil-kode");
            const tbody = document.getElementById("body-tabel-hasil");
            const btnRefresh = document.getElementById("btn-refresh-hasil");

            async function fetchSemuaHasilUjian() {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Mengambil data dari server...</td></tr>`;
                try {
                    // Kita gunakan POST agar lebih aman mengambil data sheet Hasil
                    const response = await fetch(SCRIPT_URL, {
                        method: "POST",
                        body: JSON.stringify({ action: "get_hasil_ujian" })
                    });
                    const result = await response.json();
                    
                    if(result.status === "sukses") {
                        allHasilData = result.data;
                        
                        // Ekstrak kode soal unik untuk dropdown
                        const uniqueCodes = [...new Set(allHasilData.map(item => item.kode))];
                        
                        let selectHtml = `<option value="">-- Semua Kode Soal --</option>`;
                        uniqueCodes.forEach(kode => {
                            selectHtml += `<option value="${kode}">${kode}</option>`;
                        });
                        filterSelect.innerHTML = selectHtml;
                        
                        renderTabelHasil(""); // Tampilkan semua di awal
                    } else {
                        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">${result.message}</td></tr>`;
                    }
                } catch (error) {
                    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Gagal terhubung ke server.</td></tr>`;
                }
            }

            window.renderTabelHasil = function(kodeFilter) {
                let filteredData = allHasilData;
                if (kodeFilter !== "") {
                    filteredData = allHasilData.filter(item => item.kode === kodeFilter);
                }

                if (filteredData.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px;">Tidak ada data hasil ujian yang ditemukan.</td></tr>`;
                    return;
                }

                let html = "";
                filteredData.forEach((hasil, index) => {
                    // Potong teks AI agar tidak membuat tabel terlalu panjang
                    let previewAI = hasil.analisis.substring(0, 80) + "...";
                    
                    // Format waktu
                    let waktuLengkap = new Date(hasil.waktu).toLocaleString('id-ID');

                    html += `
                        <tr>
                            <td style="text-align:center;">${index + 1}</td>
                            <td style="font-size:12px; color:#666;">${waktuLengkap}</td>
                            <td style="font-weight:bold;">${hasil.nama}</td>
                            <td style="text-align:center;">${hasil.kode}</td>
                            <td style="text-align:center; font-weight:bold; color:#198754; font-size:16px;">${hasil.skor}</td>
                            <td style="font-size:12px; white-space: pre-wrap; min-width: 300px; line-height: 1.5;">${hasil.analisis}</td>
                            <td style="text-align:center;">
                                <button class="btn-hapus-soal" onclick="hapusHasilUjian(${hasil.indexAsli}, '${hasil.nama}', '${hasil.kode}')" style="width:auto; padding:5px 10px; font-size:12px;">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                            <td style="text-align:center;">
                                <button onclick="cetakPDFLagi(${hasil.indexAsli})" class="btn-cbt btn-blue" style="width:auto; padding:5px 10px; font-size:12px; border-radius:4px;" title="Cetak PDF">
                                    <i class="fa-solid fa-print"></i> PDF
                                </button>
                            </td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;
            };

            // Event Listeners
            if(filterSelect) filterSelect.addEventListener("change", (e) => renderTabelHasil(e.target.value));
            if(btnRefresh) btnRefresh.addEventListener("click", fetchSemuaHasilUjian);

            // --- FUNGSI HAPUS HASIL UJIAN ---
            window.hapusHasilUjian = async function(indexAsli, nama, kode) {
                if(confirm(`Yakin ingin menghapus nilai siswa bernama ${nama} (Kode: ${kode})? Data akan hilang permanen!`)) {
                    try {
                        const response = await fetch(SCRIPT_URL, {
                            method: "POST",
                            // KITA KIRIM DATA BARIS (INDEX), BUKAN WAKTU LAGI
                            body: JSON.stringify({ action: "hapus_hasil", baris: indexAsli, nama: nama, kode_soal: kode })
                        });
                        const res = await response.json();
                        if(res.status === "sukses") {
                            alert("✅ Hasil ujian berhasil dihapus.");
                            fetchSemuaHasilUjian(); // Refresh otomatis
                        } else {
                            alert("❌ Gagal: " + res.message);
                        }
                    } catch (error) {
                        alert("Terjadi kesalahan jaringan.");
                    }
                }
            };

            // --- FUNGSI CETAK PDF DARI TABEL ---
            window.cetakPDFLagi = function(indexAsli) {
                // Cari data aslinya
                const dataSiswa = allHasilData.find(item => item.indexAsli === indexAsli);
                if(!dataSiswa) return;

                // Isi data ke template
                document.getElementById("pdf-cetak-nama").innerText = dataSiswa.nama;
                document.getElementById("pdf-cetak-kode").innerText = dataSiswa.kode;
                document.getElementById("pdf-cetak-skor").innerText = dataSiswa.skor;
                
                // Susun paragraf AI
                const paragraphs = dataSiswa.analisis.split('\n').filter(p => p.trim() !== '');
                let formattedFeedback = '';
                paragraphs.forEach(p => {
                    formattedFeedback += `<p style="margin-bottom: 12px; line-height: 1.6;">${p}</p>`;
                });
                document.getElementById("pdf-cetak-analisis").innerHTML = formattedFeedback;

                // Siapkan wadah untuk html2pdf
                const elemenPdf = document.getElementById("wadah-rapor-pdf-cetak");
                elemenPdf.style.display = "block"; 
                elemenPdf.style.width = "100%"; 
                elemenPdf.style.maxWidth = "100%"; 
                elemenPdf.style.boxSizing = "border-box";
                elemenPdf.style.padding = "20px"; 
                elemenPdf.style.backgroundColor = "white"; 

                const opt = {
                    margin:       10, 
                    filename:     `Rapor_${dataSiswa.kode}_${dataSiswa.nama.replace(/\\s+/g, '_')}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, scrollX: 0, scrollY: 0, useCORS: true }, 
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                // Bikin toast alert sederhana agar user tahu proses berjalan
                alert("Sedang menyusun PDF... Silakan tunggu sebentar.");
                
                html2pdf().set(opt).from(elemenPdf).save().then(() => {
                    elemenPdf.style.display = "none";
                });
            };

            // Panggil fungsi saat halaman pertama dimuat
            fetchSemuaHasilUjian();
        }

        // --- LOGIKA HALAMAN UPLOAD SOAL EXCEL ---
        if (page === "upload-soal") {
            let previewData = []; 

            // 1A. Buat & Unduh Template EXCEL
            document.getElementById("btn-download-template").addEventListener("click", () => {
                const ws_data = [
                    ["Kode Soal", "Tipe Soal", "Pertanyaan", "Pilihan Jawaban", "Kunci Jawaban", "Poin"],
                    ["TKA-01", "PG", "Ibukota Indonesia adalah...", "Jakarta|Bandung|Surabaya|Medan", "Jakarta", 10],
                    ["TKA-01", "Benar_Salah", "Matahari terbit dari sebelah barat.", "Benar|Salah", "Salah", 10],
                    ["TKA-01", "Isian", "Siapa nama presiden pertama RI?", "-", "Ir. Soekarno", 10]
                ];
                const ws = XLSX.utils.aoa_to_sheet(ws_data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Template_Soal");
                XLSX.writeFile(wb, "Template_Upload_CBT.xlsx");
            });

            // 1B. Buat & Unduh Template WORD (Bisa 4 Tipe Soal)
            document.getElementById("btn-dl-template-word")?.addEventListener("click", () => {
                const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Template Soal</title></head><body>";
                const footer = "</body></html>";
                const content = `
                    <div style="border: 2px solid red; padding: 10px; background: #ffeeee; margin-bottom: 20px;">
                        <h3 style="color: red; margin: 0;">🚨 ATURAN KETIK TEMPLATE WORD!</h3>
                        <p>Selalu gunakan tag <b>TIPE:</b> sebelum mengetik soal baru.</p>
                        <p>Pilihan Tipe: <b>PG</b>, <b>PG_Kompleks</b>, <b>Isian</b>, <b>Esai</b></p>
                    </div>
                    
                    <p><b>KODE: B.INDO-4B</b></p>
                    <br>
                    
                    <p><b>TIPE: PG</b></p>
                    <p>1. Ibukota negara Indonesia adalah...</p>
                    <p>A. Bandung</p>
                    <p>B. Jakarta</p>
                    <p>C. Surabaya</p>
                    <p>D. Medan</p>
                    <p>KUNCI: B</p>
                    <br>
                    
                    <p><b>TIPE: PG_Kompleks</b></p>
                    <p>2. Manakah yang termasuk hewan pemakan rumput? (Pilih 2 jawaban)</p>
                    <p>A. Sapi</p>
                    <p>B. Harimau</p>
                    <p>C. Kambing</p>
                    <p>D. Serigala</p>
                    <p>KUNCI: A,C</p>
                    <br>
                    
                    <p><b>TIPE: Isian</b></p>
                    <p>3. Presiden pertama Republik Indonesia adalah...</p>
                    <p>KUNCI: Ir. Soekarno</p>
                    <br>

                    <p><b>TIPE: Esai</b></p>
                    <p>4. Jelaskan apa yang dimaksud dengan fotosintesis!</p>
                    <p>KUNCI: -</p>
                `;
                const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'Template_Soal_Word.doc';
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
            });

            // 2. Membaca File yang Diupload (Deteksi Excel atau Word) + LOADING SCREEN
            document.getElementById("file-excel-soal").addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const fileName = file.name.toLowerCase();
                const fileType = file.type.toLowerCase();
                const areaPreview = document.getElementById("area-preview-upload");

                // --- DETEKSI SUPER KEBAL: JIKA EXCEL ---
                // Mengecek dari nama ekstensi ATAU tipe file bawaan sistem
                if (fileName.includes(".xls") || fileName.includes(".csv") || fileType.includes("excel") || fileType.includes("sheet")) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, {type: 'array'});
                        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1}); 
                        
                        previewData = [];
                        for (let i = 1; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            if (row.length === 0 || !row[0]) continue; 
                            previewData.push({
                                id: Date.now() + i,
                                kode: row[0] || "", tipe: row[1] || "PG", pertanyaan: row[2] || "",
                                pilihan: row[3] || "-", kunci: row[4] || "-", poin: row[5] || 10,
                                imgBase64: "", imgMime: "", imgName: ""
                            });
                        }
                        areaPreview.style.display = "block";
                        renderPreviewTable();
                    };
                    reader.readAsArrayBuffer(file);
                } 
                // --- DETEKSI SUPER KEBAL: JIKA WORD ---
                else if (fileName.includes(".doc") || fileName.includes(".docx") || fileType.includes("word") || fileType.includes("document") || fileType === "") {
                    
                    // 1. MUNCULKAN OVERLAY LOADING EKSTRAK WORD
                    const overlay = document.createElement("div");
                    overlay.id = "loading-ekstrak-word";
                    overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:999999; display:flex; justify-content:center; align-items:center;";
                    overlay.innerHTML = `
                        <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; width: 90%; max-width: 350px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <i class="fa-solid fa-file-word fa-bounce" style="font-size: 60px; color: #0d6efd; margin-bottom: 20px;"></i>
                            <h3 style="margin: 0; color: #333;">Membaca Dokumen...</h3>
                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Mohon tunggu, sedang mengekstrak teks dan mengenali pola soal...</p>
                        </div>`;
                    document.body.appendChild(overlay);
                    
                    areaPreview.style.display = "block";
                    document.getElementById("body-preview-soal").innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> Menyiapkan tabel preview...</td></tr>`;

                    // 2. Beri jeda agar animasi loading muncul, lalu eksekusi
                    setTimeout(() => {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const arrayBuffer = event.target.result;
                            
                            // --- KUNCI PERBAIKAN: NGINTIP ISI FILE (HTML .doc vs ZIP .docx) ---
                            const textDecoder = new TextDecoder("utf-8");
                            const textStr = textDecoder.decode(arrayBuffer);

                            if (textStr.includes("<html") || textStr.includes("urn:schemas-microsoft-com:office:word")) {
                                
                                // INI ADALAH FILE .DOC TEMPLATE BUATAN KITA! (Ekstrak tanpa Mammoth)
                                if (document.getElementById("loading-ekstrak-word")) document.body.removeChild(overlay);
                                
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(textStr, "text/html");
                                
                                // Ubah <p> dan <br> menjadi Enter (ganti baris), lalu hapus tag HTML
                                let rawText = doc.body.innerHTML
                                    .replace(/<br\s*[\/]?>/gi, "\n")
                                    .replace(/<\/p>/gi, "\n")
                                    .replace(/<[^>]+>/g, "")
                                    .replace(/&nbsp;/gi, " ")
                                    .trim();
                                
                                // Decode simbol HTML (seperti &amp; menjadi &)
                                const txtArea = document.createElement("textarea");
                                txtArea.innerHTML = rawText;
                                rawText = txtArea.value;

                                previewData = bedahTeksWordKeJSON(rawText);
                                if(previewData.length === 0) {
                                    alert("Gagal menemukan format soal. Pastikan pengetikan sesuai dengan Template!");
                                    areaPreview.style.display = "none";
                                } else { renderPreviewTable(); }
                                
                            } else {
                                
                                // INI ADALAH FILE .DOCX ASLI (Gunakan Mammoth)
                                mammoth.extractRawText({arrayBuffer: arrayBuffer})
                                    .then(function(result) {
                                        if (document.getElementById("loading-ekstrak-word")) document.body.removeChild(overlay);
                                        previewData = bedahTeksWordKeJSON(result.value);
                                        if(previewData.length === 0) {
                                            alert("Gagal menemukan format soal. Pastikan pengetikan sesuai dengan Template!");
                                            areaPreview.style.display = "none";
                                        } else { renderPreviewTable(); }
                                    })
                                    .catch(err => {
                                        if (document.getElementById("loading-ekstrak-word")) document.body.removeChild(overlay);
                                        alert("Gagal membaca file. Jika ini file .doc, cobalah 'Save As' menjadi format .docx di Microsoft Word lalu upload ulang.");
                                        areaPreview.style.display = "none";
                                    });
                            }
                        };
                        reader.readAsArrayBuffer(file);
                    }, 50);
                } else {
                    alert(`Format file tidak didukung!\nNama: "${fileName}"\nHarap masukkan Excel atau Word.`);
                }
            });

            // --- FUNGSI PEMBEDAH TEKS WORD (REGEX CERDAS UNTUK 4 TIPE) ---
            function bedahTeksWordKeJSON(text) {
                const lines = text.split('\n').map(line => line.trim()).filter(line => line !== "");
                let soalArray = [];
                let soalAktif = null;
                
                let kodeSoalGlobal = "UMUM"; 
                let tipeAktifGlobal = "PG"; // Default awal

                const polaKode = /^KODE:\s*(.*)/i;
                const polaTipe = /^TIPE:\s*(.*)/i;
                const polaSoal = /^\d+[\.\)]\s+(.*)/;      
                const polaOpsi = /^([A-E])[\.\)]\s+(.*)/i; 
                const polaKunci = /^KUNCI:\s*(.*)/i;  

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];

                    if (polaKode.test(line)) { 
                        kodeSoalGlobal = line.match(polaKode)[1].trim(); 
                    }
                    else if (polaTipe.test(line)) {
                        // Membaca perubahan tipe soal
                        tipeAktifGlobal = line.match(polaTipe)[1].trim();
                    }
                    else if (polaSoal.test(line)) {
                        if (soalAktif) simpanSoalKeArray(soalAktif, soalArray, kodeSoalGlobal);
                        soalAktif = { 
                            tipe: tipeAktifGlobal, 
                            pertanyaan: line.match(polaSoal)[1], 
                            opsi: [], 
                            kunciMentah: "" 
                        };
                    } 
                    // Baca opsi A,B,C,D hanya jika tipenya PG atau PG_Kompleks
                    else if (polaOpsi.test(line) && soalAktif && (soalAktif.tipe === "PG" || soalAktif.tipe === "PG_Kompleks")) {
                        let match = line.match(polaOpsi);
                        soalAktif.opsi.push({ huruf: match[1].toUpperCase(), teks: match[2] });
                    } 
                    // Baca Kunci (Sekarang bisa menangkap teks utuh untuk isian, atau multi-huruf 'A,C' untuk PG kompleks)
                    else if (polaKunci.test(line) && soalAktif) {
                        soalAktif.kunciMentah = line.match(polaKunci)[1].trim();
                    } 
                    // Menangkap sambungan paragraf cerita
                    else if (soalAktif && !polaOpsi.test(line) && !polaKunci.test(line)) {
                        soalAktif.pertanyaan += "\n" + line; 
                    }
                }
                if (soalAktif) simpanSoalKeArray(soalAktif, soalArray, kodeSoalGlobal);
                return soalArray;
            }

            // --- FUNGSI MENGONVERSI FORMAT WORD KE STANDAR DATABASE EXCEL ---
            function simpanSoalKeArray(soal, array, kodeGlobal) {
                let stringPilihan = "-";
                let teksKunciAkhir = soal.kunciMentah;

                // Jika PG atau PG Kompleks, ubah huruf kunci menjadi Teks Jawaban Penuh
                if (soal.tipe === "PG" || soal.tipe === "PG_Kompleks") {
                    stringPilihan = soal.opsi.map(o => o.teks).join("|"); // Gabung pakai garis lurus
                    
                    if (soal.kunciMentah && soal.kunciMentah !== "-") {
                        // Pecah jika kuncinya ada dua (Misal: "A,C" -> di-split jadi ["A", "C"])
                        let hurufKunciArray = soal.kunciMentah.split(',').map(h => h.trim().toUpperCase());
                        let teksKunciArray = [];

                        hurufKunciArray.forEach(huruf => {
                            let opsiBenar = soal.opsi.find(o => o.huruf === huruf);
                            if (opsiBenar) teksKunciArray.push(opsiBenar.teks);
                        });

                        // Gabung kembali jadi "Jawaban 1,Jawaban 2" sesuai standar PG Kompleks web Anda
                        if (teksKunciArray.length > 0) {
                            teksKunciAkhir = teksKunciArray.join(","); 
                        }
                    }
                }

                array.push({
                    id: Date.now() + array.length,
                    kode: kodeGlobal,
                    tipe: soal.tipe,
                    pertanyaan: soal.pertanyaan,
                    pilihan: stringPilihan,
                    kunci: teksKunciAkhir || "-",
                    poin: 10,
                    imgBase64: "", imgMime: "", imgName: ""
                });
            }

            // 3. Render Tabel Preview yang Bisa Di-Edit
            function renderPreviewTable() {
                const tbody = document.getElementById("body-preview-soal");
                const areaPreview = document.getElementById("area-preview-upload");
                if (previewData.length === 0) {
                    areaPreview.style.display = "none";
                    return;
                }
                
                areaPreview.style.display = "block";
                let html = "";
                
                previewData.forEach((soal, index) => {
                    html += `
                        <tr id="row-prev-${soal.id}">
                            <td style="text-align:center;">${index + 1}</td>
                            <td><input type="text" value="${soal.kode}" class="prev-kode" style="width:100%; border:1px solid #ccc; padding:5px;"></td>
                            <td><input type="text" value="${soal.tipe}" class="prev-tipe" style="width:100%; border:1px solid #ccc; padding:5px;"></td>
                            <td>
                                <textarea class="prev-tanya" style="width:100%; border:1px solid #ccc; padding:5px;" rows="3">${soal.pertanyaan}</textarea>
                                <div style="margin-top:5px; background:#f8f9fa; padding:5px; border-radius:4px;">
                                    <small style="color:#198754; font-weight:bold;">Sematkan Gambar (Opsional):</small>
                                    <input type="file" class="prev-img" accept="image/*" data-id="${soal.id}" style="width:100%; font-size:12px;">
                                    <div id="img-status-${soal.id}" style="font-size:11px; color:#0d6efd; margin-top:3px;"></div>
                                </div>
                            </td>
                            <td><textarea class="prev-pil" style="width:100%; border:1px solid #ccc; padding:5px;" rows="3">${soal.pilihan}</textarea></td>
                            <td><input type="text" value="${soal.kunci}" class="prev-kunci" style="width:100%; border:1px solid #ccc; padding:5px;"></td>
                            <td><input type="number" value="${soal.poin}" class="prev-poin" style="width:100%; text-align:center; border:1px solid #ccc; padding:5px;"></td>
                            <td style="text-align:center;"><button class="btn-hapus-soal" onclick="hapusBarisPreview(${soal.id})" style="padding:5px 10px;"><i class="fa-solid fa-trash"></i></button></td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;

                // Event Listener Konversi Gambar ke Base64
                // Event Listener Konversi Gambar ke Base64 + KOMPRESI OTOMATIS
                document.querySelectorAll(".prev-img").forEach(input => {
                    input.addEventListener("change", async function() {
                        const file = this.files[0];
                        const id = this.getAttribute("data-id");
                        const statusText = document.getElementById(`img-status-${id}`);
                        
                        if (file) {
                            // Tampilkan status loading
                            statusText.innerText = "⏳ Memeras ukuran gambar...";
                            statusText.style.color = "#ffc107"; // Kuning peringatan
                            
                            try {
                                // JALANKAN KOMPRESI: Lebar maksimal 800px, Kualitas 70% (0.7)
                                // Ini akan mengubah gambar 2MB menjadi sekitar 80KB - 150KB
                                const compressedDataUrl = await window.compressImage(file, 800, 800, 0.7);
                                const base64Data = compressedDataUrl.split(',')[1]; 
                                
                                // Hitung perkiraan ukuran hasil kompresi dalam KB
                                const sizeKB = Math.round((base64Data.length * (3/4)) / 1024);
                                
                                const item = previewData.find(x => x.id == id);
                                if(item) {
                                    item.imgBase64 = base64Data; 
                                    item.imgMime = "image/jpeg"; // Hasil kompresi selalu JPEG
                                    item.imgName = file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg";
                                }
                                statusText.innerText = `✅ Gambar siap (${sizeKB} KB)`;
                                statusText.style.color = "#198754"; // Hijau sukses
                            } catch (err) {
                                statusText.innerText = "❌ Gagal memproses gambar";
                                statusText.style.color = "#dc3545";
                            }
                        } else {
                            // Reset jika batal pilih file
                            const item = previewData.find(x => x.id == id);
                            if(item) { item.imgBase64 = ""; item.imgMime = ""; item.imgName = ""; }
                            statusText.innerText = "";
                        }
                    });
                });
            }

            window.hapusBarisPreview = function(id) {
                previewData = previewData.filter(x => x.id !== id);
                renderPreviewTable();
            };

            // 4. Kirim Data Massal ke Server
            // 4. Kirim Data Massal ke Server (DENGAN PROGRESS BAR)
            document.getElementById("btn-simpan-massal").addEventListener("click", async function() {
                if(!confirm("Yakin ingin menyimpan semua soal ini ke Database?")) return;

                // 1. Tarik data terbaru dari input field HTML
                const finalPayload = [];
                previewData.forEach(soal => {
                    const row = document.getElementById(`row-prev-${soal.id}`);
                    if(row) {
                        finalPayload.push({
                            kode_soal: row.querySelector('.prev-kode').value,
                            tipe_soal: row.querySelector('.prev-tipe').value,
                            pertanyaan: row.querySelector('.prev-tanya').value,
                            pilihan: row.querySelector('.prev-pil').value,
                            kunci: row.querySelector('.prev-kunci').value,
                            poin: row.querySelector('.prev-poin').value,
                            image_base64: soal.imgBase64,
                            image_mime: soal.imgMime,
                            image_name: soal.imgName
                        });
                    }
                });

                if (finalPayload.length === 0) return;

                // 2. --- BUAT LAYAR LOADING (OVERLAY) DI TENGAH LAYAR ---
                const overlay = document.createElement("div");
                overlay.id = "loading-overlay-massal";
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100vw";
                overlay.style.height = "100vh";
                overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Latar gelap transparan
                overlay.style.zIndex = "999999";
                overlay.style.display = "flex";
                overlay.style.justifyContent = "center";
                overlay.style.alignItems = "center";
                
                overlay.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; width: 90%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <i class="fa-solid fa-cloud-arrow-up fa-fade" style="font-size: 50px; color: #198754; margin-bottom: 20px;"></i>
                        <h3 style="margin: 0 0 15px 0; color: #333;">Mengunggah Data...</h3>
                        
                        <div style="background: #e9ecef; border-radius: 8px; height: 25px; width: 100%; margin-bottom: 15px; overflow: hidden; border: 1px solid #ccc;">
                            <div id="progress-bar-fill" style="background: #198754; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                        </div>
                        
                        <p id="progress-text" style="margin: 0; font-size: 16px; font-weight: bold; color: #555;">0 / ${finalPayload.length} Soal Tersimpan</p>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #dc3545; font-weight: bold;"><i class="fa-solid fa-triangle-exclamation"></i> Mohon jangan tutup halaman ini</p>
                    </div>
                `;
                document.body.appendChild(overlay);

                let suksesCount = 0;
                let gagalCount = 0;

                // 3. --- MENGUNGGAH SATU PER SATU (Mencegah Timeout Server & Update Bar) ---
                for (let i = 0; i < finalPayload.length; i++) {
                    try {
                        // Kita mengirim array yang hanya berisi 1 soal setiap putarannya
                        const response = await fetch(SCRIPT_URL, {
                            method: "POST",
                            body: JSON.stringify({
                                action: "simpan_soal_massal",
                                data_soal: [ finalPayload[i] ] 
                            })
                        });
                        const result = await response.json();
                        
                        if(result.status === "sukses") {
                            suksesCount++;
                        } else {
                            gagalCount++;
                        }
                    } catch (err) {
                        gagalCount++;
                    }

                    // Update UI Progress Bar bergerak ke kanan
                    const persen = Math.round(((i + 1) / finalPayload.length) * 100);
                    document.getElementById("progress-bar-fill").style.width = persen + "%";
                    document.getElementById("progress-text").innerText = `${i + 1} / ${finalPayload.length} Soal Tersimpan`;
                }

                // 4. --- PROSES SELESAI ---
                setTimeout(() => {
                    document.body.removeChild(overlay); // Hapus layar loading
                    
                    if (gagalCount === 0) {
                        alert("✅ Sempurna! Semua " + suksesCount + " soal berhasil diupload ke Database.");
                        // Kosongkan form dan tabel preview setelah sukses
                        document.getElementById("file-excel-soal").value = "";
                        previewData = [];
                        renderPreviewTable();
                    } else {
                        alert("Selesai. " + suksesCount + " soal berhasil, dan " + gagalCount + " gagal diunggah. Silakan cek koneksi Anda.");
                    }
                }, 600); // Jeda sedikit agar guru bisa puas melihat progress mencapai 100%
            });
        }
        
        // --- LOGIKA ARENA BERMAIN (TAHAP 3) ---
        if (page === "arena-bermain") {
            const pinRoom = sessionStorage.getItem("active_game_room");
            const isHost = sessionStorage.getItem("is_game_host") === "true";
            const myName = sessionStorage.getItem("userName");
            
            if (!pinRoom) { alert("Sesi game hilang!"); loadPage("tebak-kata"); return; }

            document.getElementById("arena-pin").innerText = pinRoom;
            
            const roomRef = dbGame.ref('rooms/' + pinRoom);
            let roomData = null;

            // Jika Guru (Host), munculkan tombol kontrol
            if (isHost) {
                document.getElementById("btn-host-mulai").style.display = "block";
            }

            
            // --- VARIABEL REM DARURAT TIMER ---
            window.currentRoomStatus = "lobby";
            let lastTargetWaktu = 0;

            // 1. MENDENGARKAN PERUBAHAN DATABASE SECARA REAL-TIME
            roomRef.on('value', (snapshot) => {
                roomData = snapshot.val();
                if (!roomData) {
                    alert("Room telah ditutup oleh Guru.");
                    keluarRoomGame();
                    return;
                }

                window.currentRoomStatus = roomData.status; // Sinkronkan status saat ini
                document.getElementById("arena-materi").innerText = "Materi: " + roomData.materi;

                
                // --- Update Daftar Pemain & Skor (Sistem Antrean) ---
                let htmlPemain = "";
                let players = roomData.pemain || {};
                let rawNames = Object.keys(players);
                
                // Gunakan antrean dari Firebase. Jika belum ada, gunakan susunan awal.
                let urutanPemain = roomData.urutan_pemain || rawNames;
                
                // Pastikan UI hanya menampilkan pemain yang benar-benar ada di room
                let playerNames = urutanPemain.filter(p => rawNames.includes(p));
                rawNames.forEach(p => { if (!playerNames.includes(p)) playerNames.push(p); });
                
                playerNames.forEach(nama => {
                    let ikon = (nama === roomData.host) ? '<i class="fa-solid fa-crown" style="color: gold;"></i>' : '<i class="fa-solid fa-user"></i>';
                    
                    // --- KUNCI PERBAIKAN: Label Giliran ---
                    let badgeGiliran = "";
                    let styleBaris = "display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 5px 0;";
                    
                    if (roomData.status === "playing" && roomData.giliran_siapa === nama) {
                        // Beri highlight pada baris anak yang sedang main
                        styleBaris += " background: #f8f9fa; border-left: 4px solid #0d6efd; padding-left: 10px;";
                        
                        // Teks badge: merah jika itu layar kita sendiri, biru jika melihat layar orang lain
                        let teksBadge = (nama === myName) ? "Giliran Kamu" : "Pemberi Petunjuk";
                        let warnaBadge = (nama === myName) ? "#dc3545" : "#0d6efd"; 
                        badgeGiliran = `<span style="background:${warnaBadge}; color:white; font-size:10px; padding:2px 6px; border-radius:10px; margin-left:5px; font-weight:bold;">${teksBadge}</span>`;
                    }
                    // --------------------------------------

                    let tombolKick = "";
                    if (isHost && nama !== roomData.host) {
                        tombolKick = `<button onclick="kickSiswa('${nama}')" style="background:#dc3545; color:white; border:none; padding:3px 8px; border-radius:4px; font-size:11px; cursor:pointer;"><i class="fa-solid fa-ban"></i> Kick</button>`;
                    }
                    
                    htmlPemain += `<li style="${styleBaris}">
                        <div>${ikon} <b>${nama}</b> ${badgeGiliran} : <span style="color:#198754; font-weight:bold;">${players[nama].skor || 0} Poin</span></div>
                        ${tombolKick}
                    </li>`;
                });
                document.getElementById("daftar-pemain").innerHTML = htmlPemain;

                // --- DETEKSI KICK (Siswa dibuang) ---
                if (!isHost && roomData.pemain && !roomData.pemain[myName]) {
                    alert("⛔ Anda telah dikeluarkan dari Room oleh Guru.");
                    sessionStorage.removeItem("active_game_room");
                    sessionStorage.removeItem("is_game_host");
                    loadPage("tebak-kata"); 
                    return;
                }

                // --- Update Layar Status Permainan & TIMER ---
                const teksGiliran = document.getElementById("teks-status-giliran");
                const teksKata = document.getElementById("teks-kata-rahasia");
                const inputChat = document.getElementById("input-chat");

                if (roomData.status === "lobby") {
                    if (window.gameTimerInterval) clearInterval(window.gameTimerInterval);
                    lastTargetWaktu = 0; // Reset waktu
                    document.getElementById("arena-waktu").innerText = "00:00";
                    document.getElementById("arena-waktu").style.color = "white";
                    
                    teksGiliran.innerText = "Menunggu Guru memulai permainan...";
                    teksKata.innerText = "???";
                    inputChat.disabled = false;
                    inputChat.placeholder = "Ngobrol santai sambil menunggu...";
                    
                    if (isHost) document.getElementById("pengaturan-waktu-host").style.display = "block";
                } 
                else if (roomData.status === "playing") {
                    let kataAktif = roomData.kata_sekarang || "";
                    let orangYangMenebak = roomData.giliran_siapa || "";
                    let sudahTebak = roomData.tebakan_benar && roomData.tebakan_benar[myName];

                    if (myName === orangYangMenebak) {
                        teksGiliran.innerText = "🔥 GILIRAN ANDA! Beri petunjuk tanpa menyebut kata ini:";
                        teksGiliran.style.color = "#dc3545";
                        teksKata.innerText = kataAktif.toUpperCase();
                        inputChat.disabled = true; 
                        inputChat.placeholder = "Anda tidak bisa mengetik saat giliran Anda.";
                    } else if (sudahTebak) {
                        teksGiliran.innerText = "🎉 Anda berhasil menebak! Menunggu waktu habis...";
                        teksGiliran.style.color = "#198754";
                        teksKata.innerText = kataAktif.toUpperCase(); 
                        inputChat.disabled = true;
                        inputChat.placeholder = "Ssstt... Jangan beri tahu yang lain!";
                    } else {
                        teksGiliran.innerText = `Giliran ${orangYangMenebak} memberi petunjuk! Ayo tebak!`;
                        teksGiliran.style.color = "#0d6efd";
                        teksKata.innerText = kataAktif.replace(/[a-zA-Z]/g, "_ "); 
                        inputChat.disabled = false;
                        inputChat.placeholder = "Ketik tebakan Anda di sini...";
                    }

                    if (isHost) document.getElementById("pengaturan-waktu-host").style.display = "none";

                    // --- JALANKAN COUNTDOWN TIMER (ANTI-BOCOR) ---
                    let targetWaktu = roomData.waktu_berakhir || 0;
                    
                    // Hanya buat jam baru jika durasi target berubah (mencegah memory leak jam bertumpuk)
                    if (targetWaktu !== lastTargetWaktu) {
                        lastTargetWaktu = targetWaktu;
                        if (window.gameTimerInterval) clearInterval(window.gameTimerInterval);

                        window.gameTimerInterval = setInterval(() => {
                            // SENSOR MATI MENDADAK: Jika game tiba-tiba berhenti, bunuh timer detik ini juga!
                            if (window.currentRoomStatus !== "playing") {
                                clearInterval(window.gameTimerInterval);
                                document.getElementById("arena-waktu").innerText = "00:00";
                                return;
                            }

                            let sisaWaktu = Math.floor((targetWaktu - Date.now()) / 1000);
                            if (isNaN(sisaWaktu)) sisaWaktu = 0;

                            if (sisaWaktu <= 0) {
                                clearInterval(window.gameTimerInterval);
                                document.getElementById("arena-waktu").innerText = "00:00";
                                
                                if (isHost && window.currentRoomStatus === "playing") {
                                    chatRef.push({ isSystem: true, teks: `⏱️ WAKTU HABIS! Kata rahasianya adalah: ${kataAktif.toUpperCase()}` });
                                    dbGame.ref(`rooms/${pinRoom}/status`).set("lobby");
                                    document.getElementById("btn-host-lanjut").style.display = "block";
                                    document.getElementById("btn-host-skip").style.display = "none";
                                }
                            } else {
                                let m = Math.floor(sisaWaktu / 60).toString().padStart(2, '0');
                                let s = (sisaWaktu % 60).toString().padStart(2, '0');
                                document.getElementById("arena-waktu").innerText = `${m}:${s}`;
                                document.getElementById("arena-waktu").style.color = (sisaWaktu <= 10) ? "#dc3545" : "white";
                            }
                        }, 1000);
                    }
                }
            });

            // 2. MENDENGARKAN LIVE CHAT & SISTEM PENILAIAN OTOMATIS
            const chatRef = dbGame.ref(`rooms/${pinRoom}/chat`);
            chatRef.on('child_added', (snapshot) => {
                const pesan = snapshot.val();
                const areaChat = document.getElementById("area-chat");
                
                let chatBubble = "";
                
                // --- KUNCI: SENSOR TEBAKAN BENAR ---
                // Mencegah siswa menyontek dari jawaban benar siswa lainnya di chat
                let teksTampilan = pesan.teks;
                let isTebakanBenar = false;
                
                if (roomData && roomData.status === "playing" && !pesan.isSystem) {
                    let kataKunci = (roomData.kata_sekarang || "").toLowerCase().trim();
                    if (pesan.teks.toLowerCase().trim() === kataKunci) {
                        isTebakanBenar = true;
                        // Jika bukan kita yang ngirim, ubah tampilannya jadi bintang-bintang!
                        if (pesan.pengirim !== myName) {
                            teksTampilan = "⭐⭐⭐ [MENEBAK KATA RAHASIA!] ⭐⭐⭐";
                        }
                    }
                }

                // Render Chat UI
                if (pesan.isSystem) {
                    chatBubble = `<div style="text-align:center; background:#d1e7dd; color:#0f5132; padding:5px; border-radius:5px; font-size:13px; font-weight:bold; margin: 5px 0;">${pesan.teks}</div>`;
                } else {
                    let isMe = pesan.pengirim === myName;
                    let bg = isTebakanBenar ? "#198754" : (isMe ? "#0d6efd" : "#e9ecef");
                    let color = isTebakanBenar ? "white" : (isMe ? "white" : "black");
                    
                    chatBubble = `
                        <div style="display:flex; flex-direction:column; align-items:${isMe ? "flex-end" : "flex-start"};">
                            <small style="font-size:10px; color:#888;">${pesan.pengirim}</small>
                            <div style="background:${bg}; color:${color}; padding:8px 12px; border-radius:15px; max-width:80%; word-wrap:break-word;">
                                ${teksTampilan}
                            </div>
                        </div>
                    `;
                }
                areaChat.innerHTML += chatBubble;
                areaChat.scrollTop = areaChat.scrollHeight;

                
                // --- GURU SEBAGAI JURI & SENSOR AUTO-STOP ---
                if (isHost && roomData && roomData.status === "playing" && isTebakanBenar) {
                    let sudahTebak = roomData.tebakan_benar && roomData.tebakan_benar[pesan.pengirim];
                    let bukanPemberiPetunjuk = pesan.pengirim !== roomData.giliran_siapa;

                    if (!sudahTebak && bukanPemberiPetunjuk) {
                        // 1. Catat poin Penebak & Pemberi Petunjuk
                        let skorPenebak = (roomData.pemain[pesan.pengirim]?.skor || 0) + 10;
                        let skorPetunjuk = (roomData.pemain[roomData.giliran_siapa]?.skor || 0) + 5;
                        
                        dbGame.ref(`rooms/${pinRoom}/pemain/${pesan.pengirim}/skor`).set(skorPenebak);
                        dbGame.ref(`rooms/${pinRoom}/pemain/${roomData.giliran_siapa}/skor`).set(skorPetunjuk);

                        // 2. Kirim pesan sukses ke chat
                        chatRef.push({ isSystem: true, teks: `🎉 ${pesan.pengirim} berhasil menebak kata! 🎉` });

                        // 3. Masukkan anak ini ke daftar yang sudah benar, lalu...
                        dbGame.ref(`rooms/${pinRoom}/tebakan_benar/${pesan.pengirim}`).set(true).then(() => {
                            
                            // 4. CEK APAKAH SEMUA PEMAIN SUDAH BERHASIL MENEBAK?
                            dbGame.ref(`rooms/${pinRoom}`).once('value', (snap) => {
                                let currentData = snap.val();
                                let totalPemain = Object.keys(currentData.pemain || {}).length;
                                let totalBenar = Object.keys(currentData.tebakan_benar || {}).length;

                                // (totalPemain - 1) karena si pemberi petunjuk tidak ikut menebak
                                if (totalBenar >= (totalPemain - 1)) {
                                    chatRef.push({ isSystem: true, teks: `🌟 HEBAT! SEMUA PEMAIN BERHASIL MENEBAK! 🌟` });
                                    chatRef.push({ isSystem: true, teks: `Kata rahasianya adalah: ${kataKunci.toUpperCase()}` });
                                    
                                    // --- KUNCI: TARIK REM DARURAT SEKARANG JUGA ---
                                    window.currentRoomStatus = "lobby"; 
                                    dbGame.ref(`rooms/${pinRoom}/status`).set("lobby");
                                    // -----------------------------------------------

                                    document.getElementById("btn-host-lanjut").style.display = "block";
                                    document.getElementById("btn-host-skip").style.display = "none";
                                }
                            });

                        });
                    }
                }
            });

            // 3. FUNGSI KIRIM PESAN CHAT
            function kirimPesan() {
                const input = document.getElementById("input-chat");
                const teks = input.value.trim();
                if (teks !== "") {
                    chatRef.push({
                        pengirim: myName,
                        teks: teks
                    });
                    input.value = "";
                }
            }
            document.getElementById("btn-kirim-chat").addEventListener("click", kirimPesan);
            document.getElementById("input-chat").addEventListener("keypress", (e) => { if (e.key === "Enter") kirimPesan(); });

            // 4. KONTROL HOST (GURU MENGATUR GILIRAN)
            if (isHost) {
                let indeksKata = 0;
                
                window.jalankanRonde = function() {
                    let players = Object.keys(roomData.pemain || {});
                    if (players.length < 2) { alert("Butuh minimal 2 pemain untuk mulai!"); return; }
                    
                    let kataBaru = roomData.daftar_kata[indeksKata];
                    if (!kataBaru) { 
                        alert("Semua kata sudah habis dimainkan!"); 
                        dbGame.ref('rooms/' + pinRoom).remove(); 
                        keluarRoomGame();
                        return; 
                    }

                    // --- KUNCI PERBAIKAN: SISTEM ANTREAN MEMUTAR ---
                    let urutanPemain = roomData.urutan_pemain || [];
                    
                    // 1. Bersihkan pemain yang sudah keluar/kick dari antrean
                    urutanPemain = urutanPemain.filter(p => players.includes(p));
                    
                    // 2. Tambahkan pemain yang baru bergabung ke urutan paling bawah
                    players.forEach(p => {
                        if (!urutanPemain.includes(p)) urutanPemain.push(p);
                    });

                    // 3. Rotasi Antrean: Jika giliran sebelumnya adalah orang di urutan teratas, 
                    // pindahkan dia ke urutan paling bawah!
                    if (roomData.giliran_siapa && urutanPemain[0] === roomData.giliran_siapa) {
                        urutanPemain.push(urutanPemain.shift()); 
                    }

                    // Pemain yang beruntung adalah yang berada di puncak antrean sekarang
                    let yangDapatGiliran = urutanPemain[0]; 
                    // ------------------------------------------------

                    let inputWaktu = document.getElementById("input-waktu-game");
                    let durasiDetik = inputWaktu ? parseInt(inputWaktu.value) : 60;
                    if (isNaN(durasiDetik) || durasiDetik < 10) durasiDetik = 60; 
                    
                    let waktuBerakhir = Date.now() + (durasiDetik * 1000);

                    dbGame.ref(`rooms/${pinRoom}/tebakan_benar`).remove().then(() => {
                        dbGame.ref('rooms/' + pinRoom).update({
                            status: "playing",
                            kata_sekarang: kataBaru,
                            giliran_siapa: yangDapatGiliran,
                            waktu_berakhir: waktuBerakhir,
                            urutan_pemain: urutanPemain // Simpan susunan antrean terbaru ke Firebase
                        });
                    });

                    document.getElementById("btn-host-mulai").style.display = "none";
                    document.getElementById("btn-host-lanjut").style.display = "none";
                    document.getElementById("btn-host-skip").style.display = "block";
                    indeksKata++;
                };

                // Sambungkan tombol ke fungsi
                document.getElementById("btn-host-mulai").addEventListener("click", window.jalankanRonde);
                document.getElementById("btn-host-lanjut").addEventListener("click", window.jalankanRonde);
                
                
                // --- Logika Tombol Skip Giliran ---
                const btnSkip = document.getElementById("btn-host-skip");
                if (btnSkip) {
                    btnSkip.onclick = () => { // Gunakan onclick agar bersih dari tumpukan memori
                        if (confirm("Hentikan giliran anak ini dan kembali istirahat ke Lobby?")) {
                            chatRef.push({ isSystem: true, teks: `Giliran dihentikan oleh Guru!` });
                            
                            // Tarik rem darurat & lemparkan ke mode santai
                            window.currentRoomStatus = "lobby";
                            dbGame.ref(`rooms/${pinRoom}/status`).set("lobby");
                            
                            document.getElementById("btn-host-lanjut").style.display = "block";
                            document.getElementById("btn-host-skip").style.display = "none";
                        }
                    };
                }
            }

            // --- FUNGSI GURU: KICK SISWA ---
            window.kickSiswa = function(namaSiswa) {
                if(confirm(`Yakin ingin mengeluarkan ${namaSiswa} dari permainan?`)) {
                    dbGame.ref(`rooms/${pinRoom}/pemain/${namaSiswa}`).remove();
                    
                    // Jika siswa yang di-kick kebetulan sedang kebagian giliran memberi petunjuk
                    if (roomData && roomData.status === "playing" && roomData.giliran_siapa === namaSiswa) {
                        chatRef.push({ isSystem: true, teks: `Giliran dibatalkan karena ${namaSiswa} dikeluarkan dari permainan.` });
                        jalankanRonde(); // Otomatis lempar ke siswa berikutnya
                    }
                }
            };

            // --- FUNGSI GURU: SKIP GILIRAN ---
            if (isHost) {
                const btnSkip = document.getElementById("btn-host-skip");
                if (btnSkip) {
                    btnSkip.addEventListener("click", () => {
                        if (confirm("Siswa ini AFK/Diam saja? Lewati giliran anak ini dan ganti ke kata berikutnya?")) {
                            chatRef.push({ isSystem: true, teks: `Giliran ${roomData.giliran_siapa} dilewati oleh Guru!` });
                            jalankanRonde();
                        }
                    });
                }
                
                // Modifikasi fungsi jalankanRonde agar memunculkan tombol Skip
                const oldJalankanRonde = jalankanRonde;
                jalankanRonde = function() {
                    let players = Object.keys(roomData.pemain || {});
                    if (players.length < 2) { alert("Butuh minimal 2 pemain untuk mulai!"); return; }
                    
                    let kataBaru = roomData.daftar_kata[indeksKata];
                    if (!kataBaru) { 
                        alert("Semua kata sudah habis dimainkan!"); 
                        dbGame.ref('rooms/' + pinRoom).remove(); 
                        keluarRoomGame();
                        return; 
                    }

                    // --- Kalkulasi Waktu Habis ---
                    let durasiDetik = parseInt(document.getElementById("input-waktu-game").value) || 60;
                    let waktuBerakhir = Date.now() + (durasiDetik * 1000);

                    let yangDapatGiliran = players[Math.floor(Math.random() * players.length)];

                    dbGame.ref('rooms/' + pinRoom).update({
                        status: "playing",
                        kata_sekarang: kataBaru,
                        giliran_siapa: yangDapatGiliran,
                        waktu_berakhir: waktuBerakhir, // Kirim target waktu ke semua siswa
                        tebakan_benar: null // KOSONGKAN daftar pemenang di ronde baru
                    });

                    document.getElementById("btn-host-mulai").style.display = "none";
                    document.getElementById("btn-host-lanjut").style.display = "none";
                    document.getElementById("btn-host-skip").style.display = "block";
                    indeksKata++;
                };
            }
            

            // 5. KELUAR ROOM
            window.keluarRoomGame = function() {
                if (isHost) dbGame.ref('rooms/' + pinRoom).remove();
                else dbGame.ref(`rooms/${pinRoom}/pemain/${myName}`).remove();
                sessionStorage.removeItem("active_game_room");
                sessionStorage.removeItem("is_game_host");
                loadPage("edu-game"); // <--- Ubah ke edu-game
            };
        }



        // ==========================================
        // --- LOGIKA ARENA BALAP KETIK (TIMER & FULL RACE MODE) ---
        // ==========================================
        if (page === "arena-balap") {
            const pinRoom = sessionStorage.getItem("active_balap_room");
            const isHost = sessionStorage.getItem("is_balap_host") === "true";
            const myName = sessionStorage.getItem("userName");
            
            if (!pinRoom) { loadPage("edu-game"); return; }
            document.getElementById("balap-pin").innerText = pinRoom;

            const inputKetik = document.getElementById("input-balap-ketik");
            const inputBebas = document.getElementById("input-balap-bebas");
            const wadahMarquee = document.getElementById("wadah-teks-berjalan");
            const areaMengetik = document.getElementById("area-mengetik-balap");
            const tbodyTrack = document.getElementById("daftar-pemain-track");
            const statusTeks = document.getElementById("balap-status-teks");
            
            // Elemen Kontrol Guru
            const wadahKontrolGuru = document.getElementById("kontrol-guru-balap");
            const btnMulai = document.getElementById("btn-host-mulai-balap");
            const btnStop = document.getElementById("btn-host-stop-balap");
            const pengaturanWaktu = document.getElementById("pengaturan-waktu-balap");

            let roomData = null;
            let targetTeksUtuh = "";
            let startTime = null;
            let lastSyncTime = 0;
            
            window.currentBalapStatus = "lobby";
            let lastTargetWaktu = 0;

            // FUNGSI GURU KONTROL BALAPAN
            if (isHost) {
                wadahKontrolGuru.style.display = "flex";
                
                btnMulai.onclick = () => {
                    let durasiDetik = parseInt(document.getElementById("input-waktu-balap").value) || 120;
                    let waktuBerakhir = Date.now() + (durasiDetik * 1000);

                    dbGame.ref('balap_rooms/' + pinRoom).once('value', (snap) => {
                        let current = snap.val();
                        if(!current) return;
                        let updates = {};
                        Object.keys(current.pemain || {}).forEach(p => {
                            updates[p] = { progress: 0, nitro: false, skor: current.pemain[p].skor || 0, selesai: false, peringkat: 0 }; 
                        });
                        dbGame.ref(`balap_rooms/${pinRoom}/pemain`).set(updates);
                        dbGame.ref(`balap_rooms/${pinRoom}`).update({ 
                            status: "playing", 
                            waktu_berakhir: waktuBerakhir,
                            peringkat_sekarang: 1 
                        });
                    });
                };

                btnStop.onclick = () => {
                    if(confirm("Hentikan balapan sekarang dan kembalikan ke mode Santai?")) {
                        window.currentBalapStatus = "lobby";
                        dbGame.ref(`balap_rooms/${pinRoom}/status`).set("lobby");
                    }
                };
            }

            // 1. RENDER REAL-TIME TRACK, MOBIL, DAN TIMER
            dbGame.ref('balap_rooms/' + pinRoom).on('value', (snapshot) => {
                roomData = snapshot.val();
                if (!roomData) { keluarBalap(); return; }

                window.currentBalapStatus = roomData.status;
                document.getElementById("balap-materi").innerText = "Materi: " + roomData.materi;
                targetTeksUtuh = roomData.teks_balapan || "";
                
                let isFreeMode = roomData.mode === "free";
                let totalKarakter = isFreeMode ? (roomData.target_karakter || 500) : (targetTeksUtuh.length || 1);

                // --- Toggle Antarmuka (Marquee vs Textarea) ---
                if (isFreeMode) {
                    if(wadahMarquee) wadahMarquee.style.display = "none";
                    if(inputKetik) inputKetik.style.display = "none";
                    if(inputBebas) inputBebas.style.display = "block";
                } else {
                    if(wadahMarquee) wadahMarquee.style.display = "block";
                    if(inputKetik) inputKetik.style.display = "block";
                    if(inputBebas) inputBebas.style.display = "none";
                }

                // Kontrol UI Status
                if (roomData.status === "lobby") {
                    statusTeks.innerText = "MENUNGGU GURU MEMULAI BALAPAN...";
                    statusTeks.style.color = "#333";
                    updateTeksBerjalan("", "", "", "Siap-siap mengetik...");
                    
                    if(inputKetik) { inputKetik.disabled = true; inputKetik.value = ""; }
                    if(inputBebas) { inputBebas.disabled = true; inputBebas.value = ""; }
                    
                    startTime = null; 
                    document.getElementById("wpm-display").innerText = "0 WPM";
                    document.getElementById("balap-waktu").innerText = "00:00";
                    document.getElementById("balap-waktu").style.color = "white";
                    
                    if (window.balapTimerInterval) clearInterval(window.balapTimerInterval);
                    lastTargetWaktu = 0;

                    if (isHost) {
                        pengaturanWaktu.style.display = "flex";
                        btnMulai.style.display = "inline-block";
                        btnMulai.innerHTML = `<i class="fa-solid fa-flag-checkered"></i> MULAI`;
                        btnStop.style.display = "none";
                    }
                } 
                else if (roomData.status === "playing") {
                    statusTeks.innerText = "BALAPAN DIMULAI! AYO KETIK CEPAT!";
                    statusTeks.style.color = "#198754";
                    
                    if (isHost) {
                        pengaturanWaktu.style.display = "none";
                        btnMulai.style.display = "none";
                        btnStop.style.display = "inline-block";
                    }

                    let activeInput = isFreeMode ? inputBebas : inputKetik;

                    if (activeInput && activeInput.disabled && !isHost && !(roomData.pemain[myName]?.selesai)) {
                        activeInput.disabled = false;
                        activeInput.value = ""; 
                        activeInput.focus();
                        startTime = Date.now(); 
                        if (!isFreeMode) updateTeksBerjalan("", "", targetTeksUtuh[0], targetTeksUtuh.substring(1));
                    }

                    let targetWaktu = roomData.waktu_berakhir || 0;
                    if (targetWaktu !== lastTargetWaktu) {
                        lastTargetWaktu = targetWaktu;
                        if (window.balapTimerInterval) clearInterval(window.balapTimerInterval);

                        window.balapTimerInterval = setInterval(() => {
                            if (window.currentBalapStatus !== "playing") { clearInterval(window.balapTimerInterval); return; }
                            let sisaWaktu = Math.floor((targetWaktu - Date.now()) / 1000);
                            if (isNaN(sisaWaktu)) sisaWaktu = 0;

                            if (sisaWaktu <= 0) {
                                clearInterval(window.balapTimerInterval);
                                document.getElementById("balap-waktu").innerText = "00:00";
                                if (isHost && window.currentBalapStatus === "playing") dbGame.ref(`balap_rooms/${pinRoom}/status`).set("finished");
                            } else {
                                let m = Math.floor(sisaWaktu / 60).toString().padStart(2, '0');
                                let s = (sisaWaktu % 60).toString().padStart(2, '0');
                                document.getElementById("balap-waktu").innerText = `${m}:${s}`;
                                document.getElementById("balap-waktu").style.color = (sisaWaktu <= 10) ? "#dc3545" : "white";
                            }
                        }, 1000);
                    }
                } 
                else if (roomData.status === "finished") {
                    statusTeks.innerText = `BALAPAN SELESAI! SILAKAN CEK PERINGKAT`;
                    statusTeks.style.color = "#0d6efd";
                    updateTeksBerjalan("", "", "", `🏁 Balapan Selesai! Semua mobil masuk finish. 🏁`);
                    
                    if(inputKetik) { inputKetik.disabled = true; inputKetik.value = ""; }
                    if(inputBebas) { inputBebas.disabled = true; inputBebas.value = ""; }
                    
                    if (window.balapTimerInterval) clearInterval(window.balapTimerInterval);

                    if (isHost) {
                        pengaturanWaktu.style.display = "flex";
                        btnMulai.style.display = "inline-block";
                        btnMulai.innerHTML = `<i class="fa-solid fa-rotate-right"></i> ULANGI BALAPAN`;
                        btnStop.style.display = "none";
                    }
                }

                // Render Sirkuit Mobil
// Render UI Berdasarkan Mode (Balapan vs Pertarungan)
                if (!tbodyTrack) return;
                
                let players = roomData.pemain || {};
                
                // JIKA MODE BATTLE ROYALE
                if (roomData.mode === "battle") {
                    let htmlBattle = `<div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; padding: 20px;">`;
                    
                    let aliveCount = 0;
                    let lastManStanding = "";

                    Object.keys(players).forEach(nama => {
                        let hp = players[nama].hp !== undefined ? players[nama].hp : 100;
                        let mati = hp <= 0;
                        if (!mati) { aliveCount++; lastManStanding = nama; }

                        // Berikan avatar acak jika belum punya
                        if (!players[nama].avatar) {
                            const avatars = ["🧙‍♂️", "🥷", "🦸‍♂️", "🧟", "🧛‍♂️", "🤖", "🐉", "👹", "👽", "👻", "🤠", "🤖"];
                            players[nama].avatar = avatars[Math.floor(Math.random() * avatars.length)];
                            if (nama === myName) dbGame.ref(`balap_rooms/${pinRoom}/pemain/${nama}`).update({ avatar: players[nama].avatar, hp: 100 });
                        }

                        let avatar = players[nama].avatar;
                        let warnaHP = hp > 50 ? "#198754" : (hp > 20 ? "#ffc107" : "#dc3545");
                        let filterMati = mati ? "grayscale(100%) opacity(0.5)" : "none";
                        let apiSerang = players[nama].isAttacking ? `<div style="position:absolute; top:-20px; right:-10px; font-size:30px; animation: bounce 0.5s;">💥</div>` : "";

                        htmlBattle += `
                            <div style="background: ${mati ? '#f8f9fa' : '#fff'}; border: 3px solid ${mati ? '#ccc' : warnaHP}; border-radius: 10px; padding: 15px; width: 150px; text-align: center; position: relative; filter: ${filterMati}; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s;">
                                ${apiSerang}
                                <div style="font-size: 50px; margin-bottom: 10px;">${mati ? '☠️' : avatar}</div>
                                <div style="font-weight: bold; font-size: 14px; color: #333; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${nama}</div>
                                <div style="background: #e9ecef; border-radius: 10px; height: 15px; width: 100%; margin-top: 10px; overflow: hidden;">
                                    <div style="background: ${warnaHP}; height: 100%; width: ${hp}%; transition: width 0.5s, background-color 0.5s;"></div>
                                </div>
                                <div style="font-size: 12px; font-weight: bold; margin-top: 5px; color: ${warnaHP};">${hp} HP</div>
                            </div>
                        `;
                    });
                    htmlBattle += `</div>`;
                    tbodyTrack.innerHTML = htmlBattle === "" ? `<div style="text-align:center; color:#888;">Menunggu petarung...</div>` : htmlBattle;

                    // Logika Battle (Kata Target & Serangan)
                    let indexPeluru = roomData.indeks_peluru || 0;
                    let arrayPeluru = roomData.daftar_peluru || [];
                    let kataTarget = arrayPeluru[indexPeluru] || "SELESAI";

                    if (roomData.status === "playing") {
                        if (kataTarget === "SELESAI" || aliveCount <= 1) {
                            // Game Over
                            statusTeks.innerText = "PERTARUNGAN SELESAI!";
                            updateTeksBerjalan("", "", "", `🏁 Pemenang: ${lastManStanding || "Tidak ada"} 🏁`);
                            if (inputKetik) inputKetik.disabled = true;
                            if (isHost && window.currentBalapStatus !== "finished") dbGame.ref(`balap_rooms/${pinRoom}/status`).set("finished");
                        } else {
                            // Tampilkan kata yang harus diketik sebagai "Mantra Serangan"
                            statusTeks.innerText = "KETIK KATA INI UNTUK MENYERANG SEMUA LAWAN!";
                            statusTeks.style.color = "#dc3545";
                            document.getElementById("teks-sisa").textContent = kataTarget;
                            document.getElementById("teks-sisa").style.fontSize = "30px";
                            document.getElementById("teks-sisa").style.fontWeight = "bold";
                            
                            // Logika Sensor Ketik Khusus Battle
                            if (inputKetik && !inputKetik.disabled && !(roomData.pemain[myName]?.hp <= 0)) {
                                inputKetik.oninput = () => {
                                    if (inputKetik.value.trim().toLowerCase() === kataTarget.toLowerCase()) {
                                        inputKetik.value = ""; // Reset input
                                        
                                        // 1. Tandai sedang menyerang
                                        dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).update({ isAttacking: true });
                                        setTimeout(() => dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).update({ isAttacking: false }), 1000);

                                        // 2. Majukan kata ke target berikutnya
                                        dbGame.ref(`balap_rooms/${pinRoom}`).update({ indeks_peluru: indexPeluru + 1 });

                                        // 3. Hajar semua musuh (AoE Damage)
                                        Object.keys(players).forEach(musuh => {
                                            if (musuh !== myName && players[musuh].hp > 0) {
                                                let hpBaru = players[musuh].hp - Math.floor(Math.random() * 15 + 15); // Damage acak 15-30
                                                if (hpBaru < 0) hpBaru = 0;
                                                dbGame.ref(`balap_rooms/${pinRoom}/pemain/${musuh}`).update({ hp: hpBaru });
                                            }
                                        });
                                    }
                                };
                            } else if (roomData.pemain[myName]?.hp <= 0) {
                                inputKetik.disabled = true;
                                document.getElementById("teks-sisa").textContent = "ANDA TERELIMINASI ☠️";
                            }
                        }
                    }

                } 
                // JIKA MODE BALAPAN BIASA ATAU FREE (MODE 3D SIRKUIT)
                else {
                    // Sembunyikan HANYA track 2D dan garis finish lama (Bukan Parent-nya!)
                    if(document.getElementById("daftar-pemain-track")) document.getElementById("daftar-pemain-track").style.display = "none";
                    if(document.getElementById("garis-finish")) document.getElementById("garis-finish").style.display = "none";
                    
                    // Munculkan Layar Sirkuit 3D
                    const wadah3DSirkuit = document.getElementById("wadah-3d-sirkuit");
                    if(wadah3DSirkuit) wadah3DSirkuit.style.display = "block";

                    // Panggil Mesin 3D jika belum menyala
                    if (typeof init3DBalapMobil === "function" && !window.engine3DBalapReady) {
                        init3DBalapMobil(pinRoom, myName);
                        window.engine3DBalapReady = true;
                    }

                    // Sinkronisasi Pergerakan Mobil 3D ke Garis Finish (Z = -600)
                    const panjangLintasan = -600; 

                    Object.keys(players).forEach((nama, idx) => {
                        let prog = players[nama].progress || 0;
                        let persen = Math.min((prog / totalKarakter), 1);
                        let targetZ = persen * panjangLintasan; // Posisi melaju ke depan
                        
                        // Posisi Jalur Kiri-Kanan (Agar tidak tabrakan)
                        // Maksimal 6 jalur, jika lebih akan bertumpuk rapi
                        let lajurX = ((idx % 6) * 3.5) - 8.75; 

                        // Jika mobil untuk player ini sudah ada di mesin 3D
                        if (window.racingCars3D && window.racingCars3D[nama]) {
                            let carMesh = window.racingCars3D[nama];
                            
                            // Gunakan GSAP agar mobil melaju mulus
                            gsap.to(carMesh.position, { z: targetZ, x: lajurX, duration: 0.8, ease: "power1.out", overwrite: "auto" });
                            
                            // Efek Roda Berputar jika sedang maju
                            carMesh.userData.roda.forEach(roda => {
                                gsap.to(roda.rotation, { x: "-=" + (prog * 0.1), duration: 0.8, overwrite: "auto" });
                            });

                            // Efek Api Nitro jika WPM tinggi
                            if (players[nama].nitro) {
                                carMesh.userData.api.visible = true;
                                carMesh.userData.api.scale.set(1 + Math.random(), 1 + Math.random(), 1 + Math.random());
                            } else {
                                carMesh.userData.api.visible = false;
                            }
                        } else if (window.buatMobilBaru) {
                            // Jika belum ada, cetak mobil baru!
                            window.buatMobilBaru(nama, idx, lajurX);
                        }
                    });

                    // --- FITUR LEADERBOARD MINI 3D (LIVE RANKING) ---
                    let playerList = [];
                    Object.keys(players).forEach(nama => {
                        playerList.push({
                            nama: nama,
                            progress: players[nama].progress || 0,
                            selesai: players[nama].selesai || false,
                            peringkat: players[nama].peringkat || 999
                        });
                    });

                    // Urutkan: Yang selesai duluan di atas, lalu yang ketikannya paling jauh (progress)
                    playerList.sort((a, b) => {
                        if (a.selesai && !b.selesai) return -1;
                        if (!a.selesai && b.selesai) return 1;
                        if (a.selesai && b.selesai) return a.peringkat - b.peringkat;
                        return b.progress - a.progress;
                    });

                    let htmlLeaderboard = "";
                    playerList.forEach((p, idx) => {
                        let isMe = (p.nama === myName);
                        let rank = idx + 1;
                        // Warna: Emas untuk diri sendiri, Hijau untuk Juara 1, Putih untuk sisanya
                        let color = isMe ? "gold" : (rank === 1 ? "#00ff00" : "white");
                        let weight = isMe ? "bold" : "normal";
                        
                        // Tampilkan HANYA Top 3 dan posisi diri sendiri (agar kotak tidak kepanjangan menutupi jalan)
                        if (rank <= 3 || isMe) {
                            htmlLeaderboard += `<div style="display: flex; justify-content: space-between; color: ${color}; font-weight: ${weight}; margin-bottom: 3px; font-size: 12px;">
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90px;">${rank}. ${p.nama}</span>
                                <span>${p.progress}</span>
                            </div>`;
                        }
                        
                        // Beri titik-titik pemisah jika posisi kita jauh di bawah Top 3
                        if (rank === 3 && !isMe && playerList.findIndex(x => x.nama === myName) > 3) {
                            htmlLeaderboard += `<div style="text-align: center; color: #888; font-size: 10px; margin: 2px 0;">...</div>`;
                        }
                    });

                    const lbElement = document.getElementById("list-posisi-balap");
                    if (lbElement) lbElement.innerHTML = htmlLeaderboard;
                }
            });

            function updateTeksBerjalan(benar, salah, aktif, sisa) {
                const wadah = document.getElementById("wadah-teks-berjalan");
                if(!wadah) return;
                document.getElementById("teks-selesai").textContent = benar;
                document.getElementById("teks-salah").textContent = salah;
                
                let teksAktifVisual = (aktif === "\n") ? "↵\n" : aktif;
                document.getElementById("teks-aktif").textContent = teksAktifVisual || "";
                document.getElementById("teks-sisa").textContent = sisa || "";
                
                wadah.style.transform = "none";
                wadah.style.wordWrap = "break-word";
                wadah.style.wordBreak = "break-word";
            }

            // 2. SENSOR KETIK & KECEPATAN (WPM)
            if (inputKetik) {
                // 1. Blokir tombol panah dan navigasi
                inputKetik.addEventListener("keydown", (e) => {
                    const tombolDilarang = [
                        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", 
                        "Home", "End", "PageUp", "PageDown"
                    ];
                    
                    if (tombolDilarang.includes(e.key)) {
                        e.preventDefault(); // Tolak penekanan tombol
                    }
                });

                // 2. Paksa kursor selalu berada di ujung kanan teks meski di-klik
                inputKetik.addEventListener("click", function() {
                    this.selectionStart = this.value.length;
                    this.selectionEnd = this.value.length;
                });
            }
            // -------------------------------------------------------------
            if (inputKetik) {
                inputKetik.addEventListener("input", () => {
                    if (areaMengetik) areaMengetik.scrollLeft = 0;
                    if (!targetTeksUtuh || inputKetik.disabled || roomData.pemain[myName]?.selesai) return;
                    
                    let ketikan = inputKetik.value; 
                    let charProgress = 0;
                    let hasError = false;

                    let teksBenar = ""; let teksSalah = "";
                    for (let i = 0; i < ketikan.length; i++) {
                        if (ketikan[i] === targetTeksUtuh[i] && !hasError) { teksBenar += ketikan[i]; } 
                        else { hasError = true; teksSalah += ketikan[i]; }
                    }

                    charProgress = teksBenar.length;
                    let sisaTeks = targetTeksUtuh.substring(charProgress + teksSalah.length);
                    let hurufAktif = sisaTeks.length > 0 ? sisaTeks[0] : "";
                    let hurufSisaLanjutan = sisaTeks.length > 1 ? sisaTeks.substring(1) : "";

                    updateTeksBerjalan(teksBenar, teksSalah, hurufAktif, hurufSisaLanjutan);
                    
                    // Peringatan Merah saat salah ketik (Sekarang menargetkan Wadah Utama)
                    const wadahUtama = document.getElementById("wadah-utama-balap");
                    if (wadahUtama) wadahUtama.style.borderColor = hasError ? "#dc3545" : "#0d6efd";

                    // KUNCI PERBAIKAN: KAMERA AUTO-SCROLL MENGIKUTI BLOK KUNING
                    const spanAktif = document.getElementById("teks-aktif");
                    if (spanAktif && areaMengetik) {
                        // 1. Geser kotak ketik gaib mengikuti kata kuning agar browser tenang
                        inputKetik.style.top = spanAktif.offsetTop + "px";

                        // 2. Hitung agar kata kuning selalu berada TEPAT DI TENGAH kotak
                        let setengahLayar = areaMengetik.clientHeight / 2;
                        
                        // Terapkan scroll dengan posisi yang sangat nyaman di mata (+20px penyeimbang)
                        areaMengetik.scrollTop = spanAktif.offsetTop - setengahLayar + 20; 
                    }
                    let timeElapsedMin = (Date.now() - startTime) / 60000;
                    let wpm = timeElapsedMin > 0 ? Math.round((charProgress / 5) / timeElapsedMin) : 0;
                    document.getElementById("wpm-display").innerText = `${wpm} WPM`;

                    let now = Date.now();
                    if (now - lastSyncTime > 800 || charProgress === targetTeksUtuh.length) {
                        let isNitro = wpm > 30 && !hasError; 
                        dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).update({ progress: charProgress, nitro: isNitro });
                        lastSyncTime = now;
                    }

                    if (charProgress === targetTeksUtuh.length && !hasError) {
                        inputKetik.disabled = true;
                        updateTeksBerjalan("", "", "", "✅ Luar biasa! Menunggu teman yang lain...");
                        
                        dbGame.ref(`balap_rooms/${pinRoom}`).once('value', snapRank => {
                            let rankData = snapRank.val();
                            let currentRank = rankData.peringkat_sekarang || 1;
                            
                            dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).update({
                                selesai: true, peringkat: currentRank, skor: (roomData.pemain[myName]?.skor || 0) + 10
                            }).then(() => {
                                dbGame.ref(`balap_rooms/${pinRoom}`).update({ peringkat_sekarang: currentRank + 1 }).then(() => {
                                    dbGame.ref(`balap_rooms/${pinRoom}/pemain`).once('value', snapCheck => {
                                        let playersObj = snapCheck.val() || {};
                                        let totalPlayers = Object.keys(playersObj).length;
                                        let finishedPlayers = Object.values(playersObj).filter(p => p.selesai).length;

                                        if (finishedPlayers >= totalPlayers && window.currentBalapStatus !== "finished") {
                                            dbGame.ref(`balap_rooms/${pinRoom}/status`).set("finished");
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            }

            if (inputBebas) {
                inputBebas.addEventListener("input", () => {
                    if (inputBebas.disabled || roomData.pemain[myName]?.selesai) return;

                    let charProgress = inputBebas.value.length;
                    let targetKarakter = roomData.target_karakter || 500;

                    let timeElapsedMin = (Date.now() - startTime) / 60000;
                    let wpm = timeElapsedMin > 0 ? Math.round((charProgress / 5) / timeElapsedMin) : 0;
                    document.getElementById("wpm-display").innerText = `${wpm} WPM`;

                    let now = Date.now();
                    if (now - lastSyncTime > 800 || charProgress >= targetKarakter) {
                        let isNitro = wpm > 30; 
                        dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).update({ progress: charProgress, nitro: isNitro });
                        lastSyncTime = now;
                    }

                    if (charProgress >= targetKarakter) {
                        inputBebas.disabled = true;
                        
                        dbGame.ref(`balap_rooms/${pinRoom}`).once('value', snapRank => {
                            let rankData = snapRank.val();
                            let currentRank = rankData.peringkat_sekarang || 1;
                            
                            dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).update({
                                selesai: true, peringkat: currentRank, skor: (roomData.pemain[myName]?.skor || 0) + 10
                            }).then(() => {
                                dbGame.ref(`balap_rooms/${pinRoom}`).update({ peringkat_sekarang: currentRank + 1 }).then(() => {
                                    dbGame.ref(`balap_rooms/${pinRoom}/pemain`).once('value', snapCheck => {
                                        let playersObj = snapCheck.val() || {};
                                        let totalPlayers = Object.keys(playersObj).length;
                                        let finishedPlayers = Object.values(playersObj).filter(p => p.selesai).length;

                                        if (finishedPlayers >= totalPlayers && window.currentBalapStatus !== "finished") {
                                            dbGame.ref(`balap_rooms/${pinRoom}/status`).set("finished");
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            }

            if (areaMengetik) {
                areaMengetik.addEventListener("click", () => { 
                    let activeInput = (roomData && roomData.mode === "free") ? inputBebas : inputKetik;
                    if(activeInput && !activeInput.disabled) activeInput.focus(); 
                });
            }

            // 3. KELUAR SIRKUIT
            window.keluarBalap = function() {
                if (isHost) dbGame.ref('balap_rooms/' + pinRoom).remove();
                else dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).remove();
                window.engine3DBalapReady = false;
                sessionStorage.removeItem("active_balap_room");
                loadPage("edu-game");
            };
        }



// ==========================================
        // --- LOGIKA ARENA 3D SURVIVAL (LANTAI RUNTUH) ---
        // ==========================================
        if (page === "arena-3d") {
            const pinRoom = sessionStorage.getItem("active_3d_room");
            const isHost = sessionStorage.getItem("is_3d_host") === "true";
            const myName = sessionStorage.getItem("userName");
            
            if (!pinRoom) { loadPage("edu-game"); return; }
            document.getElementById("survival-pin").innerText = pinRoom;

            // --- 1. FUNGSI KELUAR ARENA ---
            window.keluarArena3D = function(force = false) {
                if (force || confirm("Yakin ingin keluar dari Arena 3D?")) {
                    if (window.autoHostInterval) clearInterval(window.autoHostInterval); 
                    if (window.publicTimerInterval) clearInterval(window.publicTimerInterval);
                    if (window.publicEndTimeout) clearTimeout(window.publicEndTimeout);
                    if (window.guruBotInterval) clearInterval(window.guruBotInterval); // <--- TAMBAHKAN BARIS INI

                    if (isHost) dbGame.ref('balap_rooms/' + pinRoom).remove();
                    else dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).remove();
                    
                    sessionStorage.removeItem("active_3d_room");
                    dbGame.ref('global_scores_3d').off();
                    loadPage("edu-game");
                }
            };
            document.getElementById("btn-keluar-3d").onclick = () => window.keluarArena3D(false);

            // --- 2. SINKRONISASI SKOR GLOBAL ---
            dbGame.ref(`global_scores_3d/${myName}`).on('value', snap => {
                const elemenSkor = document.getElementById("skor-saya-3d");
                if (elemenSkor) elemenSkor.innerText = snap.val() || 0;
            });

            dbGame.ref('global_scores_3d').orderByValue().limitToLast(5).on('value', snap => {
                let list = [];
                snap.forEach(child => { list.push({ nama: child.key, skor: child.val() }); });
                list.reverse(); 

                let html = "";
                list.forEach((item, idx) => {
                    let medal = idx === 0 ? "🥇" : (idx === 1 ? "🥈" : (idx === 2 ? "🥉" : "🔸"));
                    let color = idx === 0 ? "gold" : (idx === 1 ? "silver" : (idx === 2 ? "#cd7f32" : "white"));
                    html += `<div style="display: flex; justify-content: space-between; font-weight: bold; color: ${color}; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 5px;">
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">${medal} ${item.nama}</span>
                                <span>${item.skor}</span>
                             </div>`;
                });
                const lbElemen = document.getElementById("list-highscore-3d");
                if(lbElemen) lbElemen.innerHTML = html || "<div style='text-align:center; color:#888;'>Belum ada juara</div>";
            });

            // --- 3. KONTROL GURU (OTORITAS MUTLAK) ---
            if (isHost && !sessionStorage.getItem("is_public_match")) {
                document.getElementById("kontrol-guru-3d").style.display = "flex";

                // --- OTAK BOT KHUSUS MODE GURU ---
                if (!window.guruBotInterval) {
                    window.guruBotInterval = setInterval(() => {
                        dbGame.ref('balap_rooms/' + pinRoom).once('value', snap => {
                            let r = snap.val();
                            // Pastikan game sedang berjalan agar bot bergerak
                            if (!r || r.status !== "playing") return; 

                            let ansBenar = r.daftar_soal[r.indeks_soal].jawaban_benar;
                            let botUpdates = {};
                            let hasUpdate = false;

                            Object.keys(r.pemain || {}).forEach(p => {
                                if (r.pemain[p].isBot && r.pemain[p].hp > 0) {
                                    // Bot mondar-mandir natural (Agak condong ke jawaban benar)
                                    const pilihan = ["kiri", "kanan", "tengah", ansBenar, ansBenar]; 
                                    let posBaru = pilihan[Math.floor(Math.random() * pilihan.length)];

                                    if (r.pemain[p].posisi !== posBaru) {
                                        botUpdates[`pemain/${p}/posisi`] = posBaru;
                                        hasUpdate = true;
                                    }
                                }
                            });
                            if (hasUpdate) dbGame.ref(`balap_rooms/${pinRoom}`).update(botUpdates);
                        });
                    }, 1500); // Berpindah setiap 1.5 detik agar terlihat panik/bingung
                }
                
                document.getElementById("btn-mulai-3d").onclick = () => {
                    dbGame.ref(`balap_rooms/${pinRoom}`).once('value', (snap) => {
                        let current = snap.val();
                        if(!current) return;
                        let multiUpdate = {};
                        
                        // Reset posisi dan nyawa pemain asli (Manusia)
                        Object.keys(current.pemain || {}).forEach(p => {
                            multiUpdate[`pemain/${p}/hp`] = 1; // 1 NYAWA SUDDEN DEATH
                            multiUpdate[`pemain/${p}/posisi`] = "tengah";
                        });

                        // SUNTIKAN 10 BOT PINTAR!
                        for (let i = 1; i <= 10; i++) {
                            multiUpdate[`pemain/Bot_Pintar_${i}/hp`] = 1;
                            multiUpdate[`pemain/Bot_Pintar_${i}/posisi`] = "tengah";
                            multiUpdate[`pemain/Bot_Pintar_${i}/isBot`] = true;
                        }

                        multiUpdate[`status`] = "playing";
                        multiUpdate[`indeks_soal`] = 0;
                        multiUpdate[`pemenang`] = "";
                        dbGame.ref(`balap_rooms/${pinRoom}`).update(multiUpdate);
                    });
                };
                
                document.getElementById("btn-ungkap-3d").onclick = () => {
                    dbGame.ref(`balap_rooms/${pinRoom}`).once('value', snap => {
                        let r = snap.val();
                        if(!r) return;
                        let ansBenar = r.daftar_soal[r.indeks_soal].jawaban_benar;
                        let ansSalah = ansBenar === "kiri" ? "kanan" : "kiri";
                        let updates = { status: "revealing" };
                        
                        // GURU MEMBUNUH SEMUA YANG SALAH POSISI SECARA INSTAN
                        Object.keys(r.pemain || {}).forEach(p => {
                            if (r.pemain[p].hp > 0) {
                                
                                if (r.pemain[p].isBot) {
                                    // KECERDASAN BOT: Tepat sebelum jatuh, mereka mengunci jawaban!
                                    let finalPos = Math.random() < 0.7 ? ansBenar : ansSalah; // 70% Peluang Benar
                                    updates[`pemain/${p}/posisi`] = finalPos;
                                    
                                    if (finalPos !== ansBenar) updates[`pemain/${p}/hp`] = 0; // Bot mati jika salah
                                } else {
                                    // Evaluasi Siswa (Manusia)
                                    if (r.pemain[p].posisi !== ansBenar) {
                                        updates[`pemain/${p}/hp`] = 0; 
                                    }
                                }
                            }
                        });

                        dbGame.ref(`balap_rooms/${pinRoom}`).update(updates);
                        
                        // Jeda 4 detik untuk melihat animasi jatuh sebelum pindah soal
                        setTimeout(() => {
                            dbGame.ref(`balap_rooms/${pinRoom}`).once('value', snap2 => {
                                let r2 = snap2.val();
                                if(r2 && r2.status === "revealing") {
                                    let aliveCount = 0; let winnerName = "";
                                    Object.keys(r2.pemain || {}).forEach(p => { if(r2.pemain[p].hp > 0) { aliveCount++; winnerName = p; } });

                                    if(aliveCount <= 1 || r2.indeks_soal >= (r2.daftar_soal.length - 1)) {
                                        dbGame.ref(`balap_rooms/${pinRoom}`).update({
                                            status: "finished", pemenang: aliveCount === 1 ? winnerName : (aliveCount === 0 ? "Tersetrum Semua" : "Bertahan Bersama")
                                        });
                                    } else {
                                        dbGame.ref(`balap_rooms/${pinRoom}`).update({ indeks_soal: r2.indeks_soal + 1, status: "playing" });
                                    }
                                }
                            });
                        }, 4000);
                    });
                };

                document.getElementById("btn-stop-3d").onclick = () => {
                    dbGame.ref(`balap_rooms/${pinRoom}`).once('value', (snap) => {
                        let current = snap.val();
                        if(!current) return;
                        let multiUpdate = {};
                        Object.keys(current.pemain || {}).forEach(p => {
                            multiUpdate[`pemain/${p}/hp`] = 1; multiUpdate[`pemain/${p}/posisi`] = "tengah";
                        });
                        multiUpdate[`status`] = "lobby"; multiUpdate[`indeks_soal`] = 0; multiUpdate[`pemenang`] = "";
                        dbGame.ref(`balap_rooms/${pinRoom}`).update(multiUpdate);
                    });
                };
            }

            // Panggil Mesin 3D Pertama Kali
            if (typeof init3DArena === "function") { init3DArena(pinRoom, myName, isHost); } 
            
            // --- 4. OTAK AUTO-MATCHMAKING (KONTROL SHADOW HOST & BOT) ---
            dbGame.ref('balap_rooms/' + pinRoom).on('value', snap => {
                let room = snap.val();
                if (!room) return;

                let isPublic = room.mode === "3d_survival_public";
                
                if (isPublic) {
                    sessionStorage.setItem("is_public_match", "true");
                    document.getElementById("kontrol-guru-3d").style.display = "none";
                    
                    let timerUI = document.getElementById("public-timer-ui");
                    if (!timerUI) {
                        timerUI = document.createElement("div");
                        timerUI.id = "public-timer-ui";
                        timerUI.style.cssText = "position:absolute; top:75px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; font-size:18px; font-weight:bold; padding:8px 20px; border-radius:10px; border:2px solid gold; z-index:90; text-align:center;";
                        document.getElementById("wadah-3d-survival").appendChild(timerUI);
                        const qBox = document.querySelector(".question-wrapper");
                        if(qBox) qBox.style.top = "140px";
                    }

                    window.current3DRoomStatus = room.status;
                    let targetWaktuServer = room.status === "lobby" ? room.waktu_lobby : room.waktu_soal;
                    
                    if (targetWaktuServer && targetWaktuServer !== window.lastTargetWaktuPublic) {
                        window.lastTargetWaktuPublic = targetWaktuServer;
                        if (window.publicTimerInterval) clearInterval(window.publicTimerInterval);

                        window.publicTimerInterval = setInterval(() => {
                            let now = Date.now();
                            if (window.current3DRoomStatus === "lobby") {
                                let sisa = Math.max(0, Math.ceil((targetWaktuServer - now) / 1000));
                                timerUI.style.display = "block";
                                timerUI.innerHTML = `Mulai dalam: <span style="color:yellow;">${sisa}</span> detik<br><small style="font-size:12px;">Menunggu pemain/bot...</small>`;
                            } else if (window.current3DRoomStatus === "playing") {
                                let sisa = Math.max(0, Math.ceil((targetWaktuServer - now) / 1000));
                                timerUI.style.display = "block";
                                timerUI.innerHTML = `Waktu Menjawab: <span style="color:${sisa <= 3 ? '#dc3545' : '#00ff00'}; font-size:26px;">${sisa}</span>`;
                            } else if (window.current3DRoomStatus === "revealing") {
                                timerUI.style.display = "block";
                                timerUI.innerHTML = `💥 AWAS LANTAI RUNTUH! 💥`;
                            } else {
                                timerUI.style.display = "none";
                            }
                        }, 200); 
                    }
                }

                if (isPublic && isHost && !window.autoHostInterval) {
                    window.autoHostInterval = setInterval(() => {
                        dbGame.ref('balap_rooms/' + pinRoom).once('value', checkSnap => {
                            let r = checkSnap.val();
                            if(!r) { clearInterval(window.autoHostInterval); return; }
                            let timeNow = Date.now();
                            
                            // A. LOBBY HABIS -> MASUKKAN BOT & MULAI
                            if (r.status === "lobby" && timeNow >= r.waktu_lobby && !window.isTrans) {
                                window.isTrans = true;
                                let bots = {};
                                for (let i = 1; i <= 30; i++) { bots[`Bot_Pelajar_${i}`] = { posisi: "tengah", hp: 1, isBot: true }; }
                                
                                dbGame.ref(`balap_rooms/${pinRoom}/pemain`).update(bots).then(() => {
                                    dbGame.ref(`balap_rooms/${pinRoom}`).update({
                                        status: "playing", waktu_soal: Date.now() + 8000 
                                    }).then(() => { window.isTrans = false; });
                                });
                            }
                            
                            // B. SAAT BERMAIN (PERGERAKAN BOT)
                            else if (r.status === "playing") {
                                let sisaSoal = Math.ceil((r.waktu_soal - timeNow) / 1000);
                                let tickWaktu = Math.floor(timeNow / 1200); 
                                
                                if (window.lastBotTick !== tickWaktu) {
                                    window.lastBotTick = tickWaktu;
                                    let botUpdates = {};
                                    let ansBenar = r.daftar_soal[r.indeks_soal].jawaban_benar;
                                    let ansSalah = ansBenar === "kiri" ? "kanan" : "kiri";
                                    let hasUpdate = false;
                                    
                                    Object.keys(r.pemain).forEach(p => {
                                        if (r.pemain[p].isBot && r.pemain[p].hp > 0) {
                                            let posBaru = "tengah";
                                            if (sisaSoal <= 2) { posBaru = Math.random() < 0.7 ? ansBenar : ansSalah; } 
                                            else {
                                                const pilihan = ["kiri", "kanan", "tengah"];
                                                posBaru = pilihan[Math.floor(Math.random() * pilihan.length)];
                                            }
                                            if (r.pemain[p].posisi !== posBaru) {
                                                botUpdates[`pemain/${p}/posisi`] = posBaru; hasUpdate = true;
                                            }
                                        }
                                    });
                                    if (hasUpdate) dbGame.ref(`balap_rooms/${pinRoom}`).update(botUpdates);
                                }

                                // WAKTU HABIS -> HOST MEMBUNUH YANG SALAH & LANTAI RUNTUH
                                if (sisaSoal <= 0 && !window.isTrans) {
                                    window.isTrans = true;
                                    let updateData = { status: "revealing", waktu_reveal: Date.now() + 4000 };
                                    let ansBenar = r.daftar_soal[r.indeks_soal].jawaban_benar;
                                    
                                    Object.keys(r.pemain).forEach(p => {
                                        if (r.pemain[p].hp > 0 && r.pemain[p].posisi !== ansBenar) {
                                            updateData[`pemain/${p}/hp`] = 0; // INSTANT KILL DI SERVER!
                                        }
                                    });

                                    dbGame.ref(`balap_rooms/${pinRoom}`).update(updateData).then(() => { window.isTrans = false; });
                                }
                            }

                            // C. SAAT LANTAI RUNTUH (EVALUASI)
                            else if (r.status === "revealing") {
                                let sisaReveal = Math.ceil((r.waktu_reveal - timeNow) / 1000);
                                if (sisaReveal <= 0 && !window.isTrans) {
                                    window.isTrans = true;
                                    let aliveCount = 0; let winnerName = "";
                                    
                                    Object.keys(r.pemain).forEach(p => {
                                        if (r.pemain[p].hp > 0) { aliveCount++; winnerName = p; }
                                    });

                                    if (aliveCount <= 1 || r.indeks_soal >= (r.daftar_soal.length - 1)) {
                                        dbGame.ref(`balap_rooms/${pinRoom}`).update({
                                            status: "finished", pemenang: aliveCount === 1 ? winnerName : "Tidak ada yang bertahan"
                                        }).then(() => { window.isTrans = false; });
                                    } else {
                                        dbGame.ref(`balap_rooms/${pinRoom}`).update({
                                            status: "playing", indeks_soal: r.indeks_soal + 1, waktu_soal: Date.now() + 8000
                                        }).then(() => { window.isTrans = false; });
                                    }
                                }
                            }
                        });
                    }, 500); 
                }
            });
        }


        
        
    }; // ----- AKHIR dari loadPage = async function--------
    
    // --- FUNGSI TAMPILKAN SOAL ---
    function displayQuestion(index) {
        const wadahTempatSoal = document.getElementById("tempat-soal");
        const soal = loadedQuestions[index];
        
        document.getElementById("nomor-soal-aktif").innerText = index + 1;

        // Navigasi Tampilan Tombol
        document.getElementById("btn-sebelumnya").style.display = (index === 0) ? "none" : "flex";
        document.getElementById("btn-berikutnya").style.display = (index === loadedQuestions.length - 1) ? "none" : "flex";
        document.getElementById("btn-selesai-ujian").style.display = (index === loadedQuestions.length - 1) ? "flex" : "none";

        // Update Checkbox Ragu-Ragu
        document.getElementById("cb-ragu").checked = statusRagu[soal.id] ? true : false;

        let htmlSoal = `<div class="wadah-soal" style="border:none; padding:0; background:transparent;">`;
        
        let teksPertanyaan = soal.pertanyaan;
        // Cek jika ada tag [IMG:url] dari database
        if (teksPertanyaan.includes("[IMG:")) {
            const urlGambar = teksPertanyaan.match(/\[IMG:(.*?)\]/)[1];
            teksPertanyaan = teksPertanyaan.replace(/\[IMG:.*?\]/, `<br><img src="${urlGambar}" style="max-width:100%; margin-top:10px; border-radius:5px;"><br>`);
        }
       // Kita ubah <p> menjadi <div> agar tag HTML dari CKEditor tidak rusak saat dimunculkan
        htmlSoal += `<div class="pertanyaan" style="margin-bottom: 10px; line-height: 1.6; white-space: pre-wrap; text-align: justify;">${teksPertanyaan} <div style="display:inline-block; margin-left: 10px; color: #198754; font-size: 14px;" class="poin-soal">(${soal.poin} Poin)</div></div><hr style="margin: 15px 0; border-top: 1px solid #eee;">`;
        
        // Render Tipe Soal (Logikanya sama seperti sebelumnya)
        if (soal.tipe === "PG" || soal.tipe === "Benar_Salah") {
            soal.pilihan.forEach(pil => {
                if(pil.trim() !== "") {
                    const checked = (detailJawaban[soal.id] === pil) ? "checked" : "";
                    htmlSoal += `<label class="wadah-pilihan"><input type="radio" name="jawaban_${soal.id}" value="${pil}" ${checked}> ${pil}</label>`;
                }
            });
        } 
        else if (soal.tipe === "PG_Kompleks") {
            const savedAnswers = detailJawaban[soal.id] ? detailJawaban[soal.id].split(',') : [];
            soal.pilihan.forEach(pil => {
                if(pil.trim() !== "") {
                    const checked = savedAnswers.includes(pil) ? "checked" : "";
                    htmlSoal += `<label class="wadah-pilihan"><input type="checkbox" name="jawaban_${soal.id}" value="${pil}" ${checked}> ${pil}</label>`;
                }
            });
        }
        else if (soal.tipe === "Isian") {
            const val = detailJawaban[soal.id] || "";
            htmlSoal += `<input type="text" name="jawaban_${soal.id}" class="input-isian" placeholder="Ketik jawaban singkat Anda..." value="${val}" autocomplete="off">`;
        }
        else if (soal.tipe === "Esai") {
            const val = detailJawaban[soal.id] || "";
            htmlSoal += `<textarea name="jawaban_${soal.id}" class="input-esai" rows="5" placeholder="Ketik jawaban lengkap di sini..." autocomplete="off">${val}</textarea>`;
        }
        else if (soal.tipe === "Tarik_Garis") {
            htmlSoal += `<p style="font-size:13px; color:#666; margin-bottom:10px;"><i>Pilih pasangan yang tepat:</i></p>`;
            soal.pilihan.forEach((pasangan, pIndex) => {
                if(pasangan.includes('=')) {
                    const parts = pasangan.split('=');
                    const savedVal = detailJawaban[`${soal.id}_${pIndex}`] || "";
                    htmlSoal += `<div class="wadah-tarik-garis">
                        <div class="item-tarik-garis">${parts[0]}</div>
                        <select name="jawaban_${soal.id}_${pIndex}" class="select-tarik-garis">
                            <option value="">-- Pilih --</option>
                            <option value="${parts[1]}" ${savedVal === parts[1] ? "selected" : ""}>${parts[1]}</option>
                        </select>
                    </div>`;
                }
            });
        }
        htmlSoal += `</div>`;
        wadahTempatSoal.innerHTML = htmlSoal;
    }

    // --- FUNGSI MENGGAMBAR GRID NOMOR SOAL ---
    function renderGridNavigasi() {
        const grid = document.getElementById("grid-nomor-soal");
        if (!grid) return;
        
        let htmlGrid = "";
        loadedQuestions.forEach((soal, index) => {
            let cls = "btn-nomor";
            
            // Cek apakah sudah dijawab
            let isAnswered = false;
            if (soal.tipe === "Tarik_Garis") {
                // Dianggap dijawab jika minimal 1 ditarik garis
                isAnswered = Object.keys(detailJawaban).some(key => key.startsWith(soal.id) && detailJawaban[key] !== "");
            } else {
                isAnswered = detailJawaban[soal.id] && detailJawaban[soal.id].trim() !== "";
            }

            if (isAnswered) cls += " dijawab";
            if (statusRagu[soal.id]) cls += " ragu"; // Ragu menimpa warna dijawab
            if (index === currentQuestionIndex) cls += " aktif";

            htmlGrid += `<div class="${cls}" onclick="lompatKeSoal(${index})">${index + 1}</div>`;
        });
        grid.innerHTML = htmlGrid;
    }

    // Fungsi dipanggil saat nomor di grid diklik
    window.lompatKeSoal = function(index) {
        currentQuestionIndex = index;
        displayQuestion(index);
        renderGridNavigasi();
        saveExamSession();
    };

    // --- FUNGSI AMBIL JAWABAN SAAT INI ---
    function saveCurrentAnswer() {
        if (loadedQuestions.length === 0) return;
        const soal = loadedQuestions[currentQuestionIndex];
        const tempatSoal = document.getElementById("tempat-soal");

        if (soal.tipe === "PG" || soal.tipe === "Benar_Salah") {
            const checkedRadio = tempatSoal.querySelector(`input[name="jawaban_${soal.id}"]:checked`);
            detailJawaban[soal.id] = checkedRadio ? checkedRadio.value : "";
        }
        else if (soal.tipe === "PG_Kompleks") {
            const checkedChecks = tempatSoal.querySelectorAll(`input[name="jawaban_${soal.id}"]:checked`);
            const values = Array.from(checkedChecks).map(cb => cb.value);
            detailJawaban[soal.id] = values.join(",");
        }
        else if (soal.tipe === "Isian" || soal.tipe === "Esai") {
            const val = tempatSoal.querySelector(`[name="jawaban_${soal.id}"]`).value;
            detailJawaban[soal.id] = val;
        }
        else if (soal.tipe === "Tarik_Garis") {
            soal.pilihan.forEach((pasangan, pIndex) => {
                if(pasangan.includes('=')) {
                    const val = tempatSoal.querySelector(`[name="jawaban_${soal.id}_${pIndex}"]`).value;
                    detailJawaban[`${soal.id}_${pIndex}`] = val; 
                }
            });
        }
    }

    // --- FUNGSI TIMER MUNDUR ---
    function mulaiTimer() {
        clearInterval(timerInterval);
        const display = document.getElementById("timer-display");
        
        // Buat fungsi hitung mundur yang berdiri sendiri
        function hitungMundur() {
            let now = new Date().getTime();
            let distance = examEndTime - now;

            if (distance <= 0) {
                clearInterval(timerInterval);
                display.innerText = "00:00:00";
                alert("WAKTU HABIS! Jawaban Anda akan dikumpulkan otomatis.");
                submitUjian();
                return;
            }

            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Format 00:00:00
            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            display.innerText = `${hours}:${minutes}:${seconds}`;
        }

        // KUNCI PERBAIKAN: Panggil 1x secara langsung agar tidak ada jeda 02:00:00
        hitungMundur(); 
        
        // Baru jalankan perulangannya setiap 1 detik
        timerInterval = setInterval(hitungMundur, 1000);
    }

    // --- LOGIKA SUBMIT UJIAN ---
    async function submitUjian() {
        const areaUjian = document.getElementById("area-ujian");
        const btnSelesai = document.getElementById("btn-selesai-ujian");
        const hasilAlert = document.getElementById("hasil-ujian-alert");

        // --- TAMBAHKAN LAYAR LOADING ANIMASI ---
        const loadingOverlay = document.createElement("div");
        loadingOverlay.id = "loading-submit-ujian";
        loadingOverlay.style.position = "fixed";
        loadingOverlay.style.top = "0";
        loadingOverlay.style.left = "0";
        loadingOverlay.style.width = "100vw";
        loadingOverlay.style.height = "100vh";
        loadingOverlay.style.backgroundColor = "rgba(255, 255, 255, 0.98)"; // Latar putih bersih
        loadingOverlay.style.zIndex = "9999999";
        loadingOverlay.style.display = "flex";
        loadingOverlay.style.flexDirection = "column";
        loadingOverlay.style.justifyContent = "center";
        loadingOverlay.style.alignItems = "center";
        loadingOverlay.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 60px; color: #198754; margin-bottom: 20px;"></i>
            <h2 style="color: #333; margin: 0 0 10px 0;">Mengumpulkan Jawaban...</h2>
            <p style="color: #666; font-size: 16px;">Sistem sedang menganalisis hasil Anda. Mohon tunggu sebentar.</p>
        `;
        document.body.appendChild(loadingOverlay);
        // ----------------------------------------

        

        btnSelesai.innerText = "Mengirim...";
        btnSelesai.disabled = true;
        
        let totalSkor = 0;
        let finalDetailJawaban = {}; 

        loadedQuestions.forEach(soal => {
            let userJawaban = "";
            let isBenar = false;

            if (soal.tipe === "PG" || soal.tipe === "Benar_Salah" || soal.tipe === "Isian") {
                userJawaban = detailJawaban[soal.id] || "";
                if (userJawaban.toLowerCase().trim() === soal.kunci.toLowerCase().trim()) isBenar = true;
            } 
            else if (soal.tipe === "PG_Kompleks") {
                userJawaban = detailJawaban[soal.id] || "";
                if (userJawaban === soal.kunci) isBenar = true;
            }
            else if (soal.tipe === "Tarik_Garis") {
                let skorParsial = 0;
                let itemTarikGaris = [];
                soal.pilihan.forEach((pasangan, pIndex) => {
                    if(pasangan.includes('=')) {
                        const parts = pasangan.split('=');
                        const jwb = detailJawaban[`${soal.id}_${pIndex}`] || "";
                        itemTarikGaris.push(`${parts[0]}=>${jwb}`);
                        if(jwb === parts[1]) skorParsial += (soal.poin / soal.pilihan.length);
                    }
                });
                userJawaban = itemTarikGaris.join(" | ");
                totalSkor += Math.round(skorParsial);
                isBenar = null; 
            }
            else if (soal.tipe === "Esai") {
                userJawaban = detailJawaban[soal.id] || "";
                isBenar = null;
            }

            if (isBenar === true) totalSkor += soal.poin;
            
            // --- TRIK PROMPT AI: Beritahu AI Status & Poin Soal ---
            let petunjukAI = "";
            if (isBenar === true) {
                petunjukAI = `[JAWABAN BENAR - Mendapat ${soal.poin} Poin]`;
            } else if (isBenar === false) {
                petunjukAI = `[JAWABAN SALAH - Poin Maksimal soal ini: ${soal.poin}]`;
            } else {
                petunjukAI = `[ESAI/MANUAL - Poin Maksimal soal ini: ${soal.poin}]`;
            }
            
            // Gabungkan petunjuk, pertanyaan, dan jawaban siswa
            finalDetailJawaban[`${petunjukAI} ${soal.pertanyaan}`] = userJawaban || "(Kosong / Tidak dijawab)";
        });

        try {
            const payload = {
                action: "submit_ujian",
                nama_siswa: sessionStorage.getItem("userName"),
                kode_soal: currentExamCode, 
                total_poin: totalSkor,
                detail_jawaban: finalDetailJawaban
            };

            const response = await fetch(SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if(result.status === "sukses") {
                clearExamSession(); // HAPUS SESI UJIAN KARENA SUDAH SELESAI

                // --- MATIKAN LAYAR LOADING & RESET SAKLAR ---
                if (document.getElementById("loading-submit-ujian")) {
                    document.body.removeChild(document.getElementById("loading-submit-ujian"));
                }
                window.isSubmittingExam = false; 
                // --------------------------------------------
                
                // --- KELUARKAN DARI MODE FULLSCREEN OTOMATIS ---
                if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) { /* Safari */
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) { /* IE11 */
                        document.msExitFullscreen();
                    }
                }
                
    
                
                areaUjian.style.display = "none";
                document.getElementById("pdf-nama-siswa").innerText = payload.nama_siswa;
                document.getElementById("pdf-kode-ujian").innerText = currentExamCode;
                document.getElementById("pdf-skor-objektif").innerText = totalSkor;
                
                const paragraphs = result.ai_feedback.split('\n').filter(p => p.trim() !== '');
                let formattedFeedback = '';
                paragraphs.forEach(p => {
                    formattedFeedback += `<p style="margin-bottom: 12px; line-height: 1.6;">${p}</p>`;
                });
                document.getElementById("pdf-analisis-ai").innerHTML = formattedFeedback;

                hasilAlert.innerHTML = `
                    <h3 style="margin-bottom:10px; font-size:1.8rem;">Luar Biasa!</h3>
                    <p>Jawaban berhasil dikumpulkan.</p>
                    <hr style="border-top:2px dashed #198754; margin:15px 0;">
                    <p>Skor Objektif Anda:</p>
                    <span style="font-size:48px; color:#198754; display:block; margin:10px 0; font-weight:bold;">${totalSkor}</span>
                    <button id="btn-download-pdf" style="margin-top: 15px; padding: 12px 20px; background-color: #0dcaf0; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                        Unduh Analisis Rapor PDF
                    </button>
                `;
                hasilAlert.style.display = "block";
                window.scrollTo(0, 0);

                // --- LOGIKA PEMBUATAN PDF (TEKS MURNI / NATIVE PRINT) ---
               // --- LOGIKA PEMBUATAN PDF (DIRECT DOWNLOAD UNTUK TABLET/HP) ---
                document.getElementById("btn-download-pdf").addEventListener("click", function() {
                    const elemenPdf = document.getElementById("wadah-rapor-pdf");
                    const btn = this;
                    const teksAwal = btn.innerHTML;
                    
                    // Ubah tombol jadi loading
                    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyusun PDF...`;
                    btn.disabled = true;
                    
                    // 1. Munculkan wadah PDF (Gunakan 100% agar teks membungkus/wrap otomatis sesuai layar tablet)
                    elemenPdf.style.display = "block"; 
                    elemenPdf.style.width = "100%"; // <-- KUNCI PERBAIKAN
                    elemenPdf.style.maxWidth = "100%"; 
                    elemenPdf.style.boxSizing = "border-box";
                    elemenPdf.style.padding = "20px"; // Jarak aman dalam HTML
                    elemenPdf.style.backgroundColor = "white"; 
                    
                    // 2. Paksa teks analisis AI agar rata kiri-kanan dan tidak menabrak batas pinggir
                    const aiTextContainer = document.getElementById("pdf-analisis-ai");
                    if(aiTextContainer) {
                        aiTextContainer.style.wordWrap = "break-word";
                        aiTextContainer.style.textAlign = "justify";
                    }
                    
                    // 3. Pengaturan PDF
                    const opt = {
                      margin:       10, // Margin 10mm sangat aman
                      filename:     `Rapor_${currentExamCode}_${payload.nama_siswa.replace(/\s+/g, '_')}.pdf`,
                      image:        { type: 'jpeg', quality: 0.98 },
                      // Hapus paksaan windowWidth agar kamera mengikuti ukuran asli layar tablet
                      html2canvas:  { scale: 2, scrollX: 0, scrollY: 0, useCORS: true }, 
                      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    // 4. Proses Generate dan Download Otomatis
                    html2pdf().set(opt).from(elemenPdf).save().then(() => {
                        elemenPdf.style.display = "none";
                        btn.innerHTML = teksAwal;
                        btn.disabled = false;
                    }).catch(err => {
                        alert("Terjadi kesalahan saat membuat PDF. Pastikan memori tablet Anda cukup.");
                        elemenPdf.style.display = "none";
                        btn.innerHTML = teksAwal;
                        btn.disabled = false;
                    });
                });
            }
        } catch (error) {
            alert("Terjadi kesalahan saat mengirim jawaban.");


            // --- MATIKAN LAYAR LOADING & HIDUPKAN SAKLAR ALARM JIKA GAGAL ---
            if (document.getElementById("loading-submit-ujian")) {
                document.body.removeChild(document.getElementById("loading-submit-ujian"));
            }
            window.isSubmittingExam = false; 
            // ----------------------------------------------------------------
            
            const btnSelesai = document.getElementById("btn-selesai-ujian");
            if(btnSelesai) {
                btnSelesai.innerText = "Selesai";
                btnSelesai.disabled = false;
            }
        }
    }



// --- LOGIKA SIMPAN SOAL OLEH GURU ---
    if (contentArea) {
        contentArea.addEventListener("submit", async function(e) {
            if (e.target.id === "form-buat-soal") {
                e.preventDefault();
                const btnSimpan = document.getElementById("btn-simpan-soal");
                const alertInfo = document.getElementById("alert-buat-soal");
                
                btnSimpan.innerText = "Mengunggah Soal & Gambar...";
                btnSimpan.disabled = true;
                alertInfo.style.display = "none";

                const fileInput = document.getElementById("bs-gambar");
                let base64Image = "";
                let mimeType = "";
                let fileName = "";

                // Fungsi untuk membaca gambar menjadi Base64
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    if(file.size > 2000000) { // Max 2MB
                        alert("Ukuran gambar terlalu besar! Maksimal 2MB.");
                        btnSimpan.innerText = "Simpan ke Database";
                        btnSimpan.disabled = false;
                        return;
                    }
                    mimeType = file.type;
                    fileName = file.name;
                    
                    base64Image = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(',')[1]);
                        reader.readAsDataURL(file);
                    });
                }

               const payload = {
                    action: "simpan_soal",
                    kode_soal: document.getElementById("bs-kode").value,
                    tipe_soal: document.getElementById("bs-tipe").value,
                    
                    // --- AMBIL TEKS DARI CKEDITOR ---
                    pertanyaan: window.CKEDITOR && CKEDITOR.instances['bs-pertanyaan'] ? CKEDITOR.instances['bs-pertanyaan'].getData() : document.getElementById("bs-pertanyaan").value,
                    
                    pilihan: document.getElementById("bs-pilihan").value || "-",
                    kunci: document.getElementById("bs-kunci").value || "-",
                    poin: document.getElementById("bs-poin").value,
                    image_base64: base64Image,
                    image_mime: mimeType,
                    image_name: fileName
                };

                try {
                    const response = await fetch(SCRIPT_URL, {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();

                   if(result.status === "sukses") {
                        alertInfo.style.backgroundColor = "#d1e7dd";
                        alertInfo.style.color = "#0f5132";
                        alertInfo.innerText = "Soal berhasil ditambahkan ke Database!";
                        alertInfo.style.display = "block";
                        e.target.reset(); // Kosongkan form biasa
                        
                        // --- KOSONGKAN CKEDITOR JUGA ---
                        if (window.CKEDITOR && CKEDITOR.instances['bs-pertanyaan']) {
                            CKEDITOR.instances['bs-pertanyaan'].setData('');
                        }
                    }
                } catch (error) {
                    alertInfo.style.backgroundColor = "#f8d7da";
                    alertInfo.style.color = "#842029";
                    alertInfo.innerText = "Gagal menghubungi server.";
                    alertInfo.style.display = "block";
                } finally {
                    btnSimpan.innerHTML = `<i class="fa-solid fa-save"></i> Simpan ke Database`;
                    btnSimpan.disabled = false;
                }
            }
        });
    }

    // --- FITUR KEAMANAN: DETEKSI KELUAR FULLSCREEN CBT ---
    document.addEventListener("fullscreenchange", checkFullscreenCBT);
    document.addEventListener("webkitfullscreenchange", checkFullscreenCBT);
    document.addEventListener("msfullscreenchange", checkFullscreenCBT);

    function checkFullscreenCBT() {

        // --- KUNCI PERBAIKAN: Abaikan sensor jika siswa sengaja menekan Selesai ---
        if (window.isSubmittingExam) return;
        
        const areaUjian = document.getElementById("area-ujian");
        // Cek apakah siswa sedang berada di tengah ujian
        if (areaUjian && areaUjian.style.display === "flex") {
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
            
            // Jika layar tidak fullscreen lagi, beri peringatan keras!
            // Jika layar tidak fullscreen lagi, Munculkan Layar Blokir Hitam!
            if (!isFullscreen) {
                tampilkanPeringatanPelanggaran();
            }
        }
    }

    // Fungsi membuat Layar Blokir (Mencegah klik soal & Memaksa kembali fullscreen)
    function tampilkanPeringatanPelanggaran() {
        if (document.getElementById("overlay-pelanggaran")) return;

        const overlay = document.createElement("div");
        overlay.id = "overlay-pelanggaran";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.96)"; // Latar Hitam Pekat
        overlay.style.color = "white";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "999999"; // Posisi paling atas menutupi seluruh web
        overlay.style.textAlign = "center";
        overlay.style.padding = "20px";

        overlay.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 80px; color: #dc3545; margin-bottom: 20px;"></i>
            <h1 style="color: #dc3545; margin-bottom: 10px; font-size: 32px;">PELANGGARAN TERDETEKSI!</h1>
            <p style="font-size: 18px; margin-bottom: 30px; max-width: 600px; line-height: 1.6;">Anda telah keluar dari mode Layar Penuh atau melakukan <i>Refresh</i>.<br>Ujian Anda diblokir sementara untuk alasan keamanan!</p>
            <button id="btn-kembali-ujian" style="padding: 15px 30px; font-size: 18px; font-weight: bold; background-color: #0dcaf0; color: #000; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                <i class="fa-solid fa-expand"></i> Kembali ke Layar Penuh & Lanjutkan
            </button>
        `;

        document.body.appendChild(overlay);

        // Saat tombol di layar blokir diklik, aktifkan kembali Fullscreen
        document.getElementById("btn-kembali-ujian").addEventListener("click", () => {
            const elem = document.documentElement;
            let requestFS = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
            
            if (requestFS) {
                requestFS.call(elem).then(() => {
                    overlay.remove(); // Hapus layar hitam jika sukses fullscreen
                }).catch(err => {
                    alert("Gagal masuk ke fullscreen. Pastikan browser Anda mendukung fitur ini.");
                });
            } else {
                overlay.remove(); // Otomatis lepas jika browser HP lawas tidak mendukung
            }
        });
    }

// ====================================================
// ENGINE THREE.JS: 3D SURVIVAL (DICEY DESCENT)
// ====================================================
function init3DArena(pinRoom, myName, isHost) {
    const container = document.getElementById("canvas-container-3d");
    if (!container || container.innerHTML !== "") return; 

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.Fog(0x87CEEB, 10, 50); 

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const platformGeo = new THREE.BoxGeometry(14, 2, 14);
    const platKiri = new THREE.Mesh(platformGeo, new THREE.MeshStandardMaterial({ color: 0xdc3545 }));
    platKiri.position.set(-7.5, 0, 0); platKiri.receiveShadow = true; scene.add(platKiri);

    const platKanan = new THREE.Mesh(platformGeo, new THREE.MeshStandardMaterial({ color: 0x0d6efd }));
    platKanan.position.set(7.5, 0, 0); platKanan.receiveShadow = true; scene.add(platKanan);

    // --- AWAN DEKORATIF BERJALAN ---
    const dekorasiAwanGroup = new THREE.Group();
    scene.add(dekorasiAwanGroup);

    function buatSatuAwanDekorasi() {
        const groupAwan = new THREE.Group();
        const geoAwan = new THREE.BoxGeometry(4, 2, 4);
        const matAwan = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

        for (let i = 0; i < 4; i++) {
            const part = new THREE.Mesh(geoAwan, matAwan);
            part.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 4);
            part.scale.set(Math.random() + 0.5, Math.random() + 0.5, Math.random() + 0.5);
            groupAwan.add(part);
        }
        groupAwan.position.set((Math.random() - 0.5) * 100, Math.random() * 10 + 5, (Math.random() - 0.5) * 100);
        groupAwan.userData.speed = 0.02 + Math.random() * 0.05;
        return groupAwan;
    }
    for (let i = 0; i < 15; i++) { dekorasiAwanGroup.add(buatSatuAwanDekorasi()); }

    // --- 3D ZOO FACTORY ---
    function createMaterial(colorHex) { return new THREE.MeshStandardMaterial({ color: colorHex, flatShading: true }); }
    const matHitam = createMaterial(0x333333);
    const matPutih = createMaterial(0xffffff);

    function createBabiMesh() {
        const group = new THREE.Group();
        const matBody = createMaterial(0xffc0cb); 
        const body = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 2.5), matBody);
        body.position.y = 0.9; body.castShadow = true; group.add(body);
        const snout = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 0.4), createMaterial(0xffa0af));
        snout.position.set(0, 0.8, 1.4); snout.castShadow = true; group.add(snout);
        const mataKiri = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.2), matHitam);
        mataKiri.position.set(0.5, 1.3, 1.25); group.add(mataKiri);
        const mataKanan = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.2), matHitam);
        mataKanan.position.set(-0.5, 1.3, 1.25); group.add(mataKanan);
        const kakiGeo = new THREE.BoxGeometry(0.5, 0.8, 0.5);
        for(let i=0; i<4; i++){
            const kaki = new THREE.Mesh(kakiGeo, createMaterial(0xff808f));
            kaki.position.set((i<2?0.6:-0.6), -0.4, (i%2===0?0.8:-0.8));
            kaki.castShadow = true; group.add(kaki);
        }
        group.userData.matAsli = matBody; return group;
    }

    function createAyamMesh() {
        const group = new THREE.Group();
        const matBody = createMaterial(0xffff00); 
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 1.5), matBody);
        body.position.y = 1.1; body.castShadow = true; group.add(body);
        const paruh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), createMaterial(0xffa500));
        paruh.position.set(0, 1.3, 0.9); group.add(paruh);
        const mataKiri = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), matHitam);
        mataKiri.position.set(0.4, 1.8, 0.7); group.add(mataKiri);
        const mataKanan = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), matHitam);
        mataKanan.position.set(-0.4, 1.8, 0.7); group.add(mataKanan);
        const sayap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 1.3), createMaterial(0xeeee00));
        sayap.position.set(0.85, 1.0, 0); group.add(sayap);
        const sayap2 = sayap.clone(); sayap2.position.x = -0.85; group.add(sayap2);
        const kaki = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), createMaterial(0x8b4513));
        kaki.position.set(0.4, -0.4, 0); group.add(kaki);
        const kaki2 = kaki.clone(); kaki2.position.x = -0.4; group.add(kaki2);
        group.userData.matAsli = matBody; return group;
    }

    function createPandaMesh() {
        const group = new THREE.Group();
        const matBody = createMaterial(0xffffff);
        const body = new THREE.Mesh(new THREE.BoxGeometry(2, 2.3, 2.2), matBody);
        body.position.y = 1.15; body.castShadow = true; group.add(body);
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), matBody);
        head.position.set(0, 2.8, 0); head.castShadow = true; group.add(head);
        const mata = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.2), matHitam);
        mata.position.set(0.5, 2.8, 0.8); group.add(mata);
        const mata2 = mata.clone(); mata2.position.x = -0.5; group.add(mata2);
        const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.25), matPutih);
        pupil.position.set(0.5, 2.8, 0.8); group.add(pupil);
        const pupil2 = pupil.clone(); pupil2.position.x = -0.5; group.add(pupil2);
        const telinga = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.3), matHitam);
        telinga.position.set(0.7, 3.6, -0.1); group.add(telinga);
        const telinga2 = telinga.clone(); telinga2.position.x = -0.7; group.add(telinga2);
        const lengan = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.7), matHitam);
        lengan.position.set(0.8, 0.6, 0.9); lengan.castShadow = true; group.add(lengan);
        const lengan2 = lengan.clone(); lengan2.position.x = -0.8; group.add(lengan2);
        group.userData.matAsli = matBody; return group;
    }

    const pabrikHewan = [createBabiMesh, createAyamMesh, createPandaMesh];
    let playerMeshes = {};

    // SINKRONISASI GAME FIREBASE
    dbGame.ref('balap_rooms/' + pinRoom).on('value', (snap) => {
        let room = snap.val();
        if (!room) return;

        let players = room.pemain || {};
        let soalAktif = room.daftar_soal ? room.daftar_soal[room.indeks_soal] : null;

        if (room.status === "lobby") {
            const elSoal = document.getElementById("ui-soal-3d");
            if (elSoal) elSoal.innerText = "Menunggu Pertandingan Dimulai...";
            document.getElementById("ui-opsi-kiri").style.display = "none";
            document.getElementById("ui-opsi-kanan").style.display = "none";
            document.getElementById("ui-status-3d").style.display = "none"; 
            gsap.to(platKiri.position, { y: 0, duration: 1 });
            gsap.to(platKanan.position, { y: 0, duration: 1 });
            window.lastScoredRound = null; 
        } else if (room.status === "finished") {
            const elSoal = document.getElementById("ui-soal-3d");
            if (elSoal) elSoal.innerText = "🏆 PERMAINAN SELESAI 🏆";
            document.getElementById("ui-opsi-kiri").style.display = "none";
            document.getElementById("ui-opsi-kanan").style.display = "none";
            
            let uiStatus = document.getElementById("ui-status-3d");
            uiStatus.innerHTML = `PEMENANG:<br>${room.pemenang || "SERI"}`;
            uiStatus.style.display = "block";
            
            gsap.to(platKiri.position, { y: 0, duration: 1 });
            gsap.to(platKanan.position, { y: 0, duration: 1 });
            window.lastScoredRound = null;

            if (room.mode === "3d_survival_public") {
                uiStatus.innerHTML += `<br><span style="font-size:18px; color:yellow; text-shadow: 1px 1px 2px #000;">Arena ditutup dalam 8 detik...</span>`;
                if (!window.publicEndTimeout) {
                    window.publicEndTimeout = setTimeout(() => {
                        window.publicEndTimeout = null;
                        if (typeof window.keluarArena3D === "function") window.keluarArena3D(true);
                    }, 8000);
                }
            }
        } else if (soalAktif) {
            const elSoal = document.getElementById("ui-soal-3d");
            if(elSoal) elSoal.innerText = soalAktif.pertanyaan;
            document.getElementById("ui-opsi-kiri").style.display = "block";
            document.getElementById("ui-opsi-kanan").style.display = "block";
            document.getElementById("ui-status-3d").style.display = "none";
            
            document.getElementById("ui-opsi-kiri").innerText = "❌ SALAH";
            document.getElementById("ui-opsi-kanan").innerText = "✅ BENAR";
        }

        // --- RENDER PEMAIN ---
        let daftarNama = Object.keys(players).sort();
        let hitungHewan = {}; 

        daftarNama.forEach((nama) => {
            let data = players[nama];
            let hp = data.hp !== undefined ? data.hp : 1; // DEFAULT 1 NYAWA
            let posisiY = hp > 0 ? 0.9 : -100; 
            
            let hash = 0;
            for (let k = 0; k < nama.length; k++) { hash += nama.charCodeAt(k); }
            let indeksHewan = hash % pabrikHewan.length;

            if (!hitungHewan[indeksHewan]) hitungHewan[indeksHewan] = 0;
            let urutanKembar = hitungHewan[indeksHewan];
            hitungHewan[indeksHewan]++;

            const paletWarna = [0xffc0cb, 0xffff00, 0xffffff, 0x00ff00, 0x00ffff, 0xff00ff, 0xffa500, 0x8a2be2, 0x1e90ff, 0xff4500];
            let hexWarnaUnik = paletWarna[(indeksHewan + (urutanKembar * 3)) % paletWarna.length];

            if (!playerMeshes[nama]) {
                let mesh = pabrikHewan[indeksHewan]();
                mesh.userData.offsetX = (Math.random() * 6) - 3;
                mesh.userData.offsetZ = (Math.random() * 6) - 3;
                mesh.userData.warnaAsli = hexWarnaUnik; 
                mesh.userData.matAsli.color.setHex(hexWarnaUnik);
                mesh.position.set(mesh.userData.offsetX, posisiY, mesh.userData.offsetZ); 
                scene.add(mesh);
                playerMeshes[nama] = mesh;
            }

            let pMesh = playerMeshes[nama];
            
            if ((room.status === "playing" || room.status === "lobby" || room.status === "finished") && hp > 0) {
                let baseX = 0; 
                if (data.posisi === "kiri" && room.status === "playing") baseX = -7.5;
                else if (data.posisi === "kanan" && room.status === "playing") baseX = 7.5;
                
                let targetX = baseX + pMesh.userData.offsetX;
                let targetZ = pMesh.userData.offsetZ;
                
                gsap.to(pMesh.position, { x: targetX, z: targetZ, y: 0.9, duration: 0.5, ease: "power1.out", overwrite: "auto" });
                
                const warnaOri = new THREE.Color(pMesh.userData.warnaAsli);
                gsap.to(pMesh.userData.matAsli.color, { r: warnaOri.r, g: warnaOri.g, b: warnaOri.b, duration: 0.5 });
            }
            
            if (room.status === "revealing" && soalAktif) {
                let jawabanBenar = soalAktif.jawaban_benar;
                
                if (data.posisi !== jawabanBenar) {
                    // Animasi Jatuh Kematian (Client-side render)
                    gsap.to(pMesh.position, { y: -100, duration: 1.5, ease: "power2.in", overwrite: "auto" });
                    gsap.to(pMesh.userData.matAsli.color, { r: 0.13, g: 0.13, b: 0.13, duration: 0.5, delay: 0.2 });
                } else {
                    if (nama === myName && hp > 0) {
                        let roundKey = room.indeks_soal;
                        if (window.lastScoredRound !== roundKey) {
                            window.lastScoredRound = roundKey; 
                            
                            dbGame.ref(`global_scores_3d/${myName}`).once('value', snap => {
                                let skorLama = snap.val() || 0;
                                dbGame.ref(`global_scores_3d/${myName}`).set(skorLama + 10);
                            });
                            
                            let skorUI = document.getElementById("skor-saya-3d");
                            if (skorUI) gsap.fromTo(skorUI, { scale: 1.8, color: "#00ff00" }, { scale: 1, color: "gold", duration: 1 });
                        }
                    }
                }
            } else if (hp <= 0) {
                pMesh.userData.matAsli.color.setHex(0x222222);
                pMesh.position.y = -100;
            }
        });

        if (room.status === "revealing" && soalAktif) {
            let jawabanBenar = soalAktif.jawaban_benar;
            if (jawabanBenar === "kiri") { gsap.to(platKanan.position, { y: -50, duration: 1.5, ease: "power2.in" }); } 
            else { gsap.to(platKiri.position, { y: -50, duration: 1.5, ease: "power2.in" }); }
        } else if (room.status === "playing") {
            gsap.to(platKiri.position, { y: 0, duration: 1, ease: "bounce.out" });
            gsap.to(platKanan.position, { y: 0, duration: 1, ease: "bounce.out" });
        }
    });

    document.getElementById("btn-pindah-kiri").onclick = () => { dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).update({ posisi: "kiri" }); };
    document.getElementById("btn-pindah-kanan").onclick = () => { dbGame.ref(`balap_rooms/${pinRoom}/pemain/${myName}`).update({ posisi: "kanan" }); };

    function animate() {
        requestAnimationFrame(animate);
        dekorasiAwanGroup.children.forEach(awan => {
            awan.position.x += awan.userData.speed;
            if (awan.position.x > 60) {
                awan.position.x = -60;
                awan.position.z = (Math.random() - 0.5) * 100; 
            }
        });
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

    // ====================================================
// ENGINE THREE.JS: SIRKUIT BALAP KETIK 3D (POV)
// ====================================================
function init3DBalapMobil(pinRoom, myName) {
    const container = document.getElementById("canvas-sirkuit-3d");
    if (!container || container.innerHTML !== "") return; 

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.Fog(0x87CEEB, 20, 150); // Kabut tebal di ujung jalan agar realistis

    // KAMERA POV (Akan mengikuti mobil pemain)
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Pencahayaan
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 1. BANGUN JALAN RAYA (ASPAL)
    const roadGeo = new THREE.PlaneGeometry(30, 1500);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -300; 
    road.receiveShadow = true;
    scene.add(road);

    // Garis Putih Putus-putus di tengah jalan
    for(let i=0; i<100; i++) {
        let line = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 5), new THREE.MeshBasicMaterial({color: 0xffffff}));
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.1, -i * 10);
        scene.add(line);
    }

    // 2. BANGUN PEMANDANGAN (POHON & TIANG)
    const sceneryGroup = new THREE.Group();
    scene.add(sceneryGroup);
    
    const treeGeo = new THREE.BoxGeometry(2, 6, 2);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.5, 3);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    for(let i=0; i<60; i++) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        const leaves = new THREE.Mesh(treeGeo, treeMat);
        leaves.position.y = 5; leaves.castShadow = true;
        tree.add(trunk); tree.add(leaves);
        
        // Taruh di pinggir jalan (kiri atau kanan acak)
        tree.position.set(Math.random() > 0.5 ? 18 + Math.random()*5 : -18 - Math.random()*5, 0, -i * 15);
        sceneryGroup.add(tree);
    }

    // Garis Finish
    const finishGeo = new THREE.BoxGeometry(30, 2, 2);
    const finishMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const finishLine = new THREE.Mesh(finishGeo, finishMat);
    finishLine.position.set(0, 5, -600); // Z = -600 adalah target 100% karakter
    scene.add(finishLine);

    // 3. PABRIK MOBIL VOXEL
    window.racingCars3D = {};
    const paletWarnaMobil = [0xdc3545, 0x0d6efd, 0xffc107, 0x198754, 0x8a2be2, 0xff8c00];

    window.buatMobilBaru = function(namaPemilik, indexWarna, lajurX) {
        const carGroup = new THREE.Group();
        let hexColor = paletWarnaMobil[indexWarna % paletWarnaMobil.length];

        // Body Mobil
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 4.5), new THREE.MeshStandardMaterial({ color: hexColor }));
        body.position.y = 0.8; body.castShadow = true; carGroup.add(body);
        
        // Kabin/Kaca
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2.5), new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.8 }));
        cabin.position.set(0, 1.6, -0.2); carGroup.add(cabin);

        // Roda (Disimpan di array agar bisa diputar)
        let daftarRoda = [];
        const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        
        for(let i=0; i<4; i++) {
            let w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(i<2 ? 1.4 : -1.4, 0.5, i%2===0 ? 1.5 : -1.5);
            carGroup.add(w);
            daftarRoda.push(w);
        }

        // Api Nitro (Disembunyikan default)
        const api = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 8), new THREE.MeshBasicMaterial({ color: 0xff4500 }));
        api.rotation.x = -Math.PI / 2;
        api.position.set(0, 0.8, 3);
        api.visible = false;
        carGroup.add(api);

        carGroup.position.set(lajurX, 0, 0); // Start dari Z=0
        scene.add(carGroup);

        // Simpan data khusus di dalam mobil
        carGroup.userData = { roda: daftarRoda, api: api, nama: namaPemilik };
        window.racingCars3D[namaPemilik] = carGroup;
    };

    // 4. RENDER LOOP & POV KAMERA
    function animate() {
        requestAnimationFrame(animate);

        // Kamera Dinamis (POV Pribadi)
        if (window.racingCars3D && window.racingCars3D[myName]) {
            let myCar = window.racingCars3D[myName];
            
            // Kamera selalu mengekor 15 meter di belakang mobil kita, dan 6 meter di atasnya
            let targetCamZ = myCar.position.z + 15;
            let targetCamY = 6;
            
            // Gerakkan kamera secara mulus mendekati posisi target
            camera.position.x += (myCar.position.x - camera.position.x) * 0.1;
            camera.position.y += (targetCamY - camera.position.y) * 0.1;
            camera.position.z += (targetCamZ - camera.position.z) * 0.1;
            
            // Kamera selalu menatap tajam ke arah depan mobil kita
            camera.lookAt(myCar.position.x, myCar.position.y, myCar.position.z - 20);
        } else {
            // Jika mobil kita belum masuk arena, kamera muter-muter di garis start (Lobby)
            camera.position.set(0, 10, 10);
            camera.lookAt(0, 0, -20);
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
        
});
