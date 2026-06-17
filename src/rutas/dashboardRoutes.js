const express = require('express');
const router = express.Router();
const { obtenerDashboardData } = require('../controlador/dashboardController');


router.get('/', obtenerDashboardData);

module.exports = router;