import { Producto } from './Producto.js';

export class UI {
  constructor() {
    // Referencias del DOM
    this.form = document.getElementById('product-form');
    this.idInput = document.getElementById('product-id');
    this.nombreInput = document.getElementById('nombre');
    this.categoriaInput = document.getElementById('categoria');
    this.cantidadInput = document.getElementById('cantidad');
    this.precioInput = document.getElementById('precio');
    
    this.formTitle = document.getElementById('form-title');
    this.formSubtitle = document.getElementById('form-subtitle');
    this.submitBtn = document.getElementById('submit-btn');
    this.submitBtnText = document.getElementById('submit-btn-text');
    this.cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    this.tbody = document.getElementById('inventory-tbody');
    this.emptyState = document.getElementById('empty-state');
    this.searchInput = document.getElementById('search-input');
    
    // Estadísticas
    this.statUniqueCount = document.getElementById('stat-unique-count');
    this.statTotalValue = document.getElementById('stat-total-value');
    
    // Contenedor de notificaciones
    this.notificationContainer = document.getElementById('notification-container');
    
    // Modal de confirmación
    this.deleteModal = document.getElementById('delete-modal');
    this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    // Variable temporal para guardar id a eliminar
    this.idAEliminar = null;

    // Historial para animar estadísticas en tiempo real
    this.ultimoTotalProductos = 0;
    this.ultimoValorTotal = 0;

    // Inicializar listeners de input para validación interactiva
    this.configurarValidacionesInteractivas();
 
 // Referencias para el nodal de ventas
    this.saleModal = document.getElementById('sale-modal');
    this.saleForm = document.getElementById('sale-form');
    this.saleSearchInput = document.getElementById('sale-search');
    this.saleSuggestions = document.getElementById('sale-suggestions');
    this.saleProductIdInput = document.getElementById('sale-product-id');
    this.saleCategoryInput = document.getElementById('sale-category');
    this.salePriceInput = document.getElementById('sale-price');
    this.saleStockInput = document.getElementById('sale-stock');
    this.saleQuantityInput = document.getElementById('sale-quantity');
    this.confirmSaleBtn = document.getElementById('confirm-sale-btn');
    this.closeSaleModalBtn = document.getElementById('close-sale-modal-btn');
    this.statEarningsValue = document.getElementById('stat-earnings-value');

    this.gananciasTotales = 0;

    // Referencias para el nodal del historial y devoluciones
    this.historyModal = document.getElementById('history-modal');
    this.openHistoryModalBtn = document.getElementById('open-history-modal-btn');
    this.closeHistoryModalBtn = document.getElementById('close-history-modal-btn');
    this.historyTbody = document.getElementById('history-tbody');

  }

  capturarFormulario() {
    const id = this.idInput.value || null;
    const nombre = this.nombreInput.value;
    const categoria = this.categoriaInput.value;
    const cantidad = this.cantidadInput.value;
    const precio = this.precioInput.value;
    
    return new Producto(nombre, categoria, cantidad, precio, id);
  }

  limpiarFormulario() {
    this.form.reset();
    this.idInput.value = '';
    
    const inputs = [this.nombreInput, this.categoriaInput, this.cantidadInput, this.precioInput];
    inputs.forEach(input => {
      input.classList.remove('valid', 'invalid');
    });

    // Limpiar mensajes de error
    const errorSpans = ['error-nombre', 'error-categoria', 'error-cantidad', 'error-precio'];
    errorSpans.forEach(id => {
      document.getElementById(id).textContent = '';
    });

    this.formTitle.textContent = 'Registrar Producto';
    this.formSubtitle.textContent = 'Agrega un nuevo elemento al stock';
    this.submitBtnText.textContent = 'Registrar Producto';
    this.cancelEditBtn.classList.add('hidden');
  }

  prepararEdicion(producto) {
    this.limpiarFormulario();
    
    // Cargar datos
    this.idInput.value = producto.id;
    this.nombreInput.value = producto.nombre;
    this.categoriaInput.value = producto.categoria;
    this.cantidadInput.value = producto.cantidad;
    this.precioInput.value = producto.precio;

    const inputs = [this.nombreInput, this.categoriaInput, this.cantidadInput, this.precioInput];
    inputs.forEach(input => {
      input.classList.add('valid');
    });

    this.formTitle.textContent = 'Editar Producto';
    this.formSubtitle.textContent = `Modificando ID: ${producto.id}`;
    this.submitBtnText.textContent = 'Guardar Cambios';
    this.cancelEditBtn.classList.remove('hidden');
    
    this.form.scrollIntoView({ behavior: 'smooth' });
  }

  mostrarValidaciones(errores) {
    const campos = {
      nombre: { input: this.nombreInput, errorSpan: document.getElementById('error-nombre') },
      categoria: { input: this.categoriaInput, errorSpan: document.getElementById('error-categoria') },
      cantidad: { input: this.cantidadInput, errorSpan: document.getElementById('error-cantidad') },
      precio: { input: this.precioInput, errorSpan: document.getElementById('error-precio') }
    };

    for (const key in campos) {
      const campo = campos[key];
      if (errores[key]) {
        campo.input.classList.add('invalid');
        campo.input.classList.remove('valid');
        campo.errorSpan.textContent = errores[key];
      } else {
        campo.input.classList.add('valid');
        campo.input.classList.remove('invalid');
        campo.errorSpan.textContent = '';
      }
    }
  }

