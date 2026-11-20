import { DocumentsResponse, IngestResponse, Citation } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export interface ChatApiResponse {
  answer: string;
  citations: Citation[];
  session_id: string;
}

export async function sendChatMessage(
  message: string,
  session_id: string,
  top_k: number = 5
): Promise<ChatApiResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, session_id, top_k }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Failed to communicate with API server.' }));
    throw new Error(errData.detail || errData.error || 'Server returned an error');
  }

  return response.json();
}

export async function fetchDocuments(): Promise<DocumentsResponse> {
  const response = await fetch(`${API_BASE_URL}/documents`);
  if (!response.ok) {
    throw new Error('Failed to fetch document library list.');
  }
  return response.json();
}

export async function triggerReIngest(): Promise<IngestResponse> {
  const response = await fetch(`${API_BASE_URL}/ingest`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Ingestion pipeline execution failed.');
  }
  return response.json();
}

export async function uploadPdfFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Failed to upload PDF file.' }));
    throw new Error(errData.detail || 'File upload failed');
  }

  return response.json();
}

export async function deleteDocumentFile(filename: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete document ${filename}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}
