const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type EditorElement = {
  id: number;
  page_id: number;
  kind: "text" | "rectangle" | "ellipse" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  position: number;
  properties: Record<string, string>;
};

export type Page = { id: number; name: string; width: number; height: number; elements: EditorElement[] };
export type Project = { id: number; name: string; pages: Page[] };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  createProject: () => request<Project>("/api/projects", { method: "POST", body: JSON.stringify({ project: { name: "Projeto sem título" } }) }),
  getProject: (id: number) => request<Project>(`/api/projects/${id}`),
  createElement: (element: Omit<EditorElement, "id" | "page_id"> & { page_id: number }) => request<EditorElement>("/api/elements", { method: "POST", body: JSON.stringify({ element }) }),
  updateElement: (id: number, element: Partial<EditorElement>) => request<EditorElement>(`/api/elements/${id}`, { method: "PATCH", body: JSON.stringify({ element }) }),
  deleteElement: (id: number) => request<void>(`/api/elements/${id}`, { method: "DELETE" }),
};
