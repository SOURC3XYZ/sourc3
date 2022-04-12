FROM node:16.4.2 AS builder
WORKDIR /usr/src/app-build
COPY ./ui/front/ .
RUN  npm install && npm run build

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/src/app-build/dist/ ./
COPY nginx/sourc3-front.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"] 