import { UI } from './UI.js';
import { Producto } from './Producto.js';

// Estado global de la aplicación en memoria frontend
let todosLosProductos = [];
const ui = new UI();

document.addEventListener('DOMContentLoaded', async () => {
  
  inicializarTema();

  await cargarProductos();

  // Configurar envío del formulario
  ui.form.addEventListener('submit', manejarSubmitFormulario);

  // Configurar botón de cancelar edición
  ui.cancelEditBtn.addEventListener('click', () => {
    ui.limpiarFormulario();
    ui.mostrarNotificacion('Edición cancelada.', 'info');
  });

  // Configurar delegación de eventos para la tabla (botones editar y eliminar)
  ui.tbody.addEventListener('click', manejarAccionesTabla);

  // Configurar búsqueda reactiva en tiempo real (evento input)
  ui.searchInput.addEventListener('input', manejarBusquedaReactiva);

  // Configurar botón de cambio de tema
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', manejarCambioTema);
  }

// --- LISTENERS PARA EL SISTEMA DE VENTAS ---
  const openSaleModalBtn = document.getElementById('open-sale-modal-btn');
  
  if (openSaleModalBtn) {
    openSaleModalBtn.addEventListener('click', () => ui.abrirModalVentas());
  }

  ui.closeSaleModalBtn.addEventListener('click', () => ui.cerrarModalVentas());

  // Escuchar la escritura en el buscador del modal para mostrar sugerencias dinámicas
  ui.saleSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 1) {
      ui.saleSuggestions.classList.add('hidden');
      return;
    }
    
    const filtrados = todosLosProductos.filter(p => p.nombre.toLowerCase().includes(query));
    ui.renderizarSugerenciasVenta(filtrados);
  });

  ui.saleSuggestions.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (item) {
      const id = item.dataset.id;
      const producto = todosLosProductos.find(p => p.id === id);
      if (producto) {
        ui.seleccionarProductoParaVenta(producto);
      }
    }
  });

  // Validacion en tiempo real que la cantidad a vender no supere el stock disponible
  ui.saleQuantityInput.addEventListener('input', () => {
    const id = ui.saleProductIdInput.value;
    const producto = todosLosProductos.find(p => p.id === id);
    const cantidadAVender = parseInt(ui.saleQuantityInput.value, 10);
    const errorSpan = document.getElementById('error-sale-cantidad');

    if (!producto) return;

    if (isNaN(cantidadAVender) || cantidadAVender <= 0) {
      errorSpan.textContent = 'Debe ser un número entero mayor a 0.';
      ui.confirmSaleBtn.disabled = true;
    } else if (cantidadAVender > producto.cantidad) {
      errorSpan.textContent = `Stock insuficiente. Solo hay ${producto.cantidad} unidades.`;
      ui.confirmSaleBtn.disabled = true;
    } else {
      errorSpan.textContent = '';
      ui.confirmSaleBtn.disabled = false;
    }
  });

  ui.saleForm.addEventListener('submit', manejarSubmitVenta);

  // --- LISTENERS PARA EL SISTEMA DE HISTORIAL Y DEVOLUCIONES ---
  ui.openHistoryModalBtn.addEventListener('click', async () => {
    ui.abrirModalHistorial();
    await cargarHistorialBackend();
  });

  ui.closeHistoryModalBtn.addEventListener('click', () => ui.cerrarModalHistorial());

  ui.historyTbody.addEventListener('click', async (e) => {
    const botonDevolver = e.target.closest('.btn-devolver');
    if (botonDevolver) {
      const idVenta = botonDevolver.dataset.id;
    
      botonDevolver.disabled = true;
      botonDevolver.textContent = 'Procesando...';
      await procesarDevoluciónBackend(idVenta);
    }
  });
});

// Función para obtener productos del backend e inicializar el historial
async function cargarProductos() {
  try {
    const respuesta = await fetch('/api/productos');
    if (!respuesta.ok) {
      throw new Error('No se pudo obtener la lista de productos.');
    }
    todosLosProductos = await respuesta.ok ? await respuesta.json() : [];
    
    ui.renderizarLista(todosLosProductos);
    ui.renderizarEstadisticas(todosLosProductos);

    await cargarHistorialBackend();

  } catch (error) {
    console.error(error);
    ui.mostrarNotificacion('Error de conexión con el servidor al cargar inventario.', 'error');
  }
}

