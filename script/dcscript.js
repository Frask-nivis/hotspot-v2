const GifGuard = {
    observer: null,
    timeout: null,
    targetKeywords: ["monkey", "money"],
    excludeKeywords: ["confused-monkey"],

    start() {
        const globalTarget = document.querySelector("#app-mount");
        if (!globalTarget) return console.log("❌ Target tidak ditemukan.");

        // Kita beri jeda 250ms supaya tidak membebani sistem
        this.observer = new MutationObserver(() => {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.clean(), 250);
        });

        this.observer.observe(globalTarget, { 
            childList: true, 
            subtree: true 
        });
        
        this.clean();
        console.log("✅ GifGuard AKTIF (Mode Performa Tinggi).");
    },

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        clearTimeout(this.timeout);
        document.querySelectorAll('li[style*="display: none"]').forEach(el => el.style.display = '');
        console.log("🛑 GifGuard DIMATIKAN.");
    },

    clean() {
        // Hanya cari elemen yang belum diproses agar tidak kerja dua kali
        const selector = this.targetKeywords.map(k => `a[href*="${k}"]`).join(', ');
        const targets = document.querySelectorAll(selector);
        
        targets.forEach(t => {
            try {
                const container = t.closest('li');
                // Tambahkan pengecekan: hanya proses jika elemen masih terlihat
                if (container && container.style.display !== 'none') {
                    const href = t.href.toLowerCase();
                    const isForbidden = this.targetKeywords.some(word => href.includes(word));
                    const isExcluded = this.excludeKeywords.some(word => href.includes(word));

                    if (isForbidden && !isExcluded) {
                        container.style.display = 'none';
                        // Gunakan console.count agar log tidak memenuhi layar
                        console.count("🛡️ Pesan Disembunyikan");
                    }
                }
            } catch (e) {}
        });
    }
};

GifGuard.start();