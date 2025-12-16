// --- 1. KONFIGURASI ---
const MY_WA = "6281775232136";

// --- 2. DATA PRODUK (STATIC) ---
// --- 2. DATA PRODUK (Update Gambar Unsplash Stabil) ---
// --- GANTI BAGIAN INI SAJA ---

const PRODUCTS = [
  {
    id: 1,
    name: "Kertas HVS A4 Sinar Dunia 80gsm (1 Rim)",
    category: "Kertas",
    price: 45000,
    image: "TBMO Kertas HVS Sidu Sinar Dunia A4 70gsm Per Rim.jpeg",
    rating: 5,
    reviews: 124,
    isBestSeller: true,
    description:
      "Kertas HVS berkualitas tinggi dengan ketebalan 80gsm, cocok untuk kebutuhan cetak dokumen penting.",
  },
  {
    id: 2,
    name: "Pulpen Standard AE7 Hitam (1 Pack)",
    category: "Alat Tulis",
    price: 18000,
    image: "PULPEN Standard AE7 (12PCS).jpeg",
    rating: 4.8,
    reviews: 89,
    description:
      "Pulpen standard yang nyaman digunakan dengan tinta hitam pekat anti macet.",
  },
  {
    id: 3,
    name: "Stapler Max HD-10",
    category: "Perlengkapan Kantor",
    price: 12000,
    image: "MAX (MAX Brand) HD-10NX Stapler 1 Unit.jpeg",
    rating: 5,
    reviews: 210,
    description:
      "Stapler kecil yang kuat dan tahan lama, cocok untuk menjilid kertas hingga 20 lembar.",
  },
  {
    id: 4,
    name: "Ordner Bantex PVC Blue Folio 7cm",
    category: "Filing",
    price: 38000,
    image: "ODNER BANTEX A4 7 CM ( 1450) KODE 732.jpeg",
    rating: 4.7,
    reviews: 42,
    description:
      "Ordner berkualitas tinggi untuk menyimpan dokumen arsip kantor Anda agar rapi.",
  },
  {
    id: 5,
    name: "Buku Agenda Kulit Sintetis A5",
    category: "Buku",
    price: 49500,
    image: "Buku Agenda.jpeg",
    rating: 4.9,
    reviews: 56,
    description: "Buku agenda dengan cover kulit sintetis yang elegan.",
  },
  {
    id: 6,
    name: "Kalkulator Casio MX-12B",
    category: "Elektronik",
    price: 89000,
    image:
      "Kalkulator CASIO MX-12B Office Calculator Desktop 12 B - Hijau.jpeg",
    rating: 4.6,
    reviews: 75,
    description: "Kalkulator 12 digit yang awet dan akurat.",
  },
  {
    id: 7,
    name: "Spidol Whiteboard Snowman",
    category: "Alat Tulis",
    price: 8500,
    image: "ABG12 SNOWMAN WHITEBOARD MARKERS ABG-12 RJT.jpeg",
    rating: 4.9,
    reviews: 300,
    description: "Spidol papan tulis yang mudah dihapus.",
  },
  {
    id: 8,
    name: "Gunting Kenko Besar SC-848N",
    category: "Perlengkapan Kantor",
    price: 12000,
    image: "KENKO GUNTING BESAR 848 (PCS).jpeg",
    rating: 4.5,
    reviews: 92,
    description: "Gunting tajam anti karat dengan gagang ergonomis.",
  },
];

// ... (kode PRODUCTS dan CATEGORIES di atas biarkan saja) ...

// --- STATE MANAGEMENT (Cari bagian ini) ---
let cart = JSON.parse(localStorage.getItem("ud_cart") || "[]");
let currentUser = localStorage.getItem("ud_user");
let currentState = { page: "home", params: {} };

// 👇 TAMBAHKAN 2 BARIS INI
let isLoginMode = true;
let isAuthOpen = false; // Penanda apakah modal sedang terbuka

// --- 4. HELPER ---
const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

// --- 5. NAVIGASI ---
function navigate(page, params = {}) {
  currentState = { page, params };
  window.scrollTo(0, 0);
  renderApp();
}

// --- 6. LOGIKA KERANJANG ---
function saveCart() {
  localStorage.setItem("ud_cart", JSON.stringify(cart));
  // PENTING: Panggil renderApp() agar seluruh layar (termasuk total harga) di-refresh
  renderApp();
}

// Update fungsi window.addToCart agar otomatis tercentang saat masuk keranjang
window.addToCart = function (id, qty = 1) {
  // Cek Login
  if (!currentUser) {
    alert("Silakan Login dulu!");
    toggleAuth(true);
    return;
  }

  const product = PRODUCTS.find((p) => p.id === id);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.quantity += qty;
  } else {
    // --- PERUBAHAN DI SINI ---
    // Tambahkan 'selected: true' agar barang baru langsung tercentang
    cart.push({ ...product, quantity: qty, selected: true });
  }

  saveCart();
  alert("Berhasil masuk keranjang!");
};

window.updateQty = function (id, delta) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity < 1) item.quantity = 1;
    saveCart();
  }
};

