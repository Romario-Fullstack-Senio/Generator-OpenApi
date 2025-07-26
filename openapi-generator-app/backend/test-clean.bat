@echo off
echo 🧪 Probando la limpieza de nombres duplicados...

REM Crear directorio de prueba
if not exist "test-output" mkdir test-output

REM Crear archivo de prueba con nombres duplicados
echo // Archivo de prueba con nombres duplicados > test-output\test.ts
echo import { NoveltyDTODTO } from './models/noveltyDTODTO'; >> test-output\test.ts
echo import { UserDTODTO, ApiDTODTO } from './models'; >> test-output\test.ts
echo. >> test-output\test.ts
echo export class TestServiceDTODTO { >> test-output\test.ts
echo   private noveltyDTODTO: NoveltyDTODTO; >> test-output\test.ts
echo. >> test-output\test.ts
echo   constructor(data: NoveltyDTODTO) { >> test-output\test.ts
echo     this.noveltyDTODTO = data; >> test-output\test.ts
echo   } >> test-output\test.ts
echo. >> test-output\test.ts
echo   processNoveltyDTODTO(novelty: NoveltyDTODTO): NoveltyDTODTO { >> test-output\test.ts
echo     return this.noveltyDTODTO; >> test-output\test.ts
echo   } >> test-output\test.ts
echo } >> test-output\test.ts

echo.
echo 📄 Contenido ANTES de la limpieza:
type test-output\test.ts

echo.
echo 🧹 Ejecutando script de limpieza...
npm run clean-names

echo.
echo 📄 Contenido DESPUÉS de la limpieza:
if exist "actuator-client" (
    echo ✅ Directorio actuator-client encontrado
) else (
    echo ❌ Directorio actuator-client no encontrado - ejecutando limpieza en archivo de prueba
    node -e "const fs = require('fs'); const content = fs.readFileSync('./test-output/test.ts', 'utf8'); const clean = content.replace(/(\w+)DTODTO/g, '$1DTO'); fs.writeFileSync('./test-output/test.ts', clean, 'utf8');"
    type test-output\test.ts
)

echo.
echo 🗑️ Limpiando archivos de prueba...
if exist "test-output" rmdir /s /q test-output

echo ✅ Prueba completada!
pause
