module.exports = function tenant() {
    return (req, res, next) => {
        const tenantHeader = req.header('X-Tenant');
        if (!tenantHeader) {
            return res.status(400).json({ hata: 'X-Tenant header gerekli' });
        }

        const tenantId = parseInt(tenantHeader, 10);
        if (!Number.isInteger(tenantId) || tenantId <= 0) {
            return res.status(400).json({ hata: 'Geçersiz X-Tenant değeri' });
        }

        req.tenant_id = tenantId;
        next();
    };
};