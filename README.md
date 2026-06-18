# 📦 Sistema de Control de Inventarios - StockMaster

### 👥 Integrantes del Equipo
* **Integrante 1:** Danibel Palomares - **Cédula:** 32026099
* **Integrante 2:** Miguel Ramírez - **Cédula:** 27889799
* **Integrante 3:** Venezuela Pérez - **Cédula:** 32646956

---

## 🎯 Descripción del Proyecto y Objetivo
**StockMaster** es un sistema web asíncrono tipo CRUD diseñado para la gestión, registro, visualización, edición y eliminación de productos y mercancías en un almacén. El **objetivo principal** de este proyecto es ofrecer una herramienta automatizada y eficiente que optimice el control de activos, procesando los cambios en tiempo real sin necesidad de recargar la página del navegador.

Este sistema implementa una **Arquitectura de 3 Capas**, empleando **Programación Orientada a Objetos (POO)** tanto en el Frontend como en el Backend, y una **Modularización completa** para garantizar un código limpio, estructurado y escalable.

### Características Principales:
* **Gestión de Inventario Base (CRUD y Búsqueda Reactiva):** Control completo de productos con persistencia local en `inventario.json`, validaciones estrictas de datos y un sistema de búsqueda reactiva en tiempo real que filtra la tabla dinámicamente mientras el usuario escribe.

* **Ecosistema Integrado de Control, Ventas y Autenticación:** Módulo de Login protegido con persistencia de sesión segura mediante cookies, ventana modal para procesar ventas de mercancía descontando stock, panel estadístico (Dashboard) para monitorear productos, valor total y ganancias, junto con una sección de historial para auditoría y devolución de transacciones.

* **Diseño UI/UX Interactivo:** Interfaz adaptativa y agradable con alertas de sistema (Toast), estados visuales de validación y soporte para cambio nativo entre modo claro y modo oscuro.

---

## 🛠️ Instrucciones de Instalación y Ejecución

A continuación, se describen los comandos necesarios para desplegar, revisar y ejecutar este proyecto localmente:

* Primero, se descarga el proyecto desde GitHub a la máquina local y nos ubicamos dentro del directorio raíz ejecutando `git clone https://github.com/[Tu-Usuario-De-GitHub]/StockMaster.git` y luego `cd StockMaster`.

* Segundo, se descargan e instalan automáticamente todos los módulos de Node.js (como Express y el manejador de cookies) necesarios para el funcionamiento del backend con el comando `npm install`.

* Tercero, se levanta el servidor local para que la interfaz web pueda conectarse de forma asíncrona y gestionar el archivo JSON ejecutando el comando `node server.js`.

* Cuarto, una vez que la terminal indique que el servidor está escuchando, se abre el navegador web normal e ingresa a la dirección local `http://localhost:3000` para interactuar con la interfaz y verificar el comportamiento del sistema en tiempo real.