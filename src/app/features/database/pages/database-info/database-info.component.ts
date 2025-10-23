import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, finalize } from 'rxjs';

import { DatabaseService } from '../../services/database.service';
import { DatabaseStats, CollectionStats } from '../../../../core/models/database.model';

@Component({
  selector: 'app-database-info',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './database-info.component.html',
  styleUrls: ['./database-info.component.scss'],
})
export class DatabaseInfoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado de carga
  loading = false;
  downloading = false;

  // Datos de la base de datos
  databaseStats: DatabaseStats | null = null;

  // Configuración de la tabla
  displayedColumns: string[] = ['name', 'documentCount', 'size'];
  collections: CollectionStats[] = [];

  constructor(
    private databaseService: DatabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDatabaseStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga las estadísticas de la base de datos
   */
  loadDatabaseStats(): void {
    this.loading = true;
    this.databaseService
      .getStats()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (stats) => {
          this.databaseStats = stats;
          this.collections = stats.collections;
          console.log('✅ Estadísticas de BD cargadas:', stats);
        },
        error: (error) => {
          console.error('❌ Error cargando estadísticas:', error);
          this.snackBar.open('Error al cargar las estadísticas de la base de datos', 'Cerrar', {
            duration: 5000,
          });
        },
      });
  }

  /**
   * Descarga un backup de la base de datos
   */
  downloadBackup(): void {
    // Mostrar confirmación
    const confirmDialog = this.dialog.open(ConfirmDownloadDialogComponent, {
      width: '400px',
      data: {
        title: 'Descargar Backup',
        message:
          '¿Estás seguro de que quieres descargar un backup completo de la base de datos? Esta operación puede tomar varios minutos.',
      },
    });

    confirmDialog.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.performDownload();
      }
    });
  }

  /**
   * Realiza la descarga del backup
   */
  private performDownload(): void {
    this.downloading = true;
    this.databaseService
      .downloadBackup()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.downloading = false))
      )
      .subscribe({
        next: (blob) => {
          // Crear URL del blob y descargar
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const timestamp =
            new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] +
            '_' +
            new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
          link.download = `mongodb_backup_${timestamp}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.snackBar.open('Backup descargado exitosamente', 'Cerrar', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('❌ Error descargando backup:', error);
          this.snackBar.open('Error al descargar el backup de la base de datos', 'Cerrar', {
            duration: 5000,
          });
        },
      });
  }

  /**
   * Formatea el tamaño en bytes a una representación legible
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formatea números con separadores de miles
   */
  formatNumber(num: number): string {
    return num.toLocaleString('es-ES');
  }
}

// Componente de diálogo de confirmación
@Component({
  selector: 'app-confirm-download-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-button color="primary" [mat-dialog-close]="true">Confirmar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDownloadDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
