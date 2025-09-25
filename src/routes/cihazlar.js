const express = require('express');
const router = express.Router();
const cihazController = require('../controllers/cihazController');
const requireAdmin = require('../mw/roles');

router.get('/', cihazController.liste);
router.post('/', requireAdmin(), cihazController.olustur);
router.put('/:id', requireAdmin(), cihazController.guncelle);
router.delete('/:id', requireAdmin(), cihazController.sil);

module.exports = router;