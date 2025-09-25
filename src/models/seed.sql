INSERT OR IGNORE INTO tenantler(id, ad) VALUES (1, 'Demo Tenant');

INSERT OR IGNORE INTO kategoriler(tenant_id, ad, aciklama)
VALUES (1,'Ağ Ürünleri','Switch/AP/Router'),
       (1,'Güvenlik','Firewall, IPS');

INSERT OR IGNORE INTO musteriler(tenant_id, unvan, telefon, eposta, adres, aktif)
VALUES (1,'Örnek A.Ş.','0 312 000 00 00','info@orneka.com','Ankara',1);

INSERT OR IGNORE INTO cihaz_turleri(tenant_id, ad)
VALUES (1,'Firewall'),(1,'Switch'),(1,'Access Point');