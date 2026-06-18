// Lógica interactiva de la capa Frontend para el Inicio de Sesión

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const usuarioInput = document.getElementById('usuario');
  const passwordInput = document.getElementById('password');
  
  // Elementos del control de visibilidad de contraseña (Ojito)
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const eyeOpenIcon = document.querySelector('.eye-open-icon');
  const eyeCloseIcon = document.querySelector('.eye-close-icon');

  // 1. FUNCIONALIDAD DEL OJITO
  togglePasswordBtn.addEventListener('click', () => {
   
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeOpenIcon.classList.add('hidden');
      eyeCloseIcon.classList.remove('hidden');
    } else {
     
      passwordInput.type = 'password';
      eyeOpenIcon.classList.remove('hidden');
      eyeCloseIcon.classList.add('hidden');
    }
  });

  // 2. VALIDACIÓN INTERACTIVA INLINE 
  const validarCampos = () => {
    let esValido = true;

    // Validar campo Usuario
    if (usuarioInput.value.trim() === '') {
      usuarioInput.classList.add('invalid');
      usuarioInput.classList.remove('valid');
      document.getElementById('error-usuario').textContent = 'El nombre de usuario es obligatorio.';
      esValido = false;
    } else {
      usuarioInput.classList.add('valid');
      usuarioInput.classList.remove('invalid');
      document.getElementById('error-usuario').textContent = '';
    }

    // Validar campo Contraseña
    if (passwordInput.value.length === 0) {
      passwordInput.classList.add('invalid');
      passwordInput.classList.remove('valid');
      document.getElementById('error-password').textContent = 'La contraseña es obligatoria.';
      esValido = false;
    } else {
      passwordInput.classList.add('valid');
      passwordInput.classList.remove('invalid');
      document.getElementById('error-password').textContent = '';
    }

    return esValido;
  };

  // Listeners para validar mientras el usuario escribe
  usuarioInput.addEventListener('input', validarCampos);
  passwordInput.addEventListener('input', validarCampos);

  // 3. PROCESAR ENVÍO ASÍNCRONO DEL FORMULARIO (Evitar recarga de página)
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    const credenciales = {
      usuario: usuarioInput.value.trim(),
      password: passwordInput.value
    };

    try {
      const loginBtn = document.getElementById('login-btn');
      const btnText = document.getElementById('login-btn-text');
      
      loginBtn.disabled = true;
      btnText.textContent = 'Verificando acceso...';

      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Credenciales inválidas.');
      }

      window.location.href = '/index.html';

    } catch (error) {
      console.error(error);
    
      mostrarAlertaFlotante(error.message, 'error');
    } finally {
      document.getElementById('login-btn').disabled = false;
      document.getElementById('login-btn-text').textContent = 'Ingresar al Almacén';
    }
  });
});

// Función auxiliar para renderizar alertas dinámicas flotantes
function mostrarAlertaFlotante(mensaje, tipo = 'success') {
  const container = document.getElementById('notification-container');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  
  // Icono dinámico según el tipo de alerta
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:20px; height:20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  
  toast.innerHTML = `
    <div class="toast-icon" style="color: var(--danger); display: flex; align-items: center;">${iconSvg}</div>
    <div class="toast-content" style="padding-left: 0.5rem; font-size: 0.85rem;">${mensaje}</div>
  `;
  
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 4000);
}