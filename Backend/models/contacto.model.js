//contacto.model.js
const mongoose = require('mongoose');

const ContactoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true, // Guarda el email en minúsculas
        match: [/^\S+@\S+\.\S+$/, 'Por favor, usa un formato de email válido'] // Validación de email
    },
    mensaje: {
        type: String,
        required: true
    },
    fechaEnvio: {
        type: Date,
        default: Date.now
    },
    leido: { // Para saber si Solanyi ya vio el mensaje
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Contacto', ContactoSchema);