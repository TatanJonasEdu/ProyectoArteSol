//blog.controller.js
const Blog = require('../models/blog.model');

// --- CREAR UN POST ---
// (Para que puedas añadir tus 20 posts simulados)
exports.crearPost = async (req, res) => {
    try {
        const post = new Blog(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error("Error al crear post:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor' });
    }
};

// --- OBTENER POSTS CON PAGINACIÓN ---
// (Esta es la función clave)
exports.obtenerPosts = async (req, res) => {
    try {
        // 1. Obtenemos los parámetros de la URL (query params)
        // ej: /api/blog?pagina=1&limite=9
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = parseInt(req.query.limite) || 9; // 9 posts por página

        // 2. Calculamos cuántos documentos "saltar"
        const skip = (pagina - 1) * limite;

        // 3. Hacemos dos consultas a la vez:
        //    - Contar el total de documentos
        //    - Buscar los documentos de la página actual
        const [posts, totalDocs] = await Promise.all([
            Blog.find().sort({ fechaPublicacion: -1 }).skip(skip).limit(limite), // -1 para más nuevos primero
            Blog.countDocuments()
        ]);

        // 4. Calculamos el total de páginas
        const totalPaginas = Math.ceil(totalDocs / limite);

        // 5. Enviamos la respuesta con toda la info de paginación
        res.status(200).json({
            posts,
            totalPaginas,
            paginaActual: pagina,
            totalPosts: totalDocs
        });

    } catch (error) {
        console.error("Error al obtener posts:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor' });
    }
};

// --- OBTENER UN POST POR SU ID ---
exports.obtenerPostPorId = async (req, res) => {
    try {
        // req.params.id viene de la URL (ej: /api/blog/12345)
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post no encontrado' });
        }

        res.status(200).json(post);

    } catch (error) {
        console.error("Error al obtener post:", error);
        // Si el ID no es un ID de Mongo válido, dará un error
        res.status(500).json({ msg: 'Hubo un error en el servidor o el ID es inválido' });
    }
};

// --- OBTENER POSTS ALEATORIOS ---
exports.obtenerPostsAleatorios = async (req, res) => {
    try {
        const cantidad = parseInt(req.query.cantidad) || 3; // Por defecto, 3 posts

        // Usa el operador de agregación $sample para seleccionar posts aleatorios
        const postsAleatorios = await Blog.aggregate([
            { $sample: { size: cantidad } }
        ]);

        res.status(200).json(postsAleatorios);

    } catch (error) {
        console.error("Error al obtener posts aleatorios:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener posts aleatorios' });
    }
};