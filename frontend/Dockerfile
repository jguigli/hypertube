FROM node:23

WORKDIR /app

COPY ./src/package.json .

RUN yarn

COPY ./src .
COPY ./entrypoint.sh /entrypoint.sh

EXPOSE 3000

CMD ["sh", "/entrypoint.sh"]
