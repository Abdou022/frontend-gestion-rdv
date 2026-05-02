// src/app/services/rendezvous.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RendezVous, ApiResponse, Stats } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class RendezVousService {
  private readonly apiUrl = `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les rendez-vous avec filtres
   */
  getRendezVous(options?: {
    dateDebut?: string;
    dateFin?: string;
    statut?: string;
    patient?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<RendezVous[]>> {
    let params = new HttpParams();

    if (options?.dateDebut) params = params.set('dateDebut', options.dateDebut);
    if (options?.dateFin) params = params.set('dateFin', options.dateFin);
    if (options?.statut) params = params.set('statut', options.statut);
    if (options?.patient) params = params.set('patient', options.patient);
    if (options?.page) params = params.set('page', options.page.toString());
    if (options?.limit) params = params.set('limit', options.limit.toString());

    return this.http.get<ApiResponse<RendezVous[]>>(this.apiUrl, { params });
  }

  /**
   * Récupérer un rendez-vous par ID
   */
  getRendezVousById(id: string): Observable<ApiResponse<RendezVous>> {
    return this.http.get<ApiResponse<RendezVous>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouveau rendez-vous
   */
  creerRendezVous(rendezVous: Partial<RendezVous>): Observable<ApiResponse<RendezVous>> {
    return this.http.post<ApiResponse<RendezVous>>(this.apiUrl, rendezVous);
  }

  /**
   * Modifier un rendez-vous
   */
  modifierRendezVous(
    id: string,
    rendezVous: Partial<RendezVous>
  ): Observable<ApiResponse<RendezVous>> {
    return this.http.put<ApiResponse<RendezVous>>(`${this.apiUrl}/${id}`, rendezVous);
  }

  /**
   * Changer le statut d'un rendez-vous
   */
  changerStatut(
    id: string,
    statut: string
  ): Observable<ApiResponse<RendezVous>> {
    return this.http.put<ApiResponse<RendezVous>>(`${this.apiUrl}/${id}`, { statut });
  }

  /**
   * Supprimer un rendez-vous
   */
  supprimerRendezVous(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Récupérer les statistiques du tableau de bord
   */
  getStats(): Observable<ApiResponse<Stats>> {
    return this.http.get<ApiResponse<Stats>>(`${this.apiUrl}/stats`);
  }
}
