import archiver from 'archiver';
import { execFile } from 'child_process';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { promisify } from 'util';

const app = express();
const PORT = process.env.PORT || 3001;
const execFileAsync = promisify(execFile);
const GENERATED_ROOT = path.join(process.cwd(), 'generated');

type Primitive = string | number | boolean;

interface GeneratorProfile {
  id: string;
  label: string;
  kind: 'client' | 'server';
  generatorName: string;
  description: string;
  recommended?: boolean;
  defaults: Record<string, Primitive>;
}

const GENERATOR_PROFILES: GeneratorProfile[] = [
  {
    id: 'angular-ts-ng20',
    label: 'Angular TypeScript Client (Angular 20 LTS)',
    kind: 'client',
    generatorName: 'typescript-angular',
    description: 'Cliente Angular para Angular 20, listo para publicar en Azure Artifacts.',
    recommended: true,
    defaults: {
      ngVersion: '20.3.0',
      rxjsVersion: '7.8.0',
      zonejsVersion: '0.14.10',
      npmName: 'dynamic-api-client',
      npmVersion: '1.0.0',
      npmRepository: 'https://pkgs.dev.azure.com/ORG/PROJECT/_packaging/FEED/npm/registry/',
      providedIn: 'root',
      withInterfaces: true,
      modelPropertyNaming: 'camelCase',
      enumPropertyNaming: 'camelCase',
      paramNaming: 'camelCase',
      stringEnums: true,
      supportsES6: true,
      serviceSuffix: 'Service',
      serviceFileSuffix: '.service',
      fileNaming: 'kebab-case',
      removeOperationIdPrefix: true,
      skipFormModel: true,
      useSingleRequestParameter: false,
      withoutPrefixEnums: true,
      sortParamsByRequiredFlag: true,
      sortModelPropertiesByRequiredFlag: true,
      ensureUniqueParams: true,
      disallowAdditionalPropertiesIfNotPresent: false,
      legacyDiscriminatorBehavior: false,
      generateAliasAsModel: false,
    },
  },
  {
    id: 'angular-ts-ng21',
    label: 'Angular TypeScript Client (Angular 21)',
    kind: 'client',
    generatorName: 'typescript-angular',
    description: 'Cliente Angular para proyectos en Angular 21.',
    defaults: {
      ngVersion: '21.0.0',
      rxjsVersion: '7.8.0',
      zonejsVersion: '0.15.0',
      npmName: 'dynamic-api-client',
      npmVersion: '1.0.0',
      npmRepository: 'https://pkgs.dev.azure.com/ORG/PROJECT/_packaging/FEED/npm/registry/',
      providedIn: 'root',
      withInterfaces: true,
      modelPropertyNaming: 'camelCase',
      enumPropertyNaming: 'camelCase',
      paramNaming: 'camelCase',
      stringEnums: true,
      supportsES6: true,
      serviceSuffix: 'Service',
      serviceFileSuffix: '.service',
      fileNaming: 'kebab-case',
      removeOperationIdPrefix: true,
      skipFormModel: true,
      useSingleRequestParameter: false,
      withoutPrefixEnums: true,
      sortParamsByRequiredFlag: true,
      sortModelPropertiesByRequiredFlag: true,
      ensureUniqueParams: true,
      disallowAdditionalPropertiesIfNotPresent: false,
      legacyDiscriminatorBehavior: false,
      generateAliasAsModel: false,
    },
  },
  {
    id: 'spring-boot3',
    label: 'Spring Server (Spring Boot 3 + Jakarta)',
    kind: 'server',
    generatorName: 'spring',
    description: 'Servidor Spring recomendado con Spring Boot 3, Jakarta EE y tagging por controlador.',
    recommended: true,
    defaults: {
      library: 'spring-boot',
      useSpringBoot3: true,
      useJakartaEe: true,
      delegatePattern: true,
      interfaceOnly: false,
      useTags: true,
      openApiNullable: false,
      documentationProvider: 'springdoc',
      hideGenerationTimestamp: true,
      groupId: 'com.example',
      artifactId: 'api-server',
      packageName: 'com.example.api',
      invokerPackage: 'com.example.api',
      apiPackage: 'com.example.api.controller',
      modelPackage: 'com.example.api.model',
      packageVersion: '1.0.0',
    },
  },
  {
    id: 'spring-boot3-interface',
    label: 'Spring Interface-Only (Contracts First)',
    kind: 'server',
    generatorName: 'spring',
    description: 'Genera solo interfaces y contratos para implementar manualmente.',
    defaults: {
      library: 'spring-boot',
      useSpringBoot3: true,
      useJakartaEe: true,
      delegatePattern: false,
      interfaceOnly: true,
      useTags: true,
      openApiNullable: false,
      documentationProvider: 'springdoc',
      hideGenerationTimestamp: true,
      groupId: 'com.example',
      artifactId: 'api-contracts',
      packageName: 'com.example.contracts',
      invokerPackage: 'com.example.contracts',
      apiPackage: 'com.example.contracts.api',
      modelPackage: 'com.example.contracts.model',
      packageVersion: '1.0.0',
    },
  },
];

