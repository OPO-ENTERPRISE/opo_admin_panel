export interface Topic {
  _id?: string;
  id: number; // Cambiado a number
  uuid: string;
  rootId: number; // Cambiado a number
  rootUuid: string;
  area: number; // Cambiado a number
  title: string;
  description?: string;
  imageUrl?: string;
  enabled: boolean;
  premium: boolean; // Nuevo campo premium
  order: number; // Cambiado a number
  parentUuid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TopicResponse {
  items: Topic[]; // Cambiado de 'topics' a 'items'
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubtopicsResponse {
  subtopics: Topic[];
  parentTopic: {
    _id: string;
    id: number; // Cambiado a number
    uuid: string;
    title: string;
  };
  total: number;
}

export interface TopicStats {
  totalTopics: number;
  topicsByArea: {
    PN: number;
    PS: number;
  };
  enabledTopics: number;
  disabledTopics: number;
}

export interface CreateTopicRequest {
  id: number; // Cambiado a number
  uuid: string;
  rootId: number; // Cambiado a number
  rootUuid: string;
  area: number; // Cambiado a number
  title: string;
  description?: string;
  imageUrl?: string;
  enabled: boolean;
  order: number; // Cambiado a number
  parentUuid?: string;
}

export interface UpdateTopicRequest extends CreateTopicRequest {}

export interface ToggleTopicRequest {
  enabled: boolean;
}

export interface TogglePremiumRequest {
  premium: boolean;
}
