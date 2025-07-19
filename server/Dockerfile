FROM node:lts-alpine3.17

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["sh", "-c", "npm run db:deploy && npm run start"]
# RUN npx prisma generate


# FROM node:18

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# ENV NODE_ENV production
# ENV DATABSE_URL postgresql://youruser:yourpassword@postgres:5432/yourdb
# RUN npx prisma generate
# RUN npx prisma migrate deploy
# RUN npm run build

# EXPOSE 8080
# CMD ["npm", "run", "start"]