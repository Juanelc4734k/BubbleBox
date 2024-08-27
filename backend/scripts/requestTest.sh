#!/bin/bash

# Función para realizar una solicitud POST
realizar_solicitud() {
    local endpoint=$1
    local datos=$2
    
    echo "Probando $endpoint con datos: $datos"
    curl -X POST \
         -H "Content-Type: application/json" \
         -d "$datos" \
         http://localhost:3000/auth/$endpoint
    echo -e "\n"
}

# Pruebas para el registro de usuario
echo "Pruebas de registro de usuario:"

# Caso válido
realizar_solicitud "register" '{"nombre":"Juan Pérez","username":"juanp","email":"juan@example.com","contraseña":"Abc123!@#"}'

# Nombre inválido
realizar_solicitud "register" '{"nombre":"J","username":"juanp","email":"juan@example.com","contraseña":"Abc123!@#"}'

# Nombre de usuario inválido
realizar_solicitud "register" '{"nombre":"Juan Pérez","username":"ju","email":"juan@example.com","contraseña":"Abc123!@#"}'

# Correo electrónico inválido
realizar_solicitud "register" '{"nombre":"Juan Pérez","username":"juanp","email":"juanexample.com","contraseña":"Abc123!@#"}'

# Contraseña inválida
realizar_solicitud "register" '{"nombre":"Juan Pérez","username":"juanp","email":"juan@example.com","contraseña":"abc123"}'


echo "Pruebas completadas."
