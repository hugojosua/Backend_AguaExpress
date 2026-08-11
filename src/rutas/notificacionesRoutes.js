const express = require('express');
const router = express.Router();
const { obtenerPendientesNotificacion, enviarNotificacionIndividual, descartarNotificacion } = require('../controlador/notificacionesController');

router.get('/pendientes', obtenerPendientesNotificacion);
router.post('/enviar', enviarNotificacionIndividual);
router.post('/descartar', descartarNotificacion);

module.exports = router;