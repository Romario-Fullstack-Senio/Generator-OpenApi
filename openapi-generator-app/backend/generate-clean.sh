#!/bin/bash

# Script para generar código TypeScript Angular con nombres limpios
# Este script usa configuraciones específicas para evitar duplicación de sufijos

echo "Generando cliente TypeScript Angular con configuración optimizada..."

# Verificar que existe el archivo OpenAPI
if [ ! -f "uploads/actuator-api.yaml" ] && [ ! -f "uploads/actuator-api.yml" ] && [ ! -f "uploads/openapi.yaml" ]; then
    echo "Error: No se encontró el archivo OpenAPI. Colócalo en uploads/ con nombre actuator-api.yaml"
    exit 1
fi

# Determinar el archivo de entrada
INPUT_FILE=""
if [ -f "uploads/actuator-api.yaml" ]; then
    INPUT_FILE="uploads/actuator-api.yaml"
elif [ -f "uploads/actuator-api.yml" ]; then
    INPUT_FILE="uploads/actuator-api.yml"
elif [ -f "uploads/openapi.yaml" ]; then
    INPUT_FILE="uploads/openapi.yaml"
fi

echo "Usando archivo: $INPUT_FILE"

# Limpiar directorio de salida anterior
if [ -d "./actuator-client" ]; then
    echo "Limpiando directorio anterior..."
    rm -rf ./actuator-client
fi

# Generar el código con configuraciones optimizadas
openapi-generator-cli generate \
  -i "$INPUT_FILE" \
  -g typescript-angular \
  -o ./actuator-client \
  --additional-properties="\
modelNameSuffix=,\
modelNamePrefix=,\
removeOperationIdPrefix=true,\
stringEnums=true,\
supportsES6=true,\
npmName=actuator-client,\
npmVersion=1.0.0,\
withInterfaces=true,\
useSingleRequestParameter=false,\
modelPropertyNaming=camelCase,\
enumPropertyNaming=camelCase,\
paramNaming=camelCase,\
skipFormModel=false,\
disallowAdditionalPropertiesIfNotPresent=false,\
fileNaming=kebab-case" \
  --global-property=models,apis,supportingFiles

echo "✅ Generación completada!"
echo "📁 Código generado en: ./actuator-client"

# Mostrar algunos archivos generados
echo "📋 Archivos principales generados:"
find ./actuator-client -name "*.ts" -type f | head -10
