PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS tenantler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS kullanicilar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  ad TEXT,
  email TEXT NOT NULL,
  sifre_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'okuyucu',
  aktif INTEGER NOT NULL DEFAULT 1,
  UNIQUE(tenant_id, email),
  FOREIGN KEY(tenant_id) REFERENCES tenantler(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kategoriler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  ad TEXT NOT NULL,
  aciklama TEXT,
  UNIQUE(tenant_id, ad),
  FOREIGN KEY(tenant_id) REFERENCES tenantler(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS musteriler(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  unvan TEXT NOT NULL,
  vergi_no TEXT,
  telefon TEXT,
  eposta TEXT,
  adres TEXT,
  aktif INTEGER DEFAULT 1,
  FOREIGN KEY(tenant_id) REFERENCES tenantler(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cihaz_turleri(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  ad TEXT NOT NULL,
  UNIQUE(tenant_id, ad),
  FOREIGN KEY(tenant_id) REFERENCES tenantler(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cihazlar(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  musteri_id INTEGER NOT NULL,
  tur_id INTEGER,
  marka TEXT, 
  model TEXT, 
  seri_no TEXT,
  ip TEXT, 
  mac TEXT,
  garanti_bitis DATE,
  aciklama TEXT,
  aktif INTEGER DEFAULT 1,
  UNIQUE(tenant_id, seri_no),
  FOREIGN KEY(tenant_id) REFERENCES tenantler(id) ON DELETE CASCADE,
  FOREIGN KEY(musteri_id) REFERENCES musteriler(id) ON DELETE CASCADE,
  FOREIGN KEY(tur_id) REFERENCES cihaz_turleri(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bakim_sozlesmeleri(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  musteri_id INTEGER NOT NULL,
  ad TEXT NOT NULL,
  baslangic DATE, 
  bitis DATE,
  sla_saat INTEGER DEFAULT 8,
  kapsama TEXT,
  aktif INTEGER DEFAULT 1,
  FOREIGN KEY(tenant_id) REFERENCES tenantler(id) ON DELETE CASCADE,
  FOREIGN KEY(musteri_id) REFERENCES musteriler(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS servis_kayitlari(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  musteri_id INTEGER NOT NULL,
  cihaz_id INTEGER,
  sozlesme_id INTEGER,
  konu TEXT NOT NULL,
  durum TEXT DEFAULT 'acik',
  oncelik TEXT DEFAULT 'orta',
  acilis_ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  kapanis_ts DATETIME,
  aciklama TEXT,
  FOREIGN KEY(tenant_id) REFERENCES tenantler(id) ON DELETE CASCADE,
  FOREIGN KEY(musteri_id) REFERENCES musteriler(id) ON DELETE CASCADE,
  FOREIGN KEY(cihaz_id) REFERENCES cihazlar(id) ON DELETE SET NULL,
  FOREIGN KEY(sozlesme_id) REFERENCES bakim_sozlesmeleri(id) ON DELETE SET NULL
);