  configurarValidacionesInteractivas() {
    const validarCampo = () => {
      const producto = this.capturarFormulario();
      const resultado = producto.validar();
      this.mostrarValidaciones(resultado.errores);
    };

    this.nombreInput.addEventListener('input', validarCampo);
    this.categoriaInput.addEventListener('change', validarCampo);
    this.cantidadInput.addEventListener('input', validarCampo);
    this.precioInput.addEventListener('input', validarCampo);
  }

  renderizarLista(productos) {
    this.tbody.innerHTML = '';
    
    if (productos.length === 0) {
      this.emptyState.classList.remove('hidden');
      return;
    }
    
    this.emptyState.classList.add('hidden');

    productos.forEach(prod => {
      const productoObj = new Producto(prod.nombre, prod.categoria, prod.cantidad, prod.precio, prod.id);
      
      const tr = document.createElement('tr');
      tr.dataset.id = prod.id;

      const precioFormateado = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(productoObj.precio);
      const totalFormateado = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(productoObj.calcularValorTotal());
      
      const categoriaClase = productoObj.categoria.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[áéíóú]/g, c => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u'}[c]));

      tr.innerHTML = `
        <td>
          <div class="product-name-cell">
            <span class="product-name-text">${escapeHTML(productoObj.nombre)}</span>
           </div>
          </td>
        <td>
            <span class="product-id-sub">ID: ${productoObj.id}</span>
        </td>
        <td>
          <span class="category-badge ${categoriaClase}">${escapeHTML(productoObj.categoria)}</span>
        </td>
        <td class="text-right font-semibold">${productoObj.cantidad}</td>
        <td class="text-right">${precioFormateado}</td>
        <td class="text-right font-bold text-slate-100">${totalFormateado}</td>
        <td class="text-center">
          <div class="action-btns">
            <button class="btn-icon edit" title="Editar Producto" data-id="${productoObj.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button class="btn-icon delete" title="Eliminar Producto" data-id="${productoObj.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      `;
      this.tbody.appendChild(tr);
    });
  }

  // Actualizar las estadísticas
  renderizarEstadisticas(productos) {
    const totalDiferentes = productos.length;
    
    const valorTotal = productos.reduce((acumulado, prod) => {
      const productoObj = new Producto(prod.nombre, prod.categoria, prod.cantidad, prod.precio);
      return acumulado + productoObj.calcularValorTotal();
    }, 0);

    const tarjetaProductos = this.statUniqueCount.closest('.stat-card');
    const tarjetaValor = this.statTotalValue.closest('.stat-card');

    if (totalDiferentes !== this.ultimoTotalProductos) {
      tarjetaProductos.classList.remove('pulse-active');
      void tarjetaProductos.offsetWidth; 
      tarjetaProductos.classList.add('pulse-active');
      
      this.animarValor(this.statUniqueCount, this.ultimoTotalProductos, totalDiferentes, 700, false);
      this.ultimoTotalProductos = totalDiferentes;
    }

    if (Math.abs(valorTotal - this.ultimoValorTotal) > 0.01) {
      tarjetaValor.classList.remove('pulse-active');
      void tarjetaValor.offsetWidth; 
      tarjetaValor.classList.add('pulse-active');
      
      this.animarValor(this.statTotalValue, this.ultimoValorTotal, valorTotal, 700, true);
      this.ultimoValorTotal = valorTotal;
    }
  }

  // conteo numérico en tiempo real
  animarValor(elemento, inicio, fin, duracion, esMoneda = false) {
    const rango = fin - inicio;
    if (Math.abs(rango) < 0.01) {
      elemento.textContent = esMoneda 
        ? new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(fin)
        : fin;
      return;
    }
    
    const tiempoInicio = performance.now();
    
    const paso = (timestamp) => {
      const progreso = Math.min((timestamp - tiempoInicio) / duracion, 1);
      const factor = 1 - Math.pow(1 - progreso, 3);
      const valorActual = inicio + (rango * factor);
      
      if (esMoneda) {
        elemento.textContent = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(valorActual);
      } else {
        elemento.textContent = Math.floor(valorActual);
      }
      
      if (progreso < 1) {
        requestAnimationFrame(paso);
      } else {
        elemento.textContent = esMoneda 
          ? new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(fin)
          : fin;
      }
    };
    
    requestAnimationFrame(paso);
  }

