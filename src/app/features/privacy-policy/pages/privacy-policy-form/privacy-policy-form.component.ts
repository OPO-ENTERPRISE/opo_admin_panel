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
import { Subject, takeUntil } from 'rxjs';

import { PrivacyPolicyService } from '../../services/privacy-policy.service';
import {
  PrivacyPolicy,
  CreatePrivacyPolicyRequest,
  UpdatePrivacyPolicyRequest,
} from '../../models/privacy-policy.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-privacy-policy-form',
  templateUrl: './privacy-policy-form.component.html',
  styleUrls: ['./privacy-policy-form.component.scss'],
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
export class PrivacyPolicyFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  policyForm!: FormGroup;
  policy: PrivacyPolicy | null = null;
  areaId: number | null = null;
  isLoading = false;
  isSaving = false;

  areaOptions = [
    { value: 1, label: 'Policía Nacional (PN)' },
    { value: 2, label: 'Policía Local/Guardia Civil (PS)' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private privacyPolicyService: PrivacyPolicyService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const areaIdParam = params['areaId'];
      if (areaIdParam) {
        this.areaId = +areaIdParam;
        this.loadPolicy();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.policyForm = this.fb.group({
      area: [1, [Validators.required]],
      html: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Si estamos editando, deshabilitar el campo de área
    if (this.areaId) {
      this.policyForm.get('area')?.disable();
    }
  }

  private loadPolicy(): void {
    if (!this.areaId) return;

    this.isLoading = true;

    this.privacyPolicyService
      .getByArea(this.areaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (policy) => {
          this.policy = policy;
          this.policyForm.patchValue({
            area: policy.area,
            html: policy.html,
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading policy:', error);
          this.isLoading = false;
          this.snackBar.open('Error al cargar política de privacidad', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/privacy-policies']);
        },
      });
  }

  onSubmit(): void {
    if (this.policyForm.invalid) {
      this.markFormGroupTouched(this.policyForm);
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isSaving = true;
    const formValue = this.policyForm.getRawValue();

    const areaForUrl = this.areaId ?? formValue.area;
    const areaSlug = areaForUrl === 1 ? 'pn' : 'ps';
    const publicUrl = `${environment.apiUrl}/privacy-policy/${areaSlug}`;

    if (this.areaId) {
      // Actualizar
      const updateData: UpdatePrivacyPolicyRequest = {
        html: formValue.html,
      };

      this.privacyPolicyService
        .update(this.areaId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Política de privacidad actualizada. Haz clic para abrir la URL pública.',
              'Ver política',
              {
                duration: 6000,
              }
            ).onAction().subscribe(() => {
              window.open(publicUrl, '_blank');
            });
            this.router.navigate(['/privacy-policies']);
          },
          error: (error) => {
            console.error('Error updating policy:', error);
            this.isSaving = false;
            const errorMessage =
              error.error?.message || 'Error al actualizar política de privacidad';
            this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
          },
        });
    } else {
      // Crear
      const createData: CreatePrivacyPolicyRequest = {
        area: formValue.area,
        html: formValue.html,
      };

      this.privacyPolicyService
        .create(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Política de privacidad creada. Haz clic para abrir la URL pública.',
              'Ver política',
              {
                duration: 6000,
              }
            ).onAction().subscribe(() => {
              window.open(publicUrl, '_blank');
            });
            this.router.navigate(['/privacy-policies']);
          },
          error: (error) => {
            console.error('Error creating policy:', error);
            this.isSaving = false;
            const errorMessage =
              error.error?.message || 'Error al crear política de privacidad';
            this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
          },
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/privacy-policies']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.policyForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
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
}



