document.addEventListener("DOMContentLoaded", () => {

    // --- Logika Menu Hamburger untuk HP ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzoa9ne43bhfZFD-lJ0zejgc4i2iEfM0fwsmo8q6sUgFqyMQndsnm8ufxVp-ptgFzo-/exec";
    
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
        
        // Jika role-nya guru, munculkan menu rapor
        if (savedRole.toLowerCase() === "guru") {
            document.getElementById("menu-rapor").style.display = "block";
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

                    // --- TAMBAHKAN KODE INI ---
                    // Cek jika role adalah Guru (pastikan tulisan sesuai dengan database di Google Sheet)
                    if (result.role.toLowerCase() === "guru") {
                        document.getElementById("menu-rapor").style.display = "block"; // Munculkan menu
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
            
            // 2. Sembunyikan menu khusus dan tombol logout
            document.getElementById("menu-rapor").style.display = "none";
            document.getElementById("tombol-logout-nav").style.display = "none";
            
            // 3. Munculkan kembali tombol Login
            document.getElementById("tombol-login-nav").style.display = "block";
            
            // 4. Tutup menu hamburger jika sedang dibuka di HP
            navMenu.classList.remove("active");
            
            // 5. Beri notifikasi dan kembalikan ke halaman beranda
            alert("Anda telah berhasil keluar dari sistem.");
            loadPage("beranda");
        });
    }


    // --- KODE SISTEM UJIAN (LATIHAN TKA) ---
    let dataSoalAktif = []; 

    // Fungsi untuk mengacak urutan elemen dalam array (Fisher-Yates Shuffle)
    function acakUrutan(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    const originalLoadPage = loadPage;
    loadPage = async function(page) {
        await originalLoadPage(page); 
        
        if (page === "latihan") {
            const btnMulai = document.getElementById("btn-mulai-ujian");
            const inputKode = document.getElementById("input-kode-ujian");
            const tahapKode = document.getElementById("tahap-kode-ujian");
            const errorKode = document.getElementById("error-kode");
            const loadingSoal = document.getElementById("loading-soal");
            const formUjian = document.getElementById("form-ujian");
            const tempatSoal = document.getElementById("tempat-soal");
            const inputKodeAktif = document.getElementById("kode-soal-aktif");
            const labelKodeAktif = document.getElementById("label-kode-aktif");
            
            if (btnMulai) {
                btnMulai.addEventListener("click", async () => {
                    const kodeDiminta = inputKode.value.trim().toUpperCase();
                    if(!kodeDiminta) return;

                    // Sembunyikan form input kode, munculkan loading
                    errorKode.style.display = "none";
                    tahapKode.style.display = "none";
                    loadingSoal.style.display = "block";

                    try {
                        // Tarik semua soal dari Google Sheets
                        const response = await fetch(SCRIPT_URL);
                        const semuaSoal = await response.json();

                        // 1. Saring soal: Hanya ambil yang kodenya sesuai input siswa
                        let soalSesuaiKode = semuaSoal.filter(soal => soal.kode.toUpperCase() === kodeDiminta);

                        // Jika kodenya salah atau soal tidak ada
                        if (soalSesuaiKode.length === 0) {
                            loadingSoal.style.display = "none";
                            tahapKode.style.display = "block";
                            errorKode.style.display = "block";
                            return;
                        }

                        // 2. Acak urutan soal secara random
                        soalSesuaiKode = acakUrutan(soalSesuaiKode);
                        
                        // Simpan ke memori agar bisa dinilai nanti
                        dataSoalAktif = soalSesuaiKode; 
                        inputKodeAktif.value = kodeDiminta;
                        labelKodeAktif.innerText = kodeDiminta;

                        // 3. Render HTML Soalnya
                        let htmlSoal = "";
                        soalSesuaiKode.forEach((soal, index) => {
                            const no = index + 1;
                            htmlSoal += `<div style="margin-bottom: 25px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">`;
                            htmlSoal += `<p style="font-weight: bold; margin-bottom: 15px; font-size: 16px;">${no}. ${soal.pertanyaan} <span style="font-size:12px; color:#198754; font-weight:normal; float:right;">(${soal.poin} Poin)</span></p>`;
                            
                            // Render berdasarkan Tipe Soal
                            if (soal.tipe === "PG" || soal.tipe === "Benar_Salah") {
                                // Opsional: Kita juga bisa mengacak urutan pilihan ganda di sini jika mau
                                const pilihanAcak = acakUrutan([...soal.pilihan]); 
                                pilihanAcak.forEach(pil => {
                                    if(pil.trim() !== "") {
                                        htmlSoal += `<label style="display: block; margin-bottom: 10px; cursor: pointer; background: white; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                                            <input type="radio" name="jawaban_${soal.id}" value="${pil}" required> ${pil}
                                        </label>`;
                                    }
                                });
                            } 
                            else if (soal.tipe === "PG_Kompleks") {
                                soal.pilihan.forEach(pil => {
                                    if(pil.trim() !== "") {
                                        htmlSoal += `<label style="display: block; margin-bottom: 10px; cursor: pointer; background: white; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                                            <input type="checkbox" name="jawaban_${soal.id}" value="${pil}"> ${pil}
                                        </label>`;
                                    }
                                });
                            }
                            else if (soal.tipe === "Isian") {
                                htmlSoal += `<input type="text" name="jawaban_${soal.id}" placeholder="Ketik jawaban singkat Anda..." style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size:15px;" required>`;
                            }
                            else if (soal.tipe === "Esai") {
                                htmlSoal += `<textarea name="jawaban_${soal.id}" rows="5" placeholder="Ketik penjelasan / jawaban lengkap Anda di sini..." style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size:15px;" required></textarea>`;
                            }
                            else if (soal.tipe === "Tarik_Garis") {
                                htmlSoal += `<p style="font-size:13px; color:#666; margin-bottom:10px;"><i>Pilih pasangan yang tepat dari kotak dropdown:</i></p>`;
                                soal.pilihan.forEach((pasangan, pIndex) => {
                                    if(pasangan.includes('=')) {
                                        const parts = pasangan.split('=');
                                        htmlSoal += `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                            <div style="flex: 1; background: #e9ecef; padding: 10px; border-radius: 4px; font-weight:bold;">${parts[0]}</div>
                                            <select name="jawaban_${soal.id}_${pIndex}" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
                                                <option value="">-- Pilih Pasangan --</option>
                                                <option value="${parts[1]}">${parts[1]}</option>
                                            </select>
                                        </div>`;
                                    }
                                });
                            }
                            htmlSoal += `</div>`;
                        });
                        
                        tempatSoal.innerHTML = htmlSoal;
                        loadingSoal.style.display = "none";
                        formUjian.style.display = "block";
                        
                    } catch (error) {
                        loadingSoal.innerHTML = `<span style="color:red;">Gagal memuat soal. Periksa koneksi internet Anda.</span>`;
                    }
                });
            }
        }
    };

    // --- LOGIKA PENGIRIMAN & PENILAIAN JAWABAN ---
    if (contentArea) {
        contentArea.addEventListener("submit", async function(e) {
            if (e.target.id === "form-ujian") {
                e.preventDefault();
                
                const btnSubmit = document.getElementById("btn-submit-ujian");
                const hasilAlert = document.getElementById("hasil-ujian-alert");
                const kodeAktif = document.getElementById("kode-soal-aktif").value; // Ambil kode yang sedang dikerjakan

                btnSubmit.innerText = "Mengirim Jawaban...";
                btnSubmit.disabled = true;
                
                let totalSkor = 0;
                let detailJawaban = {};
                const formData = new FormData(e.target);

                // Evaluasi / Koreksi otomatis
                dataSoalAktif.forEach(soal => {
                    let userJawaban = "";
                    let isBenar = false;

                    if (soal.tipe === "PG" || soal.tipe === "Benar_Salah" || soal.tipe === "Isian") {
                        userJawaban = formData.get(`jawaban_${soal.id}`) || "";
                        if (userJawaban.toLowerCase().trim() === soal.kunci.toLowerCase().trim()) isBenar = true;
                    } 
                    else if (soal.tipe === "PG_Kompleks") {
                        const checked = formData.getAll(`jawaban_${soal.id}`);
                        userJawaban = checked.join(",");
                        if (userJawaban === soal.kunci) isBenar = true;
                    }
                    else if (soal.tipe === "Tarik_Garis") {
                        let skorParsial = 0;
                        let itemTarikGaris = [];
                        soal.pilihan.forEach((pasangan, pIndex) => {
                            if(pasangan.includes('=')) {
                                const parts = pasangan.split('=');
                                const jwb = formData.get(`jawaban_${soal.id}_${pIndex}`);
                                itemTarikGaris.push(`${parts[0]}=>${jwb}`);
                                if(jwb === parts[1]) skorParsial += (soal.poin / soal.pilihan.length);
                            }
                        });
                        userJawaban = itemTarikGaris.join(" | ");
                        totalSkor += Math.round(skorParsial);
                        isBenar = null; 
                    }
                    else if (soal.tipe === "Esai") {
                        userJawaban = formData.get(`jawaban_${soal.id}`);
                        isBenar = null; 
                    }

                    if (isBenar === true) totalSkor += soal.poin;
                    
                    detailJawaban[soal.pertanyaan.substring(0, 30) + "..."] = userJawaban; // Simpan potongan soal dan jawabannya
                });

                try {
                    const payload = {
                        action: "submit_ujian",
                        nama_siswa: sessionStorage.getItem("userName"),
                        kode_soal: kodeAktif, // Kirim kode ujian ini ke database
                        total_poin: totalSkor,
                        detail_jawaban: detailJawaban
                    };

                    const response = await fetch(SCRIPT_URL, {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });
                    
                    const result = await response.json();
                    
                    if(result.status === "sukses") {
                        e.target.style.display = "none";
                        hasilAlert.style.backgroundColor = "#d1e7dd";
                        hasilAlert.style.color = "#0f5132";
                        hasilAlert.innerHTML = `
                            <h3 style="margin-bottom:10px;">Luar Biasa!</h3>
                            <p>Jawaban untuk kode <b>${kodeAktif}</b> berhasil dikumpulkan.</p>
                            <hr style="border-top:1px solid #198754; margin:15px 0;">
                            <p>Skor Pilihan Ganda/Objektif Anda:</p>
                            <span style="font-size:36px; color:#198754; display:block; margin:10px 0;">${totalSkor}</span>
                            <span style="font-size:12px; font-weight:normal; color:#666;">(Skor Esai akan dinilai secara manual oleh Bapak/Ibu Guru)</span>
                        `;
                        hasilAlert.style.display = "block";
                        
                        // Kembalikan siswa ke atas layar untuk melihat hasil
                        window.scrollTo(0, 0);
                    }
                } catch (error) {
                    alert("Terjadi kesalahan koneksi saat mengirim hasil. Pastikan internet stabil.");
                    btnSubmit.innerText = "Kumpulkan Jawaban";
                    btnSubmit.disabled = false;
                }
            }
        });
    }
});
