import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { ProviderService } from '../../../../core/services/provider.service';
import { AdProvider } from '../../../../core/models/provider.model';

@Component({
  selector: 'app-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  standalone: true,
})
export class ProviderListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  providers: AdProvider[] = [];
  isLoading = false;

  displayedColumns: string[] = [
    'name',
    'providerId',
    'icon',
    'color',
    'enabled',
    'order',
    'actions',
  ];

  constructor(
    private providerService: ProviderService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProviders(): void {
    this.isLoading = true;

    this.providerService
      .getProviders({ limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.providers = response.items || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading providers:', error);
          this.providers = [];
          this.isLoading = false;
          this.snackBar.open('Error al cargar proveedores', 'Cerrar', { duration: 3000 });
        },
      });
  }

  onCreateProvider(): void {
    this.router.navigate(['/ads/providers/new']);
  }

  onEditProvider(provider: AdProvider): void {
    this.router.navigate(['/ads/providers', provider._id, 'edit']);
  }

  onToggleStatus(provider: AdProvider): void {
    const newStatus = !provider.enabled;

    this.providerService
      .toggleProviderStatus(provider._id!, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          provider.enabled = newStatus;
          this.snackBar.open(
            `Proveedor ${newStatus ? 'habilitado' : 'deshabilitado'} exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error toggling provider status:', error);
          this.snackBar.open('Error al cambiar estado del proveedor', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  onDeleteProvider(provider: AdProvider): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el proveedor "${provider.name}"?`)) {
      this.providerService
        .deleteProvider(provider._id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Proveedor eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.loadProviders();
          },
          error: (error) => {
            console.error('Error deleting provider:', error);
            this.snackBar.open('Error al eliminar proveedor', 'Cerrar', { duration: 3000 });
          },
        });
    }
  }

  formatDate(dateString: string): string {
    return this.providerService.formatDate(dateString);
  }
}
