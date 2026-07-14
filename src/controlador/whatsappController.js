const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

let isReady = false;
let qrActual = ''; 

client.on('qr', (qr) => {
    qrActual = qr;
    console.log('NUEVO QR GENERADO. Entra a tu navegador en http://localhost:3000/api/whatsapp/qr para escanearlo');
});

client.on('ready', () => {
    qrActual = ''; 
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

const obtenerQr = () => qrActual;

module.exports = { enviarMensaje, isReady, obtenerQr };