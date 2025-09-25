const express = require('express');
const router = express.Router();
const musteriController = require('../controllers/musteriController');
const requireAdmin = require('../mw/roles');

router.get('/', musteriController.liste);
router.post('/', requireAdmin(), musteriController.olustur);
router.put('/:id', requireAdmin(), musteriController.guncelle);
router.delete('/:id', requireAdmin(), musteriController.sil);

module.exports = router;