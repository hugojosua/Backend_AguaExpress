# Usamos una imagen oficial de Node.js
FROM node:18

# Instalamos SOLAMENTE las herramientas de compilación que necesita Baileys para la encriptación
RUN apt-get update \
    && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Configuramos la carpeta de trabajo del servidor
WORKDIR /app

# Copiamos los archivos y dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos todo el código del proyecto
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "src/index.js"]