const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente } = require('../controlador/clienteController');

router.get('/', obtenerClientes);
router.post('/', crearCliente);

module.exports = router;