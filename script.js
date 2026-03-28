document.addEventListener("DOMContentLoaded", () => {

    // --- Logika Menu Hamburger untuk HP ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwnKqYSMGc6b9BosbUh4hGYq6_kQeot8gSc4HuAriF1QyR-yA93UbViFrgTjh3SQUtj/exec";
    
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");
    
    const contentArea = document.getElementById("content-area");
    const navItems = document.querySelectorAll(".nav-item");
    const btnLogoutNav = document.getElementById("tombol-logout-nav");

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
    if (savedRole) {
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
        }
        if (savedRole.toLowerCase() === "siswa") {
            const menuLatihan = document.getElementById("menu-latihan");
            if (menuLatihan) menuLatihan.style.display = "block";
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

                    // Sembunyikan menu Publik saat berhasil login
                        document.querySelector('[data-page="visi-misi"]').style.display = "none";
                        document.querySelector('[data-page="profil"]').style.display = "none";

                    // --- TAMBAHKAN KODE INI ---
                    // Cek jika role adalah Guru (pastikan tulisan sesuai dengan database di Google Sheet)
                    if (result.role.toLowerCase() === "guru") {
                            const menuGuru = document.getElementById("menu-guru-dropdown");
                            if(menuGuru) menuGuru.style.display = "";
                        }
                        if (result.role.toLowerCase() === "siswa") {
                            const menuLatihan = document.getElementById("menu-latihan");
                            if(menuLatihan) menuLatihan.style.display = "block";
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
            
            // 2. Sembunyikan Menu Khusus Role
            // --- KUNCI PERBAIKAN: Sembunyikan ID Dropdown Guru yang baru ---
            const menuGuru = document.getElementById("menu-guru-dropdown");
            if (menuGuru) menuGuru.style.display = "none";
            
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

            document.getElementById("btn-selesai-ujian").addEventListener("click", () => {
                if(confirm("Apakah Anda yakin ingin menyelesaikan ujian? Jawaban tidak bisa diubah lagi.")) {
                    submitUjian(); 
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
                            <td>${previewPertanyaan}</td>
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
                // ... (Kode hapus soal Anda sebelumnya tidak ada yang berubah, tetap sama!)
                const konfirmasi = confirm(`🚨 PERINGATAN!\n\nApakah Anda yakin ingin MENGHAPUS soal ini?\nData akan dihapus secara permanen dari Google Sheets.`);
                if (konfirmasi) {
                    const btnHapus = document.getElementById(`btn-hapus-${rowId}`);
                    btnHapus.innerHTML = "Menghapus...";
                    btnHapus.disabled = true;
                    try {
                        const payload = { action: "hapus_soal", kode_soal: kode, pertanyaan: pertanyaan };
                        const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
                        const result = await response.json();
                        if(result.status === "sukses") {
                            alert("✅ Soal berhasil dihapus dari Database!");
                            await fetchSemuaSoalUntukGuru(); 
                            renderTabelSoal(document.getElementById("filter-kode-soal").value);
                        } else {
                            alert("❌ Gagal menghapus soal: " + result.message);
                            btnHapus.innerHTML = `<i class="fa-solid fa-trash-can"></i> Hapus`;
                            btnHapus.disabled = false;
                        }
                    } catch (error) {
                        alert("Terjadi kesalahan sistem saat mencoba menghapus.");
                        btnHapus.innerHTML = `<i class="fa-solid fa-trash-can"></i> Hapus`;
                        btnHapus.disabled = false;
                    }
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
                            <td style="font-size:12px;">${previewAI}</td>
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
                const paragraphs = dataSiswa.analisis.split('\\n').filter(p => p.trim() !== '');
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

            // 1. Buat & Unduh Template Otomatis
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

            // 2. Membaca File Excel yang Diupload
            document.getElementById("file-excel-soal").addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const firstSheet = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheet];
                    
                    // Ubah sheet jadi array
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1}); 
                    
                    previewData = [];
                    // Mulai dari i=1 untuk melewati baris Judul (Header)
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (row.length === 0 || !row[0]) continue; // Lewati baris kosong
                        
                        previewData.push({
                            id: Date.now() + i, // ID unik sementara
                            kode: row[0] || "",
                            tipe: row[1] || "",
                            pertanyaan: row[2] || "",
                            pilihan: row[3] || "-",
                            kunci: row[4] || "-",
                            poin: row[5] || 10,
                            imgBase64: "", imgMime: "", imgName: ""
                        });
                    }
                    renderPreviewTable();
                };
                reader.readAsArrayBuffer(file);
            });

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
            document.getElementById("btn-simpan-massal").addEventListener("click", async function() {
                if(!confirm("Yakin ingin menyimpan semua soal ini ke Database?")) return;
                
                const btn = this;
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah ke Database Server... (Mohon Tunggu)`;
                btn.disabled = true;

                // Tarik data terbaru dari input field HTML (bukan dari array lama, karena mungkin guru mengubahnya di layar)
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

                try {
                    const response = await fetch(SCRIPT_URL, {
                        method: "POST",
                        body: JSON.stringify({
                            action: "simpan_soal_massal",
                            data_soal: finalPayload
                        })
                    });
                    const result = await response.json();
                    
                    if(result.status === "sukses") {
                        alert("✅ Sempurna! Semua soal berhasil diupload ke Database.");
                        document.getElementById("file-excel-soal").value = "";
                        previewData = [];
                        renderPreviewTable();
                    } else {
                        alert("❌ Gagal: " + result.message);
                    }
                } catch (err) {
                    alert("Terjadi kesalahan jaringan.");
                } finally {
                    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Simpan ke Database Sekarang`;
                    btn.disabled = false;
                }
            });
        }
        

        
    };

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
        
        htmlSoal += `<p class="pertanyaan">${teksPertanyaan} <span class="poin-soal">(${soal.poin} Poin)</span></p><hr style="margin: 15px 0; border-top: 1px solid #eee;">`;
        
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
                    pertanyaan: document.getElementById("bs-pertanyaan").value,
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
                        e.target.reset(); // Kosongkan form
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
        
});
