# OpenAPI Generator App

App full-stack para generar clientes y servidores desde OpenAPI sin depender de SwaggerHub.

## Que resuelve

- Carga especificaciones OpenAPI desde archivo local (`.yaml`, `.yml`, `.json`) o URL.
- Permite elegir perfiles modernos de generación:
  - Cliente Angular TypeScript (Angular 20 o Angular 21)
  - Servidor Spring Boot 3 + Jakarta
  - Spring Interface-Only para contratos
- Permite ajustar `additional-properties` y campos clave para publicación en Azure Artifacts.
- Descarga resultado como ZIP desde la UI.

## Estructura

- `backend/`: API Express + OpenAPI Generator CLI.
- `frontend/`: UI Angular 20 standalone.
- `docker-compose.yml`: despliegue conjunto backend + frontend.

## Perfiles incluidos

### Cliente Angular

- Generador: `typescript-angular`
- Propiedades clave:
  - `ngVersion`
  - `npmName`
  - `npmVersion`
  - `npmRepository` (Azure Artifacts)

### Servidor Spring

- Generador: `spring`
- Propiedades clave:
  - `useSpringBoot3=true`
  - `useJakartaEe=true`
  - `groupId`, `artifactId`, `packageName`, `packageVersion`
  - `delegatePattern`, `interfaceOnly`, `useTags`

## Uso local

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

API en `http://localhost:3001/api`.

### 2) Frontend

```bash
cd frontend
npm install
npm start
```

UI en `http://localhost:4200`.

## Flujo recomendado

1. Seleccionar tipo de entrada (archivo o URL).
2. Elegir perfil de generación.
3. Ajustar metadata (`npmName`, `npmRepository`, `groupId`, etc.).
4. Ejecutar generación.
5. Descargar ZIP generado.

## Azure Artifacts (cliente npm)

En el perfil Angular, define:

- `npmName`: nombre del paquete.
- `npmVersion`: versión semántica.
- `npmRepository`: URL del feed de Azure Artifacts.

Ejemplo de `npmRepository`:

```text
https://pkgs.dev.azure.com/ORG/PROJECT/_packaging/FEED/npm/registry/
```

## Despliegue con Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`

El frontend usa Nginx con proxy para `/api` hacia el contenedor backend.

## GitHub Pages vs Docker

- GitHub Pages sirve solo contenido estatico (HTML/CSS/JS).
- Este proyecto necesita backend para ejecutar OpenAPI Generator y empaquetar ZIP.
- Por lo tanto, para la app completa se recomienda Docker (o similar en cloud).
- GitHub Pages solo seria valido para una demo UI estatica apuntando a una API externa.
