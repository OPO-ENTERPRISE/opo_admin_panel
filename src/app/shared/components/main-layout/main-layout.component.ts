import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil, filter } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { IUser } from '../../../core/models/user.model';
import { AreaSelectorComponent } from '../area-selector/area-selector.component';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatExpansionModule,
    AreaSelectorComponent,
  ],
  standalone: true,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: IUser | null = null;
  currentRoute = '';
  sidebarOpen = true;

  navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      label: 'Topics',
      icon: 'topic',
      route: '/topics',
    },
    {
      label: 'Áreas',
      icon: 'category',
      route: '/areas',
    },
    {
      label: 'Publicidad',
      icon: 'campaign',
      route: '/ads',
      children: [
        {
          label: 'Anuncios',
          icon: 'ad_units',
          route: '/ads',
        },
        {
          label: 'Proveedores',
          icon: 'store',
          route: '/ads/providers',
        },
      ],
    },
    {
      label: 'Notificaciones',
      icon: 'notifications',
      route: '/notifications',
    },
    {
      label: 'Políticas de Privacidad',
      icon: 'privacy_tip',
      route: '/privacy-policies',
    },
    {
      label: 'Usuarios',
      icon: 'people',
      route: '/users',
    },
    {
      label: 'Base de Datos',
      icon: 'storage',
      route: '/database',
    },
    {
      label: 'IA WORKS',
      icon: 'psychology',
      route: '/ia-works',
    },
    {
      label: 'Perfil',
      icon: 'person',
      route: '/profile',
    },
    {
      label: 'Test CORS',
      icon: 'bug_report',
      route: '/test-cors',
    },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
    });

    // Suscribirse a cambios de ruta
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }

  getUserArea(): string {
    return this.authService.getDisplayArea();
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return 'A';
    return this.currentUser.name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
