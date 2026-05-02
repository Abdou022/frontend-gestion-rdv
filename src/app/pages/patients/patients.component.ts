// src/app/pages/patients/patients.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/index';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>👥 Patients</h1>
          <p>{{ total }} patient(s) enregistré(s)</p>
        </div>
        <a routerLink="/patients/nouveau" class="btn-primary">➕ Nouveau patient</a>
      </div>

      <!-- Barre de recherche -->
      <div class="search-bar">
        <input
          type="text"
          [(ngModel)]="recherche"
          (ngModelChange)="onRechercheChange()"
          placeholder="🔍 Rechercher par nom, prénom, email ou téléphone..."
          class="search-input"
        />
        @if (recherche) {
          <button class="btn-clear" (click)="effacerRecherche()">✕</button>
        }
      </div>

      <!-- Table patients -->
      @if (chargement) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Chargement des patients...</p>
        </div>
      } @else if (patients.length === 0) {
        <div class="empty-state">
          <span>🔍</span>
          <h3>Aucun patient trouvé</h3>
          <p>{{ recherche ? 'Essayez une autre recherche' : 'Commencez par ajouter un patient' }}</p>
          @if (!recherche) {
            <a routerLink="/patients/nouveau" class="btn-primary">Ajouter un patient</a>
          }
        </div>
      } @else {
        <div class="patients-grid">
          @for (patient of patients; track patient._id) {
            <div class="patient-card">
              <div class="patient-avatar">
                @if (patient.photo) {
                  <img [src]="getPhotoUrl(patient.photo)" [alt]="patient.nom" />
                } @else {
                  <div class="avatar-placeholder">
                    {{ patient.prenom[0] }}{{ patient.nom[0] }}
                  </div>
                }
              </div>

              <div class="patient-info">
                <h3>{{ patient.prenom }} {{ patient.nom }}</h3>
                <p class="patient-meta">
                  <span>📅 {{ patient.dateNaissance | date:'dd/MM/yyyy' }}</span>
                  <span class="badge-sexe" [class]="'sexe-' + patient.sexe">{{ patient.sexe }}</span>
                </p>
                <p class="patient-contact">📞 {{ patient.telephone }}</p>
                @if (patient.email) {
                  <p class="patient-contact">✉️ {{ patient.email }}</p>
                }
                @if (patient.groupeSanguin) {
                  <span class="badge-groupe">{{ patient.groupeSanguin }}</span>
                }
              </div>

              <div class="patient-actions">
                <a [routerLink]="['/patients', patient._id]" class="btn-icon btn-view" title="Voir détails">
                  👁️
                </a>
                <a [routerLink]="['/patients', patient._id, 'modifier']" class="btn-icon btn-edit" title="Modifier">
                  ✏️
                </a>
                <a [routerLink]="['/rendezvous/nouveau']" [queryParams]="{patient: patient._id}" class="btn-icon btn-rdv" title="Prendre RDV">
                  📅
                </a>
                <button class="btn-icon btn-delete" (click)="supprimerPatient(patient)" title="Supprimer">
                  🗑️
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (pages > 1) {
          <div class="pagination">
            <button (click)="changerPage(page - 1)" [disabled]="page === 1" class="page-btn">◀</button>
            @for (p of getPagesArray(); track p) {
              <button
                (click)="changerPage(p)"
                [class.active]="p === page"
                class="page-btn"
              >{{ p }}</button>
            }
            <button (click)="changerPage(page + 1)" [disabled]="page === pages" class="page-btn">▶</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem;
      h1 { font-size: 1.8rem; color: #1e3a5f; margin: 0 0 0.3rem; }
      p { color: #6c757d; margin: 0; }
    }

    .btn-primary {
      padding: 0.7rem 1.4rem; background: #2d6a9f; color: white;
      border-radius: 10px; text-decoration: none; font-weight: 600;
      transition: background 0.2s; white-space: nowrap;
      &:hover { background: #1e3a5f; }
    }

    .search-bar {
      position: relative; margin-bottom: 1.5rem;
      .search-input {
        width: 100%; padding: 0.85rem 3rem 0.85rem 1.2rem;
        border: 2px solid #e5e7eb; border-radius: 12px; font-size: 1rem;
        box-sizing: border-box; transition: border-color 0.2s;
        &:focus { outline: none; border-color: #2d6a9f; }
      }
      .btn-clear {
        position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; color: #6c757d;
        font-size: 1rem; padding: 0.2rem;
      }
    }

    .patients-grid {
      display: grid; gap: 1rem;
    }

    .patient-card {
      display: flex; align-items: center; gap: 1.2rem;
      background: white; border-radius: 14px; padding: 1.2rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07); transition: all 0.2s;
      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateX(2px); }
    }

    .patient-avatar {
      flex-shrink: 0;
      img, .avatar-placeholder {
        width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
      }
      .avatar-placeholder {
        background: linear-gradient(135deg, #2d6a9f, #1a9f7a);
        color: white; display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem; font-weight: 700;
      }
    }

    .patient-info {
      flex: 1;
      h3 { margin: 0 0 0.3rem; font-size: 1rem; color: #1e3a5f; }
      .patient-meta { margin: 0 0 0.2rem; display: flex; gap: 0.7rem; align-items: center; font-size: 0.85rem; color: #6c757d; }
      .patient-contact { margin: 0 0 0.2rem; font-size: 0.85rem; color: #6c757d; }
    }

    .badge-sexe {
      font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; font-weight: 600;
      &.sexe-Homme { background: #e3f2fd; color: #1565c0; }
      &.sexe-Femme { background: #fce4ec; color: #880e4f; }
      &.sexe-Autre { background: #f3e5f5; color: #4a148c; }
    }

    .badge-groupe {
      display: inline-block; background: #fff3e0; color: #e65100;
      font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 20px;
    }

    .patient-actions {
      display: flex; gap: 0.4rem;
    }

    .btn-icon {
      width: 36px; height: 36px; border: none; border-radius: 8px;
      cursor: pointer; font-size: 1rem; display: flex; align-items: center;
      justify-content: center; text-decoration: none; transition: all 0.2s;
      &.btn-view { background: #e3f2fd; &:hover { background: #bbdefb; } }
      &.btn-edit { background: #fff3e0; &:hover { background: #ffe0b2; } }
      &.btn-rdv { background: #e8f5e9; &:hover { background: #c8e6c9; } }
      &.btn-delete { background: #ffebee; &:hover { background: #ffcdd2; } }
    }

    .loading-state, .empty-state {
      text-align: center; padding: 4rem; color: #6c757d;
      span { font-size: 3rem; display: block; margin-bottom: 1rem; }
      h3 { color: #374151; }
    }

    .spinner-large {
      width: 40px; height: 40px; margin: 0 auto 1rem;
      border: 3px solid #e5e7eb; border-top-color: #2d6a9f;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .pagination {
      display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.5rem;
      .page-btn {
        padding: 0.5rem 0.9rem; border: 1px solid #dee2e6; border-radius: 8px;
        background: white; cursor: pointer; transition: all 0.2s;
        &:hover:not(:disabled) { background: #e3f2fd; }
        &.active { background: #2d6a9f; color: white; border-color: #2d6a9f; }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
    }
  `],
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  total = 0;
  page = 1;
  pages = 1;
  limit = 12;
  recherche = '';
  chargement = true;
  private rechercheTimeout: any;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.chargerPatients();
  }

  chargerPatients(): void {
    this.chargement = true;
    this.patientService
      .getPatients({ search: this.recherche, page: this.page, limit: this.limit })
      .subscribe({
        next: (res) => {
          this.patients = res.data;
          this.total = res.total || 0;
          this.pages = res.pages || 1;
          this.chargement = false;
        },
        error: () => (this.chargement = false),
      });
  }

  onRechercheChange(): void {
    clearTimeout(this.rechercheTimeout);
    this.rechercheTimeout = setTimeout(() => {
      this.page = 1;
      this.chargerPatients();
    }, 400);
  }

  effacerRecherche(): void {
    this.recherche = '';
    this.page = 1;
    this.chargerPatients();
  }

  changerPage(p: number): void {
    if (p >= 1 && p <= this.pages) {
      this.page = p;
      this.chargerPatients();
    }
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }

  getPhotoUrl(photo: string): string {
    return photo.startsWith('http') ? photo : `${environment.uploadsUrl}${photo}`;
  }

  supprimerPatient(patient: Patient): void {
    if (!confirm(`Supprimer le patient ${patient.prenom} ${patient.nom} et tous ses rendez-vous ?`)) return;

    this.patientService.supprimerPatient(patient._id!).subscribe({
      next: () => {
        alert('Patient supprimé avec succès');
        this.chargerPatients();
      },
      error: (err) => alert(err.error?.message || 'Erreur lors de la suppression'),
    });
  }
}
