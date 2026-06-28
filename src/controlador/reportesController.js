const pool = require('../configuracion/db');

exports.obtenerReportes = async (req, res) => {
    try {
        // Ventas del día, semana y mes
        const queryVentas = `
            SELECT
                COALESCE(SUM(CASE WHEN fecha_pago::date = CURRENT_DATE THEN monto_pagado ELSE 0 END),0) AS ventas_hoy,
                COALESCE(SUM(CASE WHEN fecha_pago >= CURRENT_DATE - INTERVAL '7 days' THEN monto_pagado ELSE 0 END),0) AS ventas_semana,
                COALESCE(SUM(CASE WHEN fecha_pago >= CURRENT_DATE - INTERVAL '30 days' THEN monto_pagado ELSE 0 END),0) AS ventas_mes
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
        console.error(error);
        res.status(500).json({
            error: error.message
        });
    }
};