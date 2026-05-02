// src/app/pages/calendar/calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../services/rendezvous.service';
import { RendezVous, Patient } from '../../models/index';

interface JourCalendrier {
  date: Date;
  estMoisCourant: boolean;
  estAujourdhui: boolean;
  rdv: RendezVous[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>🗓️ Calendrier</h1>
          <p>Vue mensuelle des rendez-vous</p>
        </div>
        <a routerLink="/rendezvous/nouveau" class="btn-primary">➕ Nouveau rendez-vous</a>
      </div>

      <!-- Navigation mois -->
      <div class="calendar-nav">
        <button class="nav-btn" (click)="moisPrecedent()">◀</button>
        <h2 class="mois-titre">{{ titreCalendrier }}</h2>
        <button class="nav-btn" (click)="moisSuivant()">▶</button>
        <button class="btn-aujourd-hui" (click)="allerAujourdhui()">Aujourd'hui</button>
      </div>

      <!-- Grille calendrier -->
      <div class="calendar-card">
        <!-- En-têtes jours -->
        <div class="calendar-grid">
          @for (jour of joursEnTete; track jour) {
            <div class="day-header">{{ jour }}</div>
          }

          <!-- Jours du mois -->
          @for (jour of jours; track jour.date.getTime()) {
            <div
              class="day-cell"
              [class.autre-mois]="!jour.estMoisCourant"
              [class.aujourd-hui]="jour.estAujourdhui"
              [class.a-des-rdv]="jour.rdv.length > 0"
              (click)="selectionnerJour(jour)"
              [class.selectionne]="estJourSelectionne(jour)"
            >
              <div class="day-number">{{ jour.date.getDate() }}</div>

              @if (jour.rdv.length > 0) {
                <div class="rdv-indicateurs">
                  @for (rdv of jour.rdv.slice(0, 3); track rdv._id) {
                    <div class="rdv-pill" [class]="'pill-' + rdv.statut" [title]="getRdvTitre(rdv)">
                      {{ rdv.dateHeure | date:'HH:mm' }} · {{ getPatientNom(rdv.patient) }}
                    </div>
                  }
                  @if (jour.rdv.length > 3) {
                    <div class="rdv-plus">+{{ jour.rdv.length - 3 }} autres</div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Détail du jour sélectionné -->
      @if (jourSelectionne) {
        <div class="day-detail">
          <div class="detail-header">
            <h3>📅 {{ jourSelectionne.date | date:'EEEE d MMMM yyyy':'':'fr' }}</h3>
            <a
              routerLink="/rendezvous/nouveau"
              class="btn-add-rdv"
            >
              ➕ Ajouter un RDV
            </a>
          </div>

          @if (jourSelectionne.rdv.length === 0) {
            <div class="empty-day">Aucun rendez-vous ce jour</div>
          } @else {
            <div class="detail-rdv-list">
              @for (rdv of jourSelectionne.rdv; track rdv._id) {
                <div class="detail-rdv-item" [class]="'border-' + rdv.statut">
                  <div class="detail-time">
                    <strong>{{ rdv.dateHeure | date:'HH:mm' }}</strong>
                    <span>{{ rdv.duree }}min</span>
                  </div>
                  <div class="detail-info">
                    <strong>{{ getPatientNomComplet(rdv.patient) }}</strong>
                    <span>{{ rdv.motif }}</span>
                    @if (rdv.medecin) { <span class="medecin">👨‍⚕️ {{ rdv.medecin }}</span> }
                  </div>
                  <div class="statut-badge statut-{{ rdv.statut }}">{{ rdv.statut }}</div>
                  <div class="detail-actions">
                    <a [routerLink]="['/rendezvous', rdv._id, 'modifier']" class="btn-sm">✏️</a>
                    <a [routerLink]="['/patients', getPatientId(rdv.patient)]" class="btn-sm">👤</a>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Légende -->
      <div class="legende">
        <span class="legende-item"><span class="dot pill-planifié"></span> Planifié</span>
        <span class="legende-item"><span class="dot pill-confirmé"></span> Confirmé</span>
        <span class="legende-item"><span class="dot pill-en_cours"></span> En cours</span>
        <span class="legende-item"><span class="dot pill-terminé"></span> Terminé</span>
        <span class="legende-item"><span class="dot pill-annulé"></span> Annulé</span>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;
      h1 { font-size: 1.8rem; color: #1e3a5f; margin: 0 0 0.3rem; }
      p { color: #6c757d; margin: 0; }
    }
    .btn-primary { padding: 0.7rem 1.4rem; background: #2d6a9f; color: white; border-radius: 10px; text-decoration: none; font-weight: 600; white-space: nowrap; }

    .calendar-nav {
      display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;
      .nav-btn { width: 36px; height: 36px; border: 1.5px solid #dee2e6; border-radius: 8px; background: white; cursor: pointer; font-size: 1rem; transition: all 0.2s; &:hover { background: #e3f2fd; } }
      .mois-titre { flex: 1; text-align: center; font-size: 1.3rem; color: #1e3a5f; margin: 0; text-transform: capitalize; }
      .btn-aujourd-hui { padding: 0.4rem 1rem; background: #1e3a5f; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }
    }

    .calendar-card { background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 1.5rem; }

    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }

    .day-header { padding: 0.8rem; text-align: center; font-weight: 700; font-size: 0.8rem; color: #6c757d; background: #f8f9fa; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.5px; }

    .day-cell {
      min-height: 110px; padding: 0.5rem; border-right: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;
      cursor: pointer; transition: background 0.15s;

      &:hover { background: #f8f9fa; }
      &.autre-mois { background: #fafafa; .day-number { color: #ccc; } }
      &.aujourd-hui { background: #e3f2fd; .day-number { background: #2d6a9f; color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; } }
      &.a-des-rdv { background: #fffde7; &:hover { background: #fff9c4; } }
      &.selectionne { background: #e8f5e9; border: 2px solid #4caf50; }
    }

    .day-number { font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.3rem; }

    .rdv-indicateurs { display: flex; flex-direction: column; gap: 2px; }
    .rdv-pill {
      font-size: 0.68rem; padding: 2px 5px; border-radius: 4px; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis; font-weight: 500;
      &.pill-planifié { background: #bbdefb; color: #0d47a1; }
      &.pill-confirmé { background: #c8e6c9; color: #1b5e20; }
      &.pill-en_cours { background: #ffe0b2; color: #e65100; }
      &.pill-terminé { background: #e1bee7; color: #4a148c; }
      &.pill-annulé { background: #ffcdd2; color: #b71c1c; }
      &.pill-absent { background: #d7ccc8; color: #3e2723; }
    }
    .rdv-plus { font-size: 0.68rem; color: #6c757d; padding: 1px 4px; }

    .day-detail {
      background: white; border-radius: 14px; padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 1.5rem;

      .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;
        h3 { margin: 0; font-size: 1rem; color: #1e3a5f; text-transform: capitalize; }
        .btn-add-rdv { padding: 0.5rem 1rem; background: #e8f5e9; color: #2e7d32; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 500; }
      }
    }

    .detail-rdv-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .detail-rdv-item {
      display: flex; align-items: center; gap: 1rem; padding: 0.9rem;
      background: #fafafa; border-radius: 10px; border-left: 4px solid #dee2e6;

      &.border-planifié { border-left-color: #2196f3; }
      &.border-confirmé { border-left-color: #4caf50; }
      &.border-en_cours { border-left-color: #ff9800; }
      &.border-terminé { border-left-color: #9c27b0; }
      &.border-annulé { border-left-color: #f44336; }

      .detail-time { min-width: 55px; text-align: center; strong { display: block; color: #1e3a5f; } span { font-size: 0.75rem; color: #6c757d; } }
      .detail-info { flex: 1; strong { display: block; } span { font-size: 0.85rem; color: #6c757d; display: block; } .medecin { font-size: 0.8rem; } }
      .detail-actions { display: flex; gap: 0.4rem; }
      .btn-sm { width: 30px; height: 30px; background: #f0f4f8; border-radius: 6px; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 0.85rem; transition: background 0.2s; &:hover { background: #dee2e6; } }
    }

    .statut-badge { padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;
      &.statut-planifié { background: #e3f2fd; color: #1565c0; }
      &.statut-confirmé { background: #e8f5e9; color: #2e7d32; }
      &.statut-en_cours { background: #fff3e0; color: #e65100; }
      &.statut-terminé { background: #f3e5f5; color: #6a1b9a; }
      &.statut-annulé { background: #ffebee; color: #c62828; }
    }

    .empty-day { text-align: center; color: #6c757d; padding: 1.5rem; }

    .legende { display: flex; gap: 1.5rem; flex-wrap: wrap;
      .legende-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #6c757d; }
      .dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block;
        &.pill-planifié { background: #bbdefb; }
        &.pill-confirmé { background: #c8e6c9; }
        &.pill-en_cours { background: #ffe0b2; }
        &.pill-terminé { background: #e1bee7; }
        &.pill-annulé { background: #ffcdd2; }
      }
    }
  `],
})
export class CalendarComponent implements OnInit {
  joursEnTete = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  jours: JourCalendrier[] = [];
  rendezVous: RendezVous[] = [];
  jourSelectionne: JourCalendrier | null = null;

  moisCourant = new Date().getMonth();
  anneeCourante = new Date().getFullYear();

  get titreCalendrier(): string {
    return new Date(this.anneeCourante, this.moisCourant, 1)
      .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    this.chargerMois();
  }

  chargerMois(): void {
    const debut = new Date(this.anneeCourante, this.moisCourant, 1);
    const fin = new Date(this.anneeCourante, this.moisCourant + 1, 0);

    this.rendezVousService.getRendezVous({
      dateDebut: debut.toISOString().split('T')[0],
      dateFin: fin.toISOString().split('T')[0],
      limit: 200,
    }).subscribe({
      next: (res) => {
        this.rendezVous = res.data;
        this.genererGrille();
      },
    });
  }

  genererGrille(): void {
    const premier = new Date(this.anneeCourante, this.moisCourant, 1);
    const dernier = new Date(this.anneeCourante, this.moisCourant + 1, 0);
    const aujourd_hui = new Date();

    // Début de la grille : lundi de la semaine du 1er du mois
    let debutGrille = new Date(premier);
    const jourSemaine = premier.getDay() === 0 ? 7 : premier.getDay();
    debutGrille.setDate(premier.getDate() - jourSemaine + 1);

    this.jours = [];
    const curseur = new Date(debutGrille);

    // 6 semaines max
    for (let i = 0; i < 42; i++) {
      const date = new Date(curseur);
      const rdvDuJour = this.rendezVous.filter((rdv) => {
        const d = new Date(rdv.dateHeure);
        return d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear();
      });

      this.jours.push({
        date,
        estMoisCourant: date.getMonth() === this.moisCourant,
        estAujourdhui: date.toDateString() === aujourd_hui.toDateString(),
        rdv: rdvDuJour,
      });

      curseur.setDate(curseur.getDate() + 1);
    }
  }

  selectionnerJour(jour: JourCalendrier): void {
    this.jourSelectionne = this.estJourSelectionne(jour) ? null : jour;
  }

  estJourSelectionne(jour: JourCalendrier): boolean {
    return this.jourSelectionne?.date.toDateString() === jour.date.toDateString();
  }

  moisPrecedent(): void {
    if (this.moisCourant === 0) { this.moisCourant = 11; this.anneeCourante--; }
    else this.moisCourant--;
    this.jourSelectionne = null;
    this.chargerMois();
  }

  moisSuivant(): void {
    if (this.moisCourant === 11) { this.moisCourant = 0; this.anneeCourante++; }
    else this.moisCourant++;
    this.jourSelectionne = null;
    this.chargerMois();
  }

  allerAujourdhui(): void {
    this.moisCourant = new Date().getMonth();
    this.anneeCourante = new Date().getFullYear();
    this.jourSelectionne = null;
    this.chargerMois();
  }

  getRdvTitre(rdv: RendezVous): string {
    const patient = this.getPatientNomComplet(rdv.patient);
    return `${new Date(rdv.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${patient} : ${rdv.motif}`;
  }

  getPatientNom(patient: any): string {
    if (typeof patient === 'object' && patient) {
      return `${patient.prenom} ${patient.nom}`;
    }
    return '';
  }

  getPatientNomComplet(patient: any): string {
    return this.getPatientNom(patient);
  }

  getPatientId(patient: any): string {
    return typeof patient === 'object' ? patient._id : patient;
  }
}
