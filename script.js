// ==========================================
// ESTADO Y DOM
// ==========================================
const formulario = document.querySelector('.formulario-tarea');
const inputTitulo = document.querySelector('#titulo-tarea');
const inputDescripcion = document.querySelector('#descripcion-tarea');
const contenedorTareas = document.querySelector('#contenedor-tareas');

let tareas = [];
let filtroActual = 'todas'; // Variable global para recordar el filtro seleccionado ('todas', 'pendientes', 'completadas')

// ==========================================
// FUNCIONES DE RENDERIZADO Y GESTIÓN
// ==========================================

function renderizarTareas() {
    contenedorTareas.innerHTML = "";

    // 1. FILTRADO DE TAREAS: Creamos un nuevo array basado en el botón de filtro activo
    const tareasFiltradas = tareas.filter(function(tarea) {
        if (filtroActual === 'pendientes') {
            return !tarea.completada; // Devuelve solo las tareas que NO están completadas
        } else if (filtroActual === 'completadas') {
            return tarea.completada;  // Devuelve solo las tareas que SÍ están completadas
        }
        return true; // Si el filtro es 'todas', las devuelve todas
    });

    if (tareasFiltradas.length === 0) {
        contenedorTareas.innerHTML = `<p class="mensaje-vacio">No hay tareas que mostrar en esta sección.</p>`;
        return;
    }

    // 2. Recorremos únicamente las tareas ya filtradas para dibujarlas en el DOM
    tareasFiltradas.forEach(function(tarea) {
        const tarjetaTarea = document.createElement('div');
        tarjetaTarea.classList.add('tarjeta-tarea');

        // Si la tarea está completada, aplicamos un estilo visual tachado para mayor claridad
        const estiloTexto = tarea.completada ? 'text-decoration: line-through; color: #888;' : '';

        // Añadimos el checkbox interactivo, el título, la descripción y los botones
        tarjetaTarea.innerHTML = `
            <div class="tarea-info">
                <input type="checkbox" class="checkbox-completada" data-id="${tarea.id}" ${tarea.completada ? 'checked' : ''}>
                <span style="${estiloTexto}">
                    <strong>${tarea.titulo}</strong>
                </span>
                <p style="${estiloTexto}">${tarea.descripcion || "Sin descripción proporcionada."}</p>
            </div>
            <div class="tarea-acciones">
                <button class="btn-editar" data-id="${tarea.id}">Editar</button>
                <button class="btn-eliminar" data-id="${tarea.id}">Eliminar</button>
            </div>
        `;

        contenedorTareas.appendChild(tarjetaTarea);
    });

    // 3. Configurar los eventos de los elementos generados dinámicamente
    configurarEventosTarjetas();
}

// Función auxiliar para mantener limpio el registro de eventos de las tarjetas
function configurarEventosTarjetas() {
    // Checkboxes para cambiar el estado (completada / pendiente)
    const checkboxesCompletada = document.querySelectorAll('.checkbox-completada');
    checkboxesCompletada.forEach(function(checkbox) {
        checkbox.addEventListener('change', async function() {
            const idTarea = this.getAttribute('data-id');
            const nuevoEstado = this.checked;
            
            const tareaActual = tareas.find(t => t.id == idTarea);
            if (tareaActual) {
                await cambiarEstadoTarea(idTarea, tareaActual.titulo, tareaActual.descripcion, nuevoEstado);
            }
        });
    });

    // Botones de ELIMINAR
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(function(boton) {
        boton.addEventListener('click', function() {
            const indiceTarea = this.getAttribute('data-id');
            eliminarTarea(indiceTarea);
        });
    });

    // Botones de EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(function(boton) {
        boton.addEventListener('click', function() {
            const indiceTarea = this.getAttribute('data-id');
            actualizarTarea(indiceTarea);
        });
    });
}

function guardarTareas() {
    localStorage.setItem('mis_tareas', JSON.stringify(tareas));
}

