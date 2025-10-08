import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { IUser } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  standalone: true,
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: IUser | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  isUpdating = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createProfileForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  private createPasswordForm(): FormGroup {
    return this.formBuilder.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  private loadUserProfile(): void {
    this.isLoading = true;

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
        });
      }
      this.isLoading = false;
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid && !this.isUpdating) {
      this.isUpdating = true;

      const formData = this.profileForm.value;

      this.authService
        .updateUser(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedUser) => {
            this.isUpdating = false;
            this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            this.isUpdating = false;
            console.error('Error updating profile:', error);
          },
        });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid && !this.isUpdating) {
      this.isUpdating = true;

      const passwordData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
      };

      this.authService
        .changePassword(passwordData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isUpdating = false;
            this.passwordForm.reset();
            this.snackBar.open('Contraseña cambiada exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            this.isUpdating = false;
            console.error('Error changing password:', error);
          },
        });
    }
  }

  getUserArea(): string {
    return this.authService.getUserArea();
  }

  getAreaFullName(): string {
    return this.authService.isPNArea() ? 'Policía Nacional' : 'Policía Local/Guardia Civil';
  }

  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }

    if (field?.hasError('email')) {
      return 'Ingresa un email válido';
    }

    if (field?.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${
        field.errors?.['minlength'].requiredLength
      } caracteres`;
    }

    return '';
  }

  getPasswordErrorMessage(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }

    if (field?.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${
        field.errors?.['minlength'].requiredLength
      } caracteres`;
    }

    if (field?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Nombre',
      email: 'Email',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar contraseña',
    };
    return displayNames[fieldName] || fieldName;
  }
}
