const pool = require('../configuracion/db');

exports.obtenerReportes = async (req, res) => {
    try {
        // Ventas del día, semana y mes
        const queryVentas = `
            SELECT 
                SUM(CASE WHEN fecha::date = CURRENT_DATE THEN monto_pagado ELSE 0 END) as ventas_hoy,
                SUM(CASE WHEN fecha >= CURRENT_DATE - INTERVAL '7 days' THEN monto_pagado ELSE 0 END) as ventas_semana,
                SUM(CASE WHEN fecha >= CURRENT_DATE - INTERVAL '30 days' THEN monto_pagado ELSE 0 END) as ventas_mes
            FROM pagos;
        `;
        
        // Stock actual (Botellones entregados - Botellones retirados)
        const queryStock = `
            SELECT 
                (SELECT COALESCE(SUM(botellones_entregados), 0) FROM entregas) - 
                (SELECT COALESCE(SUM(envases_devueltos), 0) FROM entregas) as stock_actual;
        `;

        const resVentas = await pool.query(queryVentas);
        const resStock = await pool.query(queryStock);

        res.status(200).json({
            ventas: resVentas.rows[0],
            stock: resStock.rows[0].stock_actual
        });
    } catch (error) {
        res.status(500).json({ error: "Error al generar reportes" });
    }
};