const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const requireAdmin = require('../mw/roles');

router.get('/', kategoriController.liste);
router.post('/', requireAdmin(), kategoriController.olustur);
router.put('/:id', requireAdmin(), kategoriController.guncelle);
router.delete('/:id', requireAdmin(), kategoriController.sil);

module.exports = router;