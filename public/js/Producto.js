export class Producto {
  constructor(nombre, categoria, cantidad, precio, id = null) {
    this.id = id;
    this.nombre = nombre ? nombre.trim() : '';
    this.categoria = categoria ? categoria.trim() : '';
    this.cantidad = Number(cantidad);
    this.precio = Number(precio);
  }

  // Calcular valor total del producto
  calcularValorTotal() {
    return this.cantidad * this.precio;
  }

  // Validación en el Frontend
  validar() {
    const errores = {};

    const letrasCount = this.nombre.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ]/g, '').length;
    if (this.nombre.length < 4) {
      errores.nombre = 'El nombre debe tener al menos 4 caracteres.';
    } else if (letrasCount < 4) {
      errores.nombre = 'El nombre debe contener al menos 4 letras.';
    }

    // Categoría: seleccionada
    if (!this.categoria || this.categoria === '') {
      errores.categoria = 'Debe seleccionar una categoría válida.';
    }

    // Cantidad Entrante
    if (isNaN(this.cantidad) || !Number.isInteger(this.cantidad) || this.cantidad <= 0) {
      errores.cantidad = 'Debe ser un número entero mayor a 0.';
    }

    // Precio Unitario
    if (isNaN(this.precio) || this.precio < 0) {
      errores.precio = 'El precio no puede ser un número negativo.';
    }

    return {
      esValido: Object.keys(errores).length === 0,
      errores
    };
  }
}
