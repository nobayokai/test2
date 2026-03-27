document.addEventListener("DOMContentLoaded", () => {

    // --- Logika Menu Hamburger untuk HP ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbziQt3U6ZJYwgMxrY2MXaQb55Zi6UB7_ftpmRJJsKsWKiiM9izOSpXHM78laVpEBg/exec";
    
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");
    
    const contentArea = document.getElementById("content-area");
    const navItems = document.querySelectorAll(".nav-item");
    const btnLogoutNav = document.getElementById("tombol-logout-nav");

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
            const menuRapor = document.getElementById("menu-rapor");
            if (menuRapor) menuRapor.style.display = "block";
    
            // TAMBAHKAN INI
            const menuBuatSoal = document.getElementById("menu-buat-soal");
            if (menuBuatSoal) menuBuatSoal.style.display = "block";

            //menu lihat soal
            const menuLihatSoal = document.getElementById("menu-lihat-soal");
            if(menuLihatSoal) menuLihatSoal.style.display = "block";
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
                            const menuRapor = document.getElementById("menu-rapor");
                            if(menuRapor) menuRapor.style.display = "block";

                            // --- TAMBAHKAN 2 BARIS INI ---
                            const menuBuatSoal = document.getElementById("menu-buat-soal");
                            if(menuBuatSoal) menuBuatSoal.style.display = "block";
                            // -----------------------------

                            // tampilkan menu lihat soal
                            const menuLihatSoal = document.getElementById("menu-lihat-soal");
                            if(menuLihatSoal) menuLihatSoal.style.display = "block";
                        
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
            clearExamSession(); // TAMBAHKAN BARIS INI
            
            // 2. Sembunyikan menu khusus dan tombol logout
            const menuRapor = document.getElementById("menu-rapor");
            if(menuRapor) menuRapor.style.display = "none";
            
            const menuLatihan = document.getElementById("menu-latihan");
            if(menuLatihan) menuLatihan.style.display = "none"; 

            // --- TAMBAHKAN 2 BARIS INI ---
            const menuBuatSoal = document.getElementById("menu-buat-soal");
            if(menuBuatSoal) menuBuatSoal.style.display = "none";
            // -----------------------------

            // sembunyikan menu lihat soal
            const menuLihatSoal = document.getElementById("menu-lihat-soal");
            if(menuLihatSoal) menuLihatSoal.style.display = "none";
            
            
            // Munculkan Kembali Menu Publik (Visi Misi & Profil)
            document.querySelector('[data-page="visi-misi"]').style.display = "block";
            document.querySelector('[data-page="profil"]').style.display = "block";
            
            // Kembalikan Tombol Login
            btnLogoutNav.style.display = "none";
            document.getElementById("tombol-login-nav").style.display = "block";
            
            if(navMenu) navMenu.classList.remove("active");
            
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
            }

            // ALUR 1: Cek Kode
            if (btnLanjut && !savedSession) {
                btnLanjut.addEventListener("click", async () => {
                    const kodeDiminta = inputKode.value.trim().toUpperCase();
                    if(!kodeDiminta) return;
                    
                    btnLanjut.innerText = "Memeriksa...";
                    btnLanjut.disabled = true;

                    try {
                        const response = await fetch(SCRIPT_URL);
                        const semuaSoal = await response.json();
                        let soalSesuaiKode = semuaSoal.filter(soal => soal.kode.toUpperCase() === kodeDiminta);

                        if (soalSesuaiKode.length === 0) {
                            document.getElementById("error-kode").style.display = "block";
                        } else {
                            currentExamCode = kodeDiminta; 
                            document.getElementById("label-kode-ujian").innerText = kodeDiminta; 
                            modalKonfirmasi.style.display = "flex"; 
                            // Acak soal dan simpan ke memory
                            loadedQuestions = acakUrutan(soalSesuaiKode); 
                        }
                    } catch (error) {
                        alert("Gagal terhubung ke server.");
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

            // Fungsi mengambil semua soal dari Sheets
            async function fetchSemuaSoalUntukGuru() {
                try {
                    const response = await fetch(SCRIPT_URL);
                    allSoalData = await response.json();

                    // Cari kode soal apa saja yang tersedia (unik)
                    const uniqueCodes = [...new Set(allSoalData.map(item => item.kode))];
                    
                    filterSelect.innerHTML = `<option value="">-- Pilih Kode Soal --</option>`;
                    uniqueCodes.forEach(kode => {
                        filterSelect.innerHTML += `<option value="${kode}">${kode}</option>`;
                    });
                } catch (error) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Gagal memuat data dari server.</td></tr>`;
                }
            }

            // Fungsi merender isi tabel sesuai dropdown yang dipilih
            window.renderTabelSoal = function(kode) {
                if (!kode) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; font-style: italic;">Silakan pilih kode soal di atas.</td></tr>`;
                    return;
                }

                const filteredSoal = allSoalData.filter(soal => soal.kode === kode);

                if (filteredSoal.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">Tidak ada soal yang ditemukan.</td></tr>`;
                    return;
                }

                let html = "";
                filteredSoal.forEach((soal, index) => {
                    // Sembunyikan URL panjang jika ada gambar agar tabel rapi
                    let previewPertanyaan = soal.pertanyaan.replace(/\[IMG:.*?\]/, "<br><span style='color:#198754; font-size:12px;'><i class='fa-solid fa-image'></i> [Dilengkapi Gambar]</span>");
                    let previewPilihan = soal.pilihan ? soal.pilihan.join(" | ") : "-";

                    html += `
                        <tr>
                            <td style="text-align:center;">${index + 1}</td>
                            <td>${soal.tipe}</td>
                            <td>${previewPertanyaan}</td>
                            <td>${previewPilihan}</td>
                            <td style="font-weight:bold; color:#198754;">${soal.kunci || "-"}</td>
                            <td style="text-align:center; font-weight:bold;">${soal.poin}</td>
                            <td style="text-align:center;">
                                <button class="btn-hapus-soal" id="btn-hapus-${soal.id}" onclick="hapusSoal('${soal.kode}', \`${soal.pertanyaan.replace(/`/g, "\\`")}\`, '${soal.id}')">
                                    <i class="fa-solid fa-trash-can"></i> Hapus
                                </button>
                            </td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;
            };

            // Jalankan saat dropdown berubah
            if(filterSelect) {
                filterSelect.addEventListener("change", (e) => {
                    renderTabelSoal(e.target.value);
                });
            }

            // Fungsi Hapus Soal menembak ke API Google
            window.hapusSoal = async function(kode, pertanyaan, rowId) {
                const konfirmasi = confirm(`🚨 PERINGATAN!\n\nApakah Anda yakin ingin MENGHAPUS soal ini?\nData akan dihapus secara permanen dari Google Sheets.`);
                
                if (konfirmasi) {
                    const btnHapus = document.getElementById(`btn-hapus-${rowId}`);
                    btnHapus.innerHTML = "Menghapus...";
                    btnHapus.disabled = true;

                    try {
                        const payload = {
                            action: "hapus_soal",
                            kode_soal: kode,
                            pertanyaan: pertanyaan
                        };

                        const response = await fetch(SCRIPT_URL, {
                            method: "POST",
                            body: JSON.stringify(payload)
                        });
                        
                        const result = await response.json();
                        
                        if(result.status === "sukses") {
                            alert("✅ Soal berhasil dihapus dari Database!");
                            // Segarkan ulang data dari Google Sheet
                            await fetchSemuaSoalUntukGuru(); 
                            // Render ulang tabel dengan kode yang sama
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

            // Panggil data pertama kali halaman dimuat
            fetchSemuaSoalUntukGuru();
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
            htmlSoal += `<input type="text" name="jawaban_${soal.id}" class="input-isian" placeholder="Ketik jawaban singkat Anda..." value="${val}">`;
        }
        else if (soal.tipe === "Esai") {
            const val = detailJawaban[soal.id] || "";
            htmlSoal += `<textarea name="jawaban_${soal.id}" class="input-esai" rows="5" placeholder="Ketik jawaban lengkap di sini...">${val}</textarea>`;
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
        
        timerInterval = setInterval(() => {
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
        }, 1000);
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
            finalDetailJawaban[soal.pertanyaan] = userJawaban;
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
                    
                    // Ubah tombol jadi loading agar siswa tidak klik berkali-kali
                    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyusun PDF...`;
                    btn.disabled = true;
                    
                    // 1. Munculkan wadah PDF dan rapikan ukurannya untuk difoto
                    elemenPdf.style.display = "block"; 
                    elemenPdf.style.width = "800px"; // Kunci lebar agar teks tidak berantakan di tablet
                    elemenPdf.style.margin = "0 auto";
                    elemenPdf.style.backgroundColor = "white"; // Pastikan background tidak transparan
                    
                    // 2. Pengaturan PDF
                    const opt = {
                      margin:       15, // Margin 1,5 cm di semua sisi kertas
                      filename:     `Rapor_${currentExamCode}_${payload.nama_siswa.replace(/\s+/g, '_')}.pdf`,
                      image:        { type: 'jpeg', quality: 0.98 },
                      html2canvas:  { scale: 2, scrollX: 0, scrollY: 0, useCORS: true }, 
                      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    // 3. Proses Generate dan Download Otomatis
                    html2pdf().set(opt).from(elemenPdf).save().then(() => {
                        // Sembunyikan lagi wadahnya setelah berhasil diunduh
                        elemenPdf.style.display = "none";
                        // Kembalikan tombol seperti semula
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
    
        
});
