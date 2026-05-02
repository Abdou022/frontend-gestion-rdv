// src/app/pages/rendezvous-form/rendezvous-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RendezVousService } from '../../services/rendezvous.service';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/index';

@Component({
  selector: 'app-rendezvous-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <a routerLink="/rendezvous" class="back-link">← Retour aux rendez-vous</a>
        <h1>{{ estModification ? '✏️ Modifier le rendez-vous' : '➕ Nouveau rendez-vous' }}</h1>
      </div>

      <form [formGroup]="rdvForm" (ngSubmit)="onSubmit()" class="form-card">

        <!-- Sélection patient -->
        <div class="form-section">
          <h3 class="section-title">👤 Patient</h3>

          <div class="form-group">
            <label>Rechercher un patient *</label>
            <input
  type="text"
  [value]="recherchePatient"
  (input)="onRechercheInput($event)"
  placeholder="Tapez un nom ou prénom..."
  [disabled]="estModification"
/>

            @if (patientsFiltres.length > 0 && !patientSelectionne) {
              <div class="dropdown-patients">
                @for (p of patientsFiltres; track p._id) {
                  <div class="dropdown-item" (click)="selectionnerPatient(p)">
                    <strong>{{ p.prenom }} {{ p.nom }}</strong>
                    <span>{{ p.telephone }}</span>
                  </div>
                }
              </div>
            }
          </div>

          @if (patientSelectionne) {
            <div class="patient-selectionne">
              <div class="patient-avatar-mini">
                {{ patientSelectionne.prenom[0] }}{{ patientSelectionne.nom[0] }}
              </div>
              <div>
                <strong>{{ patientSelectionne.prenom }} {{ patientSelectionne.nom }}</strong>
                <span>{{ patientSelectionne.telephone }}</span>
              </div>
              @if (!estModification) {
                <button type="button" class="btn-changer" (click)="changerPatient()">Changer</button>
              }
            </div>
          }

          @if (rdvForm.get('patient')?.invalid && rdvForm.get('patient')?.touched) {
            <span class="error-msg">Veuillez sélectionner un patient</span>
          }
        </div>

        <!-- Date et heure -->
        <div class="form-section">
          <h3 class="section-title">📅 Date et heure</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Date *</label>
              <input
                type="date"
                formControlName="date"
                [class.invalid]="isInvalid('date')"
              />
              @if (isInvalid('date')) { <span class="error-msg">Date requise</span> }
            </div>
            <div class="form-group">
              <label>Heure *</label>
              <input
                type="time"
                formControlName="heure"
                [class.invalid]="isInvalid('heure')"
              />
              @if (isInvalid('heure')) { <span class="error-msg">Heure requise</span> }
            </div>
            <div class="form-group">
              <label>Durée (minutes)</label>
              <select formControlName="duree">
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">2 heures</option>
              </select>
            </div>
            <div class="form-group">
              <label>Médecin</label>
              <input type="text" formControlName="medecin" placeholder="Dr. Nom" />
            </div>
          </div>
        </div>

        <!-- Motif et notes -->
        <div class="form-section">
          <h3 class="section-title">📋 Détails de la consultation</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Motif de consultation *</label>
              <input
                type="text"
                formControlName="motif"
                placeholder="Ex : Consultation générale, Suivi diabète..."
                [class.invalid]="isInvalid('motif')"
              />
              @if (isInvalid('motif')) { <span class="error-msg">Motif requis</span> }
            </div>

            @if (estModification) {
              <div class="form-group">
                <label>Statut</label>
                <select formControlName="statut">
                  <option value="planifié">Planifié</option>
                  <option value="confirmé">Confirmé</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminé">Terminé</option>
                  <option value="annulé">Annulé</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            }

            <div class="form-group full-width">
              <label>Notes</label>
              <textarea formControlName="notes" rows="2" placeholder="Observations, instructions..."></textarea>
            </div>

            @if (estModification) {
              <div class="form-group full-width">
                <label>Diagnostic</label>
                <textarea formControlName="diagnostic" rows="2" placeholder="Diagnostic posé..."></textarea>
              </div>
              <div class="form-group full-width">
                <label>Traitement prescrit</label>
                <textarea formControlName="traitement" rows="2" placeholder="Médicaments, posologie..."></textarea>
              </div>
            }
          </div>
        </div>

        @if (erreur) {
          <div class="alert-error">❌ {{ erreur }}</div>
        }
        @if (succes) {
          <div class="alert-success">✅ {{ succes }}</div>
        }

        <div class="form-actions">
          <a routerLink="/rendezvous" class="btn-cancel">Annuler</a>
          <button type="submit" class="btn-submit" [disabled]="rdvForm.invalid || !patientSelectionne || chargement">
            @if (chargement) {
              <span class="spinner"></span> Enregistrement...
            } @else {
              💾 {{ estModification ? 'Enregistrer les modifications' : 'Créer le rendez-vous' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: #2d6a9f; text-decoration: none; font-size: 0.9rem; display: inline-block; margin-bottom: 0.5rem; }
    h1 { font-size: 1.8rem; color: #1e3a5f; margin: 0; }

    .form-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-section { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #f0f0f0; &:last-of-type { border-bottom: none; } }
    .section-title { font-size: 1rem; color: #1e3a5f; font-weight: 600; margin: 0 0 1.2rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e3f2fd; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; .full-width { grid-column: 1 / -1; } }

    .form-group {
      position: relative;
      label { display: block; font-weight: 600; color: #374151; margin-bottom: 0.4rem; font-size: 0.9rem; }
      input, select, textarea {
        width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb;
        border-radius: 10px; font-size: 0.95rem; font-family: inherit;
        box-sizing: border-box; transition: border-color 0.2s;
        &:focus { outline: none; border-color: #2d6a9f; }
        &.invalid { border-color: #dc3545; }
        &:disabled { background: #f8f9fa; cursor: not-allowed; }
      }
      textarea { resize: vertical; }
    }

    .dropdown-patients {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 10;
      background: white; border: 2px solid #2d6a9f; border-top: none;
      border-radius: 0 0 10px 10px; max-height: 200px; overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);

      .dropdown-item {
        padding: 0.75rem 1rem; cursor: pointer; display: flex;
        justify-content: space-between; align-items: center;
        border-bottom: 1px solid #f0f0f0;
        strong { color: #1e3a5f; }
        span { color: #6c757d; font-size: 0.85rem; }
        &:hover { background: #e3f2fd; }
        &:last-child { border-bottom: none; }
      }
    }

    .patient-selectionne {
      display: flex; align-items: center; gap: 1rem;
      background: #e8f5e9; border: 2px solid #c8e6c9; border-radius: 10px;
      padding: 0.9rem 1.2rem; margin-top: 0.5rem;

      .patient-avatar-mini {
        width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
        background: linear-gradient(135deg, #2d6a9f, #1a9f7a);
        color: white; display: flex; align-items: center; justify-content: center;
        font-weight: 700;
      }

      div { flex: 1; strong { display: block; color: #1e3a5f; } span { color: #6c757d; font-size: 0.85rem; } }

      .btn-changer {
        background: white; border: 1px solid #dee2e6; border-radius: 8px;
        padding: 0.4rem 0.9rem; cursor: pointer; font-size: 0.85rem;
        &:hover { background: #f0f4f8; }
      }
    }

    .error-msg { color: #dc3545; font-size: 0.8rem; margin-top: 0.3rem; display: block; }
    .alert-error { background: #ffebee; border: 1px solid #ffcdd2; color: #c62828; padding: 0.9rem; border-radius: 10px; margin-bottom: 1rem; }
    .alert-success { background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32; padding: 0.9rem; border-radius: 10px; margin-bottom: 1rem; }

    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
    .btn-cancel { padding: 0.75rem 1.5rem; background: white; color: #6c757d; border: 1px solid #dee2e6; border-radius: 10px; text-decoration: none; font-weight: 500; }
    .btn-submit {
      padding: 0.75rem 2rem; background: #2d6a9f; color: white; border: none;
      border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 0.5rem;
      &:hover:not(:disabled) { background: #1e3a5f; }
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class RendezVousFormComponent implements OnInit {
  rdvForm!: FormGroup;
  estModification = false;
  rdvId: string | null = null;

  chargement = false;
  erreur = '';
  succes = '';

  recherchePatient = '';
  patientsFiltres: Patient[] = [];
  patientSelectionne: Patient | null = null;

  private rechercheTimeout: any;

  constructor(
    private fb: FormBuilder,
    private rendezVousService: RendezVousService,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.rdvId = this.route.snapshot.paramMap.get('id');
    this.estModification = !!this.rdvId;

    // Pré-remplir patient si passé en query param
    const patientId = this.route.snapshot.queryParamMap.get('patient');
    if (patientId) {
      this.patientService.getPatientById(patientId).subscribe({
        next: (res) => this.selectionnerPatient(res.data),
      });
    }

    if (this.estModification && this.rdvId) {
      this.chargerRendezVous();
    }
  }

  initForm(): void {
    const maintenant = new Date();
    const dateStr = maintenant.toISOString().split('T')[0];
    const heureStr = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;

    this.rdvForm = this.fb.group({
      patient: ['', Validators.required],
      date: [dateStr, Validators.required],
      heure: [heureStr, Validators.required],
      duree: [30],
      motif: ['', Validators.required],
      medecin: ['Dr. Généraliste'],
      statut: ['planifié'],
      notes: [''],
      diagnostic: [''],
      traitement: [''],
    });
  }

  chargerRendezVous(): void {
    this.rendezVousService.getRendezVousById(this.rdvId!).subscribe({
      next: (res) => {
        const rdv = res.data;
        const dateHeure = new Date(rdv.dateHeure);

        this.rdvForm.patchValue({
          patient: typeof rdv.patient === 'object' ? (rdv.patient as any)._id : rdv.patient,
          date: dateHeure.toISOString().split('T')[0],
          heure: `${String(dateHeure.getHours()).padStart(2, '0')}:${String(dateHeure.getMinutes()).padStart(2, '0')}`,
          duree: rdv.duree,
          motif: rdv.motif,
          medecin: rdv.medecin,
          statut: rdv.statut,
          notes: rdv.notes,
          diagnostic: rdv.diagnostic,
          traitement: rdv.traitement,
        });

        if (typeof rdv.patient === 'object') {
          this.patientSelectionne = rdv.patient as Patient;
          this.recherchePatient = `${(rdv.patient as Patient).prenom} ${(rdv.patient as Patient).nom}`;
        }
      },
      error: () => this.router.navigate(['/rendezvous']),
    });
  }

  rechercherPatients(): void {
    clearTimeout(this.rechercheTimeout);
    if (!this.recherchePatient.trim()) {
      this.patientsFiltres = [];
      return;
    }
    this.rechercheTimeout = setTimeout(() => {
      this.patientService.getPatients({ search: this.recherchePatient, limit: 6 }).subscribe({
        next: (res) => (this.patientsFiltres = res.data),
      });
    }, 300);
  }

  onRechercheInput(event: Event): void {
  this.recherchePatient = (event.target as HTMLInputElement).value;
  this.rechercherPatients();
}

  selectionnerPatient(patient: Patient): void {
    this.patientSelectionne = patient;
    this.recherchePatient = `${patient.prenom} ${patient.nom}`;
    this.patientsFiltres = [];
    this.rdvForm.patchValue({ patient: patient._id });
  }

  changerPatient(): void {
    this.patientSelectionne = null;
    this.recherchePatient = '';
    this.rdvForm.patchValue({ patient: '' });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.rdvForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.rdvForm.invalid || !this.patientSelectionne) {
      this.rdvForm.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.erreur = '';
    this.succes = '';

    const { date, heure, ...reste } = this.rdvForm.value;
    const dateHeure = new Date(`${date}T${heure}`);

    const payload = { ...reste, dateHeure };

    const operation = this.estModification
      ? this.rendezVousService.modifierRendezVous(this.rdvId!, payload)
      : this.rendezVousService.creerRendezVous(payload);

    operation.subscribe({
      next: (res) => {
        this.succes = res.message || 'Opération réussie';
        setTimeout(() => this.router.navigate(['/rendezvous']), 1200);
      },
      error: (err) => {
        this.erreur = err.error?.message || 'Une erreur est survenue';
        this.chargement = false;
      },
    });
  }
}
