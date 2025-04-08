# #!/bin/bash

# CONFIG_PATH="/config/Jackett/ServerConfig.json"
# ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -hex 16)}"

# # Attendre que le fichier ServerConfig.json soit créé
# for i in {1..10}; do
#     if [ -f "$CONFIG_PATH" ]; then
#         break
#     fi
#     echo "⏳ Waiting for ServerConfig.json to be created..."
#     sleep 5
# done

# if [ ! -f "$CONFIG_PATH" ]; then
#     echo "❌ ServerConfig.json not found. Aborting."
#     exit 1
# fi

# # Lire le contenu actuel du fichier JSON
# CONFIG=$(cat "$CONFIG_PATH")

# # Ajouter ou modifier le mot de passe administrateur
# UPDATED_CONFIG=$(echo "$CONFIG" | jq --arg password "$ADMIN_PASSWORD" '.AdminPassword = $password')

# # Écrire la nouvelle configuration dans le fichier
# echo "$UPDATED_CONFIG" > "$CONFIG_PATH"

# echo "✅ Admin password set to: $ADMIN_PASSWORD"