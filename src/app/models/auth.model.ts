// src/app/models/auth.model.ts

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'secretaire' | 'medecin' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}
