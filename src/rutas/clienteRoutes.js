const express = require('express');
const router = express.Router();
const clienteController = require('../controlador/clienteController');

// Rutas del CRUD
router.get('/', clienteController.obtenerClientes);
router.post('/', clienteController.crearCliente);
router.put('/:id', clienteController.actualizarCliente); // Ruta para actualizar
router.delete('/:id', clienteController.eliminarCliente); // Ruta para eliminar

module.exports = router;