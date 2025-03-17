FROM node:18

WORKDIR /app

# Copiar los archivos package.json de cada servicio y frontend
COPY backend/gateway/package*.json ./backend/gateway/
COPY backend/services/package*.json ./backend/services/
COPY frontend/package*.json ./frontend/

# Instalar dependencias de cada parte
RUN cd backend/gateway && npm install
RUN cd backend/services && npm install
RUN cd frontend && npm install

# Copiar el resto del proyecto
COPY . .

# Asegurarse de que el directorio de scripts exista y copiar el script de inicio
RUN mkdir -p /app/backend/scripts
COPY backend/scripts/startAllServices.cjs /app/backend/scripts/

# Instalar curl para el healthcheck
RUN apt-get update && apt-get install -y curl

# Exponer los puertos necesarios
EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 3013 3014 3015

# Definir healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/users/health || exit 1

# Establecer el directorio de trabajo para el inicio del servicio
WORKDIR /app/backend

CMD ["node", "scripts/startAllServices.cjs"]
