# ==========================================
# GESTOR DE TAREAS EN PYTHON (BACKEND BÁSICO)
# ==========================================

# Lista que funcionará como nuestra base de datos temporal en memoria
tareas = []

def agregar_tarea(titulo, descripcion):
    """Función para crear una nueva tarea y añadirla a la lista"""
    nueva_tarea = {
        "titulo": titulo,
        "descripcion": descripcion
    }
    tareas.append(nueva_tarea)
    print(f"¡Tarea '{titulo}' agregada con éxito!")

def mostrar_tareas():
    """Función para listar todas las tareas almacenadas"""
    if not tareas:
        print("No hay tareas pendientes.")
        return
    
    print("\n--- LISTA DE TAREAS ---")
    for indice, tarea in enumerate(tareas, start=1):
        print(f"{indice}. {tarea['titulo']} - {tarea['descripcion']}")

# Probando nuestras funciones en la terminal de Python
agregar_tarea("Estudiar Python", "Repasar sintaxis básica y diccionarios")
agregar_tarea("Hacer compra", "Comprar frutas y verduras")

mostrar_tareas()