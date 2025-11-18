import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatDialogModule,
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AreaService } from '../../../../core/services/area.service';
import { IArea } from '../../../../core/models/area.model';

@Component({
  selector: 'app-area-list',
  templateUrl: './area-list.component.html',
  styleUrls: ['./area-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  standalone: true,
})
export class AreaListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  areas: IArea[] = [];
  totalAreas = 0;
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 20;
  pageSizeOptions = [10, 20, 50, 100];

  // Table columns
  displayedColumns: string[] = ['name', 'description', 'order', 'enabled', 'actions'];

  constructor(
    private areaService: AreaService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAreas(): void {
    this.isLoading = true;

    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    this.areaService
      .getAreasFromBackend(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.areas = response.items;
          this.totalAreas = response.pagination.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading areas:', error);
          this.isLoading = false;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadAreas();
  }

  onCreateArea(): void {
    const dialogRef = this.dialog.open(AreaEditDialog, {
      width: '600px',
      data: { area: null, isNew: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAreas();
        this.snackBar.open('Área creada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onEditArea(area: IArea, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(AreaEditDialog, {
      width: '600px',
      data: { area, isNew: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recargar la lista completa para asegurar que se muestren los cambios
        this.loadAreas();
        this.snackBar.open('Área actualizada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onToggleStatus(area: IArea, event: Event): void {
    event.stopPropagation();

    const newStatus = !area.enabled;

    this.areaService
      .toggleAreaStatus(area.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          area.enabled = newStatus;
          this.snackBar.open(
            `Área ${newStatus ? 'habilitada' : 'deshabilitada'} exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error toggling area status:', error);
          this.snackBar.open('Error al cambiar estado del área', 'Cerrar', { duration: 3000 });
        },
      });
  }

  onDeleteArea(area: IArea, event: Event): void {
    event.stopPropagation();

    if (confirm(`¿Estás seguro de que deseas eliminar el área "${area.name}"?`)) {
      this.areaService
        .deleteArea(area.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadAreas();
            this.snackBar.open('Área eliminada exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting area:', error);
            this.snackBar.open('Error al eliminar el área', 'Cerrar', { duration: 3000 });
          },
        });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return '-';
    }
  }
}

// ========== Diálogo para crear/editar área ==========

@Component({
  selector: 'area-edit-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.isNew ? 'add' : 'edit' }}</mat-icon>
        {{ data.isNew ? 'Nueva Área' : 'Editar Área' }}
      </h2>
      <mat-dialog-content>
        <form [formGroup]="editForm" class="edit-form">
          <!-- Name Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre</mat-label>
            <input
              matInput
              formControlName="name"
              placeholder="Ingrese el nombre del área"
              style="color: #000 !important;"
            />
            <mat-icon matPrefix>label</mat-icon>
            <mat-error *ngIf="name?.hasError('required')">El nombre es requerido</mat-error>
            <mat-error *ngIf="name?.hasError('minlength')">
              El nombre debe tener al menos 3 caracteres
            </mat-error>
            <mat-error *ngIf="name?.hasError('maxlength')">
              El nombre no puede exceder 100 caracteres
            </mat-error>
          </mat-form-field>

          <!-- Description Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción</mat-label>
            <textarea
              matInput
              formControlName="description"
              placeholder="Ingrese la descripción del área"
              rows="3"
              style="color: #000 !important;"
            ></textarea>
            <mat-icon matPrefix>description</mat-icon>
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

          <!-- Enabled Checkbox -->
          <div class="checkbox-field">
            <mat-checkbox formControlName="enabled">Área habilitada</mat-checkbox>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()" [disabled]="isSaving">
          <mat-icon>cancel</mat-icon>
          Cancelar
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

      .checkbox-field {
        padding: 8px 0;
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
    MatCheckboxModule,
  ],
})
export class AreaEditDialog {
  editForm!: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AreaEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { area: IArea | null; isNew: boolean },
    private areaService: AreaService,
    private snackBar: MatSnackBar
  ) {
    // Inicializar el formulario directamente con los valores del área
    this.editForm = this.fb.group({
      name: [
        this.data.area?.name || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      ],
      description: [this.data.area?.description || ''],
      order: [
        this.data.area?.order || 0,
        [Validators.required, Validators.min(0), Validators.max(9999)],
      ],
      enabled: [this.data.area?.enabled !== undefined ? this.data.area.enabled : false], // Lógica invertida: false = habilitado
    });
  }

  onSave(): void {
    if (this.editForm.invalid) {
      return;
    }

    this.isSaving = true;

    const areaData: Partial<IArea> = {
      name: this.editForm.value.name,
      description: this.editForm.value.description,
      order: this.editForm.value.order,
      enabled: this.editForm.value.enabled,
    };

    // Incluir el ID en el payload si estamos editando
    if (!this.data.isNew && this.data.area?.id) {
      areaData.id = this.data.area.id;
    }

    const request$ = this.data.isNew
      ? this.areaService.createArea(areaData)
      : this.areaService.updateArea(this.data.area!.id, areaData);

    request$.subscribe({
      next: (updatedArea) => {
        this.isSaving = false;
        this.dialogRef.close(updatedArea);
      },
      error: (error) => {
        console.error('Error saving area:', error);
        this.snackBar.open('Error al guardar el área', 'Cerrar', { duration: 5000 });
        this.isSaving = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get name() {
    return this.editForm.get('name');
  }

  get order() {
    return this.editForm.get('order');
  }
}