function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function toSafeSegment(input: string): string {
  const sanitized = input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized || 'generated';
}

function generateDynamicClientName(filename: string): string {
  const baseName = path.basename(filename, path.extname(filename));
  return `${toSafeSegment(baseName)}-client`;
}

function parsePrimitive(value: string): Primitive {
  const trimmed = value.trim();

  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === 'true';
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function parseAdditionalProperties(input: unknown): Record<string, Primitive> {
  if (!input) {
    return {};
  }

  if (typeof input === 'string') {
    const raw = input.trim();
    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.entries(parsed).reduce<Record<string, Primitive>>((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value as Primitive;
          }
          return acc;
        }, {});
      }
    } catch {
      // Continue with CSV parsing below.
    }

    return raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .reduce<Record<string, Primitive>>((acc, pair) => {
        const separatorIndex = pair.indexOf('=');
        if (separatorIndex < 1) {
          return acc;
        }

        const key = pair.slice(0, separatorIndex).trim();
        const value = pair.slice(separatorIndex + 1);
        if (key) {
          acc[key] = parsePrimitive(value);
        }
        return acc;
      }, {});
  }

  if (typeof input === 'object' && !Array.isArray(input)) {
    return Object.entries(input as Record<string, unknown>).reduce<Record<string, Primitive>>((acc, [key, value]) => {
      if (value === undefined || value === null) {
        return acc;
      }

      if (typeof value === 'string') {
        acc[key] = parsePrimitive(value);
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        acc[key] = value;
      }

      return acc;
    }, {});
  }

  return {};
}

function serializeAdditionalProperties(properties: Record<string, Primitive>): string {
  return Object.entries(properties)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(',');
}

function resolveOutputDir(requestedOutputDir: string | undefined): {
  outputDir: string;
  absolutePath: string;
} {
  ensureDirectory(GENERATED_ROOT);

  const normalized = (requestedOutputDir || 'generated-output')
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .map((segment) => toSafeSegment(segment))
    .join('/');

  const outputDir = normalized || 'generated-output';
  const absolutePath = path.join(GENERATED_ROOT, outputDir);

  return { outputDir, absolutePath };
}

function findProfile(profileId: string | undefined, generatorName: string | undefined): GeneratorProfile | undefined {
  if (profileId) {
    return GENERATOR_PROFILES.find((profile) => profile.id === profileId);
  }

  if (generatorName) {
    return GENERATOR_PROFILES.find(
      (profile) => profile.generatorName === generatorName && (profile.recommended || profile.id.includes('ng20')),
    );
  }

  return GENERATOR_PROFILES.find((profile) => profile.recommended);
}

function buildGenerationProperties(
  profile: GeneratorProfile,
  sourceName: string,
  overrides: Record<string, Primitive>,
): Record<string, Primitive> {
  const merged = {
    ...profile.defaults,
    ...overrides,
  };

  if (profile.kind === 'client' && !overrides.npmName) {
    merged.npmName = generateDynamicClientName(sourceName);
  }

  return merged;
}

async function executeGenerationCommand(
  inputSpec: string,
  generatorName: string,
  absoluteOutputPath: string,
  additionalProperties: Record<string, Primitive>,
): Promise<{ stdout: string; stderr: string }> {
  ensureDirectory(absoluteOutputPath);

  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['openapi-generator-cli', 'generate', '-i', inputSpec, '-g', generatorName, '-o', absoluteOutputPath];

  const propertiesString = serializeAdditionalProperties(additionalProperties);
  if (propertiesString) {
    args.push('--additional-properties', propertiesString);
  }

  return execFileAsync(command, args, {
    cwd: process.cwd(),
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  });
}

function runClientCleanup(): void {
  try {
    const { cleanGeneratedFilesProfessional } = require('./clean-professional');
    cleanGeneratedFilesProfessional();
  } catch {
    try {
      const { cleanGeneratedFiles } = require('./clean-names');
      cleanGeneratedFiles();
    } catch {
      // Do not fail request if cleanup is not available.
    }
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    ensureDirectory(uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.json', '.yaml', '.yml'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .json, .yaml o .yml'));
    }
  },
});

