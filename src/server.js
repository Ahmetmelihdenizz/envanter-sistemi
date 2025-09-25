require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { runMigrations } = require('./db');
const tenant = require('./mw/tenant');
const auth = require('./mw/auth');

const app = express();

// Güvenlik middleware'leri
app.use(helmet({
    contentSecurityPolicy: false // Frontend için geçici olarak kapatıldı
}));
app.use(cors({ origin: true, credentials: true }));

// Rate limiting
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 500 // maksimum 500 istek
}));

// Body parser middleware'leri
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Statik dosyalar
app.use(express.static(path.join(__dirname, '..', 'public')));

// Root'u login sayfasına yönlendir
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Request logging middleware
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} Content-Type: ${req.headers['content-type']}`);
        console.log('Request Body:', req.body);
    }
    next();
});

// Veritabanı migration'ları çalıştır
runMigrations().catch(err => {
    console.error('Migration hatası:', err);
    process.exit(1);
});

// Auth routes (token gerektirmez)
app.use('/api/auth', tenant(), require('./routes/auth'));

// Korumalı API routes (hepsi auth gerektirir, yazma işlemleri admin'e özel)
app.use('/api/kategoriler', tenant(), auth(true), require('./routes/kategoriler'));
app.use('/api/musteriler', tenant(), auth(true), require('./routes/musteriler'));
app.use('/api/cihazlar', tenant(), auth(true), require('./routes/cihazlar'));
app.use('/api/servis', tenant(), auth(true), require('./routes/servis'));

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ hata: 'Endpoint bulunamadı' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Sunucu hatası yakalandı:', err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        hata: err.message || 'Beklenmeyen sunucu hatası'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`📝 Login sayfası: http://localhost:${PORT}/login.html`);
});