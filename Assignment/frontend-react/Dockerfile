# 1단계: React 애플리케이션 빌드
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run lint
RUN npm run build


# 2단계: 빌드된 React 파일을 별도 FE 서버로 실행
FROM node:22-alpine AS runtime

WORKDIR /app

RUN npm install --global serve@14.2.6

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]