# Regla de detección: Modificación de archivos críticos
# Detecta cuando se ejecutan comandos que modifican archivos sensibles del sistema
# como /etc/passwd, /etc/shadow, /etc/sudoers, etc.
#
# La lógica busca comandos sudo que contengan rutas de archivos críticos
# y editores o comandos de escritura conocidos (nano, vim, echo, tee, cp, mv).

import re
import json
from pathlib import Path

# Fichero de estado para persistir entre reinicios del motor
FICHERO_ESTADO = Path(__file__).parent / ".estado_archivos_criticos.json"

# IDs de eventos ya procesados para no alertar dos veces del mismo evento
if FICHERO_ESTADO.exists():
    with open(FICHERO_ESTADO, 'r') as f:
        eventos_procesados = set(json.load(f))
else:
    eventos_procesados = set()

# Rutas de archivos críticos que queremos proteger
# Una modificación en cualquiera de ellos se considera sospechosa
ARCHIVOS_CRITICOS = [
    "/etc/passwd",
    "/etc/shadow",
    "/etc/sudoers",
    "/etc/ssh/sshd_config",
    "/etc/hosts",
    "/etc/crontab",
    "/root/.ssh/authorized_keys"
]

# Comandos que pueden modificar archivos
# Si alguno de estos aparece junto a un archivo crítico → alerta
COMANDOS_EDICION = [
    "nano", "vim", "vi", "emacs",  # Editores de texto
    "echo", "printf",                # Escritura directa
    "tee",                           # Redirección
    "cp", "mv",                      # Copia o movimiento
    "chmod", "chown",                # Cambio de permisos o propietario
    "sed", "awk",                    # Procesadores que pueden modificar
    ">", ">>",                       # Redirecciones de shell
    "useradd", "usermod", "userdel", # Gestión de usuarios
    "passwd"                         # Cambio de contraseña
]


def guardar_estado():
    """Persiste en disco los IDs de eventos procesados"""
    eventos_limitados = list(eventos_procesados)[-5000:]
    with open(FICHERO_ESTADO, 'w') as f:
        json.dump(eventos_limitados, f)


def contiene_comando_edicion(comando):
    """
    Comprueba si el comando incluye alguna herramienta de edición
    Busca palabras completas para evitar falsos positivos
    """
    comando_lower = comando.lower()
    for editor in COMANDOS_EDICION:
        patron = r'\b' + re.escape(editor) + r'\b'
        if re.search(patron, comando_lower):
            return editor
    return None


def detectar(es, log_alerta):
    """
    Busca eventos de sudo que intenten modificar archivos críticos.
    Solo alerta cuando se combinan dos condiciones:
    - El comando contiene una ruta de archivo crítico
    - El comando incluye una herramienta de edición
    """
    query = {
        "size": 100,
        "sort": [{"@timestamp": "desc"}],
        "query": {
            "bool": {
                "must": [
                    {"match_phrase": {"message": "COMMAND="}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }

    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    hubo_cambios = False

    for hit in hits:
        evento_id = hit["_id"]

        # Evitamos procesar eventos ya vistos
        if evento_id in eventos_procesados:
            continue

        eventos_procesados.add(evento_id)
        hubo_cambios = True

        mensaje = hit["_source"].get("message", "")


        # Comprobamos si el comando afecta a algún archivo crítico
        archivo_afectado = None
        for archivo in ARCHIVOS_CRITICOS:
            if archivo in mensaje:
                archivo_afectado = archivo
                break

        if not archivo_afectado:
            continue

        # Comprobamos si hay alguna herramienta de edición en el comando
        editor_detectado = contiene_comando_edicion(mensaje)

        if not editor_detectado:
            continue

        # Si llegamos aquí, es una modificación sospechosa
        log_alerta(
            "MODIFICACIÓN DE ARCHIVO CRÍTICO",
            f"Archivo {archivo_afectado} modificado con {editor_detectado}",
            "ALTA"
        )

    if hubo_cambios:
        guardar_estado()