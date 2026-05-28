FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npx tsc -b && npx vite build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN sed -i 's/listen       80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]