// Función para registrar o editar un producto
async function manejarSubmitFormulario(e) {
  e.preventDefault();

  const productoCapturado = ui.capturarFormulario();
  
  const validacion = productoCapturado.validar();
  
  if (!validacion.esValido) {
    ui.mostrarValidaciones(validacion.errores);
    ui.mostrarNotificacion('Por favor, corrija los campos del formulario.', 'error');
    return;
  }

  const esEdicion = !!productoCapturado.id;
  const url = esEdicion ? `/api/productos/${productoCapturado.id}` : '/api/productos';
  const metodo = esEdicion ? 'PUT' : 'POST';

  try {
    ui.submitBtn.disabled = true;
    if (!esEdicion) ui.submitBtnText.textContent = 'Registrando...';
    else ui.submitBtnText.textContent = 'Guardando...';

    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: productoCapturado.nombre,
        categoria: productoCapturado.categoria,
        cantidad: productoCapturado.cantidad,
        precio: productoCapturado.precio
      })
    });

    const datosRespuesta = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datosRespuesta.error || 'Error procesando la solicitud en el servidor.');
    }

    if (esEdicion) {
      todosLosProductos = todosLosProductos.map(p => p.id === productoCapturado.id ? datosRespuesta : p);
      ui.mostrarNotificacion('Producto actualizado correctamente.', 'success');
    } else {
    
      todosLosProductos.push(datosRespuesta);
      ui.mostrarNotificacion('Producto registrado con éxito.', 'success');
    }

    ui.limpiarFormulario();
    
    filtrarYMostrarProductos(ui.searchInput.value);
    ui.renderizarEstadisticas(todosLosProductos);

  } catch (error) {
    console.error(error);
    ui.mostrarNotificacion(error.message, 'error');
  } finally {
    ui.submitBtn.disabled = false;
    ui.submitBtnText.textContent = esEdicion ? 'Guardar Cambios' : 'Registrar Producto';
  }
}

// Manejar botones de Editar y Eliminar dentro de la tabla usando delegación
function manejarAccionesTabla(e) {
  const botonEditar = e.target.closest('.btn-icon.edit');
  const botonEliminar = e.target.closest('.btn-icon.delete');

  if (botonEditar) {
    const id = botonEditar.dataset.id;
    const producto = todosLosProductos.find(p => p.id === id);
    if (producto) {
      ui.prepararEdicion(producto);
    }
  }

  if (botonEliminar) {
    const id = botonEliminar.dataset.id;
    const producto = todosLosProductos.find(p => p.id === id);
    if (producto) {
      ui.abrirModalConfirmacion(id, producto.nombre, eliminarProductoBackend);
    }
  }
}

// Función callback para eliminar del backend
async function eliminarProductoBackend(id) {
  try {
    const respuesta = await fetch(`/api/productos/${id}`, {
      method: 'DELETE'
    });

    const datosRespuesta = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datosRespuesta.error || 'Error al eliminar el producto del servidor.');
    }

    todosLosProductos = todosLosProductos.filter(p => p.id !== id);

    ui.mostrarNotificacion('Producto eliminado del inventario.', 'success');
    
    if (ui.idInput.value === id) {
      ui.limpiarFormulario();
    }

    // Actualizar tabla y estadísticas
    filtrarYMostrarProductos(ui.searchInput.value);
    ui.renderizarEstadisticas(todosLosProductos);

  } catch (error) {
    console.error(error);
    ui.mostrarNotificacion(error.message, 'error');
  }
}

// Manejador del campo de búsqueda
function manejarBusquedaReactiva(e) {
  const query = e.target.value;
  filtrarYMostrarProductos(query);
}

// Filtrar la lista de productos según el término de búsqueda
function filtrarYMostrarProductos(query) {
  if (!query || query.trim() === '') {
    ui.renderizarLista(todosLosProductos);
    return;
  }

  const queryLimpia = query.trim().toLowerCase();
  const productosFiltrados = todosLosProductos.filter(producto => 
    producto.nombre.toLowerCase().includes(queryLimpia)
  );

  ui.renderizarLista(productosFiltrados);
}

