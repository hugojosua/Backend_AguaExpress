const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

//  se guarde y no pida QR cada vez que reinicio el servidor
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Importante para evitar errores en algunos sistemas
    }
});

let isReady = false;

// Generar QR para vincular el teléfono
client.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('¡Escanea este código QR con el WhatsApp de AguaExpress!');
    console.log('=========================================\n');
    qrcode.generate(qr, { small: true });
});

// me avisa si la sesión esta lista y conectada 
client.on('ready', () => {
    console.log('\n✅ Cliente de WhatsApp conectado y listo para enviar notificaciones ✅\n');
    isReady = true;
});

// Inicializar el cliente
client.initialize();

// Función que exportaremos para enviar mensajes
const enviarMensaje = async (numero, mensaje) => {
    if (!isReady) {
        throw new Error('El cliente de WhatsApp aún no está listo. Revisa la terminal o escanea el QR.');
    }

    try {
        // verificacion por el codigo de pais y formato correcto
        const numeroFormateado = `${numero}@c.us`; 
        await client.sendMessage(numeroFormateado, mensaje);
        console.log(`Mensaje enviado a ${numero}`);
        return { success: true };
    } catch (error) {
        console.error(`Error enviando mensaje a ${numero}:`, error);
        throw error;
    }
};

module.exports = { enviarMensaje, isReady };