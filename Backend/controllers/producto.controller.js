//producto.controller.js
// backend/controllers/producto.controller.js
const Producto = require('../models/producto.model');

/**
 * Yo obtengo todos los productos con paginación y filtros
 */
exports.obtenerProductos = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice } = req.query;
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = { activo: true };

        if (search) {
            query.$or = [
                { nombre: { $regex: search, $options: 'i' } },
                { descripcion: { $regex: search, $options: 'i' } },
                { categoria: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.categoria = category; 
        }

        if (minPrice || maxPrice) {
            query.precio = {};
            if (minPrice) query.precio.$gte = parseFloat(minPrice);
            if (maxPrice) query.precio.$lte = parseFloat(maxPrice);
        }

        const totalProductos = await Producto.countDocuments(query);
        const productos = await Producto.find(query)
            .sort({ fechaCreacion: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProductos / limit);

        res.status(200).json({
            productos,
            totalProductos,
            totalPages,
            currentPage: page
        });

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener los productos.' });
    }
};

/**
 * Yo obtengo categorías únicas
 */
exports.obtenerCategoriasUnicas = async (req, res) => {
    try {
        const categorias = await Producto.distinct('categoria', { activo: true });
        res.status(200).json(categorias.sort());
    } catch (error) {
        console.error("Error al obtener categorías únicas:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener las categorías.' });
    }
};

/**
 * Yo creo un nuevo producto
 */
exports.crearProducto = async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(400).json({ msg: 'Error al crear el producto.', error: error.message });
    }
};

/**
 * Yo obtengo un producto por su ID
 */
exports.obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado.' });
        }
        res.status(200).json(producto);
    } catch (error) {
        console.error("Error al obtener producto por ID:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener el producto.' });
    }
};

/**
 * Yo actualizo un producto por su ID
 */
exports.actualizarProducto = async (req, res) => {
    try {
        const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado para actualizar.' });
        }
        res.status(200).json(producto);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(400).json({ msg: 'Error al actualizar el producto.', error: error.message });
    }
};

/**
 * Yo elimino un producto por su ID
 */
exports.eliminarProducto = async (req, res) => {
    try {
        const producto = await Producto.findByIdAndDelete(req.params.id);
        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado para eliminar.' });
        }
        res.status(200).json({ msg: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al eliminar el producto.' });
    }
};

/**
 * Yo creo varios productos a la vez
 */
exports.crearVariosProductos = async (req, res) => {
    try {
        const productosData = req.body;
        if (!Array.isArray(productosData)) {
            return res.status(400).json({ msg: 'El cuerpo de la solicitud debe ser un array de productos.' });
        }
        const productosCreados = await Producto.insertMany(productosData);
        res.status(201).json(productosCreados);
    } catch (error) {
        console.error("Error al crear varios productos:", error);
        res.status(400).json({ msg: 'Error al crear varios productos.', error: error.message });
    }
};

/**
 * Yo obtengo productos aleatorios
 */
exports.obtenerProductosAleatorios = async (req, res) => {
    try {
        const cantidad = parseInt(req.query.cantidad) || 4;
        const productos = await Producto.aggregate([
            { $match: { activo: true } },
            { $sample: { size: cantidad } }
        ]);
        res.status(200).json(productos);
    } catch (error) {
        console.error("Error al obtener productos aleatorios:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener productos aleatorios.' });
    }
};