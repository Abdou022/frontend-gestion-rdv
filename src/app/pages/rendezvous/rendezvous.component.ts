// src/app/pages/rendezvous/rendezvous.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../services/rendezvous.service';
import { RendezVous, Patient } from '../../models/index';

@Component({
  selector: 'app-rendezvous',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>📅 Rendez-vous</h1>
          <p>{{ total }} rendez-vous trouvé(s)</p>
        </div>
        <a routerLink="/rendezvous/nouveau" class="btn-primary">➕ Nouveau rendez-vous</a>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <div class="filter-group">
          <label>Du</label>
          <input type="date" [(ngModel)]="filtreDebut" (change)="appliquerFiltres()" />
        </div>
        <div class="filter-group">
          <label>Au</label>
          <input type="date" [(ngModel)]="filtreFin" (change)="appliquerFiltres()" />
        </div>
        <div class="filter-group">
          <label>Statut</label>
          <select [(ngModel)]="filtreStatut" (change)="appliquerFiltres()">
            <option value="">Tous les statuts</option>
            <option value="planifié">Planifié</option>
            <option value="confirmé">Confirmé</option>
            <option value="en_cours">En cours</option>
            <option value="terminé">Terminé</option>
            <option value="annulé">Annulé</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <button class="btn-reset" (click)="reinitialiserFiltres()">🔄 Réinitialiser</button>
      </div>

      @if (chargement) {
        <div class="loading-state"><div class="spinner-large"></div><p>Chargement...</p></div>
      } @else if (rendezVous.length === 0) {
        <div class="empty-state">
          <span>📅</span>
          <h3>Aucun rendez-vous trouvé</h3>
          <p>Modifiez les filtres ou créez un nouveau rendez-vous</p>
        </div>
      } @else {
        <!-- Groupement par date -->
        @for (groupe of groupesParDate; track groupe.date) {
          <div class="date-group">
            <div class="date-header">
              <span class="date-badge">{{ groupe.date }}</span>
              <span class="date-count">{{ groupe.rdv.length }} RDV</span>
            </div>

            <div class="rdv-list">
              @for (rdv of groupe.rdv; track rdv._id) {
                <div class="rdv-card" [class]="'statut-card-' + rdv.statut">
                  <div class="rdv-time-block">
                    <div class="rdv-heure">{{ rdv.dateHeure | date:'HH:mm' }}</div>
                    <div class="rdv-duree">{{ rdv.duree }}min</div>
                  </div>

                  <div class="rdv-patient-info">
                    @if (getPatient(rdv.patient)?.photo) {
                      <div class="mini-avatar has-photo">
                        <img [src]="getPatient(rdv.patient)?.photo" alt="" />
                      </div>
                    } @else {
                      <div class="mini-avatar">
                        {{ getPatient(rdv.patient)?.prenom?.[0] }}{{ getPatient(rdv.patient)?.nom?.[0] }}
                      </div>
                    }
                    <div>
                      <strong>{{ getPatient(rdv.patient)?.prenom }} {{ getPatient(rdv.patient)?.nom }}</strong>
                      <div class="rdv-motif-text">{{ rdv.motif }}</div>
                      @if (rdv.medecin) { <div class="rdv-medecin-text">👨‍⚕️ {{ rdv.medecin }}</div> }
                    </div>
                  </div>

                  <div class="rdv-right">
                    <div class="statut-badge statut-{{ rdv.statut }}">{{ rdv.statut }}</div>

                    <!-- Changement rapide de statut -->
                    <select
                      [value]="rdv.statut"
                      (change)="changerStatut(rdv, $event)"
                      class="statut-select"
                    >
                      <option value="planifié">Planifié</option>
                      <option value="confirmé">Confirmé</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminé">Terminé</option>
                      <option value="annulé">Annulé</option>
                      <option value="absent">Absent</option>
                    </select>

                    <div class="rdv-actions">
                      <a [routerLink]="['/patients', getPatientId(rdv.patient)]" class="btn-icon-sm" title="Voir patient">👤</a>
                      <a [routerLink]="['/rendezvous', rdv._id, 'modifier']" class="btn-icon-sm" title="Modifier">✏️</a>
                      <button class="btn-icon-sm btn-del" (click)="supprimerRdv(rdv)" title="Supprimer">🗑️</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;
      h1 { font-size: 1.8rem; color: #1e3a5f; margin: 0 0 0.3rem; }
      p { color: #6c757d; margin: 0; }
    }
    .btn-primary { padding: 0.7rem 1.4rem; background: #2d6a9f; color: white; border-radius: 10px; text-decoration: none; font-weight: 600; white-space: nowrap; }

    .filters-bar {
      display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;
      background: white; padding: 1.2rem 1.5rem; border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07); margin-bottom: 1.5rem;

      .filter-group {
        display: flex; flex-direction: column; gap: 0.3rem;
        label { font-size: 0.8rem; font-weight: 600; color: #6c757d; }
        input, select { padding: 0.55rem 0.8rem; border: 1.5px solid #dee2e6; border-radius: 8px; font-size: 0.9rem; background: white;
          &:focus { outline: none; border-color: #2d6a9f; }
        }
      }
      .btn-reset { padding: 0.55rem 1rem; background: #f0f4f8; border: 1px solid #dee2e6; border-radius: 8px; cursor: pointer; font-size: 0.9rem; align-self: flex-end; }
    }

    .date-group { margin-bottom: 1.5rem; }
    .date-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.8rem;
      .date-badge { background: #1e3a5f; color: white; padding: 0.3rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
      .date-count { color: #6c757d; font-size: 0.85rem; }
    }

    .rdv-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .rdv-card {
      display: flex; align-items: center; gap: 1rem;
      background: white; border-radius: 12px; padding: 1rem 1.2rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07); border-left: 5px solid #dee2e6;
      transition: all 0.2s;

      &:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.1); }
      &.statut-card-planifié { border-left-color: #2196f3; }
      &.statut-card-confirmé { border-left-color: #4caf50; }
      &.statut-card-en_cours { border-left-color: #ff9800; }
      &.statut-card-terminé { border-left-color: #9c27b0; }
      &.statut-card-annulé { border-left-color: #f44336; }
      &.statut-card-absent { border-left-color: #795548; }
    }

    .rdv-time-block { min-width: 60px; text-align: center;
      .rdv-heure { font-size: 1.2rem; font-weight: 700; color: #1e3a5f; }
      .rdv-duree { font-size: 0.75rem; color: #6c757d; }
    }

    .rdv-patient-info { display: flex; align-items: center; gap: 0.8rem; flex: 1;
      strong { display: block; color: #374151; }
      .rdv-motif-text { font-size: 0.85rem; color: #6c757d; }
      .rdv-medecin-text { font-size: 0.8rem; color: #9e9e9e; }
    }

    .mini-avatar {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #2d6a9f, #1a9f7a);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700;
      img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
    }

    .rdv-right { display: flex; align-items: center; gap: 0.8rem; }

    .statut-badge { padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;
      &.statut-planifié { background: #e3f2fd; color: #1565c0; }
      &.statut-confirmé { background: #e8f5e9; color: #2e7d32; }
      &.statut-en_cours { background: #fff3e0; color: #e65100; }
      &.statut-terminé { background: #f3e5f5; color: #6a1b9a; }
      &.statut-annulé { background: #ffebee; color: #c62828; }
      &.statut-absent { background: #efebe9; color: #4e342e; }
    }

    .statut-select { padding: 0.35rem 0.6rem; border: 1px solid #dee2e6; border-radius: 6px; font-size: 0.8rem; background: white; cursor: pointer; }

    .rdv-actions { display: flex; gap: 0.3rem; }
    .btn-icon-sm { width: 32px; height: 32px; border-radius: 6px; border: none; background: #f0f4f8; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: background 0.2s;
      &:hover { background: #dee2e6; }
      &.btn-del:hover { background: #ffcdd2; }
    }

    .loading-state, .empty-state { text-align: center; padding: 4rem; color: #6c757d;
      span { font-size: 3rem; display: block; margin-bottom: 1rem; }
    }
    .spinner-large { width: 40px; height: 40px; margin: 0 auto 1rem; border: 3px solid #e5e7eb; border-top-color: #2d6a9f; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class RendezVousComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  total = 0;
  chargement = true;

  filtreDebut = '';
  filtreFin = '';
  filtreStatut = '';

  get groupesParDate(): { date: string; rdv: RendezVous[] }[] {
    const map = new Map<string, RendezVous[]>();
    this.rendezVous.forEach((rdv) => {
      const date = new Date(rdv.dateHeure).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(rdv);
    });
    return Array.from(map.entries()).map(([date, rdv]) => ({ date, rdv }));
  }

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    // Initialiser avec la semaine courante
    const aujourd_hui = new Date();
    this.filtreDebut = aujourd_hui.toISOString().split('T')[0];
    const dans7jours = new Date(aujourd_hui);
    dans7jours.setDate(dans7jours.getDate() + 30);
    this.filtreFin = dans7jours.toISOString().split('T')[0];
    this.chargerRdv();
  }

  chargerRdv(): void {
    this.chargement = true;
    this.rendezVousService
      .getRendezVous({
        dateDebut: this.filtreDebut,
        dateFin: this.filtreFin,
        statut: this.filtreStatut,
        limit: 100,
      })
      .subscribe({
        next: (res) => {
          this.rendezVous = res.data;
          this.total = res.total || 0;
          this.chargement = false;
        },
        error: () => (this.chargement = false),
      });
  }

  appliquerFiltres(): void {
    this.chargerRdv();
  }

  reinitialiserFiltres(): void {
    this.filtreDebut = '';
    this.filtreFin = '';
    this.filtreStatut = '';
    this.chargerRdv();
  }

  changerStatut(rdv: RendezVous, event: Event): void {
    const statut = (event.target as HTMLSelectElement).value;
    this.rendezVousService.changerStatut(rdv._id!, statut).subscribe({
      next: (res) => (rdv.statut = res.data.statut),
      error: () => alert('Erreur lors de la mise à jour du statut'),
    });
  }

  supprimerRdv(rdv: RendezVous): void {
    const patient = this.getPatient(rdv.patient);
    if (!confirm(`Supprimer le rendez-vous de ${patient?.prenom} ${patient?.nom} ?`)) return;

    this.rendezVousService.supprimerRendezVous(rdv._id!).subscribe({
      next: () => this.chargerRdv(),
      error: () => alert('Erreur lors de la suppression'),
    });
  }

  getPatient(patient: any): Patient | null {
    return typeof patient === 'object' ? patient : null;
  }

  getPatientId(patient: any): string {
    return typeof patient === 'object' ? patient._id : patient;
  }
}
