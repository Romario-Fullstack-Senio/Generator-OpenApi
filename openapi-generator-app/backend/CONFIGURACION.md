# Configuración OpenAPI Generator - Nombres Limpios

## Problema Resuelto

El generador estaba creando nombres duplicados como `NoveltyDTODTO` en lugar de `NoveltyDTO`. Esta configuración elimina esos sufijos duplicados.

## Configuraciones Aplicadas

### Configuraciones Principales para Nombres Limpios

- `modelNameSuffix: ""` - Elimina sufijos automáticos en los nombres de modelos
- `modelNamePrefix: ""` - Elimina prefijos automáticos en los nombres de modelos
- `removeOperationIdPrefix: true` - Remueve prefijos de operationId para nombres de métodos más limpios

### Configuraciones de Naming

- `modelPropertyNaming: "camelCase"` - Propiedades en camelCase
- `enumPropertyNaming: "camelCase"` - Enums en camelCase
- `paramNaming: "camelCase"` - Parámetros en camelCase
- `fileNaming: "kebab-case"` - Archivos en kebab-case

### Configuraciones Adicionales

- `stringEnums: true` - Genera enums como strings para mejor compatibilidad
- `supportsES6: true` - Habilita características de ES6
- `npmName: "actuator-client"` - Nombre del paquete npm
- `npmVersion: "1.0.0"` - Versión del paquete
- `withInterfaces: true` - Genera interfaces TypeScript
- `useSingleRequestParameter: false` - Usa parámetros individuales en lugar de un objeto único

## Uso

## Uso Recomendado

### ✅ Método Principal (Recomendado)

```bash
npm run generate-clean
```

Este comando:

1. Genera el código con configuraciones optimizadas
2. Ejecuta automáticamente la limpieza de nombres duplicados

### 🔧 Métodos Alternativos

#### 1. Via scripts específicos del SO:

```bash
# Windows
npm run generate-clean-win

# Linux/Mac
npm run generate-clean-unix
```

#### 2. Via API REST:

Las configuraciones se aplican automáticamente cuando usas los endpoints:

- `POST /api/generate` - Para generar desde URL
- `POST /api/generate-from-file` - Para generar desde archivo

#### 3. Solo generación (sin limpieza):

```bash
npm run generate-actuator
```

#### 4. Solo limpieza (después de generar):

```bash
npm run clean-names
```

## Regenerar el Cliente

Para regenerar el cliente actuator con nombres limpios:

1. Coloca tu archivo OpenAPI (actuator-api.yaml) en el directorio `uploads/`
2. Ejecuta: `npm run generate-clean`
3. O usa la interfaz web en `http://localhost:3001`

## Archivos de Configuración y Herramientas

- `openapitools.json` - Configuración global del CLI
- `openapi-config.json` - Configuración específica para el proyecto
- `src/app.ts` - Lógica del servidor que aplica las configuraciones automáticamente
- `src/clean-names.ts` - Script de postprocesamiento para limpiar nombres duplicados
- `generate-clean.bat/.sh` - Scripts de línea de comandos para generación limpia
