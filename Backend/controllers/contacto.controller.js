//contacto.controller.js
const Contacto = require('../models/contacto.model');

// --- CREAR / ENVIAR MENSAJE DE CONTACTO ---
exports.enviarMensaje = async (req, res) => {
    try {
        const { nombre, email, mensaje } = req.body;

        // Validación básica
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
        }

        const nuevoMensaje = new Contacto({ nombre, email, mensaje });
        await nuevoMensaje.save();

        res.status(201).json({ msg: 'Mensaje enviado con éxito', mensaje: nuevoMensaje });

    } catch (error) {
        console.error("Error al enviar mensaje de contacto:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al procesar tu mensaje.' });
    }
};

// --- OBTENER TODOS LOS MENSAJES DE CONTACTO (Para el admin) ---
exports.obtenerMensajes = async (req, res) => {
    try {
        const mensajes = await Contacto.find().sort({ fechaEnvio: -1 }); // Los más nuevos primero
        res.status(200).json(mensajes);
    } catch (error) {
        console.error("Error al obtener mensajes de contacto:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener los mensajes.' });
    }
};

// (Aquí podríamos añadir funciones para marcar como leído, borrar, etc.)