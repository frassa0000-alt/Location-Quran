export type HiQrModelId =
  | 'hi-qr-turbo'
  | 'hi-qr-pro'
  | 'hi-qr-vision'
  | 'hi-qr-code'
  | 'hi-qr-rag';

export interface HiQrModel {
  id: HiQrModelId;
  name: string;
  nameEn: string;
  badge: string;
  description: string;
  descriptionEn: string;
  contextWindow: string;
  speed: 'فائق السرعة' | 'متوازن' | 'تفكير عميق';
  icon: string;
  provider: 'Gemini 3.1 Flash Lite' | 'Gemini 3.8 Flash' | 'Hybrid Engine';
}

export interface HiQrDocumentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  textSnippet: string;
  fullText?: string;
  base64Data?: string;
  mimeType?: string;
}

export interface HiQrImageAttachment {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  mimeType: string;
}

export interface HiQrMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelId?: HiQrModelId;
  latencyMs?: number;
  tokensEstimated?: number;
  images?: HiQrImageAttachment[];
  documents?: HiQrDocumentAttachment[];
  searchSources?: { title: string; url: string; snippet?: string }[];
  isStreaming?: boolean;
  codeBlocks?: { language: string; code: string }[];
}

export interface HiQrChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  modelId: HiQrModelId;
  messages: HiQrMessage[];
  systemInstruction?: string;
}

export interface HiQrAdminStats {
  totalRequests: number;
  totalTokens: number;
  averageLatencyMs: number;
  modelUsageCount: Record<string, number>;
  uptimeSeconds: number;
  activeSessions: number;
  serverStatus: 'optimal' | 'high_load' | 'maintenance';
}

export interface CodeExecutionResult {
  stdout: string;
  stderr?: string;
  executionTimeMs: number;
  success: boolean;
}
