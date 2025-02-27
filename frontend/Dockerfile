FROM node:23
WORKDIR /app
COPY ./app .
COPY ./entrypoint.sh /entrypoint.sh
RUN yarn
EXPOSE 3000
ENTRYPOINT [ "sh", "/entrypoint.sh" ]
