export interface EmbeddingConfig {
  chunkSize: number;
  overlap: number;
  embeddingModel: 'openai' | 'huggingface';
  chunkingStrategy: 'characters' | 'paragraphs' | 'sections';
  metadata?: {
    [key: string]: any;
  };
  openaiApiKey?: string;
  huggingFaceApiKey?: string;
}

export interface Document {
  documentId: string;
  fileName: string;
  fileType: string;
  text: string;
  status: 'uploaded' | 'processed' | 'error';
}

export interface ProcessVectorRequest {
  documentId: string;
  embeddingConfig: EmbeddingConfig;
}

export interface ProcessVectorResponse {
  vectorId: string;
  status: string;
  chunksCount: number;
}

export interface UploadFileResponse {
  documentId: string;
  fileName: string;
  fileType: string;
  text: string;
  status: string;
}

