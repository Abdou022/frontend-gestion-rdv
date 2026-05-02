// src/app/models/rendezvous.model.ts
import { Patient } from './patient.model';

export interface RendezVous {
  _id?: string;
  patient: Patient | string;
  dateHeure: string | Date;
  duree?: number;
  motif: string;
  statut?: 'planifié' | 'confirmé' | 'en_cours' | 'terminé' | 'annulé' | 'absent';
  medecin?: string;
  notes?: string;
  diagnostic?: string;
  traitement?: string;
  createdAt?: string;
  updatedAt?: string;
}
