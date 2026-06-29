const pool = require('../configuracion/db');

// 1. Consultar clientes (GET)
const obtenerClientes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar los clientes' });
    }
};

// 2. Registrar un nuevo cliente (POST)
const crearCliente = async (req, res) => {
    const { nombres_completos, numero_telefonico, direccion, estado } = req.body;

    if (!nombres_completos || !numero_telefonico || !direccion) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben estar llenos' });
    }

    try {
        const checkPhone = await pool.query('SELECT * FROM clientes WHERE numero_telefonico = $1', [numero_telefonico]);
        if (checkPhone.rows.length > 0) {
            return res.status(400).json({ error: 'El número telefónico ya está registrado' });
        }

        const result = await pool.query(
            'INSERT INTO clientes (nombres_completos, numero_telefonico, direccion, estado) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombres_completos, numero_telefonico, direccion, estado || 'Activo']
        );

        res.status(201).json({ mensaje: 'Cliente registrado exitosamente', cliente: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el cliente' });
    }
};

// 3. Actualizar un cliente existente (PUT)
const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombres_completos, numero_telefonico, direccion, estado } = req.body;

    try {
        const result = await pool.query(
            'UPDATE clientes SET nombres_completos = $1, numero_telefonico = $2, direccion = $3, estado = $4 WHERE id = $5 RETURNING *',
            [nombres_completos, numero_telefonico, direccion, estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.status(200).json({ mensaje: 'Cliente actualizado exitosamente', cliente: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};

// 4. Eliminar un cliente (DELETE)
const eliminarCliente = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
        res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        // Protección: Si el cliente tiene entregas o pagos vinculados, PostgreSQL lanzará el error 23503
        if (error.code === '23503') {
            return res.status(400).json({ error: 'No se puede eliminar este cliente porque tiene historial de entregas o deudas. Se recomienda cambiar su estado a "Inactivo".' });
        }
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
};

module.exports = {
    obtenerClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};