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
    // --- KODE SISTEM UJIAN (LATIHAN TKA) ---
    // Variabel global untuk CBT
    let currentExamCode = "";
    let loadedQuestions = [];
    let currentQuestionIndex = 0;
    let detailJawaban = {}; // Menyimpan jawaban siswa

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
            // Referensi DOM baru dari latihan.html
            const btnLanjut = document.getElementById("btn-lanjut-ujian");
            const inputKode = document.getElementById("kode-ujian");
            const tahapKode = document.getElementById("input-kode-container");
            const errorKode = document.getElementById("error-kode");
            
            const modalKonfirmasi = document.getElementById("modal-konfirmasi");
            const labelKodeUjian = document.getElementById("label-kode-ujian");
            const btnBatal = document.getElementById("btn-batal-mulai");
            const btnMulaiUjian = document.getElementById("btn-konfirmasi-mulai");
            
            const areaUjian = document.getElementById("area-ujian");
            const loadingSoal = document.createElement('div'); // Wadah loading sementara
                loadingSoal.id = "loading-soal";
                loadingSoal.style.cssText = "text-align: center; padding: 20px; display: none; color: #198754; font-weight: bold;";
                loadingSoal.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mencari dan mengacak soal...`;
            
            tahapKode.appendChild(loadingSoal); // Taruh loading di bawah tombol input

            if (btnLanjut) {
                // Alur 1: Masukkan Kode -> Muncul Modal Konfirmasi (Gambar 1)
                btnLanjut.addEventListener("click", () => {
                    const kodeDiminta = inputKode.value.trim().toUpperCase();
                    if(!kodeDiminta) return;
                    
                    currentExamCode = kodeDiminta; // Simpan kode
                    labelKodeUjian.innerText = kodeDiminta; // Update label di modal
                    modalKonfirmasi.style.display = "flex"; // Tampilkan modal
                    errorKode.style.display = "none";
                });
            }

            if (btnBatal) {
                btnBatal.addEventListener("click", () => {
                    modalKonfirmasi.style.display = "none";
                });
            }

            if (btnMulaiUjian) {
                // Alur 2: Klik 'Mulai' di Modal -> Muat Soal Satu per Satu (Gambar 2)
                btnMulaiUjian.addEventListener("click", async () => {
                    modalKonfirmasi.style.display = "none"; // Sembunyikan modal
                    tahapKode.style.display = "none"; // Sembunyikan input kode
                    loadingSoal.style.display = "block"; // Tampilkan loading

                    try {
                        // Tarik semua soal dari Google Sheets via GET
                        const response = await fetch(`${SCRIPT_URL}?action=get_questions&code=${currentExamCode}`);
                        
                        if (!response.ok) throw new Error("Gagal mengambil soal.");
                        
                        let semuaSoal = await response.json();

                        // Jika kodenya salah atau soal tidak ada
                        if (semuaSoal.length === 0) {
                            loadingSoal.style.display = "none";
                            tahapKode.style.display = "block";
                            errorKode.style.display = "block";
                            return;
                        }

                        // 1. Acak urutan soal secara random
                        semuaSoal = acakUrutan(semuaSoal);
                        
                        // 2. Simpan ke memori global
                        loadedQuestions = semuaSoal; 
                        currentQuestionIndex = 0; // Reset ke nomor 1
                        detailJawaban = {}; // Reset jawaban siswa

                        // 3. Update Label UI
                        document.getElementById("label-kode-aktif").innerText = currentExamCode;
                        document.getElementById("total-soal").innerText = loadedQuestions.length;

                        // 4. Tampilkan Soal Pertama dan Area Ujian
                        displayQuestion(0);
                        loadingSoal.style.display = "none";
                        areaUjian.style.display = "block";
                        
                    } catch (error) {
                        loadingSoal.innerHTML = `<span style="color:red;">Gagal memuat soal. Periksa koneksi atau URL Script Anda.</span>`;
                    }
                });
            }

            // Tombol Navigasi Soal
            document.getElementById("btn-sebelumnya").addEventListener("click", () => {
                if(currentQuestionIndex > 0) {
                    saveCurrentAnswer(); // Simpan jawaban saat ini
                    currentQuestionIndex--;
                    displayQuestion(currentQuestionIndex);
                }
            });

            document.getElementById("btn-berikutnya").addEventListener("click", () => {
                if(currentQuestionIndex < loadedQuestions.length - 1) {
                    saveCurrentAnswer(); // Simpan jawaban saat ini
                    currentQuestionIndex++;
                    displayQuestion(currentQuestionIndex);
                }
            });

            document.getElementById("btn-selesai-ujian").addEventListener("click", () => {
                saveCurrentAnswer(); // Simpan jawaban terakhir
                // Trigger form submit otomatis
                submitUjian(); 
            });
        }
    };

    // --- FUNGSI TAMPILKAN SOAL SATU PER SATU ---
    function displayQuestion(index) {
        const wadahTempatSoal = document.getElementById("tempat-soal");
        const soal = loadedQuestions[index];
        const no = index + 1;
        
        // Update Indikator Nomor
        document.getElementById("nomor-soal-aktif").innerText = no;

        // Navigasi Tampilan Tombol
        document.getElementById("btn-sebelumnya").style.display = (index === 0) ? "none" : "block";
        document.getElementById("btn-berikutnya").style.display = (index === loadedQuestions.length - 1) ? "none" : "block";
        document.getElementById("btn-selesai-ujian").style.display = (index === loadedQuestions.length - 1) ? "block" : "none";

        let htmlSoal = "";
        htmlSoal += `<div class="wadah-soal">`;
        htmlSoal += `<p class="pertanyaan">${soal.pertanyaan} <span class="poin-soal">(${soal.poin} Poin)</span></p>`;
        
        // Render berdasarkan Tipe Soal
        if (soal.tipe === "PG" || soal.tipe === "Benar_Salah") {
            // Ambil pilihan aslinya, tidak diacak urutannya agar Benar/Salah tidak terbalik
            soal.pilihan.forEach(pil => {
                if(pil.trim() !== "") {
                    // Cek apakah siswa sudah menjawab sebelumnya
                    const checked = (detailJawaban[soal.id] === pil) ? "checked" : "";
                    htmlSoal += `<label class="wadah-pilihan">
                        <input type="radio" name="jawaban_${soal.id}" value="${pil}" ${checked}> ${pil}
                    </label>`;
                }
            });
        } 
        else if (soal.tipe === "PG_Kompleks") {
            // Ambil jawaban sebelumnya, pisahkan koma
            const savedAnswers = detailJawaban[soal.id] ? detailJawaban[soal.id].split(',') : [];
            soal.pilihan.forEach(pil => {
                if(pil.trim() !== "") {
                    const checked = savedAnswers.includes(pil) ? "checked" : "";
                    htmlSoal += `<label class="wadah-pilihan">
                        <input type="checkbox" name="jawaban_${soal.id}" value="${pil}" ${checked}> ${pil}
                    </label>`;
                }
            });
        }
        else if (soal.tipe === "Isian") {
            const val = detailJawaban[soal.id] || "";
            htmlSoal += `<input type="text" name="jawaban_${soal.id}" class="input-isian" placeholder="Ketik jawaban singkat Anda..." value="${val}">`;
        }
        else if (soal.tipe === "Esai") {
            const val = detailJawaban[soal.id] || "";
            htmlSoal += `<textarea name="jawaban_${soal.id}" class="input-esai" rows="5" placeholder="Ketik penjelasan / jawaban lengkap Anda di sini...">${val}</textarea>`;
        }
        else if (soal.tipe === "Tarik_Garis") {
            htmlSoal += `<p style="font-size:13px; color:#666; margin-bottom:10px;"><i>Pilih pasangan yang tepat dari kotak dropdown:</i></p>`;
            soal.pilihan.forEach((pasangan, pIndex) => {
                if(pasangan.includes('=')) {
                    const parts = pasangan.split('=');
                    const savedVal = detailJawaban[`${soal.id}_${pIndex}`] || "";
                    htmlSoal += `<div class="wadah-tarik-garis">
                        <div class="item-tarik-garis">${parts[0]}</div>
                        <select name="jawaban_${soal.id}_${pIndex}" class="select-tarik-garis">
                            <option value="">-- Pilih Pasangan --</option>
                            <option value="${parts[1]}" ${savedVal === parts[1] ? "selected" : ""}>${parts[1]}</option>
                        </select>
                    </div>`;
                }
            });
        }
        htmlSoal += `</div>`;
        
        wadahTempatSoal.innerHTML = htmlSoal;
        // Scroll ke atas otomatis setiap pindah soal
        window.scrollTo(0, 0);
    }

    // --- FUNGSI SIMPAN JAWABAN SEMENTARA DI MEMORI ---
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
                    detailJawaban[`${soal.id}_${pIndex}`] = val; // Simpan per item
                }
            });
        }
    }

    // --- LOGIKA PENGIRIMAN & PENILAIAN UJIAN CBT ---
    async function submitUjian() {
        const areaUjian = document.getElementById("area-ujian");
        const btnSelesai = document.getElementById("btn-selesai-ujian");
        const hasilAlert = document.getElementById("hasil-ujian-alert");

        btnSelesai.innerText = "Mengirim Jawaban...";
        btnSelesai.disabled = true;
        
        let totalSkor = 0;
        let finalDetailJawaban = {}; // Untuk dikirim ke database

        // Kalkulasi poin otomatis berdasarkan tipe soal
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
                isBenar = null; // Dinilai manual guru
            }

            if (isBenar === true) totalSkor += soal.poin;
            
            // Simpan detail untuk database (Kode Soal: Pertanyaan => Jawaban)
            finalDetailJawaban[soal.pertanyaan.substring(0, 30) + "..."] = userJawaban;
        });

        // Kirim hasil ke Google Sheets via POST
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
                areaUjian.style.display = "none";
                hasilAlert.style.backgroundColor = "#d1e7dd";
                hasilAlert.style.color = "#0f5132";
                hasilAlert.innerHTML = `
                    <h3 style="margin-bottom:10px; font-size:1.8rem;">Luar Biasa!</h3>
                    <p>Jawaban untuk kode <b>${currentExamCode}</b> berhasil dikumpulkan.</p>
                    <hr style="border-top:2px dashed #198754; margin:15px 0;">
                    <p>Skor Pilihan Ganda/Objektif Anda:</p>
                    <span style="font-size:48px; color:#198754; display:block; margin:15px 0; font-weight:bold;">${totalSkor}</span>
                    <span style="font-size:12px; font-weight:normal; color:#666;">(Skor Esai menunggu pemeriksaan Bapak/Ibu Guru)</span>
                `;
                hasilAlert.style.display = "block";
                window.scrollTo(0, 0);
            }
        } catch (error) {
            alert("Terjadi kesalahan koneksi saat mengirim hasil. Silakan coba klik Selesai lagi.");
            btnSelesai.innerText = "Selesai";
            btnSelesai.disabled = false;
        }
    }
        
});
