const { db } = require('../db');

exports.liste = (req, res) => {
    const { q = '' } = req.query;
    const searchTerm = `%${q}%`;

    db.all(
        `SELECT * FROM kategoriler 
     WHERE tenant_id = ? AND (ad LIKE ? OR IFNULL(aciklama, '') LIKE ?)
     ORDER BY id DESC`,
        [req.tenant_id, searchTerm, searchTerm],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.json(rows);
        }
    );
};

exports.olustur = (req, res) => {
    const { ad, aciklama } = req.body;

    if (!ad || !ad.trim()) {
        return res.status(400).json({ hata: 'Kategori adı zorunlu' });
    }

    db.run(
        `INSERT INTO kategoriler (tenant_id, ad, aciklama) VALUES (?, ?, ?)`,
        [req.tenant_id, ad.trim(), aciklama || null],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.status(201).json({ id: this.lastID, mesaj: 'Kategori oluşturuldu' });
        }
    );
};

exports.guncelle = (req, res) => {
    const { id } = req.params;
    const { ad, aciklama } = req.body;

    if (!ad || !ad.trim()) {
        return res.status(400).json({ hata: 'Kategori adı zorunlu' });
    }

    db.run(
        `UPDATE kategoriler SET ad = ?, aciklama = ? WHERE id = ? AND tenant_id = ?`,
        [ad.trim(), aciklama || null, id, req.tenant_id],
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
        `DELETE FROM kategoriler WHERE id = ? AND tenant_id = ?`,
        [id, req.tenant_id],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.json({ silinen: this.changes });
        }
    );
};