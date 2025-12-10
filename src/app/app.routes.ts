import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'topics',
        loadComponent: () =>
          import('./features/topics/pages/topic-list/topic-list.component').then(
            (m) => m.TopicListComponent
          ),
      },
      {
        path: 'topics/new',
        loadComponent: () =>
          import('./features/topics/pages/topic-edit/topic-edit.component').then(
            (m) => m.TopicEditComponent
          ),
      },
      {
        path: 'topics/:id/edit',
        loadComponent: () =>
          import('./features/topics/pages/topic-edit/topic-edit.component').then(
            (m) => m.TopicEditComponent
          ),
      },
      {
        path: 'topics/:id',
        loadComponent: () =>
          import('./features/topics/pages/topic-detail/topic-detail.component').then(
            (m) => m.TopicDetailComponent
          ),
      },
      {
        path: 'areas',
        loadComponent: () =>
          import('./features/areas/pages/area-list/area-list.component').then(
            (m) => m.AreaListComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/user/pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'test-cors',
        loadComponent: () =>
          import('./features/test/pages/test-cors/test-cors.component').then(
            (m) => m.TestCorsComponent
          ),
      },
      {
        path: 'ads',
        loadComponent: () =>
          import('./features/ads/pages/ads-list/ads-list.component').then(
            (m) => m.AdsListComponent
          ),
      },
      {
        path: 'ads/new',
        loadComponent: () =>
          import('./features/ads/pages/ads-form/ads-form.component').then(
            (m) => m.AdsFormComponent
          ),
      },
      {
        path: 'ads/:id/edit',
        loadComponent: () =>
          import('./features/ads/pages/ads-form/ads-form.component').then(
            (m) => m.AdsFormComponent
          ),
      },
      {
        path: 'ads/providers',
        loadComponent: () =>
          import('./features/ads/pages/provider-list/provider-list.component').then(
            (m) => m.ProviderListComponent
          ),
      },
      {
        path: 'ads/providers/new',
        loadComponent: () =>
          import('./features/ads/pages/provider-form/provider-form.component').then(
            (m) => m.ProviderFormComponent
          ),
      },
      {
        path: 'ads/providers/:id/edit',
        loadComponent: () =>
          import('./features/ads/pages/provider-form/provider-form.component').then(
            (m) => m.ProviderFormComponent
          ),
      },
      {
        path: 'database',
        loadComponent: () =>
          import('./features/database/pages/database-info/database-info.component').then(
            (m) => m.DatabaseInfoComponent
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/pages/notification-list/notification-list.component').then(
            (m) => m.NotificationListComponent
          ),
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./features/support/pages/support-list/support-list.component').then(
            (m) => m.SupportListComponent
          ),
      },
      {
        path: 'support/:id',
        loadComponent: () =>
          import('./features/support/pages/support-detail/support-detail.component').then(
            (m) => m.SupportDetailComponent
          ),
      },
      {
        path: 'notifications/new',
        loadComponent: () =>
          import('./features/notifications/pages/notification-form/notification-form.component').then(
            (m) => m.NotificationFormComponent
          ),
      },
      {
        path: 'notifications/:id/edit',
        loadComponent: () =>
          import('./features/notifications/pages/notification-form/notification-form.component').then(
            (m) => m.NotificationFormComponent
          ),
      },
      {
        path: 'ia-works',
        loadComponent: () =>
          import('./features/ia-works/ia-works.component').then((m) => m.IaWorksComponent),
      },
      {
        path: 'privacy-policies',
        loadComponent: () =>
          import('./features/privacy-policy/pages/privacy-policy-list/privacy-policy-list.component').then(
            (m) => m.PrivacyPolicyListComponent
          ),
      },
      {
        path: 'privacy-policies/new',
        loadComponent: () =>
          import('./features/privacy-policy/pages/privacy-policy-form/privacy-policy-form.component').then(
            (m) => m.PrivacyPolicyFormComponent
          ),
      },
      {
        path: 'privacy-policies/edit/:areaId',
        loadComponent: () =>
          import('./features/privacy-policy/pages/privacy-policy-form/privacy-policy-form.component').then(
            (m) => m.PrivacyPolicyFormComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
