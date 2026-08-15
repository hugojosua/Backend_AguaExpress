const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');


let isReady = false;
let qrActual = '';
let sock;

const iniciarBot = async () => {
    // 1. Guardar credenciales de sesión en la carpeta local
    const { state, saveCreds } = await useMultiFileAuthState('auth_baileys');

    // 2. Configurar el socket sin la propiedad obsoleta printQRInTerminal
    sock = makeWASocket({
        auth: state,
        // Identificador de navegador para mayor estabilidad en la conexión
        browser: Browsers.ubuntu('AguaExpressBot'),
        // Deshabilitar la impresión automática del QR en la terminal
        printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Si WhatsApp emite un nuevo código QR
        if (qr) {
            qrActual = qr;
            console.log('\n======================================================');
            console.log('📱 ESCANEA EL SIGUIENTE CÓDIGO QR CON TU WHATSAPP:');
            console.log('======================================================\n');
            
            // Dibuja el código QR directamente en la consola
            qrcodeTerminal.generate(qr, { small: true });

            console.log('\n💡 También puedes abrir en tu navegador: http://localhost:3000/api/whatsapp/qr\n');
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            isReady = false;
            console.log(`⚠️ Conexión cerrada. Código: ${statusCode}. Reconectando: ${shouldReconnect}`);

            if (shouldReconnect) {
                // Pequeña pausa antes de reintentar para evitar spam de conexiones
                setTimeout(() => iniciarBot(), 3000);
            }
        } else if (connection === 'open') {
            qrActual = '';
            isReady = true;
            console.log('\n======================================================');
            console.log('✅ Cliente de WhatsApp conectado y listo para operar');
            console.log('======================================================\n');
        }
    });
};

// Inicializar el bot al cargar el módulo
iniciarBot();

// Función para el despacho de mensajes
const enviarMensaje = async (numero, mensaje) => {
    if (!isReady) {
        throw new Error('El cliente de WhatsApp aún no está listo. Revisa la terminal o escanea el QR.');
    }

    try {
        // Limpieza y formateo para números de Ecuador (código 593)
        let numeroLimpio = numero.toString().replace(/[\s+]/g, '');

        if (numeroLimpio.startsWith('0')) {
            numeroLimpio = '593' + numeroLimpio.substring(1);
        }

        const numeroFormateado = `${numeroLimpio}@s.whatsapp.net`;
        
        await sock.sendMessage(numeroFormateado, { text: mensaje });
        console.log(`✅ Mensaje enviado exitosamente a ${numeroFormateado}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error enviando mensaje a ${numero}:`, error);
        throw error;
    }
};

// Controlador para servir el QR como imagen en el navegador
const obtenerQrEndpoint = async (req, res) => {
    if (isReady) {
        return res.send('<h2>✅ WhatsApp ya está vinculado y conectado.</h2>');
    }

    if (!qrActual) {
        return res.send('<h2>⏳ Esperando generación de QR... Recarga en unos segundos.</h2>');
    }

    try {
        const qrImage = await QRCode.toDataURL(qrActual);
        res.send(`
            <div style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background-color:#f0f2f5;">
                <div style="text-align:center; background:white; padding:30px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                    <h2 style="color:#128c7e; margin-bottom:10px;">Vincular WhatsApp - AguaExpress</h2>
                    <p style="color:#555;">Abre WhatsApp > Dispositivos vinculados > Vincular un dispositivo</p>
                    <img src="${qrImage}" alt="QR Code" style="width:280px; height:280px; margin-top:15px;" />
                </div>
            </div>
        `);
    } catch (err) {
        res.status(500).send('Error generando la imagen del QR');
    }
};

const obtenerQr = () => qrActual;

module.exports = { enviarMensaje, isReady, obtenerQr, obtenerQrEndpoint };