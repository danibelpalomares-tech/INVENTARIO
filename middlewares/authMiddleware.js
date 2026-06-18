// Middleware de protección de rutas basado en cookies

export const verificarSesion = (req, res, next) => {

  const token = req.cookies ? req.cookies.session_token : null;

  if (token && token === 'user_authenticated') {
    
    return next();
  } else {
  
    return res.redirect('/login.html');
  }
};