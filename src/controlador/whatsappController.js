const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // <-- Evita que Puppeteer use /dev/shm, crucial en Render
            '--single-process',        // <-- Reduce el consumo de RAM
            '--no-zygote'
        ] 
    }
});

let isReady = false;
let qrActual = ''; 

client.on('qr', (qr) => {
    qrActual = qr;
    console.log('NUEVO QR GENERADO. Entra a tu navegador en https://backend-aguaexpress.onrender.com/api/whatsapp/qr para escanearlo');
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
        // 1. Convertimos a string y quitamos espacios o el signo '+' si lo tiene
        let numeroLimpio = numero.toString().replace(/[\s+]/g, '');

        // 2. Si el número empieza con '0' (ej. 0991234567), lo reemplazamos por el código de Ecuador '593'
        if (numeroLimpio.startsWith('0')) {
            numeroLimpio = '593' + numeroLimpio.substring(1);
        }

        // 3. Formato final requerido por whatsapp-web.js
        const numeroFormateado = `${numeroLimpio}@c.us`; 
        
        await client.sendMessage(numeroFormateado, mensaje);
        console.log(`✅ Mensaje enviado exitosamente a ${numeroFormateado}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error enviando mensaje a ${numero}:`, error);
        throw error;
    }
};

const obtenerQr = () => qrActual;

module.exports = { enviarMensaje, isReady, obtenerQr };