const express = require('express');
const router = express.Router();
const { registrarPago, obtenerClientesDeudores } = require('../controlador/pagoController');

router.get('/deudores', obtenerClientesDeudores); // <- ESTA ES LA RUTA VITAL
router.post('/', registrarPago);

module.exports = router;