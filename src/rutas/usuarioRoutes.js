const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controlador/usuarioController');

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

module.exports = router;