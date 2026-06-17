const express = require('express');
const router = express.Router();
const { obtenerPendientesNotificacion, enviarNotificacionIndividual } = require('../controlador/notificacionesController');

router.get('/pendientes', obtenerPendientesNotificacion);
router.post('/enviar', enviarNotificacionIndividual);

module.exports = router;