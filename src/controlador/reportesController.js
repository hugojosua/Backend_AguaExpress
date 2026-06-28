const pool = require('../configuracion/db');

exports.obtenerReportes = async (req, res) => {
    try {
        // 1. Ventas del día, semana y mes
        const queryVentas = `
            SELECT
                COALESCE(SUM(CASE WHEN fecha_pago::date = CURRENT_DATE THEN monto_pagado ELSE 0 END),0) AS ventas_hoy,
                COALESCE(SUM(CASE WHEN fecha_pago >= CURRENT_DATE - INTERVAL '7 days' THEN monto_pagado ELSE 0 END),0) AS ventas_semana,
                COALESCE(SUM(CASE WHEN fecha_pago >= CURRENT_DATE - INTERVAL '30 days' THEN monto_pagado ELSE 0 END),0) AS ventas_mes
            FROM pagos;
        `;
        
        // 2. Stock actual (Botellones entregados - Botellones retirados)
        const queryStock = `
           SELECT
            (SELECT COALESCE(SUM(botellones_entregados), 0) FROM entregas) +
            (SELECT COALESCE(SUM(envases_devueltos), 0) FROM entregas) as stock_actual;
        `;

        // 3. NUEVO: Transacciones recientes (Últimos 15 pagos registrados)
        const queryTransacciones = `
            SELECT 
                p.id, 
                c.nombres_completos AS cliente, 
                p.monto_pagado AS monto, 
                p.fecha_pago AS fecha
            FROM pagos p
            JOIN clientes c ON p.cliente_id = c.id
            ORDER BY p.fecha_pago DESC
            LIMIT 15;
        `;

        const resVentas = await pool.query(queryVentas);
        const resStock = await pool.query(queryStock);
        const resTransacciones = await pool.query(queryTransacciones);

        res.status(200).json({
            ventas: resVentas.rows[0],
            stock: resStock.rows[0].stock_actual,
            transacciones: resTransacciones.rows // Enviamos la nueva lista al frontend
        });
    } catch (error) {
        console.error("Error en reportes:", error);
        res.status(500).json({ error: "Error al generar reportes" });
    }
};