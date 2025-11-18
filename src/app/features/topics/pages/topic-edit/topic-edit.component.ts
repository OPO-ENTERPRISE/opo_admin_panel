import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';

import { TopicService } from '../../services/topic.service';
import { Topic, CreateTopicFormData } from '../../../../core/models/topic.model';
import { AreaService } from '../../../../core/services/area.service';
import { IArea } from '../../../../core/models/area.model';

@Component({
  selector: 'app-topic-edit',
  templateUrl: './topic-edit.component.html',
  styleUrls: ['./topic-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
})
export class TopicEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  editForm!: FormGroup;
  topic: Topic | null = null;
  topicId: number | null = null;
  isLoading = false;
  isSaving = false;
  availableAreas: IArea[] = [];
  isLoadingAreas = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private topicService: TopicService,
    private areaService: AreaService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadAreas();
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.topicId = id ? Number(id) : null;
      if (this.topicId) {
        this.loadTopic();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      order: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
      area: [1, [Validators.required, Validators.min(1), Validators.max(10)]], // Permitir hasta área 10
      type: ['topic', [Validators.required]],
    });
  }

  private loadTopic(): void {
    if (!this.topicId) return;

    this.isLoading = true;

    this.topicService
      .getTopicById(this.topicId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (topic) => {
          this.topic = topic;
          this.editForm.patchValue({
            title: topic.title,
            order: topic.order,
            area: topic.area,
            type: topic.type || 'topic', // Valor por defecto si no existe
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading topic:', error);
          this.snackBar.open('Error al cargar el topic', 'Cerrar', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/topics']);
        },
      });
  }

  private loadAreas(): void {
    this.isLoadingAreas = true;

    this.areaService
      .getAreasFromBackend()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Filtrar solo áreas con ID numérico válido (1, 2, etc.)
          this.availableAreas = response.items.filter((area) => {
            const areaId = parseInt(area.id, 10);
            return !isNaN(areaId) && areaId >= 1 && areaId <= 10; // Permitir hasta área 10
          });
          this.isLoadingAreas = false;
        },
        error: (error) => {
          console.error('Error loading areas:', error);
          // Si falla la carga del backend, usar áreas predefinidas
          this.areaService.getAreas().subscribe((areas) => {
            this.availableAreas = areas;
            this.isLoadingAreas = false;
          });
        },
      });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      return;
    }

    this.isSaving = true;

    if (this.topicId && this.topic) {
      // Modo edición
      const updateData: Topic = {
        ...this.topic,
        title: this.editForm.value.title,
        order: this.editForm.value.order,
        area: this.editForm.value.area,
        type: this.editForm.value.type,
      };

      this.topicService
        .updateTopic(this.topicId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedTopic) => {
            this.snackBar.open('Topic actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.isSaving = false;
            this.router.navigate(['/topics']);
          },
          error: (error) => {
            console.error('Error updating topic:', error);
            this.snackBar.open('Error al actualizar el topic', 'Cerrar', { duration: 5000 });
            this.isSaving = false;
          },
        });
    } else {
      // Modo creación
      const createData: CreateTopicFormData = {
        title: this.editForm.value.title,
        order: this.editForm.value.order,
        area: this.editForm.value.area,
        type: this.editForm.value.type,
      };

      this.topicService
        .createTopic(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newTopic) => {
            this.snackBar.open('Topic creado exitosamente', 'Cerrar', { duration: 3000 });
            this.isSaving = false;
            this.router.navigate(['/topics']);
          },
          error: (error) => {
            console.error('Error creating topic:', error);
            this.snackBar.open('Error al crear el topic', 'Cerrar', { duration: 5000 });
            this.isSaving = false;
          },
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/topics']);
  }

  // Getters para validación en el template
  get title() {
    return this.editForm.get('title');
  }

  get order() {
    return this.editForm.get('order');
  }

  get area() {
    return this.editForm.get('area');
  }

  get type() {
    return this.editForm.get('type');
  }
}
