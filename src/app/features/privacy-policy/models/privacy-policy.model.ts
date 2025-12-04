export interface PrivacyPolicy {
  id: string;
  area: number; // 1=PN, 2=PS
  html: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  /**
   * URL pública (opcional) donde se sirve la política ya publicada.
   * Si el backend no la envía, se puede calcular en el frontend.
   */
  publicUrl?: string;
}

export interface CreatePrivacyPolicyRequest {
  area: number; // 1=PN, 2=PS
  html: string;
}

export interface UpdatePrivacyPolicyRequest {
  html: string;
}

