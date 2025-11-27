//blog.model.js
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    contenido: {
        type: String,
        required: true
    },
    autor: {
        type: String,
        default: 'Solanyi Echeverry'
    },
    bannerUrl: {
        type: String,
        required: true
    },
    fechaPublicacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', BlogSchema);