const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

let isReady = false;
let qrActual = '';
let clientSocket;

async function connectToWhatsApp() {
    // Baileys guarda la sesión en esta carpeta local
    const { state, saveCreds } = await useMultiFileAuthState('auth_baileys');

    clientSocket = makeWASocket({
        auth: state,
        printQRInTerminal: true // Imprime el QR en la consola de Render por si falla la ruta web
    });

    clientSocket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrActual = qr;
            console.log('NUEVO QR GENERADO. Entra a tu navegador para escanearlo');
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada. Reconectando:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            isReady = true;
            qrActual = '';
            console.log('\n✅ Cliente de WhatsApp conectado mediante Baileys ✅\n');
        }
    });

    // Guarda las credenciales cada vez que se actualizan
    clientSocket.ev.on('creds.update', saveCreds);
}

// Iniciar la conexión
connectToWhatsApp();

const enviarMensaje = async (numero, mensaje) => {
    if (!isReady) {
        throw new Error('El cliente de WhatsApp aún no está listo. Revisa la terminal o escanea el QR.');
    }

    try {
        let numeroLimpio = numero.toString().replace(/[\s+]/g, '');
        if (numeroLimpio.startsWith('0')) {
            numeroLimpio = '593' + numeroLimpio.substring(1);
        }

        // IMPORTANTE: El formato en Baileys termina en @s.whatsapp.net, no en @c.us
        const numeroFormateado = `${numeroLimpio}@s.whatsapp.net`; 
        
        // IMPORTANTE: Baileys requiere que el mensaje vaya dentro de un objeto { text: mensaje }
        await clientSocket.sendMessage(numeroFormateado, { text: mensaje });
        console.log(`✅ Mensaje enviado exitosamente a ${numeroFormateado}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error enviando mensaje a ${numero}:`, error);
        throw error;
    }
};

const obtenerQr = () => qrActual;

module.exports = { enviarMensaje, isReady, obtenerQr };