document.addEventListener("DOMContentLoaded", () => {

    // --- Logika Menu Hamburger untuk HP ---
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");


    
    const contentArea = document.getElementById("content-area");
    const navItems = document.querySelectorAll(".nav-item");

        mobileMenuBtn.addEventListener("click", () => {
        // Menambah/menghapus class 'active' untuk memunculkan/menyembunyikan menu
        navMenu.classList.toggle("active");
    });

    // Menutup menu otomatis setelah salah satu link diklik (khusus di HP)
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove("active");
            }
        });
    });

    // Fungsi untuk memuat halaman
    async function loadPage(page) {
        try {
            // Menampilkan loading sederhana (opsional)
            contentArea.innerHTML = '<h3 style="text-align:center; padding:50px;">Memuat...</h3>';
            
            // Mengambil file html dari folder pages
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
});
