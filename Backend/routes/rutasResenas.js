// backend/routes/rutasResenas.js
const express = require('express');
const router = express.Router();
const resenaController = require('../controllers/resena.controller'); // Importa el controlador Resena

// 1. Rutas específicas (fijas) deben ir PRIMERO
// GET -> http://localhost:5000/api/resenas/aleatorias?cantidad=3
router.get('/aleatorias', resenaController.obtenerResenasAleatorias);

// GET -> http://localhost:5000/api/resenas/todas
router.get('/todas', resenaController.obtenerTodasLasResenas);

// 2. Luego, las rutas con parámetros genéricos
// GET -> http://localhost:5000/api/resenas/:idProducto
router.get('/:id', resenaController.obtenerResenasPorProducto);

// 3. La ruta POST puede ir en cualquier lugar, ya que su método es diferente
// POST -> http://localhost:5000/api/resenas
router.post('/', resenaController.crearResena);

module.exports = router;