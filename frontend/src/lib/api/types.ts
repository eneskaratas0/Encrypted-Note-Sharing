// Mirrors app/schemas/secret.py

export interface SecretCreate {
  encrypted_payload: string;
  ttl_seconds?: number;
  max_views?: number;
}

export interface SecretResponse {
  id: string;
  expires_at: string | null;
  max_views: number;
}

export interface SecretOut {
  id: string;
  encrypted_payload: string;
  created_at: string;
  expires_at: string | null;
  max_views: number;
  view_count: number;
}
