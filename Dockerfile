# 1) Базовый образ
FROM node:20-alpine

# 2) Утилиты для сборки (если реально нужны)
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
      bash \
      git \
      openssh \
      make \
      cmake \
      g++ \
      python3

# 3) Рабочая директория
WORKDIR /app

# 4) Копируем только манифесты, чтобы кешировать npm-install
COPY package.json package-lock.json ./

# 5) Устанавливаем зависимости
RUN npm install

# 6) Копируем остальной код и делаем сборку
COPY . .
RUN npm run build

# 7) Открываем порт, который слушает ваше приложение
EXPOSE 8000

# 8) По-умолчанию запускаем dev-сервер (или замените на npm start)
CMD ["npm", "run", "dev"]
