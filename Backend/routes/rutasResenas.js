const express = require('express');
const router = express.Router();
const resenaController = require('../controllers/resena.controller');

// Yo defino rutas para reseñas

// Yo añado rutas fijas primero
router.get('/aleatorias', resenaController.obtenerResenasAleatorias);
router.get('/todas', resenaController.obtenerTodasLasResenas);

// Yo añado rutas con parámetros
router.get('/:id', resenaController.obtenerResenasPorProducto);

// Yo creo nuevas reseñas
router.post('/', resenaController.crearResena);

module.exports = router;