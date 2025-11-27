const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');

// Yo obtengo categorías únicas (debe ir antes de /:id)
router.get('/categorias-unicas', productoController.obtenerCategoriasUnicas);

// Yo obtengo productos aleatorios
router.get('/aleatorios', productoController.obtenerProductosAleatorios);

// Yo obtengo un producto por ID
router.get('/:id', productoController.obtenerProductoPorId);

// Yo obtengo productos (con filtros opcionales)
router.get('/', productoController.obtenerProductos);

// Yo creo un nuevo producto
router.post('/', productoController.crearProducto);

// Yo actualizo un producto por ID
router.put('/:id', productoController.actualizarProducto);

// Yo elimino un producto por ID
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;