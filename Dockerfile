# Usamos una imagen oficial de Node.js
FROM node:18

# Instalamos las dependencias gráficas y de sistema operativo que necesita Puppeteer/Chrome
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Le decimos a Puppeteer que use el Chrome que acabamos de instalar
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Configuramos la carpeta de trabajo del servidor
WORKDIR /app

# Copiamos los archivos y dependencias
COPY package*.json ./
RUN npm install

# Copiamos todo el código de tu proyecto
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "src/index.js"]