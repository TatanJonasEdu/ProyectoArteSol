//producto.model.js
const mongoose = require('mongoose');

// Definimos el Esquema (Schema) del Producto
const ProductoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true, // El nombre es obligatorio
        trim: true      // Limpia espacios en blanco
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0          // El precio no puede ser negativo
    },
    imagenUrl: {
        type: String,
        required: true  // Usaremos un placeholder por ahora
    },
    
    categoria: {
    type: String,
    required: true,
    trim: true,
    enum: [ // ¡Aquí está tu lista de categorías permitidas!
        'Accesorios', 
        'Amigurumis', 
        'Bolsos', 
        'Bufandas', 
        'Gorros', // ¡Añadir esta!
        'Mantas', // ¡Añadir esta!
        'Chales', // ¡Añadir esta!
        'Decoración', // ¡Añadir esta!
        'Ropa', // ¡Añadir esta!
        'Guantes' // ¡Añadir esta!
        // ... otras categorías que ya tengas o quieras añadir
    ]
    },

    stock: {
        type: Number,
        default: 1      // Si no se especifica, hay 1 en stock
    },
    fechaCreacion: {
        type: Date,
        default: Date.now // La fecha se pone automáticamente
    },
    calificacionPromedio: { type: Number, default: 0 },
    totalResenas: { type: Number, default: 0 }
});

// Exportamos el modelo para que el controlador pueda usarlo
// mongoose.model('NombreDelModelo', Esquema)
module.exports = mongoose.model('Producto', ProductoSchema);