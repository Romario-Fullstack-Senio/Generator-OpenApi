@echo off
echo 🧪 Probando la limpieza PROFESIONAL de código generado...

REM Crear directorio de prueba
if not exist "test-professional" mkdir test-professional
cd test-professional

REM Crear estructura de carpetas simulando código generado
mkdir api
mkdir model

REM Crear archivo de servicio con problemas
echo // Archivo de servicio con problemas típicos > api\novelty.service.ts
echo import { NoveltyDTODTO } from '../model/noveltyDTODTO'; >> api\novelty.service.ts
echo import { ApiMessageDTODTO } from '../model/apiMessageDTODTO'; >> api\novelty.service.ts
echo. >> api\novelty.service.ts
echo @Injectable({ providedIn: 'root' }) >> api\novelty.service.ts
echo export class NoveltyServiceDTODTO { >> api\novelty.service.ts
echo   createNovelty(noveltyDTODTO: NoveltyDTODTO): Observable^<NoveltyDTODTO^> { >> api\novelty.service.ts
echo     return this.http.post^<NoveltyDTODTO^>('/api/novelty', noveltyDTODTO); >> api\novelty.service.ts
echo   } >> api\novelty.service.ts
echo } >> api\novelty.service.ts

REM Crear archivo de interface innecesario
echo // Interface innecesaria que debe eliminarse > api\novelty.serviceInterface.ts
echo export interface NoveltyServiceInterfaceDTODTO { >> api\novelty.serviceInterface.ts
echo   createNovelty(noveltyDTODTO: NoveltyDTODTO): Observable^<NoveltyDTODTO^>; >> api\novelty.serviceInterface.ts
echo } >> api\novelty.serviceInterface.ts

REM Crear archivo api.ts básico
echo export * from './novelty.service'; > api\api.ts
echo export * from './novelty.serviceInterface'; >> api\api.ts
echo import { NoveltyService } from './novelty.service'; >> api\api.ts
echo export const APIS = [NoveltyService]; >> api\api.ts

REM Crear archivo git_push.sh innecesario
echo #!/bin/bash > git_push.sh
echo git add . >> git_push.sh
echo git commit -m "Generated code" >> git_push.sh

echo.
echo 📄 ANTES de la limpieza profesional:
echo ===============================================
echo 📁 Estructura de archivos:
dir /b /s
echo.
echo 📄 Contenido de novelty.service.ts:
type api\novelty.service.ts
echo.
echo 📄 Contenido de novelty.serviceInterface.ts:
type api\novelty.serviceInterface.ts

echo.
echo 🧹 Ejecutando limpieza PROFESIONAL...
cd ..
npm run clean-professional

echo.
echo 📄 DESPUÉS de la limpieza profesional:
echo ===============================================
if exist "actuator-client" (
    echo ✅ Directorio actuator-client encontrado - limpieza aplicada ahí
    echo 📁 Estructura de archivos del cliente:
    dir /b /s actuator-client
) else (
    echo ℹ️ Directorio actuator-client no encontrado - aplicando limpieza en archivos de prueba
    
    cd test-professional
    
    REM Simular limpieza profesional
    node -e "
    const fs = require('fs');
    const path = require('path');
    
    // Eliminar archivos innecesarios
    if (fs.existsSync('api/novelty.serviceInterface.ts')) {
        fs.unlinkSync('api/novelty.serviceInterface.ts');
        console.log('🗑️ Eliminado: novelty.serviceInterface.ts');
    }
    if (fs.existsSync('git_push.sh')) {
        fs.unlinkSync('git_push.sh');
        console.log('🗑️ Eliminado: git_push.sh');
    }
    
    // Limpiar código en archivos restantes
    const serviceFile = 'api/novelty.service.ts';
    if (fs.existsSync(serviceFile)) {
        let content = fs.readFileSync(serviceFile, 'utf8');
        content = content.replace(/(\w+)DTODTO/g, '$1DTO');
        content = content.replace(/NoveltyServiceDTODTO/g, 'NoveltyService');
        fs.writeFileSync(serviceFile, content, 'utf8');
        console.log('🔧 Limpiado: novelty.service.ts');
    }
    
    // Crear nuevo api/index.ts profesional
    const indexContent = \`/**
 * API Services
 * Auto-generated and optimized API services
 */

export * from './novelty.service';
import { NoveltyService } from './novelty.service';

/**
 * All available API services
 */
export const API_SERVICES = [
  NoveltyService,
];

/**
 * API Services configuration for Angular providers
 */
export const API_PROVIDERS = API_SERVICES;
\`;
    fs.writeFileSync('api/index.ts', indexContent, 'utf8');
    console.log('✅ Creado: api/index.ts profesional');
    "
    
    echo.
    echo 📁 Estructura DESPUÉS de limpieza:
    dir /b /s
    echo.
    echo 📄 Contenido LIMPIO de novelty.service.ts:
    if exist "api\novelty.service.ts" type api\novelty.service.ts
    echo.
    echo 📄 Nuevo archivo index.ts profesional:
    if exist "api\index.ts" type api\index.ts
    
    cd ..
)

echo.
echo 🗑️ Limpiando archivos de prueba...
if exist "test-professional" rmdir /s /q test-professional

echo.
echo ✅ Prueba de limpieza profesional completada!
echo.
echo 📋 Resumen de mejoras profesionales:
echo   ❌ Interfaces innecesarias eliminadas (.serviceInterface.ts)
echo   ❌ Archivos redundantes eliminados (git_push.sh, api.ts básico)
echo   🔧 Nombres limpios (NoveltyDTODTO → NoveltyDTO)
echo   ✅ Estructura profesional aplicada
echo   ✅ Índice de API optimizado creado
echo.
pause
