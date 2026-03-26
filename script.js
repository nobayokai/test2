document.addEventListener("DOMContentLoaded", () => {

    // --- Logika Menu Hamburger untuk HP ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzpEhoLXQFFtP9r3jQR5c7UIuhgEgJrfFgBF4VC7Q7i85mibIwLnddk6cQ_ZcvVUIxL/exec";
    
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
            const btnLanjut = document.getElementById("btn-lanjut-ujian");
            const inputKode = document.getElementById("kode-ujian");
            const tahapKode = document.getElementById("input-kode-container");
            const errorKode = document.getElementById("error-kode");
            
            const modalKonfirmasi = document.getElementById("modal-konfirmasi");
            const labelKodeUjian = document.getElementById("label-kode-ujian");
            const btnBatal = document.getElementById("btn-batal-mulai");
            const btnMulaiUjian = document.getElementById("btn-konfirmasi-mulai");
            
            const areaUjian = document.getElementById("area-ujian");

            // Variabel sementara untuk menampung soal yang sudah disaring (sesuai kode)
            let soalSesuaiKode = [];

            if (btnLanjut) {
                // ALUR 1: Cek Kode Saat Klik 'Lanjut'
                btnLanjut.addEventListener("click", async () => {
                    const kodeDiminta = inputKode.value.trim().toUpperCase();
                    if(!kodeDiminta) return;
                    
                    // Ubah tombol jadi loading saat mengambil data dari Google Sheets
                    btnLanjut.innerText = "Memeriksa Kode...";
                    btnLanjut.disabled = true;
                    errorKode.style.display = "none";

                    try {
                        const response = await fetch(SCRIPT_URL);
                        const semuaSoal = await response.json();

                        // Saring hanya soal yang kodenya PERSIS sama dengan inputan siswa
                        soalSesuaiKode = semuaSoal.filter(soal => soal.kode.toUpperCase() === kodeDiminta);

                        if (soalSesuaiKode.length === 0) {
                            // JIKA KODE TIDAK VALID ATAU TIDAK ADA
                            errorKode.innerText = "Kode soal tidak valid! Pastikan kode soal sesuai.";
                            errorKode.style.display = "block";
                        } else {
                            // JIKA KODE VALID
                            currentExamCode = kodeDiminta; 
                            labelKodeUjian.innerText = kodeDiminta; 
                            modalKonfirmasi.style.display = "flex"; // Tampilkan Modal Konfirmasi
                        }
                    } catch (error) {
                        errorKode.innerText = "Gagal terhubung ke server. Periksa koneksi internet.";
                        errorKode.style.display = "block";
                    } finally {
                        // Kembalikan status tombol
                        btnLanjut.innerText = "Lanjut";
                        btnLanjut.disabled = false;
                    }
                });
            }

            if (btnBatal) {
                // Tutup modal jika batal
                btnBatal.addEventListener("click", () => {
                    modalKonfirmasi.style.display = "none";
                });
            }

            if (btnMulaiUjian) {
                // ALUR 2: Mulai Ujian setelah Konfirmasi
                btnMulaiUjian.addEventListener("click", () => {
                    modalKonfirmasi.style.display = "none"; // Sembunyikan modal
                    tahapKode.style.display = "none"; // Sembunyikan input kode

                    // Acak urutan soal yang HANYA SESUAI KODE tadi
                    loadedQuestions = acakUrutan(soalSesuaiKode); 
                    currentQuestionIndex = 0; // Mulai dari soal no 1
                    detailJawaban = {}; // Kosongkan jawaban sebelumnya (jika ada)

                    // Update informasi di UI
                    document.getElementById("label-kode-aktif").innerText = currentExamCode;
                    document.getElementById("total-soal").innerText = loadedQuestions.length;

                    // Tampilkan soal pertama dan buka area ujian
                    displayQuestion(0);
                    areaUjian.style.display = "block";
                });
            }

            // --- Tombol Navigasi Soal (Sebelumnya, Berikutnya, Selesai) ---
            document.getElementById("btn-sebelumnya").addEventListener("click", () => {
                if(currentQuestionIndex > 0) {
                    saveCurrentAnswer(); 
                    currentQuestionIndex--;
                    displayQuestion(currentQuestionIndex);
                }
            });

            document.getElementById("btn-berikutnya").addEventListener("click", () => {
                if(currentQuestionIndex < loadedQuestions.length - 1) {
                    saveCurrentAnswer(); 
                    currentQuestionIndex++;
                    displayQuestion(currentQuestionIndex);
                }
            });

            document.getElementById("btn-selesai-ujian").addEventListener("click", () => {
                saveCurrentAnswer(); 
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

            // Beri tahu siswa bahwa AI sedang bekerja
            btnSelesai.innerText = "Mengirim & Menganalisis dengan AI...";

            const response = await fetch(SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if(result.status === "sukses") {
                areaUjian.style.display = "none";
                
                // Isi data ke dalam template PDF yang tersembunyi
                document.getElementById("pdf-nama-siswa").innerText = payload.nama_siswa;
                document.getElementById("pdf-kode-ujian").innerText = currentExamCode;
                document.getElementById("pdf-skor-objektif").innerText = totalSkor;
                document.getElementById("pdf-analisis-ai").innerText = result.ai_feedback;

                // Tampilkan alert sukses dan tombol download PDF
                hasilAlert.style.backgroundColor = "#d1e7dd";
                hasilAlert.style.color = "#0f5132";
                hasilAlert.innerHTML = `
                    <h3 style="margin-bottom:10px; font-size:1.8rem;">Luar Biasa!</h3>
                    <p>Jawaban untuk kode <b>${currentExamCode}</b> berhasil dikumpulkan dan telah dianalisis.</p>
                    <hr style="border-top:2px dashed #198754; margin:15px 0;">
                    <p>Skor Pilihan Ganda/Objektif Anda:</p>
                    <span style="font-size:48px; color:#198754; display:block; margin:10px 0; font-weight:bold;">${totalSkor}</span>
                    <button id="btn-download-pdf" style="margin-top: 15px; padding: 12px 20px; background-color: #0dcaf0; color: #000; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 15px;">
                        <i class="fa-solid fa-file-pdf"></i> Unduh Analisis Rapor PDF
                    </button>
                `;
                hasilAlert.style.display = "block";
                window.scrollTo(0, 0);

                // --- LOGIKA PEMBUATAN PDF ---
                document.getElementById("btn-download-pdf").addEventListener("click", function() {
                    const elemenPdf = document.getElementById("wadah-rapor-pdf");
                    elemenPdf.style.display = "block"; // Munculkan sebentar untuk di-capture
                    
                    const opt = {
                      margin:       0.5,
                      filename:     `Rapor_${currentExamCode}_${payload.nama_siswa.replace(/\s+/g, '_')}.pdf`,
                      image:        { type: 'jpeg', quality: 0.98 },
                      html2canvas:  { scale: 2 },
                      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
                    };

                    // Generate PDF, lalu sembunyikan lagi elemennya
                    html2pdf().set(opt).from(elemenPdf).save().then(() => {
                        elemenPdf.style.display = "none";
                    });
                });
            }
        } catch (error) {
            alert("Terjadi kesalahan saat memproses hasil ujian.");
            btnSelesai.innerText = "Selesai";
            btnSelesai.disabled = false;
        }
    }
        
});
