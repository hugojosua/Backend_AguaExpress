const pool = require('../configuracion/db');

const registrarPago = async (req, res) => {
    const { cliente_id, entrega_id, monto_pagado, metodo_pago, estado_pago } = req.body;

    if (!cliente_id || monto_pagado === undefined) {
        return res.status(400).json({ error: 'El cliente y el monto son requeridos' });
    }

    try {
        const estadoFinal = estado_pago || 'Pagado';
        const montoFinal = parseFloat(monto_pagado) || 0;
        const metodoFinal = metodo_pago || 'Efectivo';

        let resultPago;

    
        if (entrega_id) {
            
            const pagoExistente = await pool.query('SELECT * FROM pagos WHERE entrega_id = $1', [entrega_id]);

            if (pagoExistente.rows.length > 0) {
                
                const pagoAnterior = pagoExistente.rows[0];
                const montoAnterior = parseFloat(pagoAnterior.monto_pagado);

                resultPago = await pool.query(
                    'UPDATE pagos SET monto_pagado = $1, metodo_pago = $2, estado_pago = $3 WHERE entrega_id = $4 RETURNING *',
                    [montoFinal, metodoFinal, estadoFinal, entrega_id]
                );

                if (pagoAnterior.estado_pago === 'Pendiente' && estadoFinal === 'Pagado') {
                    // Si antes debía y hoy te pagó la entrega -> RESTAMOS LA DEUDA
                    await pool.query('UPDATE clientes SET deuda_total = deuda_total - $1 WHERE id = $2', [montoAnterior, cliente_id]);
                } 
                else if (pagoAnterior.estado_pago === 'Pendiente' && estadoFinal === 'Pendiente') {
                    // Si modificas el valor de la deuda -> Ajustamos la diferencia
                    const diferencia = montoFinal - montoAnterior;
                    await pool.query('UPDATE clientes SET deuda_total = deuda_total + $1 WHERE id = $2', [diferencia, cliente_id]);
                }

            } else {
                // Para entregas nuevas sin pago
                resultPago = await pool.query(
                    'INSERT INTO pagos (cliente_id, entrega_id, monto_pagado, metodo_pago, estado_pago) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [cliente_id, entrega_id, montoFinal, metodoFinal, estadoFinal]
                );

                if (estadoFinal === 'Pendiente') {
                    // AQUÍ ESTÁ LA CLAVE: Si lo dejas como fiado, suma a la deuda total
                    await pool.query('UPDATE clientes SET deuda_total = deuda_total + $1 WHERE id = $2', [montoFinal, cliente_id]);
                }
            }

        } 
       
        // EL REGISTRO VIENE DESDE LA PESTAÑA "COBROS" 
       
        else {
            resultPago = await pool.query(
                'INSERT INTO pagos (cliente_id, monto_pagado, metodo_pago, estado_pago) VALUES ($1, $2, $3, $4) RETURNING *',
                [cliente_id, montoFinal, metodoFinal, 'Pagado']
            );

            // se rresta de la deuda todal
            await pool.query('UPDATE clientes SET deuda_total = deuda_total - $1 WHERE id = $2', [montoFinal, cliente_id]);
        }

        res.status(201).json({
            mensaje: estadoFinal === 'Pagado' 
                ? 'Cobro procesado. Deuda disminuida.' 
                : 'Valor pendiente registrado. Deuda sumada a la cuenta.',
            pago: resultPago.rows[0]
        });

    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ error: 'Error al procesar la transacción financiera' });
    }
};

const obtenerClientesDeudores = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes WHERE deuda_total > 0 ORDER BY deuda_total DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar los deudores' });
    }
};

module.exports = { registrarPago, obtenerClientesDeudores };