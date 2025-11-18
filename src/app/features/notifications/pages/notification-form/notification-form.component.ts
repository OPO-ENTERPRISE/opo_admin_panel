import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';

import { NotificationService } from '../../services/notification.service';
import {
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
} from '../../models/notification.model';

@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss'],
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
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class NotificationFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  notificationForm!: FormGroup;
  notification: Notification | null = null;
  notificationId: string | null = null;
  isLoading = false;
  isSaving = false;

  areaOptions = [
    { value: 0, label: 'Todas las áreas' },
    { value: 1, label: 'Policía Nacional (PN)' },
    { value: 2, label: 'Policía Local/Guardia Civil (PS)' },
  ];

  typeOptions = [
    { value: 'simple', label: 'Simple' },
    { value: 'fixed', label: 'Fija' },
  ];

  actionTypeOptions = [
    { value: 'update_app', label: 'Actualizar app' },
    { value: 'link', label: 'Enlace' },
    { value: 'acknowledge', label: 'Reconocer' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.notificationId = id || null;
      if (this.notificationId) {
        this.loadNotification();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.notificationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      type: ['simple', [Validators.required]],
      area: [0, [Validators.required]],
      actionType: [''],
      actionData: [''],
      startDate: [now, [Validators.required]],
      endDate: [null],
      enabled: [true],
    });

    // Validaciones condicionales
    this.notificationForm.get('type')?.valueChanges.subscribe((type) => {
      const actionTypeControl = this.notificationForm.get('actionType');
      const actionDataControl = this.notificationForm.get('actionData');

      if (type === 'fixed') {
        actionTypeControl?.setValidators([Validators.required]);
      } else {
        actionTypeControl?.clearValidators();
        actionDataControl?.clearValidators();
      }

      actionTypeControl?.updateValueAndValidity();
      actionDataControl?.updateValueAndValidity();
    });

    this.notificationForm.get('actionType')?.valueChanges.subscribe((actionType) => {
      const actionDataControl = this.notificationForm.get('actionData');

      if (actionType === 'link' || actionType === 'update_app') {
        actionDataControl?.setValidators([Validators.required]);
      } else {
        actionDataControl?.clearValidators();
      }

      actionDataControl?.updateValueAndValidity();
    });
  }

  private loadNotification(): void {
    if (!this.notificationId) return;

    this.isLoading = true;

    this.notificationService
      .getNotificationById(this.notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notification) => {
          this.notification = notification;
          this.notificationForm.patchValue({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            area: notification.area,
            actionType: notification.actionType || '',
            actionData: notification.actionData || '',
            startDate: new Date(notification.startDate),
            endDate: notification.endDate ? new Date(notification.endDate) : null,
            enabled: notification.enabled,
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notification:', error);
          this.snackBar.open('Error al cargar la notificación', 'Cerrar', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/notifications']);
        },
      });
  }

  onSubmit(): void {
    if (this.notificationForm.invalid) {
      this.markFormGroupTouched(this.notificationForm);
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isSaving = true;

    const formValue = this.notificationForm.value;

    // Preparar datos según el tipo
    const notificationData: CreateNotificationRequest | UpdateNotificationRequest = {
      title: formValue.title,
      message: formValue.message,
      type: formValue.type,
      area: formValue.area,
      actionType: formValue.actionType || undefined,
      actionData: formValue.actionData || undefined,
      startDate: formValue.startDate.toISOString(),
      endDate: formValue.endDate ? formValue.endDate.toISOString() : undefined,
      enabled: formValue.enabled,
    };

    const request = this.notificationId
      ? this.notificationService.updateNotification(this.notificationId, notificationData)
      : this.notificationService.createNotification(notificationData as CreateNotificationRequest);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open(
          `Notificación ${this.notificationId ? 'actualizada' : 'creada'} exitosamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.router.navigate(['/notifications']);
      },
      error: (error) => {
        console.error('Error saving notification:', error);
        this.snackBar.open('Error al guardar la notificación', 'Cerrar', { duration: 3000 });
        this.isSaving = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/notifications']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.notificationForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  get isFixedType(): boolean {
    return this.notificationForm.get('type')?.value === 'fixed';
  }

  get isLinkAction(): boolean {
    return this.notificationForm.get('actionType')?.value === 'link';
  }

  get isUpdateAppAction(): boolean {
    return this.notificationForm.get('actionType')?.value === 'update_app';
  }
}

