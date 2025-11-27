//blog.model.js
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    contenido: { // Este será el texto largo del blog
        type: String,
        required: true
    },
    autor: {
        type: String,
        default: 'Solanyi Echeverry' // Ponemos un autor por defecto
    },
    bannerUrl: { // La imagen principal del post
        type: String,
        required: true
    },
    fechaPublicacion: { // Usaremos esto para simular las fechas pasadas
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', BlogSchema);