export interface AdProvider {
  _id?: string;
  providerId: string; // Slug único: "admob", "facebook"
  name: string; // Nombre visible: "AdMob"
  icon?: string; // Icono Material
  color?: string; // Color hex
  enabled: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProvidersResponse {
  items: AdProvider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProviderRequest {
  providerId: string;
  name: string;
  icon?: string;
  color?: string;
  enabled: boolean;
  order: number;
}

export interface UpdateProviderRequest extends Partial<CreateProviderRequest> {}

export interface ProviderFilters {
  page?: number;
  limit?: number;
  enabled?: boolean;
}
