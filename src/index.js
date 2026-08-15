const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos TODO el controlador de WhatsApp (incluyendo la función de la imagen QR)
const whatsappController = require('./controlador/whatsappController'); 

const notificacionesRoutes = require('./rutas/notificacionesRoutes');
const clienteRoutes = require('./rutas/clienteRoutes'); 
const entregaRoutes = require('./rutas/entregaRoutes'); 
const pagoRoutes = require('./rutas/pagoRoutes');       
const usuarioRoutes = require('./rutas/usuarioRoutes'); 
const dashboardRoutes = require('./rutas/dashboardRoutes');
const reportesRoutes = require('./rutas/reportesRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Registro de las rutas operativas
app.use('/api/clientes', clienteRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/reportes', reportesRoutes);

// Endpoint dedicado para la visualización del QR en el navegador
app.get('/api/whatsapp/qr', whatsappController.obtenerQrEndpoint);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});