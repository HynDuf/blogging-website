const express = require('express');
const router = express.Router();

router.get('/homepage', (req, res) => res.render('../views/hbs/homepage.hbs'));
router.get('/', (req ,res) => res.redirect('/homepage'));
router.get('/login', (req, res) => res.render('../views/hbs/login.hbs'));
router.get('/register', (req, res) => res.render('../views/hbs/register.hbs'));
router.use('/auth', require('./auth'));

module.exports = router;
