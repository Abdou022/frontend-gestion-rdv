// src/app/models/patient.model.ts
import { RendezVous } from './rendezvous.model';

export interface Patient {
  _id?: string;
  nom: string;
  prenom: string;
  dateNaissance: string | Date;
  sexe: 'Homme' | 'Femme' | 'Autre';
  telephone: string;
  email?: string;
  adresse?: string;
  groupeSanguin?: string;
  allergies?: string;
  antecedents?: string;
  photo?: string;
  actif?: boolean;
  createdAt?: string;
  updatedAt?: string;
  rendezVous?: RendezVous[];
}
