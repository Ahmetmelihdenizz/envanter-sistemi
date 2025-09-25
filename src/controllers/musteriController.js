const { db } = require('../db');

exports.liste = (req, res) => {
    const { q = '' } = req.query;
    const searchTerm = `%${q}%`;

    db.all(
        `SELECT * FROM musteriler 
     WHERE tenant_id = ? AND (
       unvan LIKE ? OR 
       IFNULL(eposta, '') LIKE ? OR 
       IFNULL(telefon, '') LIKE ?
     )
     ORDER BY id DESC`,
        [req.tenant_id, searchTerm, searchTerm, searchTerm],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.json(rows);
        }
    );
};

exports.olustur = (req, res) => {
    const { unvan, vergi_no, telefon, eposta, adres } = req.body;

    if (!unvan || !unvan.trim()) {
        return res.status(400).json({ hata: 'Müşteri ünvanı zorunlu' });
    }

    db.run(
        `INSERT INTO musteriler (tenant_id, unvan, vergi_no, telefon, eposta, adres, aktif) 
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [req.tenant_id, unvan.trim(), vergi_no || null, telefon || null, eposta || null, adres || null],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.status(201).json({ id: this.lastID, mesaj: 'Müşteri oluşturuldu' });
        }
    );
};

exports.guncelle = (req, res) => {
    const { id } = req.params;
    const { unvan, vergi_no, telefon, eposta, adres, aktif = 1 } = req.body;

    if (!unvan || !unvan.trim()) {
        return res.status(400).json({ hata: 'Müşteri ünvanı zorunlu' });
    }

    db.run(
        `UPDATE musteriler 
     SET unvan = ?, vergi_no = ?, telefon = ?, eposta = ?, adres = ?, aktif = ?
     WHERE id = ? AND tenant_id = ?`,
        [unvan.trim(), vergi_no || null, telefon || null, eposta || null, adres || null, aktif, id, req.tenant_id],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.json({ guncellenen: this.changes });
        }
    );
};

exports.sil = (req, res) => {
    const { id } = req.params;

    db.run(
        `DELETE FROM musteriler WHERE id = ? AND tenant_id = ?`,
        [id, req.tenant_id],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.json({ silinen: this.changes });
        }
    );
};