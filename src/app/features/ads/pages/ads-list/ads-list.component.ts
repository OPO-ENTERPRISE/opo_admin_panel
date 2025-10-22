import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';

import { AdsService } from '../../services/ads.service';
import { Ad, AdFilters } from '../../../../core/models/ad.model';

@Component({
  selector: 'app-ads-list',
  templateUrl: './ads-list.component.html',
  styleUrls: ['./ads-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  standalone: true,
})
export class AdsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  ads: Ad[] = [];
  filteredAds: Ad[] = [];
  isLoading = false;

  // Filters
  searchControl = new FormControl('');
  providerFilter = new FormControl('all');
  typeFilter = new FormControl('all');
  screenFilter = new FormControl('all');
  statusFilter = new FormControl('all');

  // Table columns
  displayedColumns: string[] = [
    'name',
    'provider',
    'type',
    'appScreen',
    'active',
    'updatedAt',
    'actions',
  ];

  // Filter options
  readonly providerOptions = [
    { value: 'all', label: 'Todos los proveedores' },
    { value: 'admob', label: 'AdMob' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'custom', label: 'Personalizado' },
  ];

  readonly typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'banner', label: 'Banner' },
    { value: 'interstitial', label: 'Intersticial' },
    { value: 'video', label: 'Video' },
  ];

  readonly screenOptions = [
    { value: 'all', label: 'Todas las pantallas' },
    { value: 'home', label: 'Inicio' },
    { value: 'test', label: 'Test' },
    { value: 'results', label: 'Resultados' },
    { value: 'topics', label: 'Temas' },
    { value: 'history', label: 'Historial' },
  ];

  readonly statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' },
  ];

  constructor(
    private adsService: AdsService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadAds();
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
        this.applyFilters();
      });

    // Provider filter
    this.providerFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });

    // Type filter
    this.typeFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });

    // Screen filter
    this.screenFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });

    // Status filter
    this.statusFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });
  }

  private async loadAds(): Promise<void> {
    this.isLoading = true;

    try {
      this.ads = await firstValueFrom(this.adsService.getAds());
      this.applyFilters();
    } catch (error) {
      console.error('Error loading ads:', error);
      this.snackBar.open('Error al cargar los anuncios', 'Cerrar', { duration: 3000 });
      this.ads = [];
      this.filteredAds = [];
    } finally {
      this.isLoading = false;
    }
  }

  private applyFilters(): void {
    let filtered = [...this.ads];

    // Search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(
        (ad) =>
          ad.name.toLowerCase().includes(searchTerm) ||
          ad.placementId.toLowerCase().includes(searchTerm)
      );
    }

    // Provider filter
    if (this.providerFilter.value !== 'all') {
      filtered = filtered.filter((ad) => ad.provider === this.providerFilter.value);
    }

    // Type filter
    if (this.typeFilter.value !== 'all') {
      filtered = filtered.filter((ad) => ad.type === this.typeFilter.value);
    }

    // Screen filter
    if (this.screenFilter.value !== 'all') {
      filtered = filtered.filter((ad) => ad.appScreen === this.screenFilter.value);
    }

    // Status filter
    if (this.statusFilter.value !== 'all') {
      const isActive = this.statusFilter.value === 'true';
      filtered = filtered.filter((ad) => ad.active === isActive);
    }

    this.filteredAds = filtered;
  }

  async onToggleStatus(ad: Ad): Promise<void> {
    if (!ad._id) return;

    const newStatus = !ad.active;

    try {
      await firstValueFrom(this.adsService.toggleActiveStatus(ad._id, newStatus));
      ad.active = newStatus;
      this.snackBar.open(
        `Anuncio ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
        'Cerrar',
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Error toggling ad status:', error);
      this.snackBar.open('Error al cambiar el estado del anuncio', 'Cerrar', { duration: 3000 });
    }
  }

  async onDeleteAd(ad: Ad): Promise<void> {
    if (!ad._id) return;

    const confirmed = confirm(`¿Estás seguro de eliminar el anuncio "${ad.name}"?`);
    if (!confirmed) return;

    try {
      await firstValueFrom(this.adsService.deleteAd(ad._id));
      this.snackBar.open('Anuncio eliminado exitosamente', 'Cerrar', { duration: 3000 });
      await this.loadAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      this.snackBar.open('Error al eliminar el anuncio', 'Cerrar', { duration: 3000 });
    }
  }

  onEditAd(ad: Ad): void {
    this.router.navigate(['/ads', ad._id, 'edit']);
  }

  onCreateAd(): void {
    this.router.navigate(['/ads/new']);
  }

  getProviderLabel(provider: string): string {
    return this.adsService.getProviderLabel(provider);
  }

  getTypeLabel(type: string): string {
    return this.adsService.getTypeLabel(type);
  }

  getScreenLabel(screen: string): string {
    return this.adsService.getScreenLabel(screen);
  }

  formatDate(dateString: string): string {
    return this.adsService.formatDate(dateString);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.providerFilter.setValue('all');
    this.typeFilter.setValue('all');
    this.screenFilter.setValue('all');
    this.statusFilter.setValue('all');
    this.applyFilters();
  }
}
