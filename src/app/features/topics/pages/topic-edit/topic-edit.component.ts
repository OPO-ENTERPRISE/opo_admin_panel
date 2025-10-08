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
import { Subject, takeUntil } from 'rxjs';

import { TopicService } from '../../services/topic.service';
import { Topic } from '../../../../core/models/topic.model';

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
  ],
})
export class TopicEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  editForm!: FormGroup;
  topic: Topic | null = null;
  topicId: number | null = null;
  isLoading = false;
  isSaving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private topicService: TopicService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
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

  onSubmit(): void {
    if (this.editForm.invalid || !this.topicId || !this.topic) {
      return;
    }

    this.isSaving = true;

    // Crear el objeto de actualización con todos los campos necesarios
    const updateData: Topic = {
      ...this.topic,
      title: this.editForm.value.title,
      order: this.editForm.value.order,
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
}
