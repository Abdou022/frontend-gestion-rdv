// src/app/services/patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Patient, ApiResponse } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les patients avec filtres optionnels
   */
  getPatients(options?: {
    search?: string;
    page?: number;
    limit?: number;
    actif?: boolean;
  }): Observable<ApiResponse<Patient[]>> {
    let params = new HttpParams();

    if (options?.search) params = params.set('search', options.search);
    if (options?.page) params = params.set('page', options.page.toString());
    if (options?.limit) params = params.set('limit', options.limit.toString());
    if (options?.actif !== undefined)
      params = params.set('actif', options.actif.toString());

    return this.http.get<ApiResponse<Patient[]>>(this.apiUrl, { params });
  }

  /**
   * Récupérer un patient par son ID (avec ses RDV)
   */
  getPatientById(id: string): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouveau patient (avec photo optionnelle)
   */
  creerPatient(patient: Patient, photo?: File): Observable<ApiResponse<Patient>> {
    const formData = new FormData();

    // Ajout de tous les champs du patient
    Object.keys(patient).forEach((key) => {
      const value = (patient as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof Date ? value.toISOString() : value);
      }
    });

    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.post<ApiResponse<Patient>>(this.apiUrl, formData);
  }

  /**
   * Modifier un patient existant
   */
  modifierPatient(
    id: string,
    patient: Partial<Patient>,
    photo?: File
  ): Observable<ApiResponse<Patient>> {
    const formData = new FormData();

    Object.keys(patient).forEach((key) => {
      const value = (patient as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof Date ? value.toISOString() : value);
      }
    });

    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.put<ApiResponse<Patient>>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Supprimer un patient
   */
  supprimerPatient(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
