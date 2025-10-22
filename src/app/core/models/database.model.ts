export interface DatabaseStats {
  databaseName: string;
  totalSize: number;
  collections: CollectionStats[];
  totalDocuments: number;
}

export interface CollectionStats {
  name: string;
  documentCount: number;
  size: number;
}