app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');

  // Manejar solicitudes preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/generator-profiles', (req, res) => {
  res.json({ profiles: GENERATOR_PROFILES });
});

app.post('/api/generate', async (req, res) => {
  const { openapiUrl, profileId, generatorName, outputDir } = req.body as {
    openapiUrl?: string;
    profileId?: string;
    generatorName?: string;
    outputDir?: string;
    additionalProperties?: unknown;
    configOverrides?: unknown;
  };

  if (!openapiUrl) {
    return res.status(400).json({ error: 'Debe indicar una URL o ruta del archivo OpenAPI.' });
  }

  const profile = findProfile(profileId, generatorName);
  if (!profile) {
    return res.status(400).json({ error: 'Perfil de generador no valido.' });
  }

  const overrides = {
    ...parseAdditionalProperties((req.body as Record<string, unknown>).additionalProperties),
    ...parseAdditionalProperties((req.body as Record<string, unknown>).configOverrides),
  };

  const { outputDir: safeOutputDir, absolutePath } = resolveOutputDir(outputDir);
  const properties = buildGenerationProperties(profile, openapiUrl, overrides);

  try {
    const { stdout, stderr } = await executeGenerationCommand(
      openapiUrl,
      profile.generatorName,
      absolutePath,
      properties,
    );

    if (profile.kind === 'client') {
      runClientCleanup();
    }

    return res.json({
      output: stdout,
      warnings: stderr,
      profileId: profile.id,
      outputDir: safeOutputDir,
      suggestedDownloadName: `${path.basename(safeOutputDir)}.zip`,
      additionalProperties: properties,
    });
  } catch (error) {
    const errorMessage = error as {
      message?: string;
      stderr?: string;
      stdout?: string;
    };

    return res.status(500).json({
      error: errorMessage.stderr || errorMessage.message || 'Error en generacion',
      output: errorMessage.stdout || '',
    });
  }
});

app.post('/api/generate-from-file', upload.single('openapiFile'), async (req, res) => {
  const { profileId, generatorName, outputDir } = req.body as {
    profileId?: string;
    generatorName?: string;
    outputDir?: string;
    additionalProperties?: unknown;
    configOverrides?: unknown;
  };

  if (!req.file) {
    return res.status(400).json({ error: 'Debe adjuntar un archivo OpenAPI.' });
  }

  const profile = findProfile(profileId, generatorName);
  if (!profile) {
    return res.status(400).json({ error: 'Perfil de generador no valido.' });
  }

  const uploadedFilePath = req.file.path;
  const uploadedFileName = req.file.originalname;

  const overrides = {
    ...parseAdditionalProperties((req.body as Record<string, unknown>).additionalProperties),
    ...parseAdditionalProperties((req.body as Record<string, unknown>).configOverrides),
  };

  const { outputDir: safeOutputDir, absolutePath } = resolveOutputDir(outputDir);
  const properties = buildGenerationProperties(profile, uploadedFileName, overrides);

  try {
    const { stdout, stderr } = await executeGenerationCommand(
      uploadedFilePath,
      profile.generatorName,
      absolutePath,
      properties,
    );

    if (profile.kind === 'client') {
      runClientCleanup();
    }

    return res.json({
      output: stdout,
      warnings: stderr,
      profileId: profile.id,
      outputDir: safeOutputDir,
      suggestedDownloadName: `${path.basename(safeOutputDir)}.zip`,
      additionalProperties: properties,
    });
  } catch (error) {
    const errorMessage = error as {
      message?: string;
      stderr?: string;
      stdout?: string;
    };

    return res.status(500).json({
      error: errorMessage.stderr || errorMessage.message || 'Error en generacion',
      output: errorMessage.stdout || '',
    });
  } finally {
    if (fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch {
        // Ignore cleanup errors.
      }
    }
  }
});

app.post('/api/download', (req, res) => {
  const { outputDir, fileName } = req.body;

  if (!outputDir) {
    return res.status(400).json({ error: 'Directorio de salida es requerido.' });
  }

  const { absolutePath } = resolveOutputDir(outputDir);
  const safeFileName = `${toSafeSegment(String(fileName || 'codigo-generado'))}.zip`;

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: 'El directorio de salida no existe.' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);

  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  archive.on('error', (err) => {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al crear el archivo ZIP' });
    }
  });

  archive.pipe(res);
  archive.directory(absolutePath, false);
  archive.finalize();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
