import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

import { TopicService } from '../../services/topic.service';
import { Topic, SubtopicsResponse, UploadQuestionsResponse, QuestionFromJson } from '../../../../core/models/topic.model';

export interface UploadQuestionsDialogData {
  topic: Topic;
}

@Component({
  selector: 'app-upload-questions-dialog',
  templateUrl: './upload-questions-dialog.component.html',
  styleUrls: ['./upload-questions-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
  ],
  standalone: true,
})
export class UploadQuestionsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  subTopics: Topic[] = [];
  questions: QuestionFromJson[] = [];
  isLoadingSubtopics = false;
  isUploading = false;

  // Form controls
  subtopicControl = new FormControl<number | null>(null);
  modeControl = new FormControl<'add' | 'replace'>('add');
  fileControl = new FormControl<File | null>(null);

  // Mode options
  modeOptions = [
    { value: 'add', label: 'Agregar a las existentes', description: 'Las nuevas preguntas se añadirán a las que ya tiene el tema' },
    { value: 'replace', label: 'Reemplazar todas', description: 'Se eliminarán todas las preguntas actuales y se añadirán las nuevas' },
  ];

  constructor(
    private dialogRef: MatDialogRef<UploadQuestionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadQuestionsDialogData,
    private topicService: TopicService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSubtopics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSubtopics(): void {
    // Si el topic es un subtopic, no tiene subtopics
    if (!this.data.topic || this.data.topic.id !== this.data.topic.rootId) {
      return;
    }

    this.isLoadingSubtopics = true;
    this.topicService
      .getSubtopics(this.data.topic.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SubtopicsResponse) => {
          this.subTopics = response.subtopics || [];
          this.isLoadingSubtopics = false;
        },
        error: (error) => {
          console.error('Error loading subtopics:', error);
          this.isLoadingSubtopics = false;
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }

    // Verificar que sea un archivo JSON
    if (!file.name.toLowerCase().endsWith('.json')) {
      this.snackBar.open('El archivo debe ser un JSON (.json)', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.fileControl.setValue(file);

    // Leer y parsear el archivo
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validar estructura
        if (!Array.isArray(data)) {
          throw new Error('El JSON debe ser un array de preguntas');
        }

        // Validar cada pregunta
        const validQuestions: QuestionFromJson[] = [];
        for (const item of data) {
          if (!this.isValidQuestion(item)) {
            console.warn('Pregunta inválida ignorada:', item);
            continue;
          }
          validQuestions.push(item);
        }

        if (validQuestions.length === 0) {
          this.snackBar.open('No se encontraron preguntas válidas en el archivo', 'Cerrar', {
            duration: 3000,
          });
          return;
        }

        this.questions = validQuestions;
        this.snackBar.open(`✅ ${validQuestions.length} pregunta(s) cargada(s) correctamente`, 'Cerrar', {
          duration: 3000,
        });
      } catch (error: any) {
        this.snackBar.open('Error al leer el archivo JSON: ' + error.message, 'Cerrar', {
          duration: 5000,
        });
        this.questions = [];
      }
    };

    reader.readAsText(file);
  }

  private isValidQuestion(item: any): boolean {
    // Validar estructura básica
    if (!item.statement || !item.options || !Array.isArray(item.options)) {
      return false;
    }

    // Validar que tenga al menos 2 opciones
    if (item.options.length < 2) {
      return false;
    }

    // Validar que cada opción tenga text y correct
    for (const option of item.options) {
      if (!option.text || typeof option.correct !== 'boolean') {
        return false;
      }
    }

    // Validar que al menos una opción sea correcta
    const hasCorrect = item.options.some((opt: any) => opt.correct === true);
    if (!hasCorrect) {
      return false;
    }

    return true;
  }

  onUpload(): void {
    if (this.questions.length === 0) {
      this.snackBar.open('Debe cargar un archivo con preguntas válidas', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const mode = this.modeControl.value || 'add';
    const confirmMessage =
      mode === 'replace'
        ? `¿Está seguro de que desea REEMPLAZAR todas las preguntas? Se eliminarán las actuales y se añadirán ${this.questions.length} nuevas preguntas.`
        : `¿Está seguro de que desea agregar ${this.questions.length} pregunta(s) al tema?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isUploading = true;

    // Determinar subtopic si está seleccionado
    const subtopicId = this.subtopicControl.value ? Number(this.subtopicControl.value) : undefined;
    const targetTopic = subtopicId
      ? this.subTopics.find((st) => st.id === subtopicId)
      : this.data.topic;

    if (!targetTopic) {
      this.isUploading = false;
      this.snackBar.open('Error: tema no encontrado', 'Cerrar', { duration: 3000 });
      return;
    }

    // Determinar el topic principal (rootId) para usar en la URL
    const rootTopicId = this.data.topic.id === this.data.topic.rootId 
      ? this.data.topic.id 
      : this.data.topic.rootId;

    // El topicId en el request debe ser siempre el rootId del tema principal
    // para que el backend pueda cargar el topic correctamente y validar el subtopic
    const request = {
      area: targetTopic.area,
      topicId: rootTopicId,
      subtopicId: subtopicId,
      questions: this.questions,
      mode: mode,
    };

    this.topicService
      .uploadQuestionsToTopic(rootTopicId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UploadQuestionsResponse) => {
          this.isUploading = false;
          this.snackBar.open(`✅ ${response.message}. Total: ${response.totalQuestions} preguntas`, 'Cerrar', {
            duration: 5000,
          });
          this.dialogRef.close(true); // Indicate success
        },
        error: (error) => {
          console.error('Error uploading questions:', error);
          this.isUploading = false;
          this.snackBar.open(
            'Error al subir preguntas: ' + (error.error?.message || error.message),
            'Cerrar',
            { duration: 5000 }
          );
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getPreviewQuestions(): QuestionFromJson[] {
    return this.questions.slice(0, 3);
  }

  hasMoreThan3Questions(): boolean {
    return this.questions.length > 3;
  }

  getSelectedSubTopicName(): string {
    const subtopicId = this.subtopicControl.value;
    if (!subtopicId) {
      return this.data.topic.title;
    }
    const subtopic = this.subTopics.find((st) => st.id === subtopicId);
    return subtopic ? subtopic.title : this.data.topic.title;
  }
}

