FROM nginx:stable-alpine
COPY . /usr/share/nginx/html
COPY nginx/ /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]