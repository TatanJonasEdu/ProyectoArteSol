// backend/routes/rutasProductos.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');

// --- Rutas de Productos ---

// 1. Ruta para obtener las CATEGORÍAS ÚNICAS (DEBE IR ANTES DE /:id)
// GET -> http://localhost:5000/api/productos/categorias-unicas
router.get('/categorias-unicas', productoController.obtenerCategoriasUnicas);


// --- NUEVA RUTA PARA PRODUCTOS ALEATORIOS ---
// GET -> http://localhost:5000/api/productos/aleatorios
router.get('/aleatorios', productoController.obtenerProductosAleatorios);


// 2. Ruta para obtener un PRODUCTO ESPECÍFICO por ID
// GET -> http://localhost:5000/api/productos/:id
router.get('/:id', productoController.obtenerProductoPorId); 



// 3. Ruta para OBTENER TODOS los productos (con filtros opcionales de búsqueda, categoría y precio)
// GET -> http://localhost:5000/api/productos
router.get('/', productoController.obtenerProductos);

// 4. Ruta para CREAR un nuevo producto
// POST -> http://localhost:5000/api/productos
router.post('/', productoController.crearProducto);

// 5. Ruta para ACTUALIZAR un producto existente por ID
// PUT -> http://localhost:5000/api/productos/:id
router.put('/:id', productoController.actualizarProducto);

// 6. Ruta para ELIMINAR un producto por ID
// DELETE -> http://localhost:5000/api/productos/:id
router.delete('/:id', productoController.eliminarProducto);

// 7. Ruta para CREAR VARIOS PRODUCTOS (si tienes el controlador para ello)
// POST -> http://localhost:5000/api/productos/varios
// Asegúrate de tener 'exports.crearVariosProductos' en tu producto.controller.js
router.post('/varios', productoController.crearVariosProductos);



module.exports = router;