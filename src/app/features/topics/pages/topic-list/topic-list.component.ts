import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { TopicService } from '../../services/topic.service';
import { Topic, TopicResponse } from '../../../../core/models/topic.model';
import { TopicFilters } from '../../../../core/models/api.model';
import { AreaService } from '../../../../core/services/area.service';
import { IArea } from '../../../../core/models/area.model';

@Component({
  selector: 'app-topic-list',
  templateUrl: './topic-list.component.html',
  styleUrls: ['./topic-list.component.scss'],
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
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  standalone: true,
})
export class TopicListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  topics: Topic[] = [];
  totalTopics = 0;
  isLoading = false;
  areasMap: Map<string, IArea> = new Map();

  // Filters
  searchControl = new FormControl('');
  areaFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  premiumFilter = new FormControl('all');
  typeFilter = new FormControl('all');

  // Pagination
  currentPage = 1;
  pageSize = 20;
  pageSizeOptions = [10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'topic_list_page_size';

  // Table columns
  displayedColumns: string[] = [
    'title',
    'type',
    'area',
    'order',
    'enabled',
    'premium',
    'createdAt',
    'actions',
  ];

  // Filter options
  areaOptions = [
    { value: 'all', label: 'Todas las áreas' },
    { value: '1', label: 'Policía Nacional (PN)' },
    { value: '2', label: 'Policía Local/Guardia Civil (PS)' },
  ];

  readonly statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'false', label: 'Habilitados' },
    { value: 'true', label: 'Deshabilitados' },
  ];

  readonly premiumOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'true', label: 'Solo Premium' },
    { value: 'false', label: 'Solo No Premium' },
  ];

  readonly typeOptions = [
    { value: 'all', label: 'Todos los tipos', icon: 'select_all' },
    { value: 'topic', label: 'Temas', icon: 'menu_book' },
    { value: 'exam', label: 'Exámenes Oficiales', icon: 'description' },
    { value: 'misc', label: 'Miscelánea', icon: 'folder_special' },
  ];

  constructor(
    private topicService: TopicService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private areaService: AreaService
  ) {}

  ngOnInit(): void {
    this.loadPageSizeFromStorage();
    this.loadAreas();
    this.setupFilters();
    this.loadTopics();

    // Suscribirse a cambios de área para recargar topics automáticamente
    this.areaService.currentArea$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPage = 1;
      this.loadTopics();
    });
  }

  private loadPageSizeFromStorage(): void {
    const savedPageSize = localStorage.getItem(this.PAGE_SIZE_STORAGE_KEY);
    if (savedPageSize) {
      const parsedSize = parseInt(savedPageSize, 10);
      // Verificar que el valor guardado esté en las opciones válidas
      if (this.pageSizeOptions.includes(parsedSize)) {
        this.pageSize = parsedSize;
      }
    }
  }

  private savePageSizeToStorage(): void {
    localStorage.setItem(this.PAGE_SIZE_STORAGE_KEY, this.pageSize.toString());
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
    // Search filter with debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTopics();
      });

    // Area filter
    this.areaFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPage = 1;
      this.loadTopics();
    });

    // Status filter
    this.statusFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPage = 1;
      this.loadTopics();
    });

    // Premium filter
    this.premiumFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPage = 1;
      this.loadTopics();
    });

    // Type filter
    this.typeFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPage = 1;
      this.loadTopics();
    });
  }

  private loadTopics(): void {
    this.isLoading = true;

    // Obtener el área actual del AreaService
    const currentArea = this.areaService.getCurrentAreaSync();
    const currentAreaId = currentArea?.id;

    const filters: TopicFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchControl.value || undefined,
      // Si hay área seleccionada, usarla; sino usar el filtro del dropdown
      area:
        currentAreaId ||
        (this.areaFilter.value !== 'all' ? this.areaFilter.value || undefined : undefined),
      enabled: this.statusFilter.value !== 'all' ? this.statusFilter.value === 'true' : undefined,
      premium: this.premiumFilter.value !== 'all' ? this.premiumFilter.value === 'true' : undefined,
      type:
        this.typeFilter.value !== 'all'
          ? (this.typeFilter.value as 'topic' | 'exam' | 'misc')
          : undefined,
    };

    console.log('🔍 TopicList - Filtros enviados:', filters);
    console.log('🔍 TopicList - Área actual:', currentAreaId);

    this.topicService
      .getTopics(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TopicResponse) => {
          this.topics = response.items || []; // Asegurar que nunca sea null
          this.totalTopics = response.pagination?.total || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading topics:', error);
          this.topics = []; // Asegurar array vacío en caso de error
          this.isLoading = false;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.savePageSizeToStorage();
    this.loadTopics();
  }

  onTopicClick(topic: Topic): void {
    this.router.navigate(['/topics', topic.id]);
  }

  onToggleStatus(topic: Topic): void {
    const newStatus = !topic.enabled;

    this.topicService
      .toggleTopicStatus(topic.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          topic.enabled = newStatus;
          this.snackBar.open(
            `Topic ${!newStatus ? 'habilitado' : 'deshabilitado'} exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error toggling topic status:', error);
        },
      });
  }

  onTogglePremium(topic: Topic): void {
    const newPremiumStatus = !topic.premium;

    console.log('🔍 Toggle Premium - Topic ID:', topic.id);
    console.log('🔍 Toggle Premium - New Status:', newPremiumStatus);
    console.log('🔍 Toggle Premium - Topic completo:', topic);

    this.topicService
      .toggleTopicPremium(topic.id, newPremiumStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Toggle Premium - Response:', response);
          topic.premium = newPremiumStatus;
          this.snackBar.open(
            `Topic ${
              newPremiumStatus ? 'marcado como premium' : 'desmarcado como premium'
            } exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('❌ Error toggling topic premium status:', error);
          this.snackBar.open('Error al cambiar estado premium del topic', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  onDeleteTopic(topic: Topic): void {
    // TODO: Implement delete confirmation dialog
    console.log('Delete topic:', topic);
  }

  onEditTopic(topic: Topic): void {
    this.router.navigate(['/topics', topic.id, 'edit']);
  }

  onCreateTopic(): void {
    this.router.navigate(['/topics/new']);
  }

  getAreaName(area: number | string): string {
    const areaId = area.toString();
    const areaData = this.areasMap.get(areaId);

    if (areaData) {
      // Generar iniciales del nombre del área
      return areaData.name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
    }

    // Fallback al método del servicio si no está en el mapa
    return this.topicService.getAreaName(area as number);
  }

  getAreaFullName(area: number | string): string {
    const areaId = area.toString();
    const areaData = this.areasMap.get(areaId);

    if (areaData) {
      return areaData.name;
    }

    // Fallback al método del servicio si no está en el mapa
    return this.topicService.getAreaFullName(area as number);
  }

  formatDate(dateString: string): string {
    return this.topicService.formatDate(dateString);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.areaFilter.setValue('all');
    this.statusFilter.setValue('all');
    this.premiumFilter.setValue('all');
    this.typeFilter.setValue('all');
    this.currentPage = 1;
    this.loadTopics();
  }

  getTypeName(type: string): string {
    return this.topicService.getTypeName(type);
  }

  getTypeIcon(type: string): string {
    return this.topicService.getTypeIcon(type);
  }
}
