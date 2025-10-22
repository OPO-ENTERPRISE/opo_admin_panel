export interface Ad {
  _id?: string;
  name: string;
  provider: 'admob' | 'facebook' | 'custom';
  type: 'banner' | 'interstitial' | 'video';
  placementId: string;
  appScreen: string;
  active: boolean;
  config?: AdConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdConfig {
  refreshRate?: number;
  displayProbability?: number;
  customUrl?: string;
}

export interface AdsResponse {
  items: Ad[];
  total?: number;
}

export interface CreateAdRequest {
  name: string;
  provider: string;
  type: string;
  placementId: string;
  appScreen: string;
  active: boolean;
  config?: AdConfig;
}

export interface UpdateAdRequest extends CreateAdRequest {}

export interface AdFilters {
  active?: boolean;
  appScreen?: string;
  provider?: string;
  type?: string;
}
