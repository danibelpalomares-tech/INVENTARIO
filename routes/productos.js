import express from 'express';
import { GestorArchivo } from '../managers/GestorArchivo.js';

const router = express.Router();
const gestor = new GestorArchivo();

// GET: Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await gestor.leer();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Obtener el historial completo de ventas
router.get('/historial', async (req, res) => {
  try {
    const historial = await gestor.leerHistorial();
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Registrar un nuevo producto
router.post('/', async (req, res) => {
  try {
    const nuevoProducto = await gestor.crear(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST: Registrar la venta de un producto
router.post('/venta/:id', async (req, res) => {
  const { id } = req.params;
  const { cantidadVendida } = req.body;

  try {
    const resultado = await gestor.registrarVenta(id, cantidadVendida);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// DELETE: Procesar la devolución y anulación de una venta
router.delete('/devolucion/:idVenta', async (req, res) => {
  const { idVenta } = req.params;
  try {
    const resultado = await gestor.devolverVenta(idVenta);
    res.json({ success: true, message: 'Devolución procesada correctamente.', ...resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT: Actualizar un producto existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const productoActualizado = await gestor.actualizar(id, req.body);
    res.json(productoActualizado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// DELETE: Eliminar un producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eliminado = await gestor.eliminar(id);
    if (!eliminado) {
      return res.status(404).json({ error: `Producto con ID ${id} no encontrado.` });
    }
    res.json({ success: true, message: 'Producto eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;