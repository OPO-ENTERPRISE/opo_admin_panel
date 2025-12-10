export interface EmbeddingConfig {
  chunkSize: number;
  overlap: number;
  embeddingModel: 'openai' | 'huggingface' | 'deepseek';
  chunkingStrategy: 'characters' | 'paragraphs' | 'sections';
  metadata?: {
    [key: string]: any;
  };
  openaiApiKey?: string;
  huggingFaceApiKey?: string;
  deepseekApiKey?: string;
}

export interface Document {
  documentId: string;
  fileName: string;
  fileType: string;
  text: string;
  status: 'uploaded' | 'processed' | 'error';
}

export interface DocumentParagraph {
  index: number;
  content: string;
  summary?: string;
  tags?: string[];
}

export interface ProcessVectorRequest {
  documentId: string;
  embeddingConfig: EmbeddingConfig;
}

export interface ProcessVectorResponse {
  vectorId: string;
  status: string;
  chunksCount: number;
  paragraphs?: DocumentParagraph[];
  metadata?: Record<string, string>;
}

export interface UploadFileResponse {
  documentId: string;
  fileName: string;
  fileType: string;
  text: string;
  status: string;
  metadata?: Record<string, string>;
  paragraphs?: DocumentParagraph[];
}

