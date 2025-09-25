const { db } = require('../db');

exports.liste = (req, res) => {
    const { musteri_id, q = '' } = req.query;
    const searchTerm = `%${q}%`;

    let whereClause = ['c.tenant_id = ?'];
    let params = [req.tenant_id];

    if (musteri_id) {
        whereClause.push('c.musteri_id = ?');
        params.push(musteri_id);
    }

    whereClause.push(`(
    IFNULL(c.seri_no, '') LIKE ? OR 
    IFNULL(c.marka, '') LIKE ? OR 
    IFNULL(c.model, '') LIKE ? OR 
    IFNULL(c.ip, '') LIKE ?
  )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);

    db.all(
        `SELECT c.*, m.unvan AS musteri_unvan, ct.ad AS tur_ad
     FROM cihazlar c
     LEFT JOIN musteriler m ON m.id = c.musteri_id AND m.tenant_id = c.tenant_id
     LEFT JOIN cihaz_turleri ct ON ct.id = c.tur_id AND ct.tenant_id = c.tenant_id
     WHERE ${whereClause.join(' AND ')}
     ORDER BY c.id DESC`,
        params,
        (err, rows) => {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.json(rows);
        }
    );
};

exports.olustur = (req, res) => {
    const { musteri_id, tur_id, marka, model, seri_no, ip, mac, garanti_bitis, aciklama } = req.body;

    if (!musteri_id) {
        return res.status(400).json({ hata: 'Müşteri ID zorunlu' });
    }

    db.run(
        `INSERT INTO cihazlar 
     (tenant_id, musteri_id, tur_id, marka, model, seri_no, ip, mac, garanti_bitis, aciklama, aktif)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [req.tenant_id, musteri_id, tur_id || null, marka || null, model || null, seri_no || null, ip || null, mac || null, garanti_bitis || null, aciklama || null],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.status(201).json({ id: this.lastID, mesaj: 'Cihaz oluşturuldu' });
        }
    );
};

exports.guncelle = (req, res) => {
    const { id } = req.params;
    const { musteri_id, tur_id, marka, model, seri_no, ip, mac, garanti_bitis, aciklama, aktif = 1 } = req.body;

    if (!musteri_id) {
        return res.status(400).json({ hata: 'Müşteri ID zorunlu' });
    }

    db.run(
        `UPDATE cihazlar 
     SET musteri_id = ?, tur_id = ?, marka = ?, model = ?, seri_no = ?, ip = ?, mac = ?, 
         garanti_bitis = ?, aciklama = ?, aktif = ?
     WHERE id = ? AND tenant_id = ?`,
        [musteri_id, tur_id || null, marka || null, model || null, seri_no || null, ip || null, mac || null, garanti_bitis || null, aciklama || null, aktif, id, req.tenant_id],
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
        `DELETE FROM cihazlar WHERE id = ? AND tenant_id = ?`,
        [id, req.tenant_id],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.json({ silinen: this.changes });
        }
    );
};