# ==========================================
# BACKEND DE TASKMANAGER PRO CON POSTGRESQL
# ==========================================

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

# Configuramos CORS explícitamente para permitir métodos y cabeceras
CORS(app, resources={r"/api/*": {"origins": "*"}}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configuración de la conexión a PostgreSQL con tus credenciales
DB_CONFIG = {
    "dbname": "Gestor_Tareas",
    "user": "postgres",
    "password": "postgrest",
    "host": "localhost",
    "port": "5432"
}

# Función auxiliar para conectar a PostgreSQL
def conectar_db():
    conexion = psycopg2.connect(**DB_CONFIG)
    return conexion

# Función para inicializar la tabla de tareas si no existe
def inicializar_db():
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tareas (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(100) NOT NULL,
            descripcion TEXT,
            completada BOOLEAN DEFAULT FALSE
        )
    ''')
    conexion.commit()
    cursor.close()
    conexion.close()

# Inicializamos la base de datos al arrancar la aplicación
inicializar_db()

# 1. RUTA PARA GESTIONAR TAREAS (GET y POST)
@app.route('/api/tareas', methods=['GET', 'POST'])
def gestionar_tareas():
    conexion = conectar_db()
    # Usamos RealDictCursor para obtener los resultados como diccionarios (clave-valor)
    cursor = conexion.cursor(cursor_factory=RealDictCursor)

    if request.method == 'POST':
        nueva_tarea = request.get_json()
        
        if not nueva_tarea or 'titulo' not in nueva_tarea:
            cursor.close()
            conexion.close()
            return jsonify({"error": "El título es obligatorio"}), 400
        
        titulo = nueva_tarea['titulo']
        descripcion = nueva_tarea.get('descripcion', '')

        # Insertamos en PostgreSQL asegurando que nazca como no completada (False)
        cursor.execute('INSERT INTO tareas (titulo, descripcion, completada) VALUES (%s, %s, %s)', (titulo, descripcion, False))
        conexion.commit()
        cursor.close()
        conexion.close()
        
        return jsonify({
            "mensaje": "Tarea creada con éxito", 
            "tarea": {"titulo": titulo, "descripcion": descripcion, "completada": False}
        }), 201
    
    # Si es GET, consultamos todas las tareas incluyendo la columna 'completada'
    cursor.execute('SELECT id, titulo, descripcion, completada FROM tareas ORDER BY id ASC')
    lista_tareas = cursor.fetchall()
    cursor.close()
    conexion.close()

    return jsonify(lista_tareas)

# 2. RUTA PARA ACTUALIZAR TAREAS (PUT)
@app.route('/api/tareas/<int:id_tarea>', methods=['PUT'])
def actualizar_tarea_backend(id_tarea):
    datos = request.get_json()
    if not datos or 'titulo' not in datos:
        return jsonify({"error": "El título es obligatorio para actualizar"}), 400

    conexion = conectar_db()
    cursor = conexion.cursor(cursor_factory=RealDictCursor)

    # Verificamos si la tarea existe
    cursor.execute('SELECT * FROM tareas WHERE id = %s', (id_tarea,))
    tarea_existente = cursor.fetchone()

    if not tarea_existente:
        cursor.close()
        conexion.close()
        return jsonify({"error": "No se encontró la tarea con ese ID"}), 404

    # Capturamos el estado 'completada' (si no viene en los datos, mantenemos el valor actual de la BD)
    completada = datos.get('completada', tarea_existente['completada'])

    # Actualizamos en PostgreSQL incluyendo la columna completada
    cursor.execute('''
        UPDATE tareas 
        SET titulo = %s, descripcion = %s, completada = %s 
        WHERE id = %s
    ''', (datos['titulo'], datos.get('descripcion', ''), completada, id_tarea))
    
    conexion.commit()
    cursor.close()
    conexion.close()

    # Devolvemos la respuesta con el estado real actualizado
    return jsonify({
        "mensaje": "Tarea actualizada con éxito",
        "tarea": {
            "id": id_tarea, 
            "titulo": datos['titulo'], 
            "descripcion": datos.get('descripcion', ''),
            "completada": completada
        }
    }), 200

# 3. RUTA PARA ELIMINAR TAREAS (DELETE)
@app.route('/api/tareas/<int:id_tarea>', methods=['DELETE'])
def eliminar_tarea_backend(id_tarea):
    conexion = conectar_db()
    cursor = conexion.cursor(cursor_factory=RealDictCursor)

    # Verificamos si existe antes de borrar
    cursor.execute('SELECT * FROM tareas WHERE id = %s', (id_tarea,))
    tarea_existente = cursor.fetchone()

    if not tarea_existente:
        cursor.close()
        conexion.close()
        return jsonify({"error": "No se encontró la tarea con ese ID"}), 404

    # Eliminamos de PostgreSQL
    cursor.execute('DELETE FROM tareas WHERE id = %s', (id_tarea,))
    conexion.commit()
    cursor.close()
    conexion.close()

    return jsonify({
        "mensaje": "Tarea eliminada con éxito",
        "id_eliminado": id_tarea
    }), 200

if __name__ == '__main__':
    app.run(debug=True)