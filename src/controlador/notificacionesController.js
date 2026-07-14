const pool = require('../configuracion/db');
const { enviarMensaje } = require('./whatsappController');

//  Obtener la lista de clientes con 3 días de anticipación
const obtenerPendientesNotificacion = async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT ON (c.id) 
                c.id, c.nombres_completos, c.numero_telefonico, 
                TO_CHAR(e.proxima_fecha_estimada, 'DD/MM/YYYY') as fecha_estimada
            FROM clientes c
            JOIN entregas e ON c.id = e.cliente_id
            LEFT JOIN notificaciones n ON c.id = n.cliente_id AND DATE(n.fecha_envio) = CURRENT_DATE
            WHERE c.estado = 'Activo' 
              -- fechas pasadas, hoy, y hasta 3 días en el futuro
              AND e.proxima_fecha_estimada <= CURRENT_DATE + INTERVAL '3 days'
              AND n.id IS NULL 
            ORDER BY c.id, e.fecha_visita DESC;
        `;
        
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener pendientes de notificación:', error);
        res.status(500).json({ error: 'Error al consultar las notificaciones' });
    }
};

// Enviar el mensaje a un cliente específico
const enviarNotificacionIndividual = async (req, res) => {
    const { cliente_id } = req.body;

    if (!cliente_id) {
        return res.status(400).json({ error: 'El ID falta' });
    }

    try {
        const result = await pool.query('SELECT nombres_completos, numero_telefonico FROM clientes WHERE id = $1', [cliente_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const cliente = result.rows[0];
        
        // Pasamos el número tal cual, whatsappController.js ya se encarga de limpiarlo y formatearlo
        const numero = cliente.numero_telefonico;

        const mensaje = `¡Hola ${cliente.nombres_completos}! 👋\nSomos AguaExpress. Según nuestros registros, pudimos notar, es posible que estés próximo a terminar tu botellón de agua.\n\n¿Deseas que programemos una recarga para dejarte abastecido? 💧🚚`;

        // disparar mensaje
        await enviarMensaje(numero, mensaje);

        // Guardar y desapare   zca de la lista de hoy
        await pool.query(
            "INSERT INTO notificaciones (cliente_id, tipo_mensaje, fecha_programada, fecha_envio) VALUES ($1, 'Recordatorio_Predictivo', CURRENT_DATE, CURRENT_TIMESTAMP)",
            [cliente_id]
        );

        res.status(200).json({ mensaje: 'Notificación enviada exitosamente' });

    } catch (error) {
        console.error('Error al enviar WhatsApp:', error);
        // Ahora devolvemos el mensaje de error real para que sepas qué está fallando
        res.status(500).json({ 
            error: 'No se pudo enviar el mensaje', 
            detalle: error.message 
        });
    }
};

module.exports = { obtenerPendientesNotificacion, enviarNotificacionIndividual };