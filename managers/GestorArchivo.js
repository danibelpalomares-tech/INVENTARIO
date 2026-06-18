import fs from 'fs/promises';
import path from 'path';

export class GestorArchivo {
  constructor(nombreArchivo = 'inventario.json') {
    this.rutaArchivo = path.resolve(nombreArchivo);
  }

  // Leer la estructura completa del JSON
  async leerEstructura() {
    try {
      const contenido = await fs.readFile(this.rutaArchivo, 'utf-8');
      const datos = JSON.parse(contenido);
      
      if (!datos.productos || !datos.historialVentas) {
        return { productos: Array.isArray(datos) ? datos : [], historialVentas: [] };
      }
      return datos;
    } catch (error) {
     
      if (error.code === 'ENOENT') {
        const estructuraInicial = { productos: [], historialVentas: [] };
        await this.guardarEstructura(estructuraInicial);
        return estructuraInicial;
      }
      throw new Error(`Error al leer el archivo de inventario: ${error.message}`);
    }
  }

  // Guardar la estructura completa en el archivo
  async guardarEstructura(datos) {
    try {
      await fs.writeFile(this.rutaArchivo, JSON.stringify(datos, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Error al guardar el archivo de inventario: ${error.message}`);
    }
  }

  // Métodos auxiliares para mantener compatibilidad con lo anterior
  async leer() {
    const estructura = await this.leerEstructura();
    return estructura.productos;
  }

  async guardar(productosActualizados) {
    const estructura = await this.leerEstructura();
    estructura.productos = productosActualizados;
    await this.guardarEstructura(estructura);
  }

  // Leer únicamente el historial de ventas
  async leerHistorial() {
    const estructura = await this.leerEstructura();
    return estructura.historialVentas;
  }

  // Validaciones del Backend
  validarProducto(producto) {
    const { nombre, categoria, cantidad, precio } = producto;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 4) {
      throw new Error('El Nombre del Producto debe tener un mínimo de 4 letras.');
    }

    if (!categoria || typeof categoria !== 'string' || categoria.trim() === '') {
      throw new Error('La Categoría es requerida.');
    }

    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || !Number.isInteger(cantidadNum) || cantidadNum <= 0) {
      throw new Error('La Cantidad Entrante debe ser un número entero estrictamente mayor a 0.');
    }

    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      throw new Error('El Precio Unitario no puede ser negativo.');
    }

    return {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      cantidad: cantidadNum,
      precio: precioNum
    };
  }

  // Crear un nuevo producto
  async crear(datosProducto) {
    const productoValidado = this.validarProducto(datosProducto);
    const estructura = await this.leerEstructura();

    const nuevoProducto = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      ...productoValidado
    };

    estructura.productos.push(nuevoProducto);
    await this.guardarEstructura(estructura);
    return nuevoProducto;
  }

  // Actualizar un producto existente
  async actualizar(id, datosActualizados) {
    const productoValidado = this.validarProducto(datosActualizados);
    const estructura = await this.leerEstructura();

    const indice = estructura.productos.findIndex(p => p.id === id);
    if (indice === -1) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    const productoActualizado = {
      id,
      ...productoValidado
    };

    estructura.productos[indice] = productoActualizado;
    await this.guardarEstructura(estructura);
    return productoActualizado;
  }

  // Eliminar un producto
  async eliminar(id) {
    const estructura = await this.leerEstructura();
    const longitudOriginal = estructura.productos.length;
    estructura.productos = estructura.productos.filter(p => p.id !== id);

    if (estructura.productos.length === longitudOriginal) {
      return false;
    }

    await this.guardarEstructura(estructura);
    return true;
  }

  // Registrar la venta guardándola en la caja "historialVentas"
  async registrarVenta(id, cantidadVendida) {
    const estructura = await this.leerEstructura();
    
    const indice = estructura.productos.findIndex(p => p.id === id);
    if (indice === -1) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    const producto = estructura.productos[indice];
    const cantidadNum = Number(cantidadVendida);

    if (isNaN(cantidadNum) || !Number.isInteger(cantidadNum) || cantidadNum <= 0) {
      throw new Error('La cantidad a vender debe ser un número entero mayor a 0.');
    }

    if (producto.cantidad < cantidadNum) {
      throw new Error(`Stock insuficiente. Solo quedan ${producto.cantidad} unidades disponibles.`);
    }

    // Descontar del almacén
    producto.cantidad -= cantidadNum;

    // Crear el recibo de venta para la nueva caja
    const nuevaVenta = {
      idVenta: 'vnt-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      productoId: producto.id,
      productoNombre: producto.nombre,
      cantidadVendida: cantidadNum,
      totalPagado: cantidadNum * producto.precio,
      fecha: new Date().toLocaleDateString('es-VE')
    };

    estructura.historialVentas.push(nuevaVenta);
    await this.guardarEstructura(estructura);

    // Devolvemos el producto modificado e información de la venta realizada
    return { producto, nuevaVenta };
  }

  // Devolver una venta (Sumar stock y remover del historial)
  async devolverVenta(idVenta) {
    const estructura = await this.leerEstructura();

    // 1. Buscar la venta en el historial
    const indiceVenta = estructura.historialVentas.findIndex(v => v.idVenta === idVenta);
    if (indiceVenta === -1) {
      throw new Error(`La venta con ID ${idVenta} no existe en el historial.`);
    }

    const venta = estructura.historialVentas[indiceVenta];

    // 2. Buscar el producto para regresarle el stock
    const indiceProducto = estructura.productos.findIndex(p => p.id === venta.productodevolucion || p.id === venta.productoId);
    
    if (indiceProducto !== -1) {
      
      estructura.productos[indiceProducto].cantidad += venta.cantidadVendida;
    }

    // 3. Remover la venta de la caja de historial
    estructura.historialVentas.splice(indiceVenta, 1);
    
    await this.guardarEstructura(estructura);
    return { idVenta, productoId: venta.productoId };
  }
}