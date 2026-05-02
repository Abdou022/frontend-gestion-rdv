// src/app/models/api.model.ts

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
  page?: number;
  pages?: number;
}

export interface Stats {
  totalPatients: number;
  rdvAujourdhui: number;
  rdvCeMois: number;
  rdvParStatut: { _id: string; count: number }[];
}
