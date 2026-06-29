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
        
        // 2. Stock actual
        const queryStock = `
           SELECT
            (SELECT COALESCE(SUM(envases_devueltos), 0) FROM entregas) -
            (SELECT COALESCE(SUM(botellones_entregados), 0) FROM entregas) as stock_actual;
        `;

        // 3. Transacciones con Método de Pago
        const queryTransacciones = `
            SELECT 
                p.id, 
                c.nombres_completos AS cliente, 
                p.monto_pagado AS monto, 
                p.fecha_pago AS fecha,
                p.metodo_pago
            FROM pagos p
            JOIN clientes c ON p.cliente_id = c.id
            ORDER BY p.fecha_pago DESC
            LIMIT 30;
        `;

        // 4. Histórico Mensual (Último Año)
        const queryHistoricoMeses = `
            SELECT TO_CHAR(DATE_TRUNC('month', fecha_pago), 'YYYY-MM') as periodo, COALESCE(SUM(monto_pagado), 0) as total
            FROM pagos
            WHERE fecha_pago >= CURRENT_DATE - INTERVAL '1 year'
            GROUP BY DATE_TRUNC('month', fecha_pago)
            ORDER BY periodo DESC;
        `;

        // 5. Histórico Semanal (Últimas semanas)
        const queryHistoricoSemanas = `
            SELECT TO_CHAR(DATE_TRUNC('week', fecha_pago), 'YYYY-MM-DD') as periodo, COALESCE(SUM(monto_pagado), 0) as total
            FROM pagos
            WHERE fecha_pago >= CURRENT_DATE - INTERVAL '1 month'
            GROUP BY DATE_TRUNC('week', fecha_pago)
            ORDER BY periodo DESC;
        `;

        const resVentas = await pool.query(queryVentas);
        const resStock = await pool.query(queryStock);
        const resTransacciones = await pool.query(queryTransacciones);
        const resMeses = await pool.query(queryHistoricoMeses);
        const resSemanas = await pool.query(queryHistoricoSemanas);

        res.status(200).json({
            ventas: resVentas.rows[0],
            stock: resStock.rows[0].stock_actual,
            transacciones: resTransacciones.rows,
            historico_meses: resMeses.rows,
            historico_semanas: resSemanas.rows
        });
    } catch (error) {
        console.error("Error en reportes:", error);
        res.status(500).json({ error: "Error al generar reportes" });
    }
};