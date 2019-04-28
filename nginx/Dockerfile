FROM tiangolo/nginx-rtmp:latest

COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8000 8001 1935

CMD ["nginx", "-g", "daemon off;"]
