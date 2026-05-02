// src/app/pages/patient-form/patient-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <a routerLink="/patients" class="back-link">← Retour aux patients</a>
          <h1>{{ estModification ? '✏️ Modifier le patient' : '➕ Nouveau patient' }}</h1>
        </div>
      </div>

      <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" class="form-card">

        <!-- Section photo -->
        <div class="form-section">
          <div class="photo-upload">
            <div class="photo-preview">
              @if (photoPreview) {
                <img [src]="photoPreview" alt="Photo patient" />
              } @else {
                <span class="photo-placeholder">📷</span>
              }
            </div>
            <div class="photo-actions">
              <label class="btn-upload">
                📁 Choisir une photo
                <input type="file" accept="image/*" (change)="onPhotoSelected($event)" hidden />
              </label>
              @if (photoPreview) {
                <button type="button" class="btn-remove-photo" (click)="supprimerPhoto()">✕ Supprimer</button>
              }
            </div>
          </div>
        </div>

        <!-- Informations personnelles -->
        <div class="form-section">
          <h3 class="section-title">👤 Informations personnelles</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Prénom *</label>
              <input type="text" formControlName="prenom" [class.invalid]="isInvalid('prenom')" />
              @if (isInvalid('prenom')) { <span class="error-msg">Prénom requis</span> }
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" formControlName="nom" [class.invalid]="isInvalid('nom')" />
              @if (isInvalid('nom')) { <span class="error-msg">Nom requis</span> }
            </div>
            <div class="form-group">
              <label>Date de naissance *</label>
              <input type="date" formControlName="dateNaissance" [class.invalid]="isInvalid('dateNaissance')" />
              @if (isInvalid('dateNaissance')) { <span class="error-msg">Date de naissance requise</span> }
            </div>
            <div class="form-group">
              <label>Sexe *</label>
              <select formControlName="sexe" [class.invalid]="isInvalid('sexe')">
                <option value="">-- Sélectionner --</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
              @if (isInvalid('sexe')) { <span class="error-msg">Sexe requis</span> }
            </div>
          </div>
        </div>

        <!-- Coordonnées -->
        <div class="form-section">
          <h3 class="section-title">📞 Coordonnées</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Téléphone *</label>
              <input type="tel" formControlName="telephone" placeholder="+216 XX XXX XXX" [class.invalid]="isInvalid('telephone')" />
              @if (isInvalid('telephone')) { <span class="error-msg">Téléphone requis</span> }
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" [class.invalid]="isInvalid('email')" />
              @if (isInvalid('email')) { <span class="error-msg">Email invalide</span> }
            </div>
            <div class="form-group full-width">
              <label>Adresse</label>
              <input type="text" formControlName="adresse" placeholder="Rue, Ville, Code postal" />
            </div>
          </div>
        </div>

        <!-- Informations médicales -->
        <div class="form-section">
          <h3 class="section-title">🩺 Informations médicales</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Groupe sanguin</label>
              <select formControlName="groupeSanguin">
                <option value="">-- Inconnu --</option>
                <option *ngFor="let g of groupesSanguins" [value]="g">{{ g }}</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Allergies</label>
              <textarea formControlName="allergies" rows="2" placeholder="Ex : Pénicilline, Latex..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>Antécédents médicaux</label>
              <textarea formControlName="antecedents" rows="3" placeholder="Ex : Diabète type 2, Hypertension..."></textarea>
            </div>
          </div>
        </div>

        @if (erreur) {
          <div class="alert-error">❌ {{ erreur }}</div>
        }

        @if (succes) {
          <div class="alert-success">✅ {{ succes }}</div>
        }

        <div class="form-actions">
          <a routerLink="/patients" class="btn-cancel">Annuler</a>
          <button type="submit" class="btn-submit" [disabled]="patientForm.invalid || chargement">
            @if (chargement) {
              <span class="spinner"></span> Enregistrement...
            } @else {
              💾 {{ estModification ? 'Enregistrer les modifications' : 'Créer le patient' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 900px; margin: 0 auto; }

    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: #2d6a9f; text-decoration: none; font-size: 0.9rem; display: inline-block; margin-bottom: 0.5rem; }
    h1 { font-size: 1.8rem; color: #1e3a5f; margin: 0; }

    .form-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

    .form-section { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #f0f0f0; &:last-of-type { border-bottom: none; } }

    .section-title { font-size: 1rem; color: #1e3a5f; font-weight: 600; margin: 0 0 1.2rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e3f2fd; }

    .photo-upload {
      display: flex; align-items: center; gap: 1.5rem;
      .photo-preview {
        width: 100px; height: 100px; border-radius: 50%;
        border: 3px dashed #dee2e6; overflow: hidden;
        display: flex; align-items: center; justify-content: center;
        img { width: 100%; height: 100%; object-fit: cover; }
        .photo-placeholder { font-size: 2.5rem; }
      }
      .photo-actions { display: flex; flex-direction: column; gap: 0.5rem; }
    }

    .btn-upload {
      display: inline-block; padding: 0.6rem 1.2rem;
      background: #e3f2fd; color: #1565c0; border-radius: 8px;
      cursor: pointer; font-size: 0.9rem; font-weight: 500;
      &:hover { background: #bbdefb; }
    }

    .btn-remove-photo {
      background: #ffebee; color: #c62828; border: none; border-radius: 8px;
      padding: 0.4rem 0.8rem; cursor: pointer; font-size: 0.85rem;
    }

    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;
      .full-width { grid-column: 1 / -1; }
    }

    .form-group {
      label { display: block; font-weight: 600; color: #374151; margin-bottom: 0.4rem; font-size: 0.9rem; }

      input, select, textarea {
        width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb;
        border-radius: 10px; font-size: 0.95rem; font-family: inherit;
        box-sizing: border-box; transition: border-color 0.2s;
        &:focus { outline: none; border-color: #2d6a9f; }
        &.invalid { border-color: #dc3545; }
      }
      textarea { resize: vertical; }
    }

    .error-msg { color: #dc3545; font-size: 0.8rem; margin-top: 0.3rem; display: block; }

    .alert-error { background: #ffebee; border: 1px solid #ffcdd2; color: #c62828; padding: 0.9rem 1.2rem; border-radius: 10px; margin-bottom: 1rem; }
    .alert-success { background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32; padding: 0.9rem 1.2rem; border-radius: 10px; margin-bottom: 1rem; }

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
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  estModification = false;
  patientId: string | null = null;
  chargement = false;
  erreur = '';
  succes = '';
  photoFichier: File | null = null;
  photoPreview: string | null = null;

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.patientId = this.route.snapshot.paramMap.get('id');
    this.estModification = !!this.patientId && this.router.url.includes('modifier');

    if (this.estModification && this.patientId) {
      this.chargerPatient();
    }
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.maxLength(100)]],
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      dateNaissance: ['', Validators.required],
      sexe: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\s\-()]{8,20}$/)]],
      email: ['', Validators.email],
      adresse: [''],
      groupeSanguin: [''],
      allergies: [''],
      antecedents: [''],
    });
  }

  chargerPatient(): void {
    this.patientService.getPatientById(this.patientId!).subscribe({
      next: (res) => {
        const p = res.data;
        this.patientForm.patchValue({
          ...p,
          dateNaissance: p.dateNaissance
            ? new Date(p.dateNaissance).toISOString().split('T')[0]
            : '',
        });
        if (p.photo) {
          this.photoPreview = p.photo.startsWith('http')
            ? p.photo
            : `${environment.uploadsUrl}${p.photo}`;
        }
      },
      error: () => this.router.navigate(['/patients']),
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.patientForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.photoFichier = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.photoPreview = e.target?.result as string);
      reader.readAsDataURL(this.photoFichier);
    }
  }

  supprimerPhoto(): void {
    this.photoFichier = null;
    this.photoPreview = null;
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.erreur = '';
    this.succes = '';

    const donnees = this.patientForm.value;

    const operation = this.estModification
      ? this.patientService.modifierPatient(this.patientId!, donnees, this.photoFichier || undefined)
      : this.patientService.creerPatient(donnees, this.photoFichier || undefined);

    operation.subscribe({
      next: (res) => {
        this.succes = res.message || 'Opération réussie';
        setTimeout(() => this.router.navigate(['/patients']), 1200);
      },
      error: (err) => {
        this.erreur = err.error?.message || 'Une erreur est survenue';
        this.chargement = false;
      },
    });
  }
}
