// producto.model.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    imagenUrl: {
        type: String,
        required: true
    },
    
    categoria: {
        type: String,
        required: true,
        trim: true,
        enum: [
            'Accesorios', 
            'Amigurumis', 
            'Bolsos', 
            'Bufandas', 
            'Gorros',
            'Mantas',
            'Chales',
            'Decoración',
            'Ropa',
            'Guantes'
        ]
    },

    stock: {
        type: Number,
        default: 1
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    calificacionPromedio: {
        type: Number,
        default: 0
    },
    totalResenas: {
        type: Number,
        default: 0
    },
    activo: {
        type: Boolean,
        default: true
    }
});

// Yo exporto el modelo
module.exports = mongoose.model('Producto', ProductoSchema);