# Dockerfile del motor de detección Python
# Construye una imagen minimal con Python 3.12 y todas las reglas

FROM python:3.12-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los requirements primero para aprovechar la caché de Docker
# Si solo cambia el código, no reinstala las dependencias
COPY detection/requirements.txt .

# Instalamos las dependencias sin cache de pip para reducir tamaño de imagen
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el código del motor (reglas + engine.py)
COPY detection/ .

# Arrancamos el motor como proceso principal del contenedor
CMD ["python", "engine.py"]