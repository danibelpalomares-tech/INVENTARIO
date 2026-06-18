import express from 'express';

const router = express.Router();

const USUARIO_VALIDO = 'admin';
const PASSWORD_VALIDO = '12345678';

// 1. ENDPOINT PARA INICIAR SESIÓN }
router.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  if (usuario === USUARIO_VALIDO && password === PASSWORD_VALIDO) {
    
    // CREACIÓN DE LA COOKIE
    res.cookie('session_token', 'user_authenticated', {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2, 
      sameSite: 'strict' 
    });

    return res.json({ success: true, message: '¡Acceso concedido!' });
  } else {
  
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
});

// 2. ENDPOINT PARA CERRAR SESIÓN
router.post('/logout', (req, res) => {
  
  res.clearCookie('session_token');
  return res.json({ success: true, message: 'Sesión cerrada correctamente.' });
});

export default router;