# Stage 1: Build Stage
FROM node:20-bullseye AS build

WORKDIR /app

RUN npm install -g @yao-pkg/pkg

COPY ./package.json ./package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Runtime Stage
FROM ubuntu:22.04

WORKDIR /app

COPY --from=build /app/binary/statistics-service /app/statistics-service
COPY --from=build /app/src/swagger.yml /app/swagger.yml
COPY --from=build /app/geolite/ /app/geolite

CMD ["./statistics-service"]