// ==========================================
// FUNCIÓN PARA CAMBIAR EL ESTADO (PUT - CHECKBOX)
// ==========================================
async function cambiarEstadoTarea(id, titulo, descripcion, completada) {
    try {
        const tareaActualizada = {
            titulo: titulo,
            descripcion: descripcion,
            completada: completada
        };

        const respuesta = await fetch(`http://127.0.0.1:5000/api/tareas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tareaActualizada)
        });

        if (!respuesta.ok) {
            throw new Error(`Error al actualizar el estado: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();
        console.log("¡Estado de la tarea actualizado con éxito en el backend!", resultado);

        await inicializarApp();

    } catch (error) {
        console.error("No se pudo conectar con el servidor para actualizar el estado:", error);
        alert("Hubo un error al actualizar el estado de la tarea.");
    }
}

// ==========================================
// FUNCIÓN PARA ELIMINAR TAREAS (DELETE)
// ==========================================
async function eliminarTarea(indice) {
    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/api/tareas/${indice}`, {
            method: 'DELETE'
        });

        if (!respuesta.ok) {
            throw new Error(`Error al eliminar la tarea: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();
        console.log("¡Tarea eliminada en el backend con éxito!", resultado);

        await inicializarApp();

    } catch (error) {
        console.error("No se pudo eliminar la tarea en el backend:", error);
        alert("Hubo un error al conectar con el servidor para eliminar la tarea.");
    }
}

// ==========================================
// FUNCIÓN PARA EDITAR TAREAS (PUT - TEXTO)
// ==========================================
async function actualizarTarea(indice) {
    const tareaActual = tareas.find(t => t.id == indice);
    
    const nuevoTitulo = prompt("Edita el título de la tarea:", tareaActual ? tareaActual.titulo : "");
    if (nuevoTitulo === null || nuevoTitulo.trim() === "") return;

    const nuevaDescripcion = prompt("Edita la descripción de la tarea:", tareaActual ? tareaActual.descripcion : "");

    const tareaActualizada = {
        titulo: nuevoTitulo.trim(),
        descripcion: nuevaDescripcion ? nuevaDescripcion.trim() : "",
        completada: tareaActual ? tareaActual.completada : false
    };

    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/api/tareas/${indice}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tareaActualizada)
        });

        if (!respuesta.ok) {
            throw new Error(`Error al actualizar: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();
        console.log("¡Tarea actualizada con éxito en el backend!", resultado);

        await inicializarApp();

    } catch (error) {
        console.error("No se pudo conectar con el servidor para actualizar:", error);
        alert("Hubo un error al actualizar la tarea.");
    }
}

// ==========================================
// ESCUCHADOR DE EVENTOS (FORMULARIO - POST)
// ==========================================
formulario.addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const titulo = inputTitulo.value.trim();
    const descripcion = inputDescripcion.value.trim();

    if (titulo === "") {
        alert("El título de la tarea no puede estar vacío.");
        inputTitulo.focus();
        return;
    }

    if (titulo.length < 3) {
        alert("El título debe tener al menos 3 caracteres.");
        inputTitulo.focus();
        return;
    }

    const nuevaTarea = {
        titulo: titulo,
        descripcion: descripcion
    };

    try {
        const respuesta = await fetch('http://127.0.0.1:5000/api/tareas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaTarea)
        });

        if (!respuesta.ok) {
            throw new Error(`Error en el servidor: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();
        console.log("¡Tarea creada en el backend con éxito!", resultado);

        await inicializarApp();

        formulario.reset();
        inputTitulo.focus();

    } catch (error) {
        console.error("No se pudo guardar la tarea en el backend:", error);
        alert("Hubo un error al conectar con el servidor para guardar la tarea.");
    }
});

// ==========================================
// ESCUCHADORES DE EVENTOS PARA LOS FILTROS
// ==========================================
const botonesFiltro = document.querySelectorAll('.btn-filtro');
botonesFiltro.forEach(function(boton) {
    boton.addEventListener('click', function() {
        // 1. Removemos la clase 'activo' de todos los botones de filtro
        botonesFiltro.forEach(b => b.classList.remove('activo'));
        
        // 2. Añadimos la clase 'activo' únicamente al botón que fue presionado
        this.classList.add('activo');

        // 3. Capturamos el valor del atributo 'data-filtro' (todas, pendientes, completadas)
        filtroActual = this.getAttribute('data-filtro');

        // 4. Volvemos a renderizar las tareas aplicando el nuevo filtro
        renderizarTareas();
    });
});

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN (FULL STACK)
// ==========================================
async function inicializarApp() {
    try {
        const respuesta = await fetch('/api/tareas');
        
        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }
        
        const tareasBackend = await respuesta.json();
        
        tareas = tareasBackend;
        
        renderizarTareas();
        
        console.log("¡Aplicación sincronizada con el backend con éxito!");

    } catch (error) {
        console.error("No se pudo conectar con el backend de Python:", error);
    }
}

inicializarApp();