@echo off
REM Script para generar código TypeScript Angular con nombres limpios
REM Este script usa configuraciones específicas para evitar duplicación de sufijos

echo Generando cliente TypeScript Angular con configuración optimizada...

REM Verificar que existe el archivo OpenAPI
set INPUT_FILE=
if exist "uploads\actuator-api.yaml" (
    set INPUT_FILE=uploads\actuator-api.yaml
) else if exist "uploads\actuator-api.yml" (
    set INPUT_FILE=uploads\actuator-api.yml
) else if exist "uploads\openapi.yaml" (
    set INPUT_FILE=uploads\openapi.yaml
) else (
    echo Error: No se encontró el archivo OpenAPI. Colócalo en uploads\ con nombre actuator-api.yaml
    exit /b 1
)

echo Usando archivo: %INPUT_FILE%

REM Limpiar directorio de salida anterior
if exist ".\actuator-client" (
    echo Limpiando directorio anterior...
    rmdir /s /q ".\actuator-client"
)

REM Generar el código con configuraciones optimizadas
openapi-generator-cli generate ^
  -i "%INPUT_FILE%" ^
  -g typescript-angular ^
  -o .\actuator-client ^
  --additional-properties="modelNameSuffix=,modelNamePrefix=,removeOperationIdPrefix=true,stringEnums=true,supportsES6=true,npmName=actuator-client,npmVersion=1.0.0,withInterfaces=true,useSingleRequestParameter=false,modelPropertyNaming=camelCase,enumPropertyNaming=camelCase,paramNaming=camelCase,skipFormModel=false,disallowAdditionalPropertiesIfNotPresent=false,fileNaming=kebab-case" ^
  --global-property=models,apis,supportingFiles

echo ✅ Generación completada!
echo 📁 Código generado en: .\actuator-client

REM Mostrar algunos archivos generados
echo 📋 Archivos principales generados:
dir /b /s ".\actuator-client\*.ts" | head -10

pause
