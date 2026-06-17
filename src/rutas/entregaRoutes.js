const express = require('express');
const router = express.Router();
const { registrarEntrega, obtenerEntregas } = require('../controlador/entregaController');

router.post('/', registrarEntrega);
router.get('/', obtenerEntregas);

module.exports = router;