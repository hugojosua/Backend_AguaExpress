const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

//  se guarde y no pida QR cada vez que reinicio el servidor
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

let isReady = false;
let qrActual = ''; // Variable para almacenar el texto del QR

client.on('qr', (qr) => {
    qrActual = qr;
    console.log('NUEVO QR GENERADO. Entra a la ruta /api/whatsapp/qr para escanearlo y conectar AguaExpress.');
});

client.on('ready', () => {
    qrActual = ''; // Limpiamos el QR cuando ya se conectó
    isReady = true;
    console.log('\n✅ Cliente de WhatsApp conectado y listo para enviar notificaciones ✅\n');
});

client.initialize();

const enviarMensaje = async (numero, mensaje) => {
    if (!isReady) {
        throw new Error('El cliente de WhatsApp aún no está listo. Revisa la terminal o escanea el QR.');
    }

    try {
        const numeroFormateado = `${numero}@c.us`; 
        await client.sendMessage(numeroFormateado, mensaje);
        console.log(`Mensaje enviado a ${numero}`);
        return { success: true };
    } catch (error) {
        console.error(`Error enviando mensaje a ${numero}:`, error);
        throw error;
    }
};

// Función adicional para exportar el valor del QR al archivo principal
const obtenerQr = () => qrActual;

module.exports = { enviarMensaje, isReady, obtenerQr };