// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'patients',
    loadComponent: () =>
      import('./pages/patients/patients.component').then((m) => m.PatientsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'patients/nouveau',
    loadComponent: () =>
      import('./pages/patient-form/patient-form.component').then((m) => m.PatientFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'patients/:id',
    loadComponent: () =>
      import('./pages/patient-detail/patient-detail.component').then((m) => m.PatientDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'patients/:id/modifier',
    loadComponent: () =>
      import('./pages/patient-form/patient-form.component').then((m) => m.PatientFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'rendezvous',
    loadComponent: () =>
      import('./pages/rendezvous/rendezvous.component').then((m) => m.RendezVousComponent),
    canActivate: [authGuard],
  },
  {
    path: 'rendezvous/nouveau',
    loadComponent: () =>
      import('./pages/rendezvous-form/rendezvous-form.component').then((m) => m.RendezVousFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'rendezvous/:id/modifier',
    loadComponent: () =>
      import('./pages/rendezvous-form/rendezvous-form.component').then((m) => m.RendezVousFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'calendrier',
    loadComponent: () =>
      import('./pages/calendar/calendar.component').then((m) => m.CalendarComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
