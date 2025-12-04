import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { PrivacyPolicyService } from '../../services/privacy-policy.service';
import { PrivacyPolicy } from '../../models/privacy-policy.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-privacy-policy-list',
  templateUrl: './privacy-policy-list.component.html',
  styleUrls: ['./privacy-policy-list.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDialogModule,
  ],
  standalone: true,
})
export class PrivacyPolicyListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  policies: PrivacyPolicy[] = [];
  isLoading = false;

  displayedColumns: string[] = ['area', 'createdAt', 'updatedAt', 'publicUrl', 'actions'];

  constructor(
    private privacyPolicyService: PrivacyPolicyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPolicies(): void {
    this.isLoading = true;

    this.privacyPolicyService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (policies) => {
          this.policies = policies || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading policies:', error);
          this.policies = [];
          this.isLoading = false;
          this.snackBar.open('Error al cargar políticas de privacidad', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  onCreatePolicy(): void {
    this.router.navigate(['/privacy-policies/new']);
  }

  onEditPolicy(policy: PrivacyPolicy): void {
    this.router.navigate(['/privacy-policies/edit', policy.area]);
  }

  onDeletePolicy(policy: PrivacyPolicy): void {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar la política de privacidad para ${this.getAreaName(policy.area)}?`
      )
    ) {
      return;
    }

    this.privacyPolicyService
      .delete(policy.area)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Política de privacidad eliminada', 'Cerrar', {
            duration: 3000,
          });
          this.loadPolicies();
        },
        error: (error) => {
          console.error('Error deleting policy:', error);
          this.snackBar.open('Error al eliminar política de privacidad', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  getPublicUrl(policy: PrivacyPolicy): string {
    if (policy.publicUrl) {
      return policy.publicUrl;
    }
    const areaSlug = policy.area === 1 ? 'pn' : 'ps';
    return `${environment.apiUrl}/privacy-policy/${areaSlug}`;
  }

  getAreaName(area: number): string {
    return area === 1 ? 'PN' : area === 2 ? 'PS' : 'Desconocida';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}



