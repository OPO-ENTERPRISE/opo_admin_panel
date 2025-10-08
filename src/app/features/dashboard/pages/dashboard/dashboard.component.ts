import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { AreaService } from '../../../../core/services/area.service';
import { StatsService } from '../../../../core/services/stats.service';
import { IUser } from '../../../../core/models/user.model';
import { AreaStats } from '../../../../core/models/stats.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatDividerModule,
  ],
  standalone: true,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: IUser | null = null;
  areasStats: AreaStats[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private areaService: AreaService,
    private statsService: StatsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    // Obtener usuario actual
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
    });

    // Cargar estadísticas de todas las áreas
    this.statsService
      .getAllAreasStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.areasStats = stats;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading areas stats:', error);
          this.isLoading = false;
        },
      });
  }

  onManageTopics(areaId: number): void {
    // Buscar el área y establecerla como actual
    this.areaService
      .getAreaById(areaId.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (area) => {
          this.areaService.setCurrentArea(area);
          this.router.navigate(['/topics']);
        },
        error: (error) => {
          console.error('Error setting area:', error);
          this.router.navigate(['/topics']);
        },
      });
  }

  onManageUsers(areaId: number): void {
    // Buscar el área y establecerla como actual
    this.areaService
      .getAreaById(areaId.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (area) => {
          this.areaService.setCurrentArea(area);
          this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Error setting area:', error);
          this.router.navigate(['/users']);
        },
      });
  }

  getAreaIcon(areaId: number): string {
    // Iconos según área
    switch (areaId) {
      case 1:
        return 'security';
      case 2:
        return 'local_police';
      default:
        return 'category';
    }
  }

  getAreaColor(areaId: number): string {
    // Colores según área
    switch (areaId) {
      case 1:
        return 'primary';
      case 2:
        return 'accent';
      default:
        return '';
    }
  }
}
