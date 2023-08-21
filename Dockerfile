FROM docker.io/node:lts-alpine AS runner

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package.json .

RUN npm install --force

COPY ./src ./src
COPY database.js dashboard.js index.js reasons.json ./

CMD ["dumb-init", "node", "index.js"]