import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { AreaService } from '../../../core/services/area.service';
import { IArea } from '../../../core/models/area.model';

@Component({
  selector: 'app-area-selector',
  templateUrl: './area-selector.component.html',
  styleUrls: ['./area-selector.component.scss'],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  standalone: true,
})
export class AreaSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  areas: IArea[] = [];
  selectedArea: IArea | null = null;

  private areaService = inject(AreaService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadAreas();
    this.loadSelectedArea();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAreas(): void {
    // Cargar áreas desde el backend
    this.areaService
      .getAreasFromBackend({ page: 1, limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Filtrar solo las áreas habilitadas
          this.areas = response.items.filter((area) => !area.enabled);
        },
        error: (error) => {
          console.error('Error cargando áreas desde backend:', error);
          // Fallback a áreas predefinidas en caso de error
          this.areaService
            .getAreas()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (areas) => {
                this.areas = areas;
              },
            });
        },
      });
  }

  private loadSelectedArea(): void {
    this.areaService
      .getCurrentArea()
      .pipe(takeUntil(this.destroy$))
      .subscribe((area) => {
        this.selectedArea = area;
      });
  }

  onAreaChange(area: IArea): void {
    this.selectedArea = area;
    this.areaService.setCurrentArea(area);

    // Redirigir al dashboard después de cambiar el área
    this.router.navigate(['/dashboard']);
  }

  getAreaIcon(areaId: string): string {
    const area = this.areas.find((a) => a.id === areaId);
    return area?.icon || 'category';
  }

  getAreaDisplayName(areaId: string): string {
    const area = this.areas.find((a) => a.id === areaId);
    return area?.name || 'Área Desconocida';
  }
}
