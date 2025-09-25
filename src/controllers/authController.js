const { db } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function createToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        rol: user.rol,
        tenant_id: user.tenant_id
    };

    const secret = process.env.JWT_SECRET || 'devsecret';
    const expiresIn = process.env.JWT_EXPIRES || '8h';

    return jwt.sign(payload, secret, { expiresIn });
}

exports.register = (req, res) => {
    const { ad, email, sifre } = req.body;
    const tenant_id = req.tenant_id;

    if (!email || !sifre) {
        return res.status(400).json({ hata: 'Email ve şifre zorunlu alanlar' });
    }

    // İlk kullanıcı mı kontrol et
    db.get(
        `SELECT COUNT(*) AS count FROM kullanicilar WHERE tenant_id = ?`,
        [tenant_id],
        async (err, row) => {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }

            const isFirstUser = (row?.count ?? 0) === 0;
            const rol = isFirstUser ? 'admin' : 'okuyucu';

            try {
                const hashedPassword = await bcrypt.hash(sifre, 10);

                db.run(
                    `INSERT INTO kullanicilar (tenant_id, ad, email, sifre_hash, rol, aktif) VALUES (?, ?, ?, ?, ?, 1)`,
                    [tenant_id, ad || null, email, hashedPassword, rol],
                    function (insertErr) {
                        if (insertErr) {
                            return res.status(500).json({ hata: insertErr.message });
                        }

                        res.status(201).json({
                            id: this.lastID,
                            rol: rol,
                            mesaj: 'Kullanıcı başarıyla oluşturuldu'
                        });
                    }
                );
            } catch (hashErr) {
                res.status(500).json({ hata: 'Şifre hashleme hatası' });
            }
        }
    );
};

exports.login = (req, res) => {
    const { email, sifre } = req.body;
    const tenant_id = req.tenant_id;

    if (!email || !sifre) {
        return res.status(400).json({ hata: 'Email ve şifre zorunlu' });
    }

    db.get(
        `SELECT * FROM kullanicilar WHERE tenant_id = ? AND email = ? AND aktif = 1`,
        [tenant_id, email],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ hata: err.message });
            }

            if (!user) {
                return res.status(401).json({ hata: 'Kullanıcı bulunamadı' });
            }

            try {
                const validPassword = await bcrypt.compare(sifre, user.sifre_hash);
                if (!validPassword) {
                    return res.status(401).json({ hata: 'Hatalı şifre' });
                }

                const token = createToken(user);

                res.json({
                    token,
                    rol: user.rol,
                    email: user.email,
                    ad: user.ad
                });
            } catch (compareErr) {
                res.status(500).json({ hata: 'Şifre doğrulama hatası' });
            }
        }
    );
};

exports.me = (req, res) => {
    res.json({ user: req.user });
};