window.removeFromCart = function (id) {
  if (confirm("Hapus item ini?")) {
    cart = cart.filter((i) => i.id !== id);
    saveCart();
  }
};

// Fungsi untuk mencentang/hapus centang barang
window.toggleSelect = function (id) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.selected = !item.selected; // Balik status (true jadi false, dst)
    saveCart(); // Simpan perubahan agar tidak hilang saat refresh
  }
};

// --- 7. AUTHENTICATION ---
window.toggleAuth = function (show) {
  isAuthOpen = show; // Simpan status
  renderApp(); // Render ulang layar
};
window.switchAuthMode = function () {
  isLoginMode = !isLoginMode; // Ganti mode (Login <-> Daftar)
  isAuthOpen = true; // Pastikan modal tetap terbuka
  renderApp(); // Render ulang layar dengan mode baru
};
window.handleAuth = async function (e) {
  e.preventDefault();
  const f = e.target;

  // Ambil nilai input berdasarkan NAME attribute agar akurat
  const username = f.username.value;
  const password = f.password.value;
  const name = f.fullname ? f.fullname.value : ""; // Hanya ada saat daftar

  const endpoint = isLoginMode ? "/api/login" : "/api/register";
  const payload = isLoginMode
    ? { username, password }
    : { username, password, name };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      // Jika sukses, simpan sesi
      const userLogged = isLoginMode ? username : username; // Bisa disesuaikan
      localStorage.setItem("ud_user", userLogged);
      currentUser = userLogged;

      toggleAuth(false);
      renderApp();
      alert(
        isLoginMode
          ? "Login Berhasil!"
          : "Pendaftaran Berhasil! Anda sudah login."
      );
    } else {
      // Jika gagal (password salah / user sudah ada)
      alert(data.message || "Gagal memproses akun.");
    }
  } catch (err) {
    console.error(err);
    // Fallback: Simulasi Login jika server mati/tidak ada route auth
    alert("Mode Offline/Simulasi: Login Berhasil!");
    localStorage.setItem("ud_user", username);
    currentUser = username;
    toggleAuth(false);
    renderApp();
  }
};
// GANTI TOTAL FUNGSI INI
window.socialLogin = function (provider) {
  let loginUrl;

  if (provider === "Google") {
    // Halaman Login Google
    loginUrl = "https://accounts.google.com/signin/v2/identifier";
  } else if (provider === "Facebook") {
    // Halaman Login Facebook
    loginUrl = "https://www.facebook.com/login/";
  } else {
    alert("Penyedia layanan tidak valid.");
    return;
  }

  // Buka halaman login di jendela baru (simulasi otorisasi)
  const popup = window.open(loginUrl, "_blank", "width=600,height=600");

  // Setelah 2 detik (simulasi login selesai/otorisasi berhasil), kita anggap sukses login
  // Di dunia nyata, ini dilakukan oleh server backend
  setTimeout(() => {
    popup.close(); // Tutup jendela login

    // Simulasikan login sukses
    const simulatedUsername = `user_${provider.toLowerCase()}`;
    localStorage.setItem("ud_user", simulatedUsername);
    currentUser = simulatedUsername;

    toggleAuth(false); // Tutup modal login utama
    renderApp(); // Refresh tampilan

    alert(
      `✅ Login dengan ${provider} berhasil (Simulasi)! Selamat datang, ${simulatedUsername}.`
    );
  }, 2000); // Tunggu 2 detik
};

// --- LOGIKA PROSES LOGIN/DAFTAR ---
window.handleAuth = async function (e) {
  e.preventDefault();
  const f = e.target;

  // Ambil data dengan aman berdasarkan 'name' di input
  // (Gunakan ?.value || '' untuk jaga-jaga kalau input tidak ada di mode tertentu)
  const username = f.username ? f.username.value : "";
  const password = f.password ? f.password.value : "";
  const fullname = f.fullname ? f.fullname.value : "";

  // Validasi Sederhana
  if (!username || !password) {
    alert("Mohon isi username dan password!");
    return;
  }

  // Tampilkan Loading (Ubah teks tombol)
  const btn = f.querySelector('button[type="submit"]');
  const oldText = btn.innerText;
  btn.innerText = "Memproses...";
  btn.disabled = true;

  // --- COBA LOGIN KE DATABASE ---
  try {
    const endpoint = isLoginMode ? "/api/login" : "/api/register";
    const payload = isLoginMode
      ? { username, password }
      : { username, password, name: fullname };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Cek apakah responnya JSON valid
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        "Server tidak mengembalikan JSON (Mungkin offline/error)"
      );
    }

    const data = await res.json();

    if (data.success) {
      loginSuccess(username);
    } else {
      alert(data.message || "Gagal memproses akun.");
      btn.innerText = oldText;
      btn.disabled = false;
    }
  } catch (err) {
    console.warn("Server Error/Offline:", err);
    // FALLBACK: JIKA SERVER ERROR, TETAP BIARKAN MASUK (SIMULASI)
    alert("Mode Offline: Login Berhasil (Data disimpan di browser)");
    loginSuccess(username);
  }
};

