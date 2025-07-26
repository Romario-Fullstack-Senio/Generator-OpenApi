#!/bin/bash

echo "🧪 Probando la limpieza de nombres duplicados..."

# Crear directorio de prueba
mkdir -p ./test-output

# Crear archivo de prueba con nombres duplicados
cat > ./test-output/test.ts << 'EOF'
// Archivo de prueba con nombres duplicados
import { NoveltyDTODTO } from './models/noveltyDTODTO';
import { UserDTODTO, ApiDTODTO } from './models';

export class TestServiceDTODTO {
  private noveltyDTODTO: NoveltyDTODTO;
  
  constructor(data: NoveltyDTODTO) {
    this.noveltyDTODTO = data;
  }
  
  processNoveltyDTODTO(novelty: NoveltyDTODTO): NoveltyDTODTO {
    return this.noveltyDTODTO;
  }
}

export interface UserResponseDTODTO {
  user: UserDTODTO;
  api: ApiDTODTO;
}
EOF

echo "📄 Contenido ANTES de la limpieza:"
cat ./test-output/test.ts

echo ""
echo "🧹 Ejecutando limpieza..."

# Ejecutar script de limpieza usando Node.js directamente
node -e "
const fs = require('fs');

const REPLACEMENTS = [
  { from: /(\w+)DTODTO/g, to: '\$1DTO' },
  { from: /(\w+)DtoDto/g, to: '\$1Dto' },
  { from: /(\w+)dtoDTO/g, to: '\$1DTO' },
  { from: /(\w+)DTODto/g, to: '\$1DTO' },
];

function cleanFileContent(content) {
  let cleanContent = content;
  
  // Aplicar reemplazos básicos
  REPLACEMENTS.forEach(({ from, to }) => {
    cleanContent = cleanContent.replace(from, to);
  });
  
  // Reemplazos específicos
  cleanContent = cleanContent.replace(/from.*['\"'].*(\w+)DTODTO['\"']/g, (match) => 
    match.replace(/DTODTO/g, 'DTO')
  );
  cleanContent = cleanContent.replace(/import.*\{.*(\w+)DTODTO.*\}/g, (match) => 
    match.replace(/DTODTO/g, 'DTO')
  );
  cleanContent = cleanContent.replace(/export.*\{.*(\w+)DTODTO.*\}/g, (match) => 
    match.replace(/DTODTO/g, 'DTO')
  );
  
  // Reemplazos en declaraciones
  cleanContent = cleanContent.replace(/export (class|interface) (\w+)DTODTO/g, 'export \$1 \$2DTO');
  cleanContent = cleanContent.replace(/(class|interface) (\w+)DTODTO/g, '\$1 \$2DTO');
  cleanContent = cleanContent.replace(/: (\w+)DTODTO/g, ': \$1DTO');
  cleanContent = cleanContent.replace(/<(\w+)DTODTO>/g, '<\$1DTO>');
  
  return cleanContent;
}

const content = fs.readFileSync('./test-output/test.ts', 'utf8');
const cleanContent = cleanFileContent(content);
fs.writeFileSync('./test-output/test.ts', cleanContent, 'utf8');
console.log('✅ Limpieza completada');
"

echo ""
echo "📄 Contenido DESPUÉS de la limpieza:"
cat ./test-output/test.ts

echo ""
echo "🗑️ Limpiando archivos de prueba..."
rm -rf ./test-output

echo "✅ Prueba completada!"
