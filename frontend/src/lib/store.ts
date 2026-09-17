import { create } from "zustand";
import { User } from "firebase/auth";
import { ProjectAnalysis } from "./text-analyzer";
import { SemanticScholarPaper } from "./semantic-scholar";
import {
  ProjectImplementationAssessment,
  StrategicImprovement,
  DynamicRoadmap,
} from "./demo-engine";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  sourceType: "text" | "pdf" | "doc" | "prompt";
  rawInput: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
  analysis: ProjectAnalysis;
  discoveredPapers: SemanticScholarPaper[];
  implementationAssessment: ProjectImplementationAssessment | null;
  suggestions: StrategicImprovement[];
  roadmap: DynamicRoadmap | null;
  copilotMessages: { id: string; sender: "user" | "copilot"; text: string; timestamp: string }[];
}

interface AppState {
  user: User | null;
  supabaseUser: any | null;
  currentProject: ProjectData | null;
  projects: ProjectData[];
  isLoadingUser: boolean;
  isHydrated: boolean;

  // Auth actions
  setUser: (user: User | null) => void;
  setSupabaseUser: (user: any | null) => void;
  setIsLoadingUser: (loading: boolean) => void;

  // Project actions
  setCurrentProject: (project: ProjectData | null) => void;
  saveProject: (project: ProjectData) => void;
  getProjectById: (id: string) => ProjectData | undefined;
  deleteProject: (id: string) => void;
  updateProjectRoadmap: (projectId: string, roadmap: DynamicRoadmap) => void;
  toggleRoadmapTask: (projectId: string, taskId: string) => void;
  updateSuggestionStatus: (projectId: string, suggestionId: string, status: "accepted" | "rejected" | "pending") => void;
  addCopilotMessage: (projectId: string, message: { sender: "user" | "copilot"; text: string }) => void;
  hydrateStore: () => void;
}

const STORAGE_KEY = "p2p_saved_projects_v2";

function loadProjectsFromStorage(): ProjectData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse projects from localStorage", e);
  }
  return [];
}

function persistProjectsToStorage(projects: ProjectData[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects to localStorage", e);
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  supabaseUser: null,
  currentProject: null,
  projects: [],
  isLoadingUser: false,
  isHydrated: false,

  setUser: (user) => set({ user }),
  setSupabaseUser: (supabaseUser) => set({ supabaseUser }),
  setIsLoadingUser: (isLoadingUser) => set({ isLoadingUser }),

  setCurrentProject: (currentProject) => set({ currentProject }),

  saveProject: (project) => {
    const existing = get().projects;
    const index = existing.findIndex((p) => p.id === project.id);
    let updated: ProjectData[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [project, ...existing];
    }
    persistProjectsToStorage(updated);
    set({ projects: updated, currentProject: project });
  },

  getProjectById: (id) => {
    return get().projects.find((p) => p.id === id);
  },

  deleteProject: (id) => {
    const filtered = get().projects.filter((p) => p.id !== id);
    persistProjectsToStorage(filtered);
    set((state) => ({
      projects: filtered,
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  updateProjectRoadmap: (projectId, roadmap) => {
    const projects = get().projects.map((p) => {
      if (p.id === projectId) {
        return { ...p, roadmap, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    persistProjectsToStorage(projects);
    const curr = get().currentProject;
    set({
      projects,
      currentProject: curr?.id === projectId ? { ...curr, roadmap } : curr,
    });
  },

  toggleRoadmapTask: (projectId, taskId) => {
    const projects = get().projects.map((p) => {
      if (p.id === projectId && p.roadmap) {
        const updatedPhases = p.roadmap.phases.map((phase) => ({
          ...phase,
          tasks: phase.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        }));
        const updatedRoadmap = { ...p.roadmap, phases: updatedPhases };
        return { ...p, roadmap: updatedRoadmap, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    persistProjectsToStorage(projects);
    const curr = get().currentProject;
    if (curr?.id === projectId && curr.roadmap) {
      const updatedPhases = curr.roadmap.phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
      }));
      set({
        projects,
        currentProject: { ...curr, roadmap: { ...curr.roadmap, phases: updatedPhases } },
      });
    } else {
      set({ projects });
    }
  },

  updateSuggestionStatus: (projectId, suggestionId, status) => {
    const projects = get().projects.map((p) => {
      if (p.id === projectId) {
        const updatedSug = p.suggestions.map((s) => (s.id === suggestionId ? { ...s, status } : s));
        return { ...p, suggestions: updatedSug, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    persistProjectsToStorage(projects);
    const curr = get().currentProject;
    if (curr?.id === projectId) {
      const updatedSug = curr.suggestions.map((s) => (s.id === suggestionId ? { ...s, status } : s));
      set({ projects, currentProject: { ...curr, suggestions: updatedSug } });
    } else {
      set({ projects });
    }
  },

  addCopilotMessage: (projectId, msg) => {
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sender: msg.sender,
      text: msg.text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const projects = get().projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          copilotMessages: [...(p.copilotMessages || []), newMsg],
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    persistProjectsToStorage(projects);
    const curr = get().currentProject;
    if (curr?.id === projectId) {
      set({
        projects,
        currentProject: {
          ...curr,
          copilotMessages: [...(curr.copilotMessages || []), newMsg],
        },
      });
    } else {
      set({ projects });
    }
  },

  hydrateStore: () => {
    if (get().isHydrated) return;
    const stored = loadProjectsFromStorage();
    set({ projects: stored, isHydrated: true });
  },
}));
