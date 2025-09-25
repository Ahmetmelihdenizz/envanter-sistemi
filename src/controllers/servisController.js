const { db } = require('../db');

exports.liste = (req, res) => {
    const { musteri_id, durum, q = '' } = req.query;
    const searchTerm = `%${q}%`;

    let whereClause = ['s.tenant_id = ?'];
    let params = [req.tenant_id];

    if (musteri_id) {
        whereClause.push('s.musteri_id = ?');
        params.push(musteri_id);
    }

    if (durum) {
        whereClause.push('s.durum = ?');
        params.push(durum);
    }

    whereClause.push('(s.konu LIKE ? OR IFNULL(s.aciklama, "") LIKE ?)');
    params.push(searchTerm, searchTerm);

    db.all(
        `SELECT s.*, m.unvan AS musteri_unvan, c.seri_no AS cihaz_seri
     FROM servis_kayitlari s
     LEFT JOIN musteriler m ON m.id = s.musteri_id AND m.tenant_id = s.tenant_id
     LEFT JOIN cihazlar c ON c.id = s.cihaz_id AND c.tenant_id = s.tenant_id
     WHERE ${whereClause.join(' AND ')}
     ORDER BY s.id DESC`,
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
    const { musteri_id, cihaz_id, sozlesme_id, konu, aciklama, oncelik } = req.body;

    if (!musteri_id || !konu) {
        return res.status(400).json({ hata: 'Müşteri ID ve konu zorunlu' });
    }

    db.run(
        `INSERT INTO servis_kayitlari 
     (tenant_id, musteri_id, cihaz_id, sozlesme_id, konu, aciklama, oncelik)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.tenant_id, musteri_id, cihaz_id || null, sozlesme_id || null, konu, aciklama || null, oncelik || 'orta'],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.status(201).json({ id: this.lastID, mesaj: 'Servis kaydı oluşturuldu' });
        }
    );
};

exports.durumDegistir = (req, res) => {
    const { id } = req.params;
    const { durum } = req.body;

    if (!durum) {
        return res.status(400).json({ hata: 'Durum değeri zorunlu' });
    }

    db.run(
        `UPDATE servis_kayitlari 
     SET durum = ?,
         kapanis_ts = CASE WHEN ? = 'kapatildi' THEN CURRENT_TIMESTAMP ELSE kapanis_ts END
     WHERE id = ? AND tenant_id = ?`,
        [durum, durum, id, req.tenant_id],
        function (err) {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }
            res.json({ guncellenen: this.changes });
        }
    );
};