// Inicializar el tema de color desde localStorage
function inicializarTema() {
  const temaGuardado = localStorage.getItem('theme') || 'dark';
  const moonIcon = document.querySelector('.moon-icon');
  const sunIcon = document.querySelector('.sun-icon');

  if (temaGuardado === 'light') {
    document.body.classList.add('light-theme');
    if (moonIcon) moonIcon.classList.add('hidden');
    if (sunIcon) sunIcon.classList.remove('hidden');
  } else {
    document.body.classList.remove('light-theme');
    if (moonIcon) moonIcon.classList.remove('hidden');
    if (sunIcon) sunIcon.classList.add('hidden');
  }
}

// Manejar el cambio de tema de color
function manejarCambioTema() {
  const esClaro = document.body.classList.toggle('light-theme');
  const moonIcon = document.querySelector('.moon-icon');
  const sunIcon = document.querySelector('.sun-icon');

  if (esClaro) {
    localStorage.setItem('theme', 'light');
    if (moonIcon) moonIcon.classList.add('hidden');
    if (sunIcon) sunIcon.classList.remove('hidden');
    ui.mostrarNotificacion('Modo claro activado.', 'info');
  } else {
    localStorage.setItem('theme', 'dark');
    if (moonIcon) moonIcon.classList.remove('hidden');
    if (sunIcon) sunIcon.classList.add('hidden');
    ui.mostrarNotificacion('Modo oscuro activado.', 'info');
  }
}

// Función para procesar la venta en el servidor y actualizar el frontend
async function manejarSubmitVenta(e) {
  e.preventDefault();

  const id = ui.saleProductIdInput.value;
  const cantidadAVender = parseInt(ui.saleQuantityInput.value, 10);
  const productoOriginal = todosLosProductos.find(p => p.id === id);

  if (!id || !cantidadAVender || !productoOriginal) return;

  try {
    ui.confirmSaleBtn.disabled = true;

    const respuesta = await fetch(`/api/productos/venta/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidadVendida: cantidadAVender })
    });

    const datosRespuesta = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datosRespuesta.error || 'Error al procesar la venta en el servidor.');
    }

    todosLosProductos = todosLosProductos.map(p => p.id === id ? datosRespuesta.producto : p);

    ui.mostrarNotificacion(`Venta registrada con éxito.`, 'success');
    ui.cerrarModalVentas();

    ui.renderizarLista(todosLosProductos);
    ui.renderizarEstadisticas(todosLosProductos);

    await cargarHistorialBackend();

    if (ui.idInput.value === id) ui.limpiarFormulario();

  } catch (error) {
    console.error(error);
    ui.mostrarNotificacion(error.message, 'error');
  } finally {
    ui.confirmSaleBtn.disabled = false;
  }
}

// Consultar las transacciones del backend y mandárselas a la UI
async function cargarHistorialBackend() {
  try {
    const respuesta = await fetch('/api/productos/historial');
    if (!respuesta.ok) throw new Error('No se pudo obtener el historial.');
    
    const historial = await respuesta.json();
    ui.renderizarHistorial(historial);
  } catch (error) {
    console.error('Error al cargar historial:', error);
  }
}

// Comunicarse con la ruta DELETE para anular una venta
async function procesarDevoluciónBackend(idVenta) {
  try {
    const respuesta = await fetch(`/api/productos/devolucion/${idVenta}`, {
      method: 'DELETE'
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.error || 'No se pudo procesar la devolución.');
    }

    ui.mostrarNotificacion('Devolución procesada. El almacén y las ganancias han sido actualizados.', 'success');

    // Volver a traer los productos del servidor porque su stock aumentó con la devolución
    const respProd = await fetch('/api/productos');
    if (respProd.ok) {
      todosLosProductos = await respProd.json();
      ui.renderizarLista(todosLosProductos);
      ui.renderizarEstadisticas(todosLosProductos);
    }

    await cargarHistorialBackend();

  } catch (error) {
    console.error(error);
    ui.mostrarNotificacion(error.message, 'error');
  }
}

// Lógica asíncrona para destruir la cookie y cerrar sesión
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
      
        const respuesta = await fetch('/api/auth/logout', { method: 'POST' });

        if (respuesta.ok) {
         
          window.location.href = '/login.html';
        } else {
          console.error('No se pudo cerrar la sesión en el servidor.');
        }
      } catch (error) {
        console.error('Error en la conexión al cerrar sesión:', error);
      }
    });
  }
});