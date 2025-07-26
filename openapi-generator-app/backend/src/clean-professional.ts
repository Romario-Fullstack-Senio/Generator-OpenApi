import fs from 'fs';
import path from 'path';

/**
 * Script de limpieza profesional para código generado por OpenAPI Generator
 * - Elimina archivos innecesarios como *.serviceInterface.ts
 * - Simplifica la estructura de archivos
 * - Organiza imports y exports de forma profesional
 * - Soporte dinámico para múltiples directorios
 */

// 🎯 Función para detectar directorios generados dinámicamente
function findGeneratedDirectories(): string[] {
  const currentDir = process.cwd();
  const items = fs.readdirSync(currentDir);

  // Buscar directorios que terminen en "-client"
  const clientDirs = items.filter((item) => {
    const itemPath = path.join(currentDir, item);
    return (
      fs.statSync(itemPath).isDirectory() &&
      (item.endsWith('-client') || item === 'actuator-client')
    );
  });

  return clientDirs.map((dir) => path.join(currentDir, dir));
}

// 🎯 Directorio dinámico (se actualizará según el archivo generado)
const ACTUATOR_CLIENT_DIR = path.join(process.cwd(), './actuator-client');

// Archivos que deben eliminarse por ser innecesarios
const UNNECESSARY_FILES = [
  'api.ts', // Muy básico, se puede mejorar
  '*.serviceInterface.ts', // Interfaces innecesarias
  'git_push.sh', // Script innecesario
  '.openapi-generator-ignore', // No necesario en producción
];

// Patrones para limpiar código
const CODE_REPLACEMENTS = [
  // Limpiar nombres duplicados
  { from: /(\w+)DTODTO/g, to: '$1DTO' },
  { from: /(\w+)DtoDto/g, to: '$1Dto' },
  { from: /(\w+)dtoDTO/g, to: '$1DTO' },
  { from: /(\w+)DTODto/g, to: '$1DTO' },

  // Limpiar imports innecesarios
  { from: /import.*serviceInterface.*\n/g, to: '' },
  { from: /export.*serviceInterface.*\n/g, to: '' },

  // Mejorar comentarios
  { from: /\/\*\*\s*\n\s*\*\s*\n/g, to: '/**\n' },
  { from: /\*\s*NOTE: This class is auto generated.*\n.*\n.*\n.*\n/g, to: '' },
];

function deleteUnnecessaryFiles(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directorio no encontrado: ${dirPath}`);
    return;
  }

  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      deleteUnnecessaryFiles(itemPath);
    } else {
      // Verificar si el archivo debe eliminarse
      const shouldDelete = UNNECESSARY_FILES.some((pattern) => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(item);
        }
        return item === pattern;
      });

      if (shouldDelete) {
        fs.unlinkSync(itemPath);
        console.log(`🗑️ Eliminado archivo innecesario: ${itemPath}`);
      }
    }
  });
}

function cleanFileContent(content: string): string {
  let cleanContent = content;

  CODE_REPLACEMENTS.forEach(({ from, to }) => {
    cleanContent = cleanContent.replace(from, to as string);
  });

  // Limpiar imports y exports mejorados
  cleanContent = cleanContent.replace(/from.*['"].*(\w+)DTODTO['"]/g, (match) =>
    match.replace(/DTODTO/g, 'DTO')
  );

  // Limpiar líneas vacías excesivas
  cleanContent = cleanContent.replace(/\n\n\n+/g, '\n\n');

  return cleanContent;
}

function createProfessionalApiIndex(clientDir: string): void {
  const apiDir = path.join(clientDir, 'api');

  if (!fs.existsSync(apiDir)) {
    console.log(`❌ Directorio API no encontrado: ${apiDir}`);
    return;
  }

  // Buscar archivos de servicio
  const serviceFiles = fs
    .readdirSync(apiDir)
    .filter((file) => file.endsWith('.service.ts'))
    .map((file) => file.replace('.service.ts', ''));

  // Crear contenido del archivo api.ts (como en users-api)
  const apiContent = `/**
 * API Services
 * Auto-generated API services for the application
 */

${serviceFiles
  .map((service) => `export * from './${service}.service';`)
  .join('\n')}

${serviceFiles
  .map((service) => {
    const className =
      service.charAt(0).toUpperCase() + service.slice(1) + 'Service';
    return `import { ${className} } from './${service}.service';`;
  })
  .join('\n')}

/**
 * All available API services
 */
export const APIS = [
${serviceFiles
  .map((service) => {
    const className =
      service.charAt(0).toUpperCase() + service.slice(1) + 'Service';
    return `  ${className},`;
  })
  .join('\n')}
];
`;

  const apiPath = path.join(apiDir, 'api.ts');
  fs.writeFileSync(apiPath, apiContent, 'utf8');
  console.log(`✅ Creado api.ts profesional: ${apiPath}`);
}

function createModelsIndex(clientDir: string): void {
  const modelDir = path.join(clientDir, 'model');

  if (!fs.existsSync(modelDir)) {
    console.log(`❌ Directorio model no encontrado: ${modelDir}`);
    return;
  }

  // Buscar archivos de modelo
  const modelFiles = fs
    .readdirSync(modelDir)
    .filter(
      (file) =>
        file.endsWith('.ts') && file !== 'models.ts' && file !== 'index.ts'
    )
    .map((file) => file.replace('.ts', ''));

  // Crear contenido del archivo models.ts (como en users-api)
  const modelsContent = `/**
 * Models
 * Auto-generated model exports
 */

${modelFiles.map((model) => `export * from './${model}';`).join('\n')}
`;

  const modelsPath = path.join(modelDir, 'models.ts');
  fs.writeFileSync(modelsPath, modelsContent, 'utf8');
  console.log(`✅ Creado models.ts profesional: ${modelsPath}`);
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
      const content = fs.readFileSync(itemPath, 'utf8');
      const cleanContent = cleanFileContent(content);

      if (content !== cleanContent) {
        fs.writeFileSync(itemPath, cleanContent, 'utf8');
        console.log(`🔧 Limpiado: ${itemPath}`);
      }
    }
  });
}

function main(): void {
  console.log('🧹 Iniciando limpieza profesional del código generado...');

  // 🎯 Detectar directorios generados dinámicamente
  const generatedDirs = findGeneratedDirectories();

  if (generatedDirs.length === 0) {
    console.log('❌ No se encontraron directorios de clientes generados');
    console.log('💡 Buscar directorios que terminen en "-client"');
    return;
  }

  console.log(`📁 Directorios encontrados: ${generatedDirs.length}`);
  generatedDirs.forEach((dir) => console.log(`  📂 ${path.basename(dir)}`));

  // Procesar cada directorio encontrado
  generatedDirs.forEach((clientDir) => {
    console.log(`\n🔧 Procesando: ${path.basename(clientDir)}`);

    // 1. Eliminar archivos innecesarios
    deleteUnnecessaryFiles(clientDir);

    // 2. Limpiar código en archivos restantes
    processDirectory(clientDir);

    // 3. Crear índices profesionales (como users-api)
    createProfessionalApiIndex(clientDir);
    createModelsIndex(clientDir);
  });

  console.log('\n✅ Limpieza profesional completada!');
  console.log('📋 Estructura similar a users-api aplicada');
  console.log('  ❌ Interfaces innecesarias eliminadas');
  console.log('  ❌ Archivos redundantes eliminados');
  console.log('  ✅ Código optimizado y limpio');
  console.log('  ✅ Archivo api.ts creado (como users-api)');
  console.log('  ✅ Archivo models.ts creado (como users-api)');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { main as cleanGeneratedFilesProfessional };
