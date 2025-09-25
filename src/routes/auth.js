const express = require('express');
const router = express.Router();
const auth = require('../mw/auth');
const authController = require('../controllers/authController');

router.post('/register', auth(false), authController.register);
router.post('/login', auth(false), authController.login);
router.get('/me', auth(true), authController.me);

module.exports = router;