# Runtime image only — static assets must be built separately (`npm run build` with REACT_APP_API_URL).
# Local: `npm run build` then `docker build -t todoops-frontend .`

FROM nginx:1.28.2-alpine

COPY build/ /usr/share/nginx/html/
COPY conf/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
