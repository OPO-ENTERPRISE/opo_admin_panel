import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

import { IaWorksService } from '../../services/ia-works.service';
import {
  EmbeddingConfig,
  UploadFileResponse,
  ProcessVectorResponse,
} from '../../models/embedding-config.model';

@Component({
  selector: 'app-convert-vector',
  templateUrl: './convert-vector.component.html',
  styleUrls: ['./convert-vector.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
  ],
  standalone: true,
})
export class ConvertVectorComponent implements OnInit {
  uploadForm!: FormGroup;
  embeddingConfigForm!: FormGroup;
  metadataForm!: FormGroup;

  selectedFile: File | null = null;
  uploadResponse: UploadFileResponse | null = null;
  isUploading = false;
  isProcessing = false;
  processResponse: ProcessVectorResponse | null = null;

  previewText = '';
  showPreview = false;

  constructor(
    private fb: FormBuilder,
    private iaWorksService: IaWorksService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      file: [null, Validators.required],
    });

    this.embeddingConfigForm = this.fb.group({
      chunkSize: [500, [Validators.required, Validators.min(100), Validators.max(2000)]],
      overlap: [50, [Validators.required, Validators.min(0), Validators.max(500)]],
      embeddingModel: ['openai', Validators.required],
      chunkingStrategy: ['characters', Validators.required],
      openaiApiKey: [''],
      huggingFaceApiKey: [''],
    });

    this.metadataForm = this.fb.group({
      title: [''],
      category: [''],
      tags: [''],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.validateFile();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.validateFile();
    }
  }

  validateFile(): void {
    if (!this.selectedFile) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];

    const fileExtension = this.selectedFile.name
      .substring(this.selectedFile.name.lastIndexOf('.'))
      .toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      this.snackBar.open(
        'Formato de archivo no permitido. Solo se permiten: PDF, DOCX, DOC, TXT',
        'Cerrar',
        { duration: 5000 }
      );
      this.selectedFile = null;
      return;
    }

    if (this.selectedFile.size > 100 * 1024 * 1024) {
      this.snackBar.open('El archivo es demasiado grande. Máximo: 100MB', 'Cerrar', {
        duration: 5000,
      });
      this.selectedFile = null;
      return;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Por favor selecciona un archivo', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.iaWorksService.uploadAndConvert(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadResponse = response;
        this.previewText = response.text;
        this.showPreview = true;
        this.isUploading = false;
        this.snackBar.open('Archivo convertido exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        this.isUploading = false;
        const errorMessage =
          error.error?.message || 'Error al convertir el archivo. Intenta nuevamente.';
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      },
    });
  }

  processToVector(): void {
    if (!this.uploadResponse) {
      this.snackBar.open('Primero debes subir y convertir un archivo', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    if (this.embeddingConfigForm.invalid) {
      this.snackBar.open('Por favor completa la configuración de embeddings', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const config: EmbeddingConfig = {
      chunkSize: this.embeddingConfigForm.value.chunkSize,
      overlap: this.embeddingConfigForm.value.overlap,
      embeddingModel: this.embeddingConfigForm.value.embeddingModel,
      chunkingStrategy: this.embeddingConfigForm.value.chunkingStrategy,
      openaiApiKey: this.embeddingConfigForm.value.openaiApiKey || undefined,
      huggingFaceApiKey: this.embeddingConfigForm.value.huggingFaceApiKey || undefined,
      metadata: {
        title: this.metadataForm.value.title || undefined,
        category: this.metadataForm.value.category || undefined,
        tags: this.metadataForm.value.tags
          ? this.metadataForm.value.tags.split(',').map((t: string) => t.trim())
          : undefined,
      },
    };

    // Limpiar metadata vacía
    Object.keys(config.metadata || {}).forEach((key) => {
      if (!config.metadata![key]) {
        delete config.metadata![key];
      }
    });

    this.isProcessing = true;
    this.iaWorksService
      .processToVector({
        documentId: this.uploadResponse.documentId,
        embeddingConfig: config,
      })
      .subscribe({
        next: (response) => {
          this.processResponse = response;
          this.isProcessing = false;
          this.snackBar.open(
            `Procesamiento completado: ${response.chunksCount} chunks generados`,
            'Cerrar',
            { duration: 5000 }
          );
        },
        error: (error) => {
          this.isProcessing = false;
          const errorMessage =
            error.error?.message || 'Error al procesar el documento. Intenta nuevamente.';
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        },
      });
  }

  resetForm(): void {
    this.selectedFile = null;
    this.uploadResponse = null;
    this.processResponse = null;
    this.previewText = '';
    this.showPreview = false;
    this.uploadForm.reset();
    this.embeddingConfigForm.reset({
      chunkSize: 500,
      overlap: 50,
      embeddingModel: 'openai',
      chunkingStrategy: 'characters',
    });
    this.metadataForm.reset();
  }

  getFileIcon(): string {
    if (!this.selectedFile) return 'insert_drive_file';
    const ext = this.selectedFile.name.substring(this.selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (ext === '.pdf') return 'picture_as_pdf';
    if (ext === '.docx' || ext === '.doc') return 'description';
    if (ext === '.txt') return 'text_snippet';
    return 'insert_drive_file';
  }
}

