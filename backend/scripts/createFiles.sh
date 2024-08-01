#!/bin/bash

# Lista de servicios
services=(
  "auth"
  "chats"
  "communities"
  "friendships"
  "music-player"
  "notifications"
  "posts"
  "reels"
  "stories"
  "users"
)

# Ruta base de los servicios
base_path="../services"

# Crear config y db.js para cada servicio
for service in "${services[@]}"; do
  config_path="$base_path/$service/src/config"
  db_file="$config_path/db.js"
  
  # Crear la carpeta config si no existe
  if [ ! -d "$config_path" ]; then
    mkdir -p "$config_path"
  fi
  
  # Crear el archivo db.js si no existe
  if [ ! -f "$db_file" ]; then
    echo "// Configuración de la base de datos" > "$db_file"
  fi

  echo "Config directory and db.js created for $service"
done

echo "All config directories and db.js files have been created."
