import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import routesProductos from './routes/productos.js';
import routesAuth from './routes/auth.js';
import { verificarSesion } from './middlewares/authMiddleware.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(cookieParser());

app.use('/api/auth', routesAuth);

app.get('/', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/productos', routesProductos);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Servidor de Inventarios iniciado con éxito`);
  console.log(` Puerto de escucha: ${PORT}`);
  console.log(` Acceder localmente en: http://localhost:${PORT}`);
  console.log(`===================================================`);
});