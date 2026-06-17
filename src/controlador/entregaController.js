const pool = require('../configuracion/db'); // Ajusta la ruta a tu config

// rregistrar entrega y calcular la próxima fecha
const registrarEntrega = async (req, res) => {
    const { cliente_id, usuario_id, botellones_entregados, envases_devueltos, observaciones } = req.body;

    if (!cliente_id || botellones_entregados === undefined) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para la entrega' });
    }

    try {
//  intervalo de consumo del cliente para el algoritmo 
        const clienteRes = await pool.query('SELECT intervalo_consumo_dias, saldo_envases FROM clientes WHERE id = $1', [cliente_id]);
        
        if (clienteRes.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const { intervalo_consumo_dias, saldo_envases } = clienteRes.rows[0];
        const diasIntervalo = intervalo_consumo_dias || 7; // or defecto 7 días 

        // Algoritmo: Calcular próxima fecha sumando los días
        const proximaFecha = new Date();
        proximaFecha.setDate(proximaFecha.getDate() + diasIntervalo);

        // Insertar el registro de la entrega 
        const nuevaEntrega = await pool.query(
            `INSERT INTO entregas (cliente_id, usuario_id, botellones_entregados, envases_devueltos, proxima_fecha_estimada, observaciones) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [cliente_id, usuario_id, botellones_entregados, envases_devueltos, proximaFecha, observaciones]
        );

        //actualizar el saldo de envases en la tabla clientes 
        const nuevoSaldoEnvases = (saldo_envases + botellones_entregados) - envases_devueltos;
        await pool.query('UPDATE clientes SET saldo_envases = $1 WHERE id = $2', [nuevoSaldoEnvases, cliente_id]);

        res.status(201).json({
            mensaje: 'Entrega registrada y próxima visita programada',
            entrega: nuevaEntrega.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al registrar la entrega' });
    }
};

const obtenerEntregas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM entregas ORDER BY fecha_visita DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener entregas' });
    }
};

module.exports = { registrarEntrega, obtenerEntregas };