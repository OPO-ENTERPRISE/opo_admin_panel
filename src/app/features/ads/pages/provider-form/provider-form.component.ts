import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { ProviderService } from '../../../../core/services/provider.service';
import { AdProvider } from '../../../../core/models/provider.model';

@Component({
  selector: 'app-provider-form',
  templateUrl: './provider-form.component.html',
  styleUrls: ['./provider-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  standalone: true,
})
export class ProviderFormComponent implements OnInit {
  private destroy$ = new Subject<void>();

  providerForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  providerId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private providerService: ProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.providerId = id || null;
      if (this.providerId) {
        this.isEditMode = true;
        this.loadProvider();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.providerForm = this.fb.group({
      providerId: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      icon: ['ads_click'],
      color: ['#4285f4'],
      enabled: [true],
      order: [1, [Validators.required, Validators.min(0), Validators.max(999)]],
    });
  }

  private loadProvider(): void {
    if (!this.providerId) return;

    this.isLoading = true;

    this.providerService
      .getProviderById(this.providerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (provider) => {
          this.providerForm.patchValue({
            providerId: provider.providerId,
            name: provider.name,
            icon: provider.icon || 'ads_click',
            color: provider.color || '#4285f4',
            enabled: provider.enabled,
            order: provider.order,
          });
          // Deshabilitar providerId en modo edición (no se debe cambiar)
          this.providerForm.get('providerId')?.disable();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading provider:', error);
          this.snackBar.open('Error al cargar el proveedor', 'Cerrar', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/ads/providers']);
        },
      });
  }

  onSubmit(): void {
    if (this.providerForm.invalid) {
      return;
    }

    this.isSaving = true;

    const formValue = this.providerForm.getRawValue(); // getRawValue para incluir campos disabled

    const providerData = {
      providerId: formValue.providerId,
      name: formValue.name,
      icon: formValue.icon || undefined,
      color: formValue.color || undefined,
      enabled: formValue.enabled,
      order: formValue.order,
    };

    const request$ =
      this.isEditMode && this.providerId
        ? this.providerService.updateProvider(this.providerId, providerData)
        : this.providerService.createProvider(providerData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open(
          `Proveedor ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.isSaving = false;
        this.router.navigate(['/ads/providers']);
      },
      error: (error) => {
        console.error('Error saving provider:', error);
        this.snackBar.open('Error al guardar el proveedor', 'Cerrar', { duration: 3000 });
        this.isSaving = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/ads/providers']);
  }

  // Getters para validación en el template
  get providerId_field() {
    return this.providerForm.get('providerId');
  }

  get name() {
    return this.providerForm.get('name');
  }

  get icon() {
    return this.providerForm.get('icon');
  }

  get color() {
    return this.providerForm.get('color');
  }

  get order() {
    return this.providerForm.get('order');
  }

  get title(): string {
    return this.isEditMode ? 'Editar Proveedor' : 'Crear Nuevo Proveedor';
  }
}
