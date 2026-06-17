const pool = require('../configuracion/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro de Usuario 
const registrarUsuario = async (req, res) => {
    const { nombre, correo, cedula, contrasena, rol } = req.body;

    if (!nombre || !correo || !cedula || !contrasena) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // verifica si el correo o cedula ya existen
        const userExists = await pool.query('SELECT * FROM usuarios WHERE correo = $1 OR cedula = $2', [correo, cedula]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Usuario ya existe' }); // F10 Validado
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre, correo, cedula, contrasena, rol, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, correo, rol',
            [nombre, correo, cedula, contrasenaEncriptada, rol || 'Repartidor', 'Activo']
        );

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: nuevoUsuario.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// Autenticación de Usuarios / Login (F9)
const loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // Buscar el usuario por correo
        const userRes = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' }); // F9 Mensaje de advertencia
        }

        const usuario = userRes.rows[0];

        // Verificar el estado de la cuenta
        if (usuario.estado !== 'Activo') {
            return res.status(403).json({ error: 'La cuenta está inactiva' });
        }

        // comparar contraseña encriptada
        const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!passwordValida) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Genera Token 
        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET || 'secreto_super_seguro', { expiresIn: '8h' });

        res.status(200).json({ mensaje: 'Acceso concedido', token, rol: usuario.rol });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor durante el login' });
    }
};

module.exports = { registrarUsuario, loginUsuario };