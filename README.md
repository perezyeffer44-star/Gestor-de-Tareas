# 🚀 TaskManager Pro - Gestor de Tareas Full Stack

> Aplicación web Full Stack para la gestión de tareas en tiempo real, desplegada en la nube con arquitectura desacoplada y almacenamiento persistente.

---

## 📌 Tabla de Contenido
- [Demo en Vivo](#-demo-en-vivo)
- [Características](#-características)
- [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
- [Instalación Local](#-instalación-local)
- [Variables de Entorno](#-variables-de-entorno)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Aprendizajes y Retos Técnicos](#-aprendizajes-y-retos-técnicos)

---

## 🌐 Demo en Vivo
- **Aplicación Web:** [https://gestor-de-tareas-defh.onrender.com](https://gestor-de-tareas-defh.onrender.com)
- **API Endpoint:** [https://gestor-de-tareas-defh.onrender.com/api/tareas](https://gestor-de-tareas-defh.onrender.com/api/tareas)

---

## ✨ Características
- 📝 **Creación de Tareas:** Alta de tareas con título y descripción.
- 🔄 **Sincronización Asíncrona:** Interfaz dinámica mediante peticiones `fetch` sin recargar la página.
- ☑️ **Gestión de Estados:** Marcar tareas como pendientes o completadas.
- 🗑️ **Eliminación:** Borrado de registros directamente en la base de datos.
- 💾 **Persistencia de Datos:** Conexión a base de datos PostgreSQL remota.

---

## 🛠️ Arquitectura y Tecnologías

### **Frontend**
- **HTML5 & CSS3:** Estructura semántica y diseño dinámico.
- **JavaScript (ES6+):** Manipulación del DOM y consumo de API mediante rutas relativas asíncronas (`async/await`, `fetch`).

### **Backend**
- **Python (Flask):** Servidor HTTP y enrutamiento API REST.
- **Gunicorn:** Servidor WSGI listo para producción.

### **Base de Datos & Infraestructura**
- **PostgreSQL:** Base de datos relacional para almacenamiento en la nube.
- **Render:** Hosting del Web Service y servidor PostgreSQL.
- **Git & GitHub:** Control de versiones e integración continua (CI/CD) con autodespliegue.

---

## ⚙️ Variables de Entorno
Para el funcionamiento en producción, se requiere configurar la siguiente variable en Render:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URI de conexión a la base de datos PostgreSQL | `postgresql://usuario:password@host/database` |

---

## 🔌 Endpoints de la API

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/tareas` | Obtiene la lista completa de tareas en formato JSON |
| `POST` | `/api/tareas` | Crea una nueva tarea |
| `PUT` | `/api/tareas/<id>` | Actualiza el estado o detalles de una tarea existente |
| `DELETE` | `/api/tareas/<id>` | Elimina una tarea por su ID |

---

## 💡 Aprendizajes y Retos Técnicos
- **Migración de Entorno:** Transición de una base de datos local SQLite a un servidor PostgreSQL administrado en la nube.
- **Rutas Relativas vs Rutas Absolutas:** Corrección de peticiones CORS y hardcoded `localhost` para permitir la comunicación fluida entre cliente y servidor en producción.
- **Manejo de Archivos Estáticos:** Configuración de Flask para servir contenido estático (`send_from_directory`) y evitar errores 404 en la navegación.