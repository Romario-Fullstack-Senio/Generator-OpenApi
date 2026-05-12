import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

type InputType = 'url' | 'file';
type ProfileKind = 'client' | 'server';

interface GeneratorProfile {
  id: string;
  label: string;
  kind: ProfileKind;
  generatorName: string;
  description: string;
  recommended?: boolean;
  defaults: Record<string, string | number | boolean>;
}

interface ProfilesResponse {
  profiles: GeneratorProfile[];
}

interface GenerateResponse {
  output: string;
  warnings?: string;
  profileId: string;
  outputDir: string;
  suggestedDownloadName: string;
  additionalProperties: Record<string, string | number | boolean>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AppComponent implements OnInit {
  title = 'OpenAPI Generator App';

  inputType: InputType = 'file';
  openapiUrl = '';
  selectedFile: File | null = null;
  selectedFileName = '';

  profiles = signal<GeneratorProfile[]>([]);
  selectedProfileId = signal<string>('angular-ts-ng20');

  outputDir = 'angular-client-output';
  downloadFileName = 'angular-client-output.zip';
  customPropertiesText = '';

  npmName = 'dynamic-api-client';
  npmVersion = '1.0.0';
  npmRepository = 'https://pkgs.dev.azure.com/ORG/PROJECT/_packaging/FEED/npm/registry/';
  ngVersion = '20.3.0';

  groupId = 'com.example';
  artifactId = 'api-server';
  packageName = 'com.example.api';
  packageVersion = '1.0.0';
  springInterfaceOnly = false;
  springDelegatePattern = true;
  springUseTags = true;

  generatedCode: string | null = null;
  error: string | null = null;
  warnings: string | null = null;
  isDownloading: boolean = false;
  isGenerating: boolean = false;
  progressPercentage: number = 0;
  progressMessage: string = '';
  generatedOutputDir: string = '';
  generatedDownloadName: string = '';

  private http = inject(HttpClient);

  readonly selectedProfile = computed(() => {
    return this.profiles().find((profile) => profile.id === this.selectedProfileId()) ?? null;
  });

  readonly isClientProfile = computed(() => {
    return this.selectedProfile()?.kind === 'client';
  });

  ngOnInit(): void {
    this.loadProfiles();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.selectedFileName = this.selectedFile.name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  onProfileChange(): void {
    this.applyProfileDefaults();
  }

  private loadProfiles(): void {
    this.http.get<ProfilesResponse>(`${environment.apiUrl}/generator-profiles`).subscribe({
      next: (response) => {
        this.profiles.set(response.profiles || []);

        const recommended = response.profiles.find((profile) => profile.recommended) || response.profiles[0];

        if (recommended) {
          this.selectedProfileId.set(recommended.id);
          this.applyProfileDefaults();
        }
      },
      error: () => {
        this.error = 'No fue posible cargar perfiles del backend. Revisa si el servidor esta activo en el puerto 3001.';
      },
    });
  }

  private applyProfileDefaults(): void {
    const profile = this.selectedProfile();
    if (!profile) {
      return;
    }

    this.outputDir = profile.kind === 'client' ? 'angular-client-output' : 'spring-server-output';
    this.downloadFileName = `${this.outputDir}.zip`;

    this.npmName = String(profile.defaults['npmName'] ?? 'dynamic-api-client');
    this.npmVersion = String(profile.defaults['npmVersion'] ?? '1.0.0');
    this.npmRepository = String(profile.defaults['npmRepository'] ?? '');
    this.ngVersion = String(profile.defaults['ngVersion'] ?? '20.3.0');

    this.groupId = String(profile.defaults['groupId'] ?? 'com.example');
    this.artifactId = String(profile.defaults['artifactId'] ?? 'api-server');
    this.packageName = String(profile.defaults['packageName'] ?? 'com.example.api');
    this.packageVersion = String(profile.defaults['packageVersion'] ?? '1.0.0');
    this.springInterfaceOnly = Boolean(profile.defaults['interfaceOnly'] ?? false);
    this.springDelegatePattern = Boolean(profile.defaults['delegatePattern'] ?? true);
    this.springUseTags = Boolean(profile.defaults['useTags'] ?? true);
  }

  private parseCustomProperties(): Record<string, string | number | boolean> {
    const raw = this.customPropertiesText.trim();
    if (!raw) {
      return {};
    }

    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .reduce<Record<string, string | number | boolean>>((acc, entry) => {
        const separator = entry.indexOf('=');
        if (separator < 1) {
          return acc;
        }

        const key = entry.slice(0, separator).trim();
        const value = entry.slice(separator + 1).trim();

        if (!key) {
          return acc;
        }

        if (/^(true|false)$/i.test(value)) {
          acc[key] = value.toLowerCase() === 'true';
        } else if (/^-?\d+(\.\d+)?$/.test(value)) {
          acc[key] = Number(value);
        } else {
          acc[key] = value;
        }

        return acc;
      }, {});
  }

  private buildOverrides(): Record<string, string | number | boolean> {
    const profile = this.selectedProfile();
    const custom = this.parseCustomProperties();

    if (!profile) {
      return custom;
    }

    if (profile.kind === 'client') {
      return {
        ...custom,
        npmName: this.npmName,
        npmVersion: this.npmVersion,
        npmRepository: this.npmRepository,
        ngVersion: this.ngVersion,
      };
    }

    return {
      ...custom,
      groupId: this.groupId,
      artifactId: this.artifactId,
      packageName: this.packageName,
      packageVersion: this.packageVersion,
      interfaceOnly: this.springInterfaceOnly,
      delegatePattern: this.springDelegatePattern,
      useTags: this.springUseTags,
    };
  }

  generateCode(): void {
    const profile = this.selectedProfile();

    if (!profile) {
      this.error = 'Selecciona un perfil valido para generar codigo.';
      return;
    }

    this.generatedCode = null;
    this.warnings = null;
    this.error = null;
    this.isGenerating = true;
    this.progressPercentage = 0;
    this.progressMessage = 'Iniciando generación...';

    // Simular progreso
    this.updateProgress();

    const payload = {
      profileId: profile.id,
      outputDir: this.outputDir,
      configOverrides: this.buildOverrides(),
    };

    if (this.inputType === 'url') {
      if (!this.openapiUrl.trim()) {
        this.error = 'Ingresa una URL o ruta OpenAPI valida.';
        this.isGenerating = false;
        return;
      }

      this.progressMessage = 'Descargando especificación OpenAPI...';

      this.http
        .post<GenerateResponse>(`${environment.apiUrl}/generate`, {
          ...payload,
          openapiUrl: this.openapiUrl,
        })
        .subscribe({
          next: (res) => {
            this.progressPercentage = 100;
            this.progressMessage = 'Codigo generado exitosamente.';
            this.generatedCode = res.output;
            this.warnings = res.warnings || null;
            this.generatedOutputDir = res.outputDir;
            this.generatedDownloadName = this.downloadFileName || res.suggestedDownloadName;

            setTimeout(() => {
              this.isGenerating = false;
              this.progressPercentage = 0;
              this.progressMessage = '';
            }, 1500);
          },
          error: (err) => {
            this.error = err.error?.error || 'Error al generar el código';
            this.isGenerating = false;
            this.progressPercentage = 0;
            this.progressMessage = '';
          },
        });
    } else if (this.inputType === 'file' && this.selectedFile) {
      this.progressMessage = 'Subiendo archivo y generando código...';
      const formData = new FormData();
      formData.append('openapiFile', this.selectedFile);
      formData.append('profileId', profile.id);
      formData.append('outputDir', this.outputDir);
      formData.append('configOverrides', JSON.stringify(this.buildOverrides()));

      this.http.post<GenerateResponse>(`${environment.apiUrl}/generate-from-file`, formData).subscribe({
        next: (res) => {
          this.progressPercentage = 100;
          this.progressMessage = 'Codigo generado exitosamente.';
          this.generatedCode = res.output;
          this.warnings = res.warnings || null;
          this.generatedOutputDir = res.outputDir;
          this.generatedDownloadName = this.downloadFileName || res.suggestedDownloadName;

          setTimeout(() => {
            this.isGenerating = false;
            this.progressPercentage = 0;
            this.progressMessage = '';
          }, 1500);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al generar el código desde archivo';
          this.isGenerating = false;
          this.progressPercentage = 0;
          this.progressMessage = '';
        },
      });
    } else {
      this.error = 'Selecciona una URL o archivo OpenAPI valido.';
      this.isGenerating = false;
      this.progressPercentage = 0;
      this.progressMessage = '';
    }
  }

  downloadGeneratedFiles(): void {
    if (!this.generatedCode || !this.generatedOutputDir) {
      this.error = 'No hay archivos generados para descargar.';
      return;
    }

    this.isDownloading = true;
    this.error = null;

    // Determinar el nombre del archivo
    const fileName = this.generatedDownloadName || this.downloadFileName || 'codigo-generado.zip';

    this.http
      .post(
        `${environment.apiUrl}/download`,
        {
          outputDir: this.generatedOutputDir,
          fileName: fileName,
        },
        {
          responseType: 'blob',
          observe: 'response',
        },
      )
      .subscribe({
        next: (response) => {
          const blob = response.body;

          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
          this.isDownloading = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al descargar los archivos';
          this.isDownloading = false;
        },
      });
  }

  private updateProgress(): void {
    const interval = setInterval(() => {
      if (this.progressPercentage < 80) {
        this.progressPercentage += Math.random() * 10;

        if (this.progressPercentage >= 20 && this.progressPercentage < 40) {
          this.progressMessage = 'Analizando especificación OpenAPI...';
        } else if (this.progressPercentage >= 40 && this.progressPercentage < 60) {
          this.progressMessage = 'Generando archivos de código...';
        } else if (this.progressPercentage >= 60 && this.progressPercentage < 80) {
          this.progressMessage = 'Finalizando generación...';
        }
      } else {
        clearInterval(interval);
      }

      if (!this.isGenerating) {
        clearInterval(interval);
      }
    }, 200);
  }
}
