const express = require('express');
const router = express.Router();
// Asumimos que creaste el controlador previamente en src/controllers/reportesController.js
const reportesController = require('../controllers/reportesController');

// Definir la ruta GET
router.get('/', reportesController.obtenerReportes);

module.exports = router;