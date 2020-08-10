FROM nginx:alpine

#!/bin/sh

COPY *.conf /etc/nginx/

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stahg 1
COPY ./dist /usr/share/nginx/html/profile

ENTRYPOINT ["nginx", "-g", "daemon off;"]