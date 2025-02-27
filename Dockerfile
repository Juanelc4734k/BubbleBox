FROM node:18

WORKDIR /app

COPY package*.json ./

COPY backend/gateway/package*.json ./backend/gateway/
COPY backend/services/package*.json ./backend/services/
COPY frontend/package*.json ./frontend/

RUN cd backend/gateway && npm install
RUN cd backend/services && npm install
RUN cd frontend && npm install

COPY . .

EXPOSE 3000
EXPOSE 3001
EXPOSE 3002
EXPOSE 3003
EXPOSE 3004
EXPOSE 3005
EXPOSE 3006
EXPOSE 3007
EXPOSE 3008
EXPOSE 3009
EXPOSE 3010
EXPOSE 3011
EXPOSE 3012

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/users/health || exit 1

CMD ["node", "scripts/startAllServices.cjs"]