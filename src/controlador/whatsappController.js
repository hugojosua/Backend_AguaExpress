const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

let isReady = false; //[cite: 1]
let qrActual = ''; //[cite: 1]
let sock;

const iniciarBot = async () => {
    // Guarda la sesión localmente sin necesitar navegador
    const { state, saveCreds } = await useMultiFileAuthState('auth_baileys');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true 
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrActual = qr; //[cite: 1]
            console.log('NUEVO QR GENERADO. Entra a tu navegador en https://backend-aguaexpress.onrender.com/api/whatsapp/qr para escanearlo'); //[cite: 1]
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                iniciarBot();
            }
        } else if (connection === 'open') {
            qrActual = ''; //[cite: 1]
            isReady = true; //[cite: 1]
            console.log('\n✅ Cliente de WhatsApp conectado y listo para enviar notificaciones ✅\n'); //[cite: 1]
        }
    });
};

// Inicializamos el bot al levantar el archivo
iniciarBot();

const enviarMensaje = async (numero, mensaje) => {
    if (!isReady) { //[cite: 1]
        throw new Error('El cliente de WhatsApp aún no está listo. Revisa la terminal o escanea el QR.'); //[cite: 1]
    }

    try {
        // 1. Convertimos a string y quitamos espacios o el signo '+' si lo tiene[cite: 1]
        let numeroLimpio = numero.toString().replace(/[\s+]/g, ''); //[cite: 1]

        // 2. Si el número empieza con '0', lo reemplazamos por el código de Ecuador '593'[cite: 1]
        if (numeroLimpio.startsWith('0')) { //[cite: 1]
            numeroLimpio = '593' + numeroLimpio.substring(1); //[cite: 1]
        }

        // 3. Formato final requerido por Baileys (usa @s.whatsapp.net en lugar de @c.us)
        const numeroFormateado = `${numeroLimpio}@s.whatsapp.net`; 
        
        await sock.sendMessage(numeroFormateado, { text: mensaje });
        console.log(`✅ Mensaje enviado exitosamente a ${numeroFormateado}`); //[cite: 1]
        return { success: true }; //[cite: 1]
    } catch (error) {
        console.error(`❌ Error enviando mensaje a ${numero}:`, error); //[cite: 1]
        throw error; //[cite: 1]
    }
};

const obtenerQr = () => qrActual; //[cite: 1]

module.exports = { enviarMensaje, isReady, obtenerQr }; //[cite: 1]