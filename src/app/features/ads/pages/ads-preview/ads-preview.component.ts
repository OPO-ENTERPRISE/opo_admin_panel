import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Ad } from '../../../../core/models/ad.model';

@Component({
  selector: 'app-ads-preview',
  templateUrl: './ads-preview.component.html',
  styleUrls: ['./ads-preview.component.scss'],
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  standalone: true,
})
export class AdsPreviewComponent {
  @Input() ad: Ad | null = null;

  getProviderLabel(provider: string): string {
    const providers: Record<string, string> = {
      admob: 'AdMob',
      facebook: 'Facebook',
      custom: 'Personalizado',
    };
    return providers[provider] || provider;
  }

  getTypeLabel(type: string): string {
    const types: Record<string, string> = {
      banner: 'Banner',
      interstitial: 'Intersticial',
      video: 'Video',
    };
    return types[type] || type;
  }

  getScreenLabel(screen: string): string {
    const screens: Record<string, string> = {
      home: 'Inicio',
      test: 'Test',
      results: 'Resultados',
      topics: 'Temas',
      history: 'Historial',
    };
    return screens[screen] || screen;
  }
}
