import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';

import { TopicService } from '../../services/topic.service';
import { Topic, SubtopicsResponse } from '../../../../core/models/topic.model';
import { AreaService } from '../../../../core/services/area.service';
import { IArea } from '../../../../core/models/area.model';
import { AddQuestionsDialogComponent } from '../../components/add-questions-dialog/add-questions-dialog.component';
import { UploadQuestionsDialogComponent } from '../../components/upload-questions-dialog/upload-questions-dialog.component';

@Component({
  selector: 'app-topic-detail',
  templateUrl: './topic-detail.component.html',
  styleUrls: ['./topic-detail.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  standalone: true,
})
export class TopicDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  topic: Topic | null = null;
  subtopics: Topic[] = [];
  isLoading = false;
  topicId: number | null = null;
  areasMap: Map<string, IArea> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicService: TopicService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private areaService: AreaService
  ) {}

  ngOnInit(): void {
    this.loadAreas();
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.topicId = id ? Number(id) : null;
      if (this.topicId) {
        this.loadTopicDetail();
      }
    });
  }

  private loadAreas(): void {
    // Cargar todas las áreas para tener los nombres disponibles
    this.areaService
      .getAreasFromBackend({ page: 1, limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Crear mapa de áreas por ID para acceso rápido
          response.items.forEach((area) => {
            this.areasMap.set(area.id, area);
          });
        },
        error: (error) => {
          console.error('Error loading areas for display:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTopicDetail(): void {
    if (!this.topicId) return;

    this.isLoading = true;

    // Load topic details
    this.topicService
      .getTopicById(this.topicId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (topic) => {
          this.topic = topic;
          this.loadSubtopics();
        },
        error: (error) => {
          console.error('Error loading topic:', error);
          this.isLoading = false;
        },
      });
  }

  private loadSubtopics(): void {
    if (!this.topicId) return;

    this.topicService
      .getSubtopics(this.topicId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SubtopicsResponse) => {
          // Asegurar que subtopics nunca sea null
          this.subtopics = response.subtopics || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading subtopics:', error);
          this.subtopics = [];
          this.isLoading = false;
        },
      });
  }

  onBackToList(): void {
    this.router.navigate(['/topics']);
  }

  onEditTopic(): void {
    if (this.topicId) {
      this.router.navigate(['/topics', this.topicId, 'edit']);
    }
  }

  onToggleStatus(): void {
    if (!this.topic) return;

    const newStatus = !this.topic.enabled;

    this.topicService
      .toggleTopicStatus(this.topic.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.topic) {
            this.topic.enabled = newStatus;
          }
          this.snackBar.open(
            `Topic ${!newStatus ? 'habilitado' : 'deshabilitado'} exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error toggling topic status:', error);
        },
      });
  }

  getAreaName(area: number): string {
    const areaId = area.toString();
    const areaData = this.areasMap.get(areaId);

    if (areaData) {
      // Generar iniciales del nombre del área
      return areaData.name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
    }

    // Fallback al método del servicio si no está en el mapa
    return this.topicService.getAreaName(area);
  }

  getAreaFullName(area: number): string {
    const areaId = area.toString();
    const areaData = this.areasMap.get(areaId);

    if (areaData) {
      return areaData.name;
    }

    // Fallback al método del servicio si no está en el mapa
    return this.topicService.getAreaFullName(area);
  }

  formatDate(dateString: string): string {
    return this.topicService.formatDate(dateString);
  }

  isMainTopic(topic: Topic): boolean {
    return this.topicService.isMainTopic(topic);
  }

  // ========== Funciones para subtemas ==========

  onEditSubtopic(subtopic: Topic, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(SubtopicEditDialog, {
      width: '600px',
      data: { subtopic },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Actualizar el subtopic en el array
        const index = this.subtopics.findIndex((s) => s.id === result.id);
        if (index !== -1) {
          this.subtopics[index] = result;
        }
        this.snackBar.open('Subtema actualizado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onToggleSubtopicStatus(subtopic: Topic, event: Event): void {
    event.stopPropagation();

    const newStatus = !subtopic.enabled;

    this.topicService
      .toggleTopicStatus(subtopic.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          subtopic.enabled = newStatus;
          this.snackBar.open(
            `Subtema ${newStatus ? 'habilitado' : 'deshabilitado'} exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error toggling subtopic status:', error);
          this.snackBar.open('Error al cambiar estado del subtema', 'Cerrar', { duration: 3000 });
        },
      });
  }

  onToggleSubtopicPremium(subtopic: Topic, event: Event): void {
    event.stopPropagation();

    const newPremiumStatus = !subtopic.premium;

    this.topicService
      .toggleTopicPremium(subtopic.id, newPremiumStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          subtopic.premium = newPremiumStatus;
          this.snackBar.open(
            `Subtema ${
              newPremiumStatus ? 'marcado como premium' : 'desmarcado como premium'
            } exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error toggling subtopic premium status:', error);
          this.snackBar.open('Error al cambiar estado premium del subtema', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  onAddQuestions(): void {
    if (!this.topic) return;

    const dialogRef = this.dialog.open(AddQuestionsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        topicId: this.topic.id,
        topicTitle: this.topic.title,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Questions were successfully copied
        this.snackBar.open('Preguntas copiadas exitosamente', 'Cerrar', {
          duration: 3000,
        });
        // Optionally reload topic data or refresh the view
      }
    });
  }

  onUploadQuestions(): void {
    if (!this.topic) return;

    const dialogRef = this.dialog.open(UploadQuestionsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        topic: this.topic,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Questions were successfully uploaded
        this.snackBar.open('Preguntas subidas exitosamente', 'Cerrar', {
          duration: 3000,
        });
        // Optionally reload topic data or refresh the view
      }
    });
  }

  onCreateSubtopic(): void {
    if (!this.topic) return;

    const dialogRef = this.dialog.open(SubtopicCreateDialog, {
      width: '600px',
      data: { parentTopic: this.topic },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refrescar la lista de subtopics
        this.loadSubtopics();
        this.snackBar.open('Subtema creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }
}

// ========== Diálogo para editar subtema ==========

@Component({
  selector: 'subtopic-edit-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title><mat-icon>edit</mat-icon> Editar Subtema</h2>
      <mat-dialog-content>
        <form [formGroup]="editForm" class="edit-form">
          <!-- Title Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Título</mat-label>
            <input
              matInput
              formControlName="title"
              placeholder="Ingrese el título del subtema"
              style="color: #000 !important;"
            />
            <mat-icon matPrefix>title</mat-icon>
            <mat-error *ngIf="title?.hasError('required')">El título es requerido</mat-error>
            <mat-error *ngIf="title?.hasError('minlength')"
              >El título debe tener al menos 3 caracteres</mat-error
            >
            <mat-error *ngIf="title?.hasError('maxlength')"
              >El título no puede exceder 200 caracteres</mat-error
            >
          </mat-form-field>

          <!-- Order Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Orden</mat-label>
            <input
              matInput
              type="number"
              formControlName="order"
              placeholder="Orden de visualización"
              style="color: #000 !important;"
            />
            <mat-icon matPrefix>sort</mat-icon>
            <mat-error *ngIf="order?.hasError('required')">El orden es requerido</mat-error>
            <mat-error *ngIf="order?.hasError('min')"
              >El orden debe ser mayor o igual a 0</mat-error
            >
            <mat-error *ngIf="order?.hasError('max')">El orden no puede exceder 9999</mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()" [disabled]="isSaving">
          <mat-icon>cancel</mat-icon> Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onSave()"
          [disabled]="editForm.invalid || isSaving"
        >
          <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!isSaving">save</mat-icon>
          {{ isSaving ? 'Guardando...' : 'Guardar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        min-width: 500px;
      }

      h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }

      .edit-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      mat-dialog-actions {
        gap: 8px;
        padding: 16px 0 0 0;
      }

      button {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class SubtopicEditDialog {
  editForm!: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubtopicEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { subtopic: Topic },
    private topicService: TopicService,
    private snackBar: MatSnackBar
  ) {
    // Inicializar el formulario directamente con los valores del subtema
    this.editForm = this.fb.group({
      title: [
        this.data.subtopic?.title || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      ],
      order: [
        this.data.subtopic?.order || 0,
        [Validators.required, Validators.min(0), Validators.max(9999)],
      ],
    });
  }

  onSave(): void {
    if (this.editForm.invalid || !this.data.subtopic) {
      return;
    }

    this.isSaving = true;

    const updateData: Topic = {
      ...this.data.subtopic,
      title: this.editForm.value.title,
      order: this.editForm.value.order,
    };

    this.topicService.updateTopic(this.data.subtopic.id, updateData).subscribe({
      next: (updatedTopic) => {
        this.isSaving = false;
        this.dialogRef.close(updatedTopic);
      },
      error: (error) => {
        console.error('Error updating subtopic:', error);
        this.snackBar.open('Error al actualizar el subtema', 'Cerrar', { duration: 5000 });
        this.isSaving = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get title() {
    return this.editForm.get('title');
  }

  get order() {
    return this.editForm.get('order');
  }
}

// ========== Diálogo para crear subtema ==========

@Component({
  selector: 'subtopic-create-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title><mat-icon>add_circle</mat-icon> Crear Subtema</h2>
      <mat-dialog-content>
        <form [formGroup]="createForm" class="create-form">
          <!-- Title Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Título</mat-label>
            <input
              matInput
              formControlName="title"
              placeholder="Ingrese el título del subtema"
              style="color: #000 !important;"
            />
            <mat-icon matPrefix>title</mat-icon>
            <mat-error *ngIf="title?.hasError('required')">El título es requerido</mat-error>
            <mat-error *ngIf="title?.hasError('minlength')"
              >El título debe tener al menos 3 caracteres</mat-error
            >
            <mat-error *ngIf="title?.hasError('maxlength')"
              >El título no puede exceder 200 caracteres</mat-error
            >
          </mat-form-field>

          <!-- Order Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Orden</mat-label>
            <input
              matInput
              type="number"
              formControlName="order"
              placeholder="Orden de visualización"
              style="color: #000 !important;"
            />
            <mat-icon matPrefix>sort</mat-icon>
            <mat-error *ngIf="order?.hasError('required')">El orden es requerido</mat-error>
            <mat-error *ngIf="order?.hasError('min')"
              >El orden debe ser mayor o igual a 0</mat-error
            >
            <mat-error *ngIf="order?.hasError('max')">El orden no puede exceder 9999</mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()" [disabled]="isSaving">
          <mat-icon>cancel</mat-icon> Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onCreate()"
          [disabled]="createForm.invalid || isSaving"
        >
          <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!isSaving">add</mat-icon>
          {{ isSaving ? 'Creando...' : 'Crear Subtema' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        min-width: 500px;
      }

      h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }

      .create-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      mat-dialog-actions {
        gap: 8px;
        padding: 16px 0 0 0;
      }

      button {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class SubtopicCreateDialog {
  createForm!: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubtopicCreateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { parentTopic: Topic },
    private topicService: TopicService,
    private snackBar: MatSnackBar
  ) {
    // Inicializar el formulario vacío
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      order: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
    });
  }

  onCreate(): void {
    if (this.createForm.invalid || !this.data.parentTopic) {
      return;
    }

    this.isSaving = true;

    const createData = {
      title: this.createForm.value.title,
      order: this.createForm.value.order,
      type: this.data.parentTopic.type || 'topic',
    };

    this.topicService.createSubtopic(this.data.parentTopic.id, createData).subscribe({
      next: (newSubtopic) => {
        this.isSaving = false;
        this.dialogRef.close(newSubtopic);
      },
      error: (error) => {
        console.error('Error creating subtopic:', error);
        this.snackBar.open('Error al crear el subtema', 'Cerrar', { duration: 5000 });
        this.isSaving = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get title() {
    return this.createForm.get('title');
  }

  get order() {
    return this.createForm.get('order');
  }
}
