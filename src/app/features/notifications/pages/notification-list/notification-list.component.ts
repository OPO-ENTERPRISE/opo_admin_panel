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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { NotificationService } from '../../services/notification.service';
import { Notification, PaginatedNotificationResponse } from '../../models/notification.model';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
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
    MatSnackBarModule,
  ],
  standalone: true,
})
export class NotificationListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  notifications: Notification[] = [];
  totalNotifications = 0;
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 20;
  pageSizeOptions = [10, 20, 50, 100];

  // Table columns
  displayedColumns: string[] = [
    'title',
    'type',
    'area',
    'status',
    'startDate',
    'endDate',
    'actions',
  ];

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications(): void {
    this.isLoading = true;

    this.notificationService
      .getNotifications(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedNotificationResponse) => {
          this.notifications = response.items || [];
          this.totalNotifications = response.pagination?.total || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.notifications = [];
          this.isLoading = false;
          this.snackBar.open('Error al cargar notificaciones', 'Cerrar', { duration: 3000 });
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadNotifications();
  }

  onCreateNotification(): void {
    this.router.navigate(['/notifications/new']);
  }

  onEditNotification(notification: Notification): void {
    this.router.navigate(['/notifications', notification.id, 'edit']);
  }

  onToggleStatus(notification: Notification): void {
    this.notificationService
      .toggleNotificationStatus(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          notification.enabled = updated.enabled;
          this.snackBar.open(
            `Notificación ${updated.enabled ? 'activada' : 'desactivada'} exitosamente`,
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error toggling notification status:', error);
          this.snackBar.open('Error al cambiar estado de la notificación', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  onDeleteNotification(notification: Notification): void {
    if (!confirm(`¿Estás seguro de eliminar la notificación "${notification.title}"?`)) {
      return;
    }

    this.notificationService
      .deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Notificación eliminada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          this.snackBar.open('Error al eliminar la notificación', 'Cerrar', { duration: 3000 });
        },
      });
  }

  onViewStats(notification: Notification): void {
    this.router.navigate(['/notifications', notification.id]);
  }

  getAreaName(area: number): string {
    return this.notificationService.getAreaName(area);
  }

  getTypeName(type: string): string {
    return this.notificationService.getTypeName(type);
  }

  formatDate(dateString: string): string {
    return this.notificationService.formatDate(dateString);
  }

  isActive(notification: Notification): boolean {
    return this.notificationService.isActive(notification);
  }
}

