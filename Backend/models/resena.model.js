// backend/models/resena.model.js
const mongoose = require('mongoose');

const ResenaSchema = new mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto', // Debe coincidir con el nombre de tu modelo Producto
        required: true
    },
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente', // Debe coincidir con el nombre de tu modelo Cliente (si existe)
        required: false // Puede ser anónimo o para futuras implementaciones de login
    },
    nombreCliente: { // Para mostrar en la reseña
        type: String,
        required: true,
        trim: true
    },
    calificacion: { // Estrellas de 1 a 5
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comentario: {
        type: String,
        required: true,
        trim: true
    },
    fechaResena: { // Campo de fecha sin "ñ"
        type: Date,
        default: Date.now
    }
    // Si quieres una foto para el cliente de la reseña:
    // fotoClienteUrl: {
    //     type: String,
    //     default: '/img/clientes/default.jpg' 
    // }
});

module.exports = mongoose.model('Resena', ResenaSchema); // Nombre del modelo: Resena