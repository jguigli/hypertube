FROM lscr.io/linuxserver/jackett:latest

COPY ./Indexers /config/Jackett/Indexers

# TODO: Set a default admin password
# COPY ./ServerConfig.json /config/Jackett/ServerConfig.json
# COPY ./set_admin_password.sh /config/set_admin_password.sh
# RUN chmod +x /config/set_admin_password.sh

EXPOSE 9117

ENTRYPOINT [ "/init" ]