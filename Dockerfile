# syntax=docker/dockerfile:1
FROM node:19.4 AS builder

WORKDIR /build

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN set -eux; \
    yarn prisma generate; \
    yarn build

FROM node:19
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /build/build .

CMD ["node", "index.js"]
