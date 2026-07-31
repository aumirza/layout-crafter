import { SavedProject, MediaItem, ProjectExportData } from "@/types/library";

const DB_NAME = "layoutcraft_library_db";
const DB_VERSION = 1;

const STORES = {
  PROJECTS: "projects",
  MEDIA: "media",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: "id" });
        projectStore.createIndex("updatedAt", "updatedAt", { unique: false });
        projectStore.createIndex("title", "title", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.MEDIA)) {
        const mediaStore = db.createObjectStore(STORES.MEDIA, { keyPath: "id" });
        mediaStore.createIndex("addedAt", "addedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper generic for IndexedDB transaction operations
async function getStore(
  storeName: string,
  mode: IDBTransactionMode = "readonly"
): Promise<{ store: IDBObjectStore; tx: IDBTransaction }> {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  return { store, tx };
}

/* ==========================================================================
   PROJECT OPERATIONS
   ========================================================================== */

export async function getAllProjects(): Promise<SavedProject[]> {
  try {
    const { store } = await getStore(STORES.PROJECTS, "readonly");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const projects = (request.result as SavedProject[]) || [];
        projects.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(projects);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load projects from IndexedDB:", err);
    return [];
  }
}

export async function getProject(id: string): Promise<SavedProject | null> {
  try {
    const { store } = await getStore(STORES.PROJECTS, "readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve((request.result as SavedProject) || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`Failed to load project ${id}:`, err);
    return null;
  }
}

export async function saveProject(project: SavedProject): Promise<SavedProject> {
  const updatedProject: SavedProject = {
    ...project,
    updatedAt: Date.now(),
  };

  const { store } = await getStore(STORES.PROJECTS, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.put(updatedProject);
    request.onsuccess = () => resolve(updatedProject);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProject(id: string): Promise<boolean> {
  const { store } = await getStore(STORES.PROJECTS, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function duplicateProject(id: string): Promise<SavedProject | null> {
  const original = await getProject(id);
  if (!original) return null;

  const now = Date.now();
  const duplicated: SavedProject = {
    ...original,
    id: `proj_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  return await saveProject(duplicated);
}

export function exportProjectJson(project: SavedProject): void {
  const exportPayload: ProjectExportData = {
    version: "1.0",
    exportedAt: Date.now(),
    project,
  };

  const dataStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const sanitizedTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const filename = `${sanitizedTitle || "layoutcraft-project"}.layoutcraft`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importProjectJson(jsonStr: string): Promise<SavedProject> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Invalid JSON file formatting.");
  }

  let projectData: SavedProject;

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "version" in parsed &&
    "project" in parsed
  ) {
    projectData = (parsed as ProjectExportData).project;
  } else if (
    typeof parsed === "object" &&
    parsed !== null &&
    "state" in parsed &&
    "pageSize" in parsed
  ) {
    projectData = parsed as SavedProject;
  } else {
    throw new Error("Unrecognized project file structure.");
  }

  const now = Date.now();
  const newProject: SavedProject = {
    ...projectData,
    id: `proj_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: projectData.title ? `${projectData.title} (Imported)` : "Imported Layout Project",
    createdAt: now,
    updatedAt: now,
  };

  return await saveProject(newProject);
}

/* ==========================================================================
   MEDIA POOL OPERATIONS
   ========================================================================== */

export async function getAllMedia(): Promise<MediaItem[]> {
  try {
    const { store } = await getStore(STORES.MEDIA, "readonly");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const media = (request.result as MediaItem[]) || [];
        media.sort((a, b) => b.addedAt - a.addedAt);
        resolve(media);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load media from IndexedDB:", err);
    return [];
  }
}

export async function saveMedia(mediaItem: MediaItem): Promise<MediaItem> {
  const { store } = await getStore(STORES.MEDIA, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.put(mediaItem);
    request.onsuccess = () => resolve(mediaItem);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteMedia(id: string): Promise<boolean> {
  const { store } = await getStore(STORES.MEDIA, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}