// Fungsi pembantu biar tidak nulis ulang
function loginSuccess(user) {
  localStorage.setItem("ud_user", user);
  currentUser = user;
  isAuthOpen = false; // Tutup modal
  renderApp();
  alert(`Selamat datang, ${user}!`);
}

window.logout = function () {
  localStorage.removeItem("ud_user");
  currentUser = null;
  cart = [];
  saveCart();
  navigate("home");
};

// --- 8. RENDERER (TAMPILAN) ---

function renderNavbar() {
  const total = cart.reduce((a, b) => a + b.quantity, 0);
  const active = (p) =>
    currentState.page === p
      ? "text-accent font-bold"
      : "text-navy hover:text-primary";

  // Perhatikan ID container navbar agar sesuai dengan script renderApp nanti
  return `
    <nav class="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center gap-3 cursor-pointer" onclick="navigate('home')">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
                <span class="material-symbols-outlined text-2xl">storefront</span>
            </div>
            <span class="text-navy text-xl font-bold tracking-tight font-heading">UD. Amanah</span>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <a href="#" onclick="navigate('home')" class="text-sm font-medium transition-colors ${active(
              "home"
            )}">Beranda</a>
            <a href="#" onclick="navigate('catalog')" class="text-sm font-medium transition-colors ${active(
              "catalog"
            )}">Produk</a>
            <a href="#" onclick="navigate('about')" class="text-sm font-medium transition-colors ${active(
              "about"
            )}">Tentang Kami</a>
            <a href="#" onclick="navigate('contact')" class="text-sm font-medium transition-colors ${active(
              "contact"
            )}">Kontak</a>
          </div>
          <div class="flex items-center gap-4">
            <button onclick="navigate('cart')" class="relative p-2 text-navy hover:text-accent transition-colors">
              <span class="material-symbols-outlined">shopping_cart</span>
              ${
                total > 0
                  ? `<span class="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">${total}</span>`
                  : ""
              }
            </button>
            ${
              currentUser
                ? `<button onclick="logout()" class="text-sm text-red-500 font-bold border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">Keluar</button>`
                : `<button onclick="toggleAuth(true)" class="bg-accent text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors">Masuk</button>`
            }
          </div>
        </div>
      </div>
    </nav>`;
}

function renderHome() {
  const featured = PRODUCTS.slice(0, 4)
    .map((p) => createCard(p))
    .join("");
  return `
    <div class="animate-fade-in">
        <section class="relative bg-navy py-16 md:py-24 overflow-hidden">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div class="w-full md:w-1/2 space-y-6">
                    <span class="text-accent font-bold tracking-wider uppercase text-sm">Pusat Alat Tulis Terlengkap</span>
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">Solusi Kebutuhan <br><span class="text-accent">Kantor & Sekolah</span></h1>
                    <p class="text-lg text-gray-300 leading-relaxed">Dapatkan produk berkualitas dengan harga terbaik. Kami melayani pembelian eceran dan grosir.</p>
                    <div class="flex flex-wrap gap-4 pt-4">
                        <button onclick="navigate('catalog')" class="px-8 py-4 bg-accent hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all">Belanja Sekarang</button>
                    </div>
                </div>
                <div class="w-full md:w-1/2">
                    <div class="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
                        <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174" class="w-full h-full object-cover">
                    </div>
                </div>
            </div>
        </section>
        
        <section class="py-20 bg-background-light">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center mb-10">
                    <h2 class="text-3xl font-heading font-bold text-navy">Produk Terlaris</h2>
                    <button onclick="navigate('catalog')" class="text-accent font-bold">Lihat Semua</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">${featured}</div>
            </div>
        </section>
    </div>`;
}

function renderCatalog() {
  const cards = PRODUCTS.map((p) => createCard(p)).join("");
  return `
    <div class="bg-background-off min-h-screen pb-20 animate-fade-in">
        <div class="bg-white border-b border-gray-200 pt-8 pb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-heading font-bold text-navy">Katalog Produk</h1>
                <p class="text-gray-500 mt-2">Temukan berbagai kebutuhan kantor berkualitas.</p>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${cards}
            </div>
        </div>
    </div>`;
}

function renderDetail(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p)
    return '<div class="pt-32 text-center text-xl">Produk tidak ditemukan</div>';

  return `
    <div class="bg-neutral-50 min-h-screen py-8 animate-fade-in">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onclick="navigate('catalog')" class="flex items-center text-sm text-gray-500 mb-8 hover:text-primary">
                <span class="material-symbols-outlined mr-2 text-sm">arrow_back</span> Kembali
            </button>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-16">
                <div class="lg:col-span-7">
                    <img src="${
                      p.image
                    }" class="w-full rounded-2xl border border-gray-200 shadow-sm aspect-[4/3] object-cover">
                </div>
                <div class="lg:col-span-5 flex flex-col">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent w-fit mb-4">Stok Tersedia</span>
                    <h1 class="text-3xl font-heading font-bold text-navy mb-2">${
                      p.name
                    }</h1>
                    <div class="text-3xl font-bold text-navy mb-6">${fmt(
                      p.price
                    )}</div>
                    <p class="text-gray-600 leading-relaxed mb-8">${
                      p.description
                    }</p>
                    <div class="flex gap-4">
                        <div class="flex items-center border border-gray-300 rounded-lg h-12 w-32 bg-white">
                            <button onclick="if(tempQty>1)document.getElementById('dq').innerText=--tempQty" class="flex-1 h-full hover:bg-gray-50 flex items-center justify-center"><span class="material-symbols-outlined text-sm">remove</span></button>
                            <span id="dq" class="font-bold text-navy">${tempQty}</span>
                            <button onclick="document.getElementById('dq').innerText=++tempQty" class="flex-1 h-full hover:bg-gray-50 flex items-center justify-center"><span class="material-symbols-outlined text-sm">add</span></button>
                        </div>
                        <button onclick="addToCart(${
                          p.id
                        }, tempQty)" class="flex-1 h-12 bg-accent hover:bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors">
                            <span class="material-symbols-outlined">shopping_cart</span> Masuk Keranjang
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

// GANTI TOTAL FUNGSI renderCartPage() INI
function renderCartPage() {
    // Tampilan jika keranjang kosong
    if (cart.length === 0) return `<div class="min-h-screen flex flex-col items-center justify-center bg-neutral-50"><h2 class="text-2xl font-bold text-navy mb-4">Keranjang Kosong</h2><button onclick="navigate('catalog')" class="bg-accent text-white px-6 py-2 rounded-lg font-bold shadow-md">Belanja Sekarang</button></div>`;
    
    // Hitung Total (Hanya yang dicentang)
    const selectedItems = cart.filter(i => i.selected !== false);
    const total = selectedItems.reduce((a, b) => a + (b.price * b.quantity), 0);
    const count = selectedItems.length;

    return `
    <div class="bg-neutral-50 min-h-screen py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-10">
            
            <div class="flex-1 flex flex-col gap-6">
                <div class="flex justify-between items-center pb-4 border-b border-gray-200">
                    <h1 class="text-2xl font-bold text-navy">Keranjang Belanja</h1>
                    <span class="text-sm text-gray-500">${cart.length} Barang</span>
                </div>

                ${cart.map(i => `
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 flex gap-4 items-center">
                        <div class="flex items-center h-full pl-2">
                            <input type="checkbox" onchange="toggleSelect(${i.id})" ${i.selected !== false ? 'checked' : ''} class="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent cursor-pointer">
                        </div>

                        <img src="${i.image}" class="w-20 h-20 object-cover rounded-md bg-neutral-100 border border-gray-100">
                        
                        <div class="flex-1 min-w-0">
                            <h3 class="font-bold text-navy text-sm sm:text-base truncate">${i.name}</h3>
                            <p class="text-accent font-bold mt-1 text-sm sm:text-base">${fmt(i.price)}</p>
                        </div>
                        
                        <div class="flex items-center border border-gray-300 rounded-lg h-9 bg-gray-50">
                            <button onclick="updateQty(${i.id}, -1)" class="w-8 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 rounded-l-lg">
                                <span class="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span class="w-8 text-center font-bold text-sm text-navy bg-white h-full flex items-center justify-center border-x border-gray-300">${i.quantity}</span>
                            <button onclick="updateQty(${i.id}, 1)" class="w-8 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 rounded-r-lg">
                                <span class="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                        
                        <button onclick="removeFromCart(${i.id})" class="text-red-400 hover:text-red-600 p-2 transition-colors">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                `).join('')}
            </div>

            <div class="w-full lg:w-[380px]">
                <div class="bg-white rounded-xl shadow-lg border border-neutral-100 p-6 sticky top-24">
                    <h3 class="text-lg font-bold text-navy mb-6">Ringkasan Belanja</h3>
                    
                    <div class="flex justify-between items-center mb-2 text-sm text-gray-600">
                        <span>Total Barang Dipilih</span>
                        <span class="font-bold text-navy">${count} item</span>
                    </div>
                    
                    <div class="flex justify-between items-center mb-6 pt-4 border-t border-gray-100">
                        <span class="font-bold text-lg text-navy">Total Harga</span>
                        <span class="font-bold text-2xl text-accent">${fmt(total)}</span>
                    </div>

                    <button onclick="navigate('checkout')" 
                        ${count === 0 ? 'disabled' : ''} 
                        class="w-full ${count === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-accent hover:bg-green-600 shadow-md'} text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all">
                        Beli (${count}) <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

// --- RENDER CHECKOUT PAGE BARU ---
function renderCheckoutPage() {
    const selectedItems = cart.filter(i => i.selected !== false);
    
    // Jika tidak ada barang terpilih, kembali ke keranjang
    if (selectedItems.length === 0) {
        setTimeout(() => navigate('cart'), 100); 
        return `<div class="p-10 text-center"><h1 class="text-xl font-bold">Tidak ada barang untuk di-checkout.</h1><p>Mengarahkan kembali ke keranjang...</p></div>`;
    }
    
    const total = selectedItems.reduce((a, b) => a + (b.price * b.quantity), 0);

    return `
    <div class="bg-neutral-50 min-h-screen py-10">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-navy mb-8 border-b pb-4">Lanjut ke Pembayaran</h1>
            
            <div class="flex flex-col lg:flex-row gap-8">
                
                <div class="flex-1 bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-navy mb-6">Detail Pengiriman</h2>
                    
                    <form onsubmit="handleCheckoutSubmit(event)" class="space-y-4">
                        <input type="text" id="checkout-name" name="name" placeholder="Nama Penerima (Wajib)" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-accent outline-none text-sm" required>
                        
                        <input type="tel" id="checkout-wa" name="wa" placeholder="Nomor WhatsApp (Wajib)" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-accent outline-none text-sm" required>
                        
                        <textarea id="checkout-address" name="addr" placeholder="Alamat Lengkap (Wajib)" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-accent outline-none text-sm" required></textarea>
                        
                        
                        <h2 class="text-xl font-bold text-navy pt-6 mb-4 border-t">Rincian Barang (${selectedItems.length} Item)</h2>
                        <ul class="space-y-3 mb-6">
                            ${selectedItems.map(i => `
                                <li class="flex justify-between text-sm text-gray-700">
                                    <span class="truncate">${i.name} (${i.quantity}x)</span>
                                    <span class="font-bold">${fmt(i.price * i.quantity)}</span>
                                </li>
                            `).join('')}
                        </ul>
                        
                        <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span class="font-bold text-xl text-navy">Total Bayar</span>
                            <span class="font-bold text-3xl text-accent">${fmt(total)}</span>
                        </div>
                        
                        <button type="submit" class="w-full mt-6 bg-accent hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5">
                            Konfirmasi Pesanan & Bayar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}
// GANTI FUNGSI INI DI script.js
// Cari fungsi ini:
// --- GANTI TOTAL FUNGSI handleCheckoutSubmit INI DI script.js ---
// --- GANTI TOTAL FUNGSI INI DI script.js ---
// --- GANTI TOTAL FUNGSI INI DI script.js ---
window.handleCheckoutSubmit = async function(e) {
    e.preventDefault();
    const f = e.target;
    
    // 1. Ambil data
    const name = f.name.value;
    const wa = f.wa.value;
    const address = f.addr.value;
    
    const selectedItems = cart.filter(i => i.selected !== false);
    const total = selectedItems.reduce((a, b) => a + (b.price * b.quantity), 0);
    
    const payload = { 
        name, 
        wa, 
        total, 
        items: selectedItems.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price })) 
    };
    
    const btn = f.querySelector('button[type="submit"]');
    const oldText = btn.innerText;
    btn.innerText = "Memproses...";
    btn.disabled = true;

    // 2. SIAPKAN PESAN WA dan BUKA JENDELA POPUP
    const waMessage = `Halo UD. Amanah, saya ingin melakukan pemesanan.\n\n*Total:* ${fmt(total)}\n*Penerima:* ${name}\n*Alamat:* ${address}`;
    const waUrl = `https://wa.me/${MY_WA}?text=${encodeURIComponent(waMessage)}`;
    
    const waWindow = window.open('about:blank', '_blank'); 
    let serverSuccess = false; // Flag status server

    // 3. KIRIM DATA KE SERVER
    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (data.success) {
            serverSuccess = true;
            // Jika server sukses, pesan WA bisa lebih detail (misal: ada Order ID)
            const successMessage = `Pesanan #${data.orderId || 'BARU'} berhasil dibuat! Silakan konfirmasi di WhatsApp.`;
            alert(successMessage);
        } else {
            // Server merespons 200 OK, tapi dengan status success: false
            alert(`Gagal menyimpan pesanan ke database: ${data.message}`);
        }
    } catch (error) {
        // Error Jaringan/Koneksi (Server Offline/DB Error)
        console.error('Error saat mencoba menyimpan pesanan:', error);
        alert('Server Offline atau Gagal Terhubung. Melanjutkan proses via WhatsApp (Tanpa simpan database).');
    }

    // 4. FINALISASI: Selalu arahkan ke WA, lalu bersihkan keranjang jika berhasil atau status diabaikan.
    
    // Arahkan jendela yang sudah dibuka
    waWindow.location.href = waUrl;

    // Bersihkan keranjang & navigasi
    cart = cart.filter(item => item.selected === false);
    localStorage.setItem('ud_cart', JSON.stringify(cart));
    
    // Reset tombol
    btn.innerText = oldText;
    btn.disabled = false;
    
    // Kembali ke home setelah semua selesai (agar form tidak submit ganda)
    navigate('home'); 
}
function renderAbout() {
  return `
    <div class="animate-fade-in bg-white">
        <div class="relative w-full overflow-hidden bg-neutral-50 py-12 md:py-20">
            <div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: radial-gradient(#2C3E50 1px, transparent 1px); background-size: 32px 32px;"></div>
            <div class="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
                <div class="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
                    <div class="w-full lg:w-1/2">
                        <div class="relative rounded-2xl overflow-hidden shadow-xl aspect-video lg:aspect-[4/3] bg-gray-100 group">
                            <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80" alt="Office" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                            <div class="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                            <div class="absolute bottom-6 left-6 text-white">
                                <p class="font-heading font-semibold text-sm bg-accent px-3 py-1 rounded-full w-fit mb-2">Sejak 2010</p>
                                <p class="text-sm opacity-90">Melayani dengan sepenuh hati</p>
                            </div>
                        </div>
                    </div>
                    <div class="w-full lg:w-1/2 flex flex-col gap-6">
                        <div class="flex flex-col gap-3 text-left">
                            <h1 class="text-primary font-heading text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight">
                                Mitra Terpercaya <br/> <span class="text-accent">Kebutuhan Kantor</span> Anda
                            </h1>
                            <p class="text-primary/70 text-lg leading-relaxed">
                                Berdiri sejak tahun 2010, UD. Amanah hadir di Lombok Timur untuk memenuhi kebutuhan alat tulis kantor Anda. Kami menggabungkan pelayanan profesional dengan kehangatan toko lokal yang Anda kenal.
                            </p>
                            <p class="text-primary/70 text-base leading-relaxed">
                                Kami percaya bahwa peralatan yang tepat dapat meningkatkan produktivitas. Dari UMKM hingga instansi pemerintah, kami siap menjadi partner penyediaan ATK berkualitas dengan harga yang kompetitif.
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-4 pt-2">
                            <button onclick="navigate('catalog')" class="bg-primary hover:bg-primary-light transition-colors text-white text-base font-heading font-semibold h-12 px-8 rounded-lg shadow-lg shadow-primary/20">
                                Lihat Katalog
                            </button>
                            <button onclick="navigate('contact')" class="flex items-center gap-2 bg-white border border-primary/10 hover:border-accent hover:text-accent transition-colors text-primary text-base font-heading font-medium h-12 px-6 rounded-lg">
                                <span class="material-symbols-outlined text-[20px]">location_on</span>
                                Lokasi Toko
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full bg-primary py-12">
            <div class="max-w-7xl mx-auto px-4 md:px-10">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    <div class="flex flex-col items-center text-center p-4">
                        <span class="text-accent font-heading text-5xl font-bold mb-2">10+</span>
                        <p class="text-white/80 text-sm font-medium uppercase tracking-wider">Tahun Pengalaman</p>
                    </div>
                    <div class="flex flex-col items-center text-center p-4">
                        <span class="text-accent font-heading text-5xl font-bold mb-2">500+</span>
                        <p class="text-white/80 text-sm font-medium uppercase tracking-wider">Produk Tersedia</p>
                    </div>
                    <div class="flex flex-col items-center text-center p-4">
                        <span class="text-accent font-heading text-5xl font-bold mb-2">1000+</span>
                        <p class="text-white/80 text-sm font-medium uppercase tracking-wider">Pelanggan Puas</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full bg-[#f8f9fa] py-20">
            <div class="max-w-7xl mx-auto px-4 md:px-10">
                <div class="flex flex-col gap-12">
                    <div class="flex flex-col gap-4 text-center max-w-3xl mx-auto">
                        <h2 class="text-primary font-heading text-3xl md:text-4xl font-bold leading-tight">
                            Visi & Misi Kami
                        </h2>
                        <p class="text-primary/60 text-lg">Komitmen kami untuk memberikan yang terbaik bagi pelanggan dan menjadi solusi produktivitas Anda.</p>
                    </div>
                    <div class="grid md:grid-cols-2 gap-8">
                        <div class="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:shadow-accent/5 border border-gray-100 transition-all duration-300">
                            <div class="size-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-[32px]">visibility</span>
                            </div>
                            <h3 class="text-primary font-heading text-xl font-bold mb-3">Visi</h3>
                            <p class="text-primary/70 leading-relaxed">
                                Menjadi toko ATK terlengkap dan terpercaya di Lombok Timur yang mendukung produktivitas UMKM, sekolah, dan perkantoran dengan standar pelayanan profesional.
                            </p>
                        </div>
                        <div class="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:shadow-accent/5 border border-gray-100 transition-all duration-300">
                            <div class="size-14 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-[32px]">flag</span>
                            </div>
                            <h3 class="text-primary font-heading text-xl font-bold mb-3">Misi</h3>
                            <ul class="flex flex-col gap-3 text-primary/70 leading-relaxed">
                                <li class="flex gap-3 items-start">
                                    <span class="material-symbols-outlined text-accent text-[20px] mt-0.5">check_circle</span>
                                    <span>Menyediakan produk berkualitas dengan harga bersaing.</span>
                                </li>
                                <li class="flex gap-3 items-start">
                                    <span class="material-symbols-outlined text-accent text-[20px] mt-0.5">check_circle</span>
                                    <span>Memberikan pelayanan yang ramah, cepat, dan solutif.</span>
                                </li>
                                <li class="flex gap-3 items-start">
                                    <span class="material-symbols-outlined text-accent text-[20px] mt-0.5">check_circle</span>
                                    <span>Membangun kemitraan jangka panjang dengan pelanggan.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderContact() {
  return `
    <div class="animate-fade-in bg-white min-h-screen flex flex-col">
        <section class="relative bg-neutral-50 py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
                    Hubungi UD. Amanah
                </h1>
                <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
                    Kami siap melayani kebutuhan operasional bisnis dan sekolah Anda.
                </p>
            </div>
        </section>

        <section class="py-12 md:py-16 bg-white flex-grow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div class="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all text-center group">
                        <div class="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                            <span class="material-symbols-outlined text-3xl">chat</span>
                        </div>
                        <h3 class="font-bold text-primary text-lg mb-2">WhatsApp</h3>
                        <p class="text-neutral-500 text-sm mb-4">Respon cepat untuk pemesanan.</p>
                        <a href="#" onclick="window.open('https://wa.me/${MY_WA}', '_blank'); return false;" class="text-lg font-bold text-accent hover:underline">+62 817-7522-3136</a>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all text-center group">
                        <div class="w-14 h-14 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <span class="material-symbols-outlined text-3xl">mail</span>
                        </div>
                        <h3 class="font-bold text-primary text-lg mb-2">Email</h3>
                        <p class="text-neutral-500 text-sm mb-4">Untuk penawaran kerjasama.</p>
                        <a href="mailto:info@udamanah.com" class="text-lg font-bold text-blue-600 hover:underline">info@udamanah.com</a>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all text-center group">
                        <div class="w-14 h-14 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <span class="material-symbols-outlined text-3xl">storefront</span>
                        </div>
                        <h3 class="font-bold text-primary text-lg mb-2">Toko Fisik</h3>
                        <p class="text-neutral-500 text-sm mb-4">Senin - Minggu, 08.00 - 22.00</p>
                        <p class="text-sm font-bold text-orange-600">Jl. TGH Umar No.118, Kelayu Utara, Kec. Selong, Kabupaten Lombok Timur, Nusa Tenggara Bar. 83613</p>
                    </div>
                </div>

                <div class="flex justify-center mb-16">
                    <button onclick="window.open('https://wa.me/${MY_WA}', '_blank')" class="flex items-center gap-3 bg-accent hover:bg-accent-hover text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg shadow-green-200 transition-transform hover:-translate-y-1">
                        <span class="material-symbols-outlined">chat_bubble</span>
                        Chat Langsung via WhatsApp
                    </button>
                </div>

                <div class="w-full bg-neutral-50 p-3 rounded-2xl border border-neutral-200 shadow-sm">
                    <div class="relative w-full h-[450px] rounded-xl overflow-hidden bg-gray-200">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252461.69581179298!2d116.15464927812496!3d-8.623431994722448!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4ee6f3397b5d%3A0xb3daa9b0131ff46!2sUD.%20Amanah%20Kelayu!5e0!3m2!1sen!2sus!4v1765563713249!5m2!1sen!2sus>" 
                            width="100%" 
                            height="100%" 
                            style="border:0;" 
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>

            </div>
        </section>

        <section class="bg-primary py-10 mt-auto">
            <div class="max-w-7xl mx-auto px-4 text-center text-white">
                <p class="text-lg font-medium opacity-90">
                    Melayani kebutuhan kantor dalam jumlah besar? 
                    <span class="font-bold underline cursor-pointer hover:text-accent-light" onclick="window.open('https://wa.me/${MY_WA}', '_blank')">Hubungi tim sales kami.</span>
                </p>
            </div>
        </section>
    </div>`;
}

// --- HELPER COMPONENT ---
function createCard(p) {
  // Gambar cadangan jika link mati
  const fallback = "https://via.placeholder.com/300x200?text=Produk+UD+Amanah";

  return `
    <div onclick="navigate('product', {id:${
      p.id
    }})" class="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col h-full">
        <div class="relative h-64 bg-neutral-100 overflow-hidden">
            <img 
                src="${p.image}" 
                alt="${p.name}"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onerror="this.onerror=null; this.src='${fallback}';"
            >
            ${
              p.isBestSeller
                ? '<div class="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">TERLARIS</div>'
                : ""
            }
        </div>
        
        <div class="p-4 flex flex-col flex-grow">
            <span class="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">${
              p.category
            }</span>
            <h3 class="font-bold text-primary text-sm leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">${
              p.name
            }</h3>
            
            <div class="mt-auto pt-2 flex justify-between items-center">
                <span class="text-base font-bold text-primary">${fmt(
                  p.price
                )}</span>
                <button onclick="event.stopPropagation(); addToCart(${
                  p.id
                })" class="w-8 h-8 rounded-full bg-neutral-100 text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                    <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    </div>`;
}

function renderFooter() {
  return `
    <footer class="bg-primary text-white pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                
                <div class="col-span-1">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                            <span class="material-symbols-outlined text-2xl">edit_note</span>
                        </div>
                        <span class="text-xl font-bold font-heading">UD. Amanah</span>
                    </div>
                    <p class="text-white/70 text-sm leading-relaxed">
                        Mitra terpercaya kebutuhan alat tulis kantor dan perlengkapan sekolah di Lombok Timur sejak 2010.
                    </p>
                </div>

                <div>
                    <h4 class="font-bold text-white mb-4 font-heading text-lg">Navigasi</h4>
                    <ul class="space-y-3 text-sm text-white/70">
                        <li><a href="#" onclick="navigate('home')" class="hover:text-accent-light transition-colors">Beranda</a></li>
                        <li><a href="#" onclick="navigate('catalog')" class="hover:text-accent-light transition-colors">Katalog Produk</a></li>
                        <li><a href="#" onclick="navigate('about')" class="hover:text-accent-light transition-colors">Tentang Kami</a></li>
                        <li><a href="#" onclick="navigate('contact')" class="hover:text-accent-light transition-colors">Kontak</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-white mb-4 font-heading text-lg">Legal</h4>
                    <ul class="space-y-3 text-sm text-white/70">
                        <li><a href="#" class="hover:text-accent-light transition-colors">Kebijakan Privasi</a></li>
                        <li><a href="#" class="hover:text-accent-light transition-colors">Syarat & Ketentuan</a></li>
                        <li><a href="#" class="hover:text-accent-light transition-colors">Pengembalian Barang</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-white mb-4 font-heading text-lg">Ikuti Kami</h4>
                    <div class="flex gap-4">
                        <a href="#" class="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:border-accent transition-colors">
                            <span class="material-symbols-outlined text-xl">public</span>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:border-accent transition-colors">
                            <span class="material-symbols-outlined text-xl">thumb_up</span>
                        </a>
                    </div>
                </div>
            </div>

            <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/50 text-sm">
                <p class="text-center md:text-left">© 2024 UD. Amanah. All rights reserved.</p>
                <div class="flex gap-6">
                    <span class="text-xs">Designed for Local Business</span>
                </div>
            </div>
        </div>
    </footer>`;
}
// --- FUNGSI BARU: RENDER MODAL LOGIN KEREN ---
// --- 8. RENDER AUTH MODAL (SUDAH DIPERBAIKI) ---
// --- GANTI TOTAL FUNGSI INI: renderAuthModal ---
function renderAuthModal() {
  // Ikon Social Media
  const iconGoogle = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;
  const iconFB = `<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

  return `
    <div id="auth-modal" class="fixed inset-0 z-[100] ${
      isAuthOpen ? "flex" : "hidden"
    } items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
            <button onclick="toggleAuth(false)" class="absolute top-4 right-4 text-gray-400 hover:text-red-500"><i data-lucide="x"></i></button>
            
            <div class="p-8">
                <div class="text-center mb-8">
                    <h3 class="text-2xl font-bold text-navy mb-2">${
                      isLoginMode ? "Masuk ke Akun" : "Daftar Akun"
                    }</h3>
                    <p class="text-gray-500 text-sm">Silakan gunakan metode masuk Anda</p>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-6">
                    <button onclick="socialLogin('Google')" class="flex items-center gap-2 justify-center py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-sm text-gray-700">
                        ${iconGoogle} Google
                    </button>
                    <button onclick="socialLogin('Facebook')" class="flex items-center gap-2 justify-center py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-sm text-gray-700">
                        ${iconFB} Facebook
                    </button>
                </div>

                <div class="relative flex items-center gap-4 mb-6">
                    <div class="h-px bg-gray-200 flex-1"></div>
                    <span class="text-xs text-gray-400 font-medium uppercase">Atau Manual</span>
                    <div class="h-px bg-gray-200 flex-1"></div>
                </div>

                <form onsubmit="handleAuth(event)" class="space-y-4">
                    ${
                      !isLoginMode
                        ? `
                        <div class="animate-fade-in space-y-4">
                            <input type="text" name="fullname" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-accent outline-none text-sm" placeholder="Nama Lengkap" required>
                            <input type="tel" name="whatsapp" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-accent outline-none text-sm" placeholder="Nomor WhatsApp" required>
                        </div>
                    `
                        : ""
                    }
                    
                    <input type="text" name="username" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-accent outline-none text-sm" placeholder="Username" required>
                    <input type="password" name="password" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-accent outline-none text-sm" placeholder="Password" required>
                    
                    <button type="submit" class="w-full bg-accent hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5">
                        ${isLoginMode ? "Masuk Sekarang" : "Daftar Sekarang"}
                    </button>
                </form>

                <p class="text-center mt-6 text-sm text-gray-500">
                    ${isLoginMode ? "Belum punya akun?" : "Sudah punya akun?"} 
                    <button onclick="switchAuthMode()" class="text-accent font-bold hover:underline ml-1">
                        ${isLoginMode ? "Daftar Disini" : "Masuk Disini"}
                    </button>
                </p>
            </div>
        </div>
    </div>`;
}
// --- MAIN RENDER ---
function renderApp() {
  const app = document.getElementById("app-root");
  if (!app) return;

  const { page, params } = currentState;
  let content = "";

  if (page === "home") content = renderHome();
  else if (page === "catalog") content = renderCatalog();
  else if (page === "product") content = renderProductDetail(params.id);
  else if (page === "cart") content = renderCartPage();
  else if (page === "checkout") content = renderCheckoutPage();
  else if (page === "about") content = renderAbout();
  else if (page === "contact") content = renderContact();

  // PERHATIKAN: Saya menambahkan + renderAuthModal() di akhir
  app.innerHTML =
    renderNavbar() +
    `<main class="flex-grow">${content}</main>` +
    renderFooter() +
    renderAuthModal();

  lucide.createIcons();
}

renderApp();
