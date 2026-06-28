const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./controlador/whatsappController'); // Esto inicia WhatsApp

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

// Registro de las rutas
app.use('/api/clientes', clienteRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/reportes', reportesRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});