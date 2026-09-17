import { getCurrentIdToken } from "./firebase";

function resolveApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  if (!trimmed.endsWith("/api/v1")) {
    return `${trimmed}/api/v1`;
  }
  return trimmed;
}

const API_BASE_URL = resolveApiBaseUrl();

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = await getCurrentIdToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body = options.body;
  if (options.data && !(options.data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.data);
  } else if (options.data instanceof FormData) {
    body = options.data;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ─── Typed API Methods ────────────────────────────────────────────────────────

export const api = {
  // Auth
  getMe: () => apiFetch("/auth/me"),

  // Projects
  createProject: (data: { title: string; description?: string; project_type?: string; complexity_level?: string }) =>
    apiFetch("/projects", { method: "POST", data }),
  getProjects: (limit = 20, offset = 0) =>
    apiFetch(`/projects?limit=${limit}&offset=${offset}`),
  getProject: (id: string) => apiFetch(`/projects/${id}`),
  updateProject: (id: string, data: any) => apiFetch(`/projects/${id}`, { method: "PATCH", data }),
  deleteProject: (id: string) => apiFetch(`/projects/${id}`, { method: "DELETE" }),

  // Inputs
  submitText: (projectId: string, text: string, inputType = "text") => {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("input_type", inputType);
    return apiFetch(`/projects/${projectId}/inputs/text`, { method: "POST", data: formData });
  },
  uploadFile: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch(`/projects/${projectId}/inputs/file`, { method: "POST", data: formData });
  },

  // Analysis
  startAnalysis: (projectId: string) =>
    apiFetch(`/projects/${projectId}/analysis/start`, { method: "POST" }),
  getAnalysisStatus: (projectId: string) =>
    apiFetch(`/projects/${projectId}/analysis/status`),
  getAnalysisResult: (projectId: string) =>
    apiFetch(`/projects/${projectId}/analysis/result`),

  // Discover
  startDiscovery: (projectId: string) =>
    apiFetch(`/projects/${projectId}/discover/start`, { method: "POST" }),
  getDiscoveryStatus: (projectId: string) =>
    apiFetch(`/projects/${projectId}/discover/status`),
  getDiscoveryResults: (projectId: string, limit = 20, offset = 0, source?: string) =>
    apiFetch(`/projects/${projectId}/discover/results?limit=${limit}&offset=${offset}${source ? `&source=${source}` : ""}`),
  compareResult: (projectId: string, resultId: string) =>
    apiFetch(`/projects/${projectId}/discover/compare/${resultId}`),

  // Suggestions
  getSuggestions: (projectId: string) =>
    apiFetch(`/projects/${projectId}/suggestions`),
  acceptSuggestion: (projectId: string, suggestionId: string) =>
    apiFetch(`/projects/${projectId}/suggestions/${suggestionId}/accept`, { method: "POST" }),
  rejectSuggestion: (projectId: string, suggestionId: string) =>
    apiFetch(`/projects/${projectId}/suggestions/${suggestionId}/reject`, { method: "POST" }),

  // Copilot
  chat: (projectId: string, message: string, conversationId?: string) =>
    apiFetch(`/projects/${projectId}/copilot/chat`, {
      method: "POST",
      data: { message, conversation_id: conversationId },
    }),
  getConversations: (projectId: string) =>
    apiFetch(`/projects/${projectId}/copilot/conversations`),
  getMessages: (projectId: string, conversationId: string) =>
    apiFetch(`/projects/${projectId}/copilot/conversations/${conversationId}/messages`),

  // Roadmap
  generateRoadmap: (projectId: string, constraints: any) =>
    apiFetch(`/projects/${projectId}/roadmap/generate`, { method: "POST", data: constraints }),
  getRoadmap: (projectId: string) =>
    apiFetch(`/projects/${projectId}/roadmap`),
  updateTaskStatus: (projectId: string, taskId: string, status: string) =>
    apiFetch(`/projects/${projectId}/roadmap/tasks/${taskId}?status=${status}`, { method: "PATCH" }),

  // Architecture
  generateArchitecture: (projectId: string, diagramType = "system") =>
    apiFetch(`/projects/${projectId}/architecture/generate?diagram_type=${diagramType}`, { method: "POST" }),
  getArchitecture: (projectId: string, diagramType = "system") =>
    apiFetch(`/projects/${projectId}/architecture?diagram_type=${diagramType}`),
};
