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
  type: 'topic' | 'exam' | 'misc'; // Tipo de topic: temas, exámenes oficiales, miscelánea
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

export interface CreateTopicFormData {
  title: string;
  area: number;
  type: 'topic' | 'exam' | 'misc';
  order: number;
  description?: string;
  imageUrl?: string;
}

export interface CreateSubtopicFormData {
  title: string;
  type?: 'topic' | 'exam' | 'misc';
  order: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateTopicRequest extends CreateTopicRequest {}

export interface ToggleTopicRequest {
  enabled: boolean;
}

export interface TogglePremiumRequest {
  premium: boolean;
}

export interface SourceTopicInfo {
  topicId: number;
  uuid: string;
  title: string;
  area: number;
  isMain: boolean;
  subtopicCount: number;
  questionCount: number;
}

export interface CopyQuestionsRequest {
  sourceTopicUuids: string[];
}

export interface CopyQuestionsResponse {
  message: string;
  questionsCopied: number;
  topicsProcessed: number;
}

export interface QuestionOptionFromJson {
  text: string;
  correct: boolean;
}

export interface QuestionFromJson {
  statement: string;
  options: QuestionOptionFromJson[];
  multi: boolean;
}

export interface UploadQuestionsRequest {
  area: number;
  topicId: number;
  subtopicId?: number;
  questions: QuestionFromJson[];
  mode: 'add' | 'replace';
}

export interface UploadQuestionsResponse {
  message: string;
  questionsAdded: number;
  totalQuestions: number;
}