FROM node:16.16.0 AS builder
WORKDIR /usr/src/app-build
COPY ./ui/front/ .
RUN  yarn install && npm run build:web

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/src/app-build/dist/ ./
COPY nginx/sourc3-front.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"] 
