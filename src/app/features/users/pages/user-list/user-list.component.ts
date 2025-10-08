import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { UserManagementService } from '../../../../core/services/user-management.service';
import { AreaService } from '../../../../core/services/area.service';
import { IUser } from '../../../../core/models/user.model';
import { IArea } from '../../../../core/models/area.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  standalone: true,
})
export class UserListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  users: IUser[] = [];
  totalUsers = 0;
  isLoading = false;
  areasMap: Map<string, IArea> = new Map();

  // Pagination
  currentPage = 1;
  pageSize = 20;
  pageSizeOptions = [10, 20, 50, 100];

  // Table columns
  displayedColumns: string[] = ['name', 'email', 'area', 'createdAt', 'enabled', 'actions'];

  constructor(
    private userManagementService: UserManagementService,
    private areaService: AreaService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAreas();
    this.loadUsers();

    // Suscribirse a cambios de área para recargar usuarios automáticamente
    this.areaService.currentArea$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private loadUsers(): void {
    this.isLoading = true;

    // Obtener el área actual del AreaService
    const currentArea = this.areaService.getCurrentAreaSync();
    const currentAreaId = currentArea?.id;

    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      area: currentAreaId,
    };

    console.log('🔍 UserList - Filtros enviados:', filters);
    console.log('🔍 UserList - Área actual:', currentAreaId);

    this.userManagementService
      .getUsers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.items || [];
          this.totalUsers = response.pagination?.total || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.users = [];
          this.isLoading = false;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onToggleStatus(user: IUser, event: Event): void {
    event.stopPropagation();

    if (!user.id && !user._id) {
      this.snackBar.open('Error: Usuario sin ID', 'Cerrar', { duration: 3000 });
      return;
    }

    const userId = user.id || user._id!;
    const newStatus = !user.enabled;

    this.userManagementService
      .toggleUserStatus(userId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          user.enabled = newStatus;
          this.snackBar.open(
            `Usuario ${newStatus ? 'habilitado' : 'deshabilitado'} exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          this.snackBar.open('Error al cambiar estado del usuario', 'Cerrar', { duration: 3000 });
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

    // Fallback
    return area === 1 ? 'PN' : area === 2 ? 'PS' : 'N/A';
  }

  getAreaFullName(area: number): string {
    const areaId = area.toString();
    const areaData = this.areasMap.get(areaId);

    if (areaData) {
      return areaData.name;
    }

    // Fallback
    return area === 1 ? 'Policía Nacional' : area === 2 ? 'Policía Local/Guardia Civil' : 'N/A';
  }

  formatDate(dateString: string): string {
    return this.userManagementService.formatDate(dateString);
  }
}
