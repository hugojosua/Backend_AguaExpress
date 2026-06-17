const pool = require('../configuracion/db');

// Consultar clientes
const obtenerClientes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar los clientes' });
    }
};

// Registrar un nuevo cliente
const crearCliente = async (req, res) => {
    const { nombres_completos, numero_telefonico, direccion, estado } = req.body;

    // Validación 1: Campos obligatorios no vacíos
    if (!nombres_completos || !numero_telefonico || !direccion) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben estar llenos' });
    }

    try {
        // Validación 2: numero cell no repetido
        const checkPhone = await pool.query('SELECT * FROM clientes WHERE numero_telefonico = $1', [numero_telefonico]);
        if (checkPhone.rows.length > 0) {
            return res.status(400).json({ error: 'El número telefónico ya está registrado' });
        }

        const result = await pool.query(
            'INSERT INTO clientes (nombres_completos, numero_telefonico, direccion, estado) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombres_completos, numero_telefonico, direccion, estado || 'Activo']
        );

        // Mensaje de confirmación 
        res.status(201).json({ 
            mensaje: 'Cliente registrado exitosamente', 
            cliente: result.rows[0] 
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el cliente' });
    }
};

module.exports = {
    obtenerClientes,
    crearCliente
};