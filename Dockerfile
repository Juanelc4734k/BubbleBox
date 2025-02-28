FROM node:18

WORKDIR /app

# Copy package files first
COPY backend/gateway/package*.json ./backend/gateway/
COPY backend/services/package*.json ./backend/services/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend/gateway && npm install
RUN cd ../services && npm install
RUN cd ../../frontend && npm install

# Copy the entire project
COPY . .

# Make sure scripts directory exists and copy the start script
RUN mkdir -p /app/backend/scripts
COPY backend/scripts/startAllServices.cjs /app/backend/scripts/

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl

# Expose ports
EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Set the working directory to where the script is
WORKDIR /app/backend

CMD ["node", "scripts/startAllServices.cjs"]