document.addEventListener("DOMContentLoaded", () => {
    // --- Konfigurasi ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyc_fPgK9yeYrcqHn4GRmdqsJTWjQJJD_DA4EAEqjV-5c_Pj-D2uN3LEA42RtOAh0O2/exec"; // GANTI DENGAN URL GAS ANDA

    // --- Elemen-elemen DOM ---
    const contentArea = document.getElementById("content-area");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");
    const navItems = document.querySelectorAll(".nav-item");
    const btnLogoutNav = document.getElementById("tombol-logout-nav");

    // Elemen-elemen Modal
    const confirmModal = document.getElementById("confirm-modal");
    const modalKodeSoalText = document.getElementById("modal-kode-soal");
    const btnCancelModal = document.getElementById("btn-cancel-modal");
    const btnStartExam = document.getElementById("btn-start-exam");

    // Variabel Global untuk Ujian
    let ujianData = {
        kodeSoal: "",
        semuaSoal: [],
        currentSoalIndex: 0,
        jawabanSiswa: {}, // Format: {soalId: "jawaban"}
        timer: null,
        sisaWaktuDetik: 0
    };

    // --- Inisialisasi ---
    loadPage("beranda"); // Muat beranda secara default

    // --- Logika Navigasi ---
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const pageName = item.getAttribute("data-page");
            loadPage(pageName);
            if (window.innerWidth <= 768 && navMenu) {
                navMenu.classList.remove("active");
            }
        });
    });

    // --- Cek Sesi Refresh ---
    const savedRole = sessionStorage.getItem("userRole");
    if (savedRole) {
        setLoggedInUI(savedRole);
    }

    // --- Fungsi Utama untuk Memuat Halaman (SPA) ---
    async function loadPage(page) {
        try {
            contentArea.innerHTML = '<h3 class="loading-text">Memuat...</h3>';

            // Logika Khusus Halaman
            if (page === "nilai") {
                loadNilaiIframe();
                return;
            } else if (page === "latihan") {
                loadLatihanInputPage();
                return;
            } else if (page === "soal") {
                // Jangan muat halaman soal langsung, harus lewat alur kode soal -> mulai
                if (!ujianData.semuaSoal.length) {
                    loadPage("latihan");
                    return;
                }
            }

            // Muat Halaman Lainnya
            const response = await fetch(`pages/${page}.html`);
            if (!response.ok) throw new Error("Halaman tidak ditemukan");
            const html = await response.text();
            contentArea.innerHTML = html;

            // Inisialisasi Spesifik Halaman
            if (page === "soal") {
                initSoalPage();
            }

        } catch (error) {
            contentArea.innerHTML = `<h3 class="error-text">Error 404: ${error.message}</h3>`;
        }
    }

    // --- Fungsi Pendukung Navigasi ---
    function loadNilaiIframe() {
        contentArea.innerHTML = `
            <iframe 
                src="Nilai/index.html" 
                class="rapor-iframe"
                title="Aplikasi e-Rapor">
            </iframe>
        `;
    }

    // --- Logika Halaman Latihan (Input Kode Soal) ---
    function loadLatihanInputPage() {
        contentArea.innerHTML = `
            <div class="latihan-container">
                <h2>Latihan TKA</h2>
                <p>Silakan masukkan kode soal ujian Anda untuk memulai.</p>
                <form id="kode-soal-form" class="kode-soal-form">
                    <input type="text" id="kode-soal-input" placeholder="Contoh: TKA01" required>
                    <button type="submit">Lanjut</button>
                    <div id="kode-alert" class="alert-box" style="display:none;"></div>
                </form>
            </div>
        `;

        document.getElementById("kode-soal-form").addEventListener("submit", handleKodeSoalSubmit);
    }

    async function handleKodeSoalSubmit(e) {
        e.preventDefault();
        const kodeSoalInput = document.getElementById("kode-soal-input").value;
        const kodeAlert = document.getElementById("kode-alert");

        // Cek Kode Soal ke Server
        kodeAlert.style.display = "none";
        kodeAlert.innerText = "";
        
        try {
            // Kita gunakan doGet di GAS untuk mengambil semua soal dan memfilternya di client
            const response = await fetch(`${SCRIPT_URL}?action=getSoalByKode&kode=${kodeSoalInput}`);
            const result = await response.json();

            if (result.status === "sukses") {
                ujianData.semuaSoal = result.data;
                ujianData.kodeSoal = kodeSoalInput;
                showConfirmModal(kodeSoalInput);
            } else {
                kodeAlert.innerText = result.message;
                kodeAlert.className = "alert-box error";
                kodeAlert.style.display = "block";
            }
        } catch (error) {
            kodeAlert.innerText = "Terjadi kesalahan koneksi.";
            kodeAlert.className = "alert-box error";
            kodeAlert.style.display = "block";
        }
    }

    // --- Logika Modal Konfirmasi ---
    function showConfirmModal(kodeSoal) {
        modalKodeSoalText.innerText = kodeSoal;
        confirmModal.style.display = "block";
    }

    function closeConfirmModal() {
        confirmModal.style.display = "none";
    }

    btnCancelModal.addEventListener("click", closeConfirmModal);

    btnStartExam.addEventListener("click", () => {
        closeConfirmModal();
        loadPage("soal");
    });

    // --- Logika Halaman Soal (Pagination) ---
    function initSoalPage() {
        ujianData.currentSoalIndex = 0;
        ujianData.jawabanSiswa = {}; // Reset jawaban
        
        document.getElementById("soal-kode-display").innerText = ujianData.kodeSoal;

        // Ambil waktu dari database soal (jika ada, asumsi sisaWaktuDetik dari server)
        // ujianData.sisaWaktuDetik = result.waktu * 60;
        
        renderCurrentSoal();
        // startTimer(); // Implementasikan fungsi timer jika diperlukan

        document.getElementById("btn-prev-soal").addEventListener("click", showPreviousSoal);
        document.getElementById("btn-next-soal").addEventListener("click", showNextSoal);
        document.getElementById("btn-submit-ujian").addEventListener("click", handleSubmitUjian);
    }

    function renderCurrentSoal() {
        const soal = ujianData.semuaSoal[ujianData.currentSoalIndex];
        const soalContent = document.getElementById("soal-content");
        
        // Buat HTML untuk satu soal
        const html = renderSoalItem(soal, ujianData.currentSoalIndex + 1);
        soalContent.innerHTML = html;

        // Set Jawaban yang Sudah Disimpan (jika siswa kembali ke soal ini)
        if (ujianData.jawabanSiswa[soal.id]) {
            setSavedJawaban(soal, ujianData.jawabanSiswa[soal.id]);
        }

        updateNavigationButtons();
    }

    function renderSoalItem(soal, nomor) {
        let html = `
            <div class="soal-item" data-soal-id="${soal.id}" data-tipe="${soal.tipe}">
                <p class="soal-pertanyaan"><strong>${nomor}.</strong> ${soal.pertanyaan} <span class="soal-poin">(${soal.poin} Poin)</span></p>
                <div class="soal-jawaban-area">
        `;

        // Render Opsi Jawaban berdasarkan Tipe
        if (soal.tipe === "PG") {
            soal.pilihan.forEach(pil => {
                html += `<label><input type="radio" name="jawaban_${soal.id}" value="${pil}"> ${pil}</label>`;
            });
        } else if (soal.tipe === "PG_Kompleks") {
            soal.pilihan.forEach(pil => {
                html += `<label><input type="checkbox" name="jawaban_${soal.id}" value="${pil}"> ${pil}</label>`;
            });
        } else if (soal.tipe === "Isian") {
            html += `<input type="text" name="jawaban_${soal.id}" placeholder="Ketik jawaban Anda di sini">`;
        } else if (soal.tipe === "Esai") {
            html += `<textarea name="jawaban_${soal.id}" rows="4" placeholder="Ketik jawaban lengkap Anda di sini"></textarea>`;
        } else if (soal.tipe === "Tarik_Garis") {
            // Implementasikan logika Tarik Garis (mungkin butuh library external atau logic tersendiri)
            html += `<p class="warning-text">Fitur Tarik Garis belum diimplementasikan sepenuhnya.</p>`;
        } else if (soal.tipe === "Benar_Salah") {
            html += `<label><input type="radio" name="jawaban_${soal.id}" value="Benar"> Benar</label>`;
            html += `<label><input type="radio" name="jawaban_${soal.id}" value="Salah"> Salah</label>`;
        }

        html += `
                </div>
            </div>
        `;
        return html;
    }

    function showPreviousSoal() {
        saveCurrentJawaban();
        ujianData.currentSoalIndex--;
        renderCurrentSoal();
    }

    function showNextSoal() {
        saveCurrentJawaban();
        ujianData.currentSoalIndex++;
        renderCurrentSoal();
    }

    function updateNavigationButtons() {
        const btnPrev = document.getElementById("btn-prev-soal");
        const btnNext = document.getElementById("btn-next-soal");
        const btnSubmit = document.getElementById("btn-submit-ujian");

        btnPrev.style.display = (ujianData.currentSoalIndex === 0) ? "none" : "block";
        btnNext.style.display = (ujianData.currentSoalIndex === ujianData.semuaSoal.length - 1) ? "none" : "block";
        btnSubmit.style.display = (ujianData.currentSoalIndex === ujianData.semuaSoal.length - 1) ? "block" : "none";
    }

    function saveCurrentJawaban() {
        const soalItem = document.querySelector(".soal-item");
        const soalId = soalItem.dataset.soalId;
        const tipe = soalItem.dataset.tipe;
        let jawaban = "";

        if (tipe === "PG" || tipe === "Benar_Salah") {
            const selected = document.querySelector(`input[name="jawaban_${soalId}"]:checked`);
            if (selected) jawaban = selected.value;
        } else if (tipe === "PG_Kompleks") {
            const selected = document.querySelectorAll(`input[name="jawaban_${soalId}"]:checked`);
            jawaban = Array.from(selected).map(input => input.value).join(",");
        } else if (tipe === "Isian") {
            jawaban = document.querySelector(`input[name="jawaban_${soalId}"]`).value;
        } else if (tipe === "Esai") {
            jawaban = document.querySelector(`textarea[name="jawaban_${soalId}"]`).value;
        }

        if (jawaban) {
            ujianData.jawabanSiswa[soalId] = jawaban;
        }
    }

    function setSavedJawaban(soal, jawaban) {
        if (soal.tipe === "PG" || soal.tipe === "Benar_Salah") {
            const input = document.querySelector(`input[name="jawaban_${soal.id}"][value="${jawaban}"]`);
            if (input) input.checked = true;
        } else if (soal.tipe === "PG_Kompleks") {
            const jawabanArray = jawaban.split(",");
            jawabanArray.forEach(jwb => {
                const input = document.querySelector(`input[name="jawaban_${soal.id}"][value="${jwb}"]`);
                if (input) input.checked = true;
            });
        } else if (soal.tipe === "Isian") {
            document.querySelector(`input[name="jawaban_${soal.id}"]`).value = jawaban;
        } else if (soal.tipe === "Esai") {
            document.querySelector(`textarea[name="jawaban_${soal.id}"]`).value = jawaban;
        }
    }

    async function handleSubmitUjian() {
        saveCurrentJawaban(); // Simpan jawaban soal terakhir

        if (!confirm("Apakah Anda yakin ingin mengumpulkan ujian ini?")) return;

        clearInterval(ujianData.timer);
        contentArea.innerHTML = '<h3 class="loading-text">Menyimpan jawaban...</h3>';

        const payload = {
            action: "submit_ujian",
            nama_siswa: sessionStorage.getItem("userName"),
            kode_soal: ujianData.kodeSoal,
            jawaban: ujianData.jawabanSiswa
        };

        try {
            const response = await fetch(SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.status === "sukses") {
                // Tampilkan halaman hasil ujian sederhana (Buat di `pages/hasil.html`)
                loadPage("hasil"); 
            } else {
                alert("Gagal menyimpan jawaban: " + result.message);
                // Kembalikan ke soal terakhir?
                loadPage("soal");
            }

        } catch (error) {
            alert("Terjadi kesalahan koneksi.");
            loadPage("soal");
        }
    }

    // --- Logika Login/Logout ---
    contentArea.addEventListener("submit", async function(e) {
        if (e.target.id === "login-form") {
            handleLoginSubmit(e);
        }
    });

    async function handleLoginSubmit(e) {
        e.preventDefault();
        const userVal = document.getElementById("username").value;
        const passVal = document.getElementById("password").value;
        const btnLogin = document.getElementById("btn-login");
        const loginAlert = document.getElementById("login-alert");

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
                loginAlert.innerText = `Selamat datang, ${result.nama}!`;
                loginAlert.className = "alert-box sukses";
                loginAlert.style.display = "block";

                sessionStorage.setItem("userRole", result.role);
                sessionStorage.setItem("userName", result.nama);

                setLoggedInUI(result.role);

                setTimeout(() => {
                    loadPage("beranda");
                }, 1500);

            } else {
                loginAlert.innerText = result.message;
                loginAlert.className = "alert-box error";
                loginAlert.style.display = "block";
            }
        } catch (error) {
            loginAlert.innerText = "Terjadi kesalahan koneksi.";
            loginAlert.className = "alert-box error";
            loginAlert.style.display = "block";
        } finally {
            btnLogin.innerText = "Masuk";
            btnLogin.disabled = false;
        }
    }

    if (btnLogoutNav) {
        btnLogoutNav.addEventListener("click", handleLogout);
    }

    function handleLogout(e) {
        e.preventDefault();
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("userName");
        
        // Sembunyikan menu khusus
        document.getElementById("menu-rapor").style.display = "none";
        btnLogoutNav.style.display = "none";
        
        document.getElementById("tombol-login-nav").style.display = "block";
        navMenu.classList.remove("active");
        
        alert("Anda telah berhasil keluar.");
        loadPage("beranda");
    }

    function setLoggedInUI(role) {
        document.getElementById("tombol-login-nav").style.display = "none";
        document.getElementById("tombol-logout-nav").style.display = "block";
        
        if (role.toLowerCase() === "guru") {
            document.getElementById("menu-rapor").style.display = "block";
        }
    }
});
