const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

router.post('/register', body('username').isString(), body('password').isLength({ min: 6 }), register);
router.post('/login', body('username').isString(), body('password').isString(), login);
router.post('/logout', authMiddleware, logout);

module.exports = router;
