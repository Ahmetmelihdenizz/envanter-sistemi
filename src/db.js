const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'envanter.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
    } else {
        console.log('SQLite veritabanına bağlandı.');
    }
});

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;');
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA synchronous = NORMAL;');
});

function execSql(sql) {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function runMigrations() {
    try {
        const schemaPath = path.join(__dirname, 'models', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await execSql(schema);
        console.log('Tablo yapısı oluşturuldu.');

        const seedPath = path.join(__dirname, 'models', 'seed.sql');
        if (fs.existsSync(seedPath)) {
            const seed = fs.readFileSync(seedPath, 'utf8');
            await execSql(seed);
            console.log('Örnek veriler yüklendi.');
        }
    } catch (error) {
        console.error('Migration hatası:', error);
        throw error;
    }
}

module.exports = { db, runMigrations };