  // Mostrar alertas tipo Toast flotantes
  mostrarNotificacion(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    // Iconos según el tipo
    let iconSvg = '';
    if (tipo === 'success') {
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    } else if (tipo === 'error') {
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    } else {
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">${escapeHTML(mensaje)}</div>
    `;

    this.notificationContainer.appendChild(toast);

    // Eliminar automáticamente después de 4 segundos
    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 4000);
  }

  abrirModalConfirmacion(id, nombreProducto, callbackConfirmar) {
    this.idAEliminar = id;
    this.deleteModal.querySelector('p').textContent = `¿Está seguro de que desea eliminar "${nombreProducto}"? Esta acción no se puede deshacer.`;
    this.deleteModal.classList.remove('hidden');

    const cerrarModal = () => {
      this.deleteModal.classList.add('hidden');
      this.confirmDeleteBtn.onclick = null;
      this.cancelDeleteBtn.onclick = null;
    };

    this.cancelDeleteBtn.onclick = cerrarModal;
    
    this.confirmDeleteBtn.onclick = async () => {
      cerrarModal();
      if (this.idAEliminar) {
        await callbackConfirmar(this.idAEliminar);
        this.idAEliminar = null;
      }
    };
  }

  // Abrir y limpiar el modal de ventas
  abrirModalVentas() {
    this.saleForm.reset();
    this.saleProductIdInput.value = '';
    this.saleSuggestions.innerHTML = '';
    this.saleSuggestions.classList.add('hidden');
    this.saleQuantityInput.disabled = true;
    this.confirmSaleBtn.disabled = true;
    document.getElementById('error-sale-cantidad').textContent = '';
    this.saleModal.classList.remove('hidden');
  }

  // Cerrar el modal de ventas
  cerrarModalVentas() {
    this.saleModal.classList.add('hidden');
  }

  // Mostrar la lista desplegable de sugerencias flotantes dentro del modal
  renderizarSugerenciasVenta(productosFiltrados) {
    this.saleSuggestions.innerHTML = '';
    
    if (productosFiltrados.length === 0) {
      this.saleSuggestions.classList.add('hidden');
      return;
    }

    productosFiltrados.forEach(prod => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.dataset.id = prod.id;
      
      const badgeStock = prod.cantidad <= 3 
        ? `<span class="suggestion-stock-badge" style="color: var(--danger);">¡Solo ${prod.cantidad}!</span>`
        : `<span class="suggestion-stock-badge">${prod.cantidad} u.</span>`;

      item.innerHTML = `${prod.nombre} ${badgeStock}`;
      this.saleSuggestions.appendChild(item);
    });

    this.saleSuggestions.classList.remove('hidden');
  }

  // Auto-relleno de las casillas bloqueadas cuando se selecciona un producto
  seleccionarProductoParaVenta(producto) {
    this.saleProductIdInput.value = producto.id;
    this.saleSearchInput.value = producto.nombre;
    this.saleCategoryInput.value = producto.categoria;
    this.salePriceInput.value = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(producto.precio);
    this.saleStockInput.value = `${producto.cantidad} unidades`;
    
    this.saleQuantityInput.disabled = false;
    this.saleQuantityInput.value = '';
    this.saleQuantityInput.focus();
    document.getElementById('error-sale-cantidad').textContent = '';
    
    this.saleSuggestions.classList.add('hidden');
  }

  actualizarTarjetaGanancias(monto) {
    this.gananciasTotales += monto;
    this.animarValor(this.statEarningsValue, this.gananciasTotales - monto, this.gananciasTotales, 700, true);
  }

  abrirModalHistorial() {
    this.historyModal.classList.remove('hidden');
  }

  cerrarModalHistorial() {
    this.historyModal.classList.add('hidden');
  }

  renderizarHistorial(ventas) {
    this.historyTbody.innerHTML = '';

    if (ventas.length === 0) {
      this.historyTbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="color: var(--text-secondary); padding: 2rem;">
            No se han registrado ventas todavía.
          </td>
        </tr>
      `;

      this.animarValor(this.statEarningsValue, this.gananciasTotales, 0, 700, true);
      this.gananciasTotales = 0;
      return;
    }

    const gananciasCalculadas = ventas.reduce((acumulado, v) => acumulado + v.totalPagado, 0);
    
    if (Math.abs(gananciasCalculadas - this.gananciasTotales) > 0.01) {
      this.animarValor(this.statEarningsValue, this.gananciasTotales, gananciasCalculadas, 700, true);
      this.gananciasTotales = gananciasCalculadas;
    }

    ventas.forEach(venta => {
      const tr = document.createElement('tr');
      const totalFormateado = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(venta.totalPagado);

      tr.innerHTML = `
        <td class="font-semibold" style="color: var(--primary);">${venta.idVenta}</td>
        <td><strong>${escapeHTML(venta.productoNombre)}</strong></td>
        <td class="text-right">${venta.cantidadVendida}</td>
        <td class="text-right font-bold text-slate-100">${totalFormateado}</td>
        <td class="text-center" style="color: var(--text-secondary);">${venta.fecha}</td>
        <td class="text-center">
          <button class="btn btn-danger btn-devolver" data-id="${venta.idVenta}" style="padding: 0.35rem 0.8rem; font-size: 0.75rem; border-radius: 50px; width: auto;">
            Devolver
          </button>
        </td>
      `;
      this.historyTbody.appendChild(tr);
    });
  }
}

// Función auxiliar para escapar caracteres HTML peligrosos (Seguridad XSS)
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
