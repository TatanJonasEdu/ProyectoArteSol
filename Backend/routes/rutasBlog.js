//rutasBlog.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');

// Ruta para CREAR un nuevo post
// POST -> http://localhost:5000/api/blog
router.post('/', blogController.crearPost);

// Ruta para OBTENER TODOS los posts (con paginación)
// GET -> http://localhost:5000/api/blog
router.get('/', blogController.obtenerPosts);

module.exports = router;


// --- AÑADE ESTA NUEVA RUTA ---
// Ruta para OBTENER POSTS ALEATORIOS
// GET -> http://localhost:5000/api/blog/aleatorios?cantidad=3
router.get('/aleatorios', blogController.obtenerPostsAleatorios);


// --- AÑADE ESTA NUEVA RUTA ---
// Ruta para OBTENER UN POST por su ID
// Debe ir después de otras rutas GET para no causar conflictos
router.get('/:id', blogController.obtenerPostPorId);

module.exports = router;



