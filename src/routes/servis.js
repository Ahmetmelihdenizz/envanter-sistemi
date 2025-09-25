const express = require('express');
const router = express.Router();
const servisController = require('../controllers/servisController');
const requireAdmin = require('../mw/roles');

router.get('/', servisController.liste);
router.post('/', requireAdmin(), servisController.olustur);
router.patch('/:id/durum', requireAdmin(), servisController.durumDegistir);

module.exports = router;