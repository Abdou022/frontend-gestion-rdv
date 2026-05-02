// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RendezVousService } from '../../services/rendezvous.service';
import { AuthService } from '../../services/auth.service';
import { Stats, RendezVous } from '../../models/index';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bonjour, {{ authService.utilisateurConnecte()?.prenom }} 👋 — {{ dateAujourdhui | date:'EEEE d MMMM yyyy':'':'fr' }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/rendezvous/nouveau" class="btn-primary">
            ➕ Nouveau rendez-vous
          </a>
          <a routerLink="/patients/nouveau" class="btn-secondary">
            👤 Nouveau patient
          </a>
        </div>
      </div>

      <!-- Cartes statistiques -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats?.totalPatients || 0 }}</div>
            <div class="stat-label">Patients actifs</div>
          </div>
        </div>

        <div class="stat-card green">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats?.rdvAujourdhui || 0 }}</div>
            <div class="stat-label">RDV aujourd'hui</div>
          </div>
        </div>

        <div class="stat-card orange">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats?.rdvCeMois || 0 }}</div>
            <div class="stat-label">RDV ce mois</div>
          </div>
        </div>

        <div class="stat-card purple">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ getCompteStatut('terminé') }}</div>
            <div class="stat-label">Consultations terminées</div>
          </div>
        </div>
      </div>

      <!-- RDV du jour -->
      <div class="section-card">
        <div class="section-header">
          <h2>📅 Rendez-vous d'aujourd'hui</h2>
          <a routerLink="/rendezvous" class="voir-plus">Voir tous →</a>
        </div>

        @if (chargement) {
          <div class="loading">Chargement...</div>
        } @else if (rdvAujourdhui.length === 0) {
          <div class="empty-state">
            <span>🎉</span>
            <p>Aucun rendez-vous prévu aujourd'hui</p>
          </div>
        } @else {
          <div class="rdv-list">
            @for (rdv of rdvAujourdhui; track rdv._id) {
              <div class="rdv-item">
                <div class="rdv-time">
                  {{ rdv.dateHeure | date:'HH:mm' }}
                </div>
                <div class="rdv-info">
                  <strong>
                    {{ getPatient(rdv.patient)?.prenom }}
                    {{ getPatient(rdv.patient)?.nom }}
                  </strong>
                  <span>{{ rdv.motif }}</span>
                </div>
                <div class="rdv-statut" [class]="'statut-' + rdv.statut">
                  {{ rdv.statut }}
                </div>
                <div class="rdv-duree">⏱ {{ rdv.duree }} min</div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Accès rapide -->
      <div class="quick-actions">
        <h2>Accès rapide</h2>
        <div class="actions-grid">
          <a routerLink="/patients" class="action-card">
            <span class="action-icon">👥</span>
            <span>Liste des patients</span>
          </a>
          <a routerLink="/rendezvous" class="action-card">
            <span class="action-icon">📋</span>
            <span>Tous les RDV</span>
          </a>
          <a routerLink="/calendrier" class="action-card">
            <span class="action-icon">🗓️</span>
            <span>Calendrier</span>
          </a>
          <a routerLink="/patients/nouveau" class="action-card">
            <span class="action-icon">➕</span>
            <span>Ajouter patient</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }

    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 2rem;

      h1 { font-size: 1.8rem; color: #1e3a5f; margin: 0 0 0.3rem; }
      p { color: #6c757d; margin: 0; }

      .header-actions { display: flex; gap: 1rem; }
    }

    .btn-primary {
      padding: 0.6rem 1.2rem; background: #2d6a9f; color: white;
      border-radius: 8px; text-decoration: none; font-weight: 600;
      transition: background 0.2s;
      &:hover { background: #1e3a5f; }
    }

    .btn-secondary {
      padding: 0.6rem 1.2rem; background: white; color: #2d6a9f;
      border: 1px solid #2d6a9f; border-radius: 8px; text-decoration: none;
      font-weight: 600; transition: all 0.2s;
      &:hover { background: #f0f4f8; }
    }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem; margin-bottom: 2rem;
    }

    .stat-card {
      display: flex; align-items: center; gap: 1.2rem;
      padding: 1.5rem; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);

      &.blue { background: linear-gradient(135deg, #e3f2fd, #bbdefb); }
      &.green { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
      &.orange { background: linear-gradient(135deg, #fff3e0, #ffe0b2); }
      &.purple { background: linear-gradient(135deg, #f3e5f5, #e1bee7); }

      .stat-icon { font-size: 2.5rem; }
      .stat-number { font-size: 2rem; font-weight: 700; color: #1e3a5f; line-height: 1; }
      .stat-label { color: #6c757d; font-size: 0.85rem; margin-top: 0.3rem; }
    }

    .section-card {
      background: white; border-radius: 16px; padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 2rem;
    }

    .section-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.2rem;

      h2 { margin: 0; font-size: 1.1rem; color: #1e3a5f; }
      .voir-plus { color: #2d6a9f; text-decoration: none; font-size: 0.9rem; }
    }

    .rdv-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.9rem 0; border-bottom: 1px solid #f0f0f0;

      &:last-child { border-bottom: none; }

      .rdv-time { font-weight: 700; color: #2d6a9f; min-width: 50px; font-size: 1.1rem; }
      .rdv-info { flex: 1; strong { display: block; } span { color: #6c757d; font-size: 0.85rem; } }
      .rdv-duree { color: #6c757d; font-size: 0.85rem; }
    }

    .rdv-statut {
      padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
      &.statut-planifié { background: #e3f2fd; color: #1565c0; }
      &.statut-confirmé { background: #e8f5e9; color: #2e7d32; }
      &.statut-en_cours { background: #fff3e0; color: #e65100; }
      &.statut-terminé { background: #f3e5f5; color: #6a1b9a; }
      &.statut-annulé { background: #ffebee; color: #c62828; }
    }

    .empty-state {
      text-align: center; padding: 2rem; color: #6c757d;
      span { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    }

    .quick-actions {
      h2 { font-size: 1.1rem; color: #1e3a5f; margin-bottom: 1rem; }
    }

    .actions-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      padding: 1.5rem; background: white; border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-decoration: none;
      color: #374151; transition: all 0.2s;

      .action-icon { font-size: 2rem; }
      span:last-child { font-size: 0.85rem; font-weight: 500; }

      &:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    }

    .loading { text-align: center; padding: 2rem; color: #6c757d; }
  `],
})
export class DashboardComponent implements OnInit {
  stats: Stats | null = null;
  rdvAujourdhui: RendezVous[] = [];
  chargement = true;
  dateAujourdhui = new Date();

  constructor(
    private rendezVousService: RendezVousService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerStats();
    this.chargerRdvAujourdhui();
  }

  chargerStats(): void {
    this.rendezVousService.getStats().subscribe({
      next: (res) => (this.stats = res.data),
      error: (err) => console.error('Erreur stats:', err),
    });
  }

  chargerRdvAujourdhui(): void {
    const aujourd_hui = new Date().toISOString().split('T')[0];
    this.rendezVousService
      .getRendezVous({ dateDebut: aujourd_hui, dateFin: aujourd_hui })
      .subscribe({
        next: (res) => {
          this.rdvAujourdhui = res.data;
          this.chargement = false;
        },
        error: () => (this.chargement = false),
      });
  }

  getPatient(patient: any): Patient | null {
    return typeof patient === 'object' ? patient : null;
  }

  getCompteStatut(statut: string): number {
    const trouve = this.stats?.rdvParStatut?.find((s) => s._id === statut);
    return trouve?.count || 0;
  }
}
