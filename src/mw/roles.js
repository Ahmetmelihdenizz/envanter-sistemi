module.exports = function requireAdmin() {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(401).json({ hata: 'Kimlik doğrulama gerekli' });
        }

        if (req.user.rol !== 'admin') {
            return res.status(403).json({ hata: 'Sadece admin kullanıcılar işlem yapabilir' });
        }

        next();
    };
};