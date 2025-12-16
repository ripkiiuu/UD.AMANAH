const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. KONEKSI DATABASE
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'toko_amanah'
});

db.connect(err => {
    if(err) console.error("❌ ERROR DB: Pastikan XAMPP nyala!", err.message);
    else console.log("✅ DB BERHASIL: Terhubung ke MySQL");
});

// 2. DATA PRODUK
const PRODUCTS = [
  { id: 1, name: "Kertas HVS A4 Sinar Dunia", price: 45000, category: "Kertas", image: "https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?w=800", rating: 5, reviews: 124, isBestSeller: true, description: "Kertas HVS berkualitas." },
  { id: 2, name: "Pulpen Standard AE7", price: 18000, category: "Alat Tulis", image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800", rating: 4.8, reviews: 89 },
  { id: 3, name: "Stapler Max HD-10", price: 12000, category: "Kantor", image: "https://images.unsplash.com/photo-1626262458428-2649b5558230?w=800", rating: 5, reviews: 210 },
  { id: 4, name: "Ordner Bantex Blue", price: 38000, category: "Filing", image: "https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?w=800", rating: 4.7, reviews: 42 },
  { id: 5, name: "Agenda Kulit A5", price: 49500, category: "Buku", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800", rating: 4.9, reviews: 56 },
  { id: 6, name: "Kalkulator Casio 12D", price: 89000, category: "Elektronik", image: "https://images.unsplash.com/photo-1594729095022-97010538a8b1?w=800", rating: 4.6, reviews: 75 },
  { id: 7, name: "Spidol Snowman", price: 8500, category: "Alat Tulis", image: "https://images.unsplash.com/photo-1517427677506-ade074eb1432?w=800", rating: 4.9, reviews: 300 },
  { id: 8, name: "Gunting Besar", price: 12000, category: "Kantor", image: "https://images.unsplash.com/photo-1590240974864-16e9f2444b05?w=800", rating: 4.5, reviews: 92 }
];

app.get('/api/products', (req, res) => res.json(PRODUCTS));

// LOGIN & REGISTER (TETAP SAMA)
app.post('/api/register', (req, res) => {
    // Ambil data yang diperlukan
    const { username, password } = req.body;
    
    // Query INSERT
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
        if (err) {
            // Cek jika errornya adalah 'Duplicate Entry' (ER_DUP_ENTRY)
            if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                return res.status(400).json({ success: false, message: "Username sudah digunakan. Coba yang lain." });
            }
            
            // Error database lain
            console.error("Registrasi Error DB:", err);
            return res.status(500).json({ success: false, message: "Gagal Daftar karena kesalahan server/database." });
        }
        
        // SUKSES: Kirim username kembali
        res.json({ success: true, username: username, message: "Pendaftaran Berhasil!" });
    });
});

app.post('/api/login', (req, res) => {
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [req.body.username, req.body.password], (err, results) => {
        if (results.length > 0) res.json({ success: true, username: results[0].username });
        else res.status(401).json({ success: false, message: "Gagal Login" });
    });
});

// 3. CHECKOUT (HANYA DATABASE - TANPA MIDTRANS)
// GANTI TOTAL FUNGSI INI DI server.js
app.post('/api/checkout', (req, res) => {
    const { name, wa, total, items } = req.body;
    
    // Validasi dasar
    if (!name || !wa || !total || !items || items.length === 0) {
         return res.status(400).json({ success: false, message: "Data pesanan tidak lengkap." });
    }

    // Buat Order ID
    const orderId = 'ORD-' + Date.now();

    console.log(`📥 Menyimpan Pesanan #${orderId}: ${name} | Total: ${total}`);

    // Query SQL
    // Pastikan nama kolom 'items' di database bisa menampung JSON stringified
    const sql = 'INSERT INTO orders (order_id, customer_name, customer_wa, total_amount, items, status) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [orderId, name, wa, total, JSON.stringify(items), 'pending'], (err) => {
        if (err) {
            console.error("❌ Gagal Masuk Database:", err.message);
            // Kunci sukses adalah merespons 500 jika ada error database
            return res.status(500).json({ success: false, message: "Database Error saat menyimpan pesanan." });
        }
        
        console.log("✅ SUKSES: Data tersimpan di Tabel Orders!");
        // Kirim respon sukses ke frontend, termasuk orderId
        res.json({ success: true, orderId: orderId, message: "Pesanan berhasil dibuat." });
    });
});

app.listen(PORT, () => console.log(`🚀 Server Database Ready di http://localhost:${PORT}`));