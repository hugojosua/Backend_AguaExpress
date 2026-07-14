# 1. Usamos Node.js versión 20 (la recomendada por Baileys)
FROM node:20-alpine

# 2. Establecemos el directorio de trabajo
WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos el resto del código del proyecto
COPY . .

# 6. Exponemos el puerto
EXPOSE 3000

# 7. Comando para iniciar la aplicación
CMD ["node", "src/index.js"]