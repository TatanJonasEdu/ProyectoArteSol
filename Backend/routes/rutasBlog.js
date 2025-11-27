const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');

// Yo creo un nuevo post
router.post('/', blogController.crearPost);

// Yo obtengo posts aleatorios
router.get('/aleatorios', blogController.obtenerPostsAleatorios);

// Yo obtengo un post por su ID
router.get('/:id', blogController.obtenerPostPorId);

// Yo obtengo todos los posts (con paginación)
router.get('/', blogController.obtenerPosts);

module.exports = router;