const jwt = require('jsonwebtoken');

module.exports = function auth(required = true) {
    return (req, res, next) => {
        const authHeader = req.header('Authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            if (!required) return next();
            return res.status(401).json({ hata: 'Token gerekli' });
        }

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');

            if (req.tenant_id && payload.tenant_id !== req.tenant_id) {
                return res.status(403).json({ hata: 'Tenant uyuşmazlığı' });
            }

            req.user = payload;
            next();
        } catch (error) {
            return res.status(401).json({ hata: 'Geçersiz veya süresi dolmuş token' });
        }
    };
};