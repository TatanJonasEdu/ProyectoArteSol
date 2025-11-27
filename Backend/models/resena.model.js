// backend/models/resena.model.js
const mongoose = require('mongoose');

const ResenaSchema = new mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: false
    },
    nombreCliente: {
        type: String,
        required: true,
        trim: true
    },
    calificacion: {
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
    fechaResena: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resena', ResenaSchema);