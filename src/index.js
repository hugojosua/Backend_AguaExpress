const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode'); // Importamos la nueva librería
require('dotenv').config();

// Importamos la función obtenerQr junto con la inicialización
const { obtenerQr } = require('./controlador/whatsappController'); 

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

// Endpoint dedicado para la visualización del QR
app.get('/api/whatsapp/qr', async (req, res) => {
    const qrString = obtenerQr();

    if (!qrString) {
        return res.send('<h2 style="font-family: sans-serif; text-align: center; margin-top: 50px;">No hay ningún QR pendiente. WhatsApp ya está conectado o el servidor está cargando.</h2>');
    }
    
    try {
        const qrImage = await qrcode.toDataURL(qrString);
        
        res.send(`
            <div style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; font-family: sans-serif; background-color: #f0f2f5;">
                <h2 style="color: #333;">Escanea este QR con el WhatsApp de AguaExpress</h2>
                <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <img src="${qrImage}" style="width: 300px; height: 300px;" alt="Código QR" />
                </div>
            </div>
        `);
    } catch (err) {
        res.status(500).send('Error generando la imagen del QR');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});