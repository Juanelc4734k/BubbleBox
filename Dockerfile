FROM node:18

WORKDIR /app

COPY package*.json ./

COPY . .

RUN cd backend/gateway && npm install
RUN cd backend/services && npm install
RUN cd frontend && npm install

CMD ["node", "scripts/startAllServices.cjs"]