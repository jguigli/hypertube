FROM lscr.io/linuxserver/jackett:latest

COPY ./config/Indexers /config/Jackett/Indexers
COPY ./config/ServerConfig.json /config/Jackett/ServerConfig.json

EXPOSE 9117

ENTRYPOINT [ "/init" ]