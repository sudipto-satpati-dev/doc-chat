export interface Citation {
  source_file: string;
  page_number: number;
  text_snippet?: string;
  similarity?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface DocumentInfo {
  filename: string;
  size_mb: number;
  chunk_count: number;
  indexed: boolean;
  status: 'Indexed' | 'Processing' | 'Pending';
}

export interface DocumentsResponse {
  documents: DocumentInfo[];
  total_files: number;
  total_chunks: number;
}

export interface IngestResponse {
  status: string;
  files_processed: number;
  pages_processed: number;
  chunks_created: number;
  errors: string[];
}
