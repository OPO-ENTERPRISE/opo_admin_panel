import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { AdsService } from '../../services/ads.service';
import { Ad, CreateAdRequest, UpdateAdRequest } from '../../../../core/models/ad.model';
import { ProviderService } from '../../../../core/services/provider.service';
import { AdProvider } from '../../../../core/models/provider.model';

@Component({
  selector: 'app-ads-form',
  templateUrl: './ads-form.component.html',
  styleUrls: ['./ads-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  standalone: true,
})
export class AdsFormComponent implements OnInit {
  adForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  adId: string | null = null;

  // Options for selects
  providerOptions: { value: string; label: string; icon?: string; color?: string }[] = [];
  isLoadingProviders = false;

  readonly typeOptions = [
    { value: 'banner', label: 'Banner' },
    { value: 'interstitial', label: 'Intersticial' },
    { value: 'video', label: 'Video' },
  ];

  readonly screenOptions = [
    { value: 'home', label: 'Inicio' },
    { value: 'test', label: 'Test' },
    { value: 'results', label: 'Resultados' },
    { value: 'topics', label: 'Temas' },
    { value: 'history', label: 'Historial' },
  ];

  constructor(
    private fb: FormBuilder,
    private adsService: AdsService,
    private providerService: ProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProviders();
    this.initForm();
    this.checkEditMode();
  }

  private loadProviders(): void {
    this.isLoadingProviders = true;

    this.providerService.getEnabledProviders().subscribe({
      next: (response) => {
        this.providerOptions = response.items.map((provider) => ({
          value: provider.providerId,
          label: provider.name,
          icon: provider.icon,
          color: provider.color,
        }));
        this.isLoadingProviders = false;
      },
      error: (error) => {
        console.error('Error loading providers:', error);
        // Fallback a proveedores por defecto si falla la carga
        this.providerOptions = [
          { value: 'admob', label: 'AdMob', icon: 'ads_click', color: '#4285f4' },
          { value: 'facebook', label: 'Facebook', icon: 'campaign', color: '#1877f2' },
          { value: 'custom', label: 'Personalizado', icon: 'settings', color: '#757575' },
        ];
        this.isLoadingProviders = false;
      },
    });
  }

  private initForm(): void {
    this.adForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      provider: ['admob', Validators.required],
      type: ['banner', Validators.required],
      placementId: ['', [Validators.required]],
      appScreen: ['home', [Validators.required]],
      active: [true],
      config: this.fb.group({
        refreshRate: [60, [Validators.min(0)]],
        displayProbability: [0.8, [Validators.min(0), Validators.max(1)]],
        customUrl: [''],
      }),
    });
  }

  private checkEditMode(): void {
    this.adId = this.route.snapshot.paramMap.get('id');
    if (this.adId) {
      this.isEditMode = true;
      this.loadAd(this.adId);
    }
  }

  private async loadAd(id: string): Promise<void> {
    this.isLoading = true;

    try {
      const ad = await firstValueFrom(this.adsService.getAdById(id));
      this.populateForm(ad);
    } catch (error) {
      console.error('Error loading ad:', error);
      this.snackBar.open('Error al cargar el anuncio', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/ads']);
    } finally {
      this.isLoading = false;
    }
  }

  private populateForm(ad: Ad): void {
    this.adForm.patchValue({
      name: ad.name,
      provider: ad.provider,
      type: ad.type,
      placementId: ad.placementId,
      appScreen: ad.appScreen,
      active: ad.active,
      config: {
        refreshRate: ad.config?.refreshRate || 60,
        displayProbability: ad.config?.displayProbability || 0.8,
        customUrl: ad.config?.customUrl || '',
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.adForm.invalid) {
      this.markFormGroupTouched(this.adForm);
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isSaving = true;

    try {
      const formValue = this.adForm.value;
      const adData: CreateAdRequest | UpdateAdRequest = {
        name: formValue.name,
        provider: formValue.provider,
        type: formValue.type,
        placementId: formValue.placementId,
        appScreen: formValue.appScreen,
        active: formValue.active,
        config: {
          refreshRate: formValue.config.refreshRate || undefined,
          displayProbability: formValue.config.displayProbability || undefined,
          customUrl: formValue.config.customUrl || undefined,
        },
      };

      if (this.isEditMode && this.adId) {
        await firstValueFrom(this.adsService.updateAd(this.adId, adData));
        this.snackBar.open('Anuncio actualizado exitosamente', 'Cerrar', { duration: 3000 });
      } else {
        await firstValueFrom(this.adsService.createAd(adData));
        this.snackBar.open('Anuncio creado exitosamente', 'Cerrar', { duration: 3000 });
      }

      this.router.navigate(['/ads']);
    } catch (error) {
      console.error('Error saving ad:', error);
      this.snackBar.open('Error al guardar el anuncio', 'Cerrar', { duration: 3000 });
    } finally {
      this.isSaving = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/ads']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.adForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength'])
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;

    return '';
  }

  getConfigErrorMessage(fieldName: string): string {
    const control = this.adForm.get(`config.${fieldName}`);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;

    return '';
  }

  get title(): string {
    return this.isEditMode ? 'Editar Anuncio' : 'Crear Nuevo Anuncio';
  }
}
