// backend/controllers/resena.controller.js
const Resena = require('../models/resena.model');
const Producto = require('../models/producto.model');
const mongoose = require('mongoose');

/**
 * Yo creo una nueva reseña
 */
exports.crearResena = async (req, res) => {
    try {
        const { productoId, clienteId, nombreCliente, calificacion, comentario } = req.body;

        if (!productoId || !nombreCliente || !calificacion || !comentario) {
            return res.status(400).json({ msg: 'Todos los campos de la reseña son obligatorios.' });
        }
        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ msg: 'La calificación debe estar entre 1 y 5 estrellas.' });
        }

        const nuevaResena = new Resena({
            productoId,
            clienteId,
            nombreCliente,
            calificacion,
            comentario
        });

        await nuevaResena.save();

        // Yo actualizo la calificación promedio del producto
        await exports.actualizarCalificacionProducto(productoId);

        res.status(201).json({ msg: 'Reseña enviada con éxito.', resena: nuevaResena });

    } catch (error) {
        console.error("Error al crear reseña:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al procesar tu reseña.' });
    }
};

/**
 * Yo obtengo reseñas por ID de producto
 */
exports.obtenerResenasPorProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const resenas = await Resena.find({ productoId: id })
                                  .sort({ fechaResena: -1 });
        res.status(200).json(resenas);
    } catch (error) {
        console.error("Error al obtener reseñas por producto:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener las reseñas.' });
    }
};

/**
 * Yo obtengo reseñas aleatorias (para la página de inicio)
 */
exports.obtenerResenasAleatorias = async (req, res) => {
    try {
        const cantidad = parseInt(req.query.cantidad) || 3;

        const resenasAleatorias = await Resena.aggregate([
            { $match: { comentario: { $ne: null, $ne: '' } } },
            { $sample: { size: cantidad } }
        ]);

        res.status(200).json(resenasAleatorias);

    } catch (error) {
        console.error("Error al obtener reseñas aleatorias:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener reseñas aleatorias.' });
    }
};

/**
 * Yo obtengo todas las reseñas
 */
exports.obtenerTodasLasResenas = async (req, res) => {
    try {
        const resenas = await Resena.find()
                                  .populate('productoId', 'nombre imagenUrl')
                                  .sort({ fechaResena: -1 });
        res.status(200).json(resenas);
    } catch (error) {
        console.error("Error al obtener todas las reseñas:", error);
        res.status(500).json({ msg: 'Hubo un error en el servidor al obtener todas las reseñas.' });
    }
};

/**
 * Yo actualizo la calificación promedio del producto
 */
exports.actualizarCalificacionProducto = async (productoId) => {
    try {
        const resultadoAgregacion = await Resena.aggregate([
            { $match: { productoId: new mongoose.Types.ObjectId(productoId) } },
            {
                $group: {
                    _id: '$productoId',
                    promedioCalificacion: { $avg: '$calificacion' },
                    totalResenas: { $sum: 1 }
                }
            }
        ]);

        if (resultadoAgregacion.length > 0) {
            const { promedioCalificacion, totalResenas } = resultadoAgregacion[0];
            await Producto.findByIdAndUpdate(productoId, {
                calificacionPromedio: promedioCalificacion,
                totalResenas: totalResenas
            }, { new: true });
        } else {
            await Producto.findByIdAndUpdate(productoId, {
                calificacionPromedio: 0,
                totalResenas: 0
            }, { new: true });
        }

    } catch (error) {
        console.error("Error al actualizar calificación promedio del producto:", error);
    }
};