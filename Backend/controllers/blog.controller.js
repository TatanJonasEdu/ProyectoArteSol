//blog.controller.js
const Blog = require('../models/blog.model');

/**
 * Yo creo un nuevo post
 */
exports.crearPost = async (req, res) => {
    try {
        const post = new Blog(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error("Error al crear post:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al crear el post.' });
    }
};

/**
 * Yo obtengo posts con paginación
 */
exports.obtenerPosts = async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = parseInt(req.query.limite) || 9;
        const skip = (pagina - 1) * limite;

        const [posts, totalDocs] = await Promise.all([
            Blog.find().sort({ fechaPublicacion: -1 }).skip(skip).limit(limite),
            Blog.countDocuments()
        ]);

        const totalPaginas = Math.ceil(totalDocs / limite);

        res.status(200).json({
            posts,
            totalPaginas,
            paginaActual: pagina,
            totalPosts: totalDocs
        });

    } catch (error) {
        console.error("Error al obtener posts:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener los posts.' });
    }
};

/**
 * Yo obtengo un post por su ID
 */
exports.obtenerPostPorId = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post no encontrado.' });
        }

        res.status(200).json(post);

    } catch (error) {
        console.error("Error al obtener post por ID:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener el post.' });
    }
};

/**
 * Yo obtengo posts aleatorios
 */
exports.obtenerPostsAleatorios = async (req, res) => {
    try {
        const cantidad = parseInt(req.query.cantidad) || 3;

        const postsAleatorios = await Blog.aggregate([
            { $sample: { size: cantidad } }
        ]);

        res.status(200).json(postsAleatorios);

    } catch (error) {
        console.error("Error al obtener posts aleatorios:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener posts aleatorios.' });
    }
};