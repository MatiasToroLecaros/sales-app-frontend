FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Imagen de producción
FROM nginx:alpine

# Copiar archivos de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx si es necesaria
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]