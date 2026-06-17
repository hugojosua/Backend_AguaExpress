const pool = require('../configuracion/db');

const obtenerDashboardData = async (req, res) => {
    try {
        const [cobrosRes, entregasRes, rutaRes] = await Promise.all([
            // 1. deuda del cliente
            pool.query('SELECT COALESCE(SUM(deuda_total), 0) AS total_pendiente FROM clientes'),
            
            // 2. Contar entregas de hoy
            pool.query('SELECT COUNT(*) AS entregas_hoy FROM entregas WHERE DATE(fecha_visita) = CURRENT_DATE'),
            
            // 3. consulta solo las no procesadas 
            pool.query(`
                SELECT 
                    e.id AS entrega_id, 
                    c.id AS cliente_id, 
                    c.nombres_completos, 
                    c.direccion,
                    e.botellones_entregados, 
                    e.envases_devueltos, 
                    TO_CHAR(e.fecha_visita, 'DD/MM HH24:MI') as fecha_entrega
                FROM entregas e
                JOIN clientes c ON e.cliente_id = c.id
                LEFT JOIN pagos p ON e.id = p.entrega_id
                WHERE p.id IS NULL -- ESTA ES LA CLAVE: Solo muestra si NO hay registro de pago o deuda
                ORDER BY e.fecha_visita DESC
            `)
        ]);

        res.status(200).json({
            metricas: {
                entregasHoy: parseInt(entregasRes.rows[0].entregas_hoy),
                cobrosPendientes: parseFloat(cobrosRes.rows[0].total_pendiente)
            },
            entregasPendientes: rutaRes.rows 
        });

    } catch (error) {
        console.error('Error en el Dashboard:', error);
        res.status(500).json({ error: 'Error al obtener la información del Dashboard' });
    }
};

module.exports = { obtenerDashboardData };