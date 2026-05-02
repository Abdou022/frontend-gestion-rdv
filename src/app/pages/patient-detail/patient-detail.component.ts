// src/app/pages/patient-detail/patient-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient, RendezVous } from '../../models/index';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      @if (chargement) {
        <div class="loading-state"><div class="spinner-large"></div></div>
      } @else if (patient) {

        <div class="page-header">
          <a routerLink="/patients" class="back-link">← Retour aux patients</a>
          <div class="header-actions">
            <a [routerLink]="['/patients', patient._id, 'modifier']" class="btn-edit">✏️ Modifier</a>
            <a [routerLink]="['/rendezvous/nouveau']" [queryParams]="{patient: patient._id}" class="btn-rdv">📅 Prendre RDV</a>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Carte profil -->
          <div class="profile-card">
            <div class="profile-avatar">
              @if (patient.photo) {
                <img [src]="getPhotoUrl(patient.photo)" [alt]="patient.nom" />
              } @else {
                <div class="avatar-placeholder">
                  {{ patient.prenom?.[0] }}{{ patient.nom?.[0] }}
                </div>
              }
            </div>

            <h2>{{ patient.prenom }} {{ patient.nom }}</h2>
            <span class="badge-sexe sexe-{{ patient.sexe }}">{{ patient.sexe }}</span>
            @if (patient.groupeSanguin) {
              <span class="badge-groupe">🩸 {{ patient.groupeSanguin }}</span>
            }

            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-num">{{ patient.rendezVous?.length || 0 }}</span>
                <span class="stat-lbl">Rendez-vous</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ getAge(patient.dateNaissance) }}</span>
                <span class="stat-lbl">Ans</span>
              </div>
            </div>
          </div>

          <!-- Infos détaillées -->
          <div class="detail-content">
            <div class="info-card">
              <h3>📋 Informations personnelles</h3>
              <div class="info-grid">
                <div class="info-item"><span class="label">Date de naissance</span><span>{{ patient.dateNaissance | date:'dd MMMM yyyy':'':'fr' }}</span></div>
                <div class="info-item"><span class="label">Téléphone</span><span>{{ patient.telephone }}</span></div>
                @if (patient.email) {
                  <div class="info-item"><span class="label">Email</span><span>{{ patient.email }}</span></div>
                }
                @if (patient.adresse) {
                  <div class="info-item full"><span class="label">Adresse</span><span>{{ patient.adresse }}</span></div>
                }
              </div>
            </div>

            @if (patient.allergies || patient.antecedents) {
              <div class="info-card medical">
                <h3>🩺 Informations médicales</h3>
                @if (patient.allergies) {
                  <div class="medical-item allergies">
                    <span class="label">⚠️ Allergies</span>
                    <span>{{ patient.allergies }}</span>
                  </div>
                }
                @if (patient.antecedents) {
                  <div class="medical-item">
                    <span class="label">📂 Antécédents</span>
                    <span>{{ patient.antecedents }}</span>
                  </div>
                }
              </div>
            }

            <!-- Historique RDV -->
            <div class="info-card">
              <div class="rdv-header">
                <h3>📅 Historique des rendez-vous</h3>
                <a [routerLink]="['/rendezvous/nouveau']" [queryParams]="{patient: patient._id}" class="btn-new-rdv">+ Nouveau RDV</a>
              </div>

              @if (!patient.rendezVous?.length) {
                <div class="empty-rdv">Aucun rendez-vous enregistré</div>
              } @else {
                <div class="rdv-timeline">
                  @for (rdv of patient.rendezVous; track rdv._id) {
                    <div class="rdv-entry" [class]="'statut-border-' + rdv.statut">
                      <div class="rdv-date">
                        <strong>{{ rdv.dateHeure | date:'dd/MM/yyyy' }}</strong>
                        <span>{{ rdv.dateHeure | date:'HH:mm' }}</span>
                      </div>
                      <div class="rdv-details">
                        <div class="rdv-motif">{{ rdv.motif }}</div>
                        @if (rdv.diagnostic) {
                          <div class="rdv-diag">🔬 {{ rdv.diagnostic }}</div>
                        }
                        @if (rdv.medecin) {
                          <div class="rdv-medecin">👨‍⚕️ {{ rdv.medecin }}</div>
                        }
                      </div>
                      <div class="rdv-statut-badge statut-{{ rdv.statut }}">{{ rdv.statut }}</div>
                      <a [routerLink]="['/rendezvous', rdv._id, 'modifier']" class="btn-edit-rdv">✏️</a>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .back-link { color: #2d6a9f; text-decoration: none; font-size: 0.9rem; }
    .header-actions { display: flex; gap: 0.75rem; }

    .btn-edit { padding: 0.6rem 1.2rem; background: #fff3e0; color: #e65100; border-radius: 8px; text-decoration: none; font-weight: 500; }
    .btn-rdv { padding: 0.6rem 1.2rem; background: #2d6a9f; color: white; border-radius: 8px; text-decoration: none; font-weight: 500; }

    .detail-grid { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; }

    .profile-card {
      background: white; border-radius: 16px; padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; height: fit-content;

      .profile-avatar {
        margin: 0 auto 1rem;
        img, .avatar-placeholder {
          width: 100px; height: 100px; border-radius: 50%; object-fit: cover;
        }
        .avatar-placeholder {
          background: linear-gradient(135deg, #2d6a9f, #1a9f7a);
          color: white; display: flex; align-items: center; justify-content: center;
          font-size: 2rem; font-weight: 700; margin: 0 auto;
        }
      }

      h2 { margin: 0 0 0.5rem; color: #1e3a5f; }

      .badge-sexe { display: inline-block; font-size: 0.8rem; padding: 3px 10px; border-radius: 20px; margin: 0.3rem;
        &.sexe-Homme { background: #e3f2fd; color: #1565c0; }
        &.sexe-Femme { background: #fce4ec; color: #880e4f; }
      }
      .badge-groupe { display: inline-block; background: #fff3e0; color: #e65100; font-size: 0.8rem; padding: 3px 10px; border-radius: 20px; }

      .profile-stats { display: flex; gap: 1rem; justify-content: center; margin-top: 1.2rem; padding-top: 1.2rem; border-top: 1px solid #f0f0f0;
        .stat-item { text-align: center; flex: 1; }
        .stat-num { display: block; font-size: 1.5rem; font-weight: 700; color: #1e3a5f; }
        .stat-lbl { font-size: 0.8rem; color: #6c757d; }
      }
    }

    .info-card { background: white; border-radius: 14px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 1.2rem;
      h3 { font-size: 1rem; color: #1e3a5f; margin: 0 0 1.2rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e3f2fd; }
      &.medical h3 { border-bottom-color: #ffccbc; }
    }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; .full { grid-column: 1/-1; } }

    .info-item { .label { display: block; font-size: 0.78rem; color: #6c757d; font-weight: 600; text-transform: uppercase; margin-bottom: 0.2rem; } }

    .medical-item { margin-bottom: 0.8rem; padding: 0.75rem; border-radius: 8px; background: #fafafa;
      .label { display: block; font-size: 0.8rem; font-weight: 600; color: #6c757d; margin-bottom: 0.3rem; }
      &.allergies { background: #fff8f0; border-left: 3px solid #ff9800; }
    }

    .rdv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e3f2fd;
      h3 { margin: 0; font-size: 1rem; color: #1e3a5f; }
      .btn-new-rdv { background: #e8f5e9; color: #2e7d32; padding: 0.4rem 0.9rem; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 500; }
    }

    .rdv-timeline { display: flex; flex-direction: column; gap: 0.7rem; }
    .rdv-entry {
      display: flex; align-items: center; gap: 1rem; padding: 0.9rem;
      background: #fafafa; border-radius: 10px; border-left: 4px solid #dee2e6;

      &.statut-border-terminé { border-left-color: #9c27b0; }
      &.statut-border-confirmé { border-left-color: #4caf50; }
      &.statut-border-planifié { border-left-color: #2196f3; }
      &.statut-border-annulé { border-left-color: #f44336; }

      .rdv-date { min-width: 80px; text-align: center; font-size: 0.85rem;
        strong { display: block; color: #1e3a5f; }
        span { color: #6c757d; font-size: 0.8rem; }
      }
      .rdv-details { flex: 1;
        .rdv-motif { font-weight: 500; }
        .rdv-diag, .rdv-medecin { font-size: 0.82rem; color: #6c757d; margin-top: 0.2rem; }
      }
      .rdv-statut-badge { padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
        &.statut-planifié { background: #e3f2fd; color: #1565c0; }
        &.statut-confirmé { background: #e8f5e9; color: #2e7d32; }
        &.statut-terminé { background: #f3e5f5; color: #6a1b9a; }
        &.statut-annulé { background: #ffebee; color: #c62828; }
      }
      .btn-edit-rdv { background: none; border: none; cursor: pointer; font-size: 0.9rem; }
    }

    .empty-rdv { text-align: center; color: #6c757d; padding: 2rem; }

    .loading-state { text-align: center; padding: 4rem; }
    .spinner-large { width: 40px; height: 40px; margin: 0 auto; border: 3px solid #e5e7eb; border-top-color: #2d6a9f; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  chargement = true;

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.chargerPatient(id);
  }

  chargerPatient(id: string): void {
    this.patientService.getPatientById(id).subscribe({
      next: (res) => {
        this.patient = res.data;
        this.chargement = false;
      },
      error: () => this.router.navigate(['/patients']),
    });
  }

  getAge(dateNaissance: string | Date): number {
    const naissance = new Date(dateNaissance);
    const aujourd_hui = new Date();
    let age = aujourd_hui.getFullYear() - naissance.getFullYear();
    const m = aujourd_hui.getMonth() - naissance.getMonth();
    if (m < 0 || (m === 0 && aujourd_hui.getDate() < naissance.getDate())) age--;
    return age;
  }

  getPhotoUrl(photo: string): string {
    return photo.startsWith('http') ? photo : `${environment.uploadsUrl}${photo}`;
  }
}
