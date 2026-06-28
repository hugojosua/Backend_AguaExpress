const express = require('express');
const router = express.Router();
const { obtenerReportes } = require('../controlador/reportesController');

router.get('/', obtenerReportes);

module.exports = router;