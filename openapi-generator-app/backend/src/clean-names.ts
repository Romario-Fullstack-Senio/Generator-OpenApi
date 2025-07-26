import fs from 'fs';
import path from 'path';

/**
 * Script para limpiar nombres duplicados en archivos generados por OpenAPI Generator
 * Reemplaza patrones como NoveltyDTODTO por NoveltyDTO
 */

const ACTUATOR_CLIENT_DIR = './actuator-client';

// Patrones a buscar y reemplazar
const REPLACEMENTS = [
  // Patrones específicos para el problema de doble DTO
  { from: /(\w+)DTODTO/g, to: '$1DTO' },
  { from: /(\w+)DtoDto/g, to: '$1Dto' },
  { from: /(\w+)dtoDTO/g, to: '$1DTO' },
  { from: /(\w+)DTODto/g, to: '$1DTO' },

  // Otros patrones comunes
  { from: /(\w+)APIDTO/g, to: '$1DTO' },
  { from: /(\w+)DTOAPI/g, to: '$1DTO' },
  { from: /(\w+)ModelModel/g, to: '$1Model' },
  { from: /(\w+)RequestRequest/g, to: '$1Request' },
  { from: /(\w+)ResponseResponse/g, to: '$1Response' },
];

function cleanFileName(fileName: string): string {
  let cleanName = fileName;

  // Limpiar nombres de archivos
  cleanName = cleanName.replace(/dto-dto/gi, 'dto');
  cleanName = cleanName.replace(/api-dto/gi, 'dto');
  cleanName = cleanName.replace(/model-model/gi, 'model');

  return cleanName;
}

function cleanFileContent(content: string): string {
  let cleanContent = content;

  // Aplicar reemplazos básicos
  REPLACEMENTS.forEach(({ from, to }) => {
    cleanContent = cleanContent.replace(from, to as string);
  });

  // Reemplazos adicionales específicos para imports y exports
  cleanContent = cleanContent.replace(/from.*['"].*(\w+)DTODTO['"]/g, (match) =>
    match.replace(/DTODTO/g, 'DTO')
  );
  cleanContent = cleanContent.replace(/import.*\{.*(\w+)DTODTO.*\}/g, (match) =>
    match.replace(/DTODTO/g, 'DTO')
  );
  cleanContent = cleanContent.replace(/export.*\{.*(\w+)DTODTO.*\}/g, (match) =>
    match.replace(/DTODTO/g, 'DTO')
  );

  // Reemplazos en declaraciones de clase e interface
  cleanContent = cleanContent.replace(
    /export (class|interface) (\w+)DTODTO/g,
    'export $1 $2DTO'
  );
  cleanContent = cleanContent.replace(
    /(class|interface) (\w+)DTODTO/g,
    '$1 $2DTO'
  );

  // Reemplazos en nombres de variables y parámetros
  cleanContent = cleanContent.replace(/: (\w+)DTODTO/g, ': $1DTO');
  cleanContent = cleanContent.replace(/<(\w+)DTODTO>/g, '<$1DTO>');

  return cleanContent;
}

function processDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directorio no encontrado: ${dirPath}`);
    return;
  }

  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (item.endsWith('.ts')) {
      // Procesar archivo TypeScript
      const content = fs.readFileSync(itemPath, 'utf8');
      const cleanContent = cleanFileContent(content);

      if (content !== cleanContent) {
        fs.writeFileSync(itemPath, cleanContent, 'utf8');
        console.log(`🔧 Limpiado: ${itemPath}`);
      }

      // Verificar si el nombre del archivo necesita limpieza
      const cleanName = cleanFileName(item);
      if (cleanName !== item) {
        const newPath = path.join(path.dirname(itemPath), cleanName);
        fs.renameSync(itemPath, newPath);
        console.log(`📝 Renombrado: ${item} → ${cleanName}`);
      }
    }
  });
}

function main(): void {
  console.log('🧹 Iniciando limpieza de archivos generados...');
  console.log(`📁 Directorio: ${ACTUATOR_CLIENT_DIR}`);

  processDirectory(ACTUATOR_CLIENT_DIR);

  console.log('✅ Limpieza completada!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { main as cleanGeneratedFiles };
