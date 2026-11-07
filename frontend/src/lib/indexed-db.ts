/**
 * Client-side Local Database (IndexedDB)
 * Stores full JSON retrieved paper payloads (10 to 1,000 papers per project)
 * to save backend database storage and enable instant client-side "Load More" pagination.
 */

const DB_NAME = "Paper2ProjectLocalDB";
const DB_VERSION = 1;
const STORE_PAPERS = "project_papers";

function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PAPERS)) {
        db.createObjectStore(STORE_PAPERS, { keyPath: "projectId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredPaperRecord {
  projectId: string;
  totalPapers: number;
  papers: any[];
  updatedAt: string;
}

/**
 * Save complete retrieved papers batch for a project in IndexedDB.
 */
export async function savePapersToLocalDB(projectId: string, papers: any[]): Promise<void> {
  try {
    const db = await openLocalDB();
    const transaction = db.transaction(STORE_PAPERS, "readwrite");
    const store = transaction.objectStore(STORE_PAPERS);

    const record: StoredPaperRecord = {
      projectId,
      totalPapers: papers.length,
      papers,
      updatedAt: new Date().toISOString(),
    };

    store.put(record);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn("Failed to store papers in IndexedDB, using fallback memory:", err);
  }
}

/**
 * Retrieve paginated papers (e.g. 10 more) directly from IndexedDB.
 */
export async function getPagedPapersFromLocalDB(
  projectId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ papers: any[]; total: number; hasMore: boolean }> {
  try {
    const db = await openLocalDB();
    const transaction = db.transaction(STORE_PAPERS, "readonly");
    const store = transaction.objectStore(STORE_PAPERS);
    const request = store.get(projectId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const record = request.result as StoredPaperRecord | undefined;
        if (!record || !record.papers) {
          resolve({ papers: [], total: 0, hasMore: false });
          return;
        }

        const all = record.papers;
        const start = (page - 1) * pageSize;
        const slice = all.slice(start, start + pageSize);
        const hasMore = start + pageSize < all.length;

        resolve({
          papers: slice,
          total: all.length,
          hasMore,
        });
      };

      request.onerror = () => {
        resolve({ papers: [], total: 0, hasMore: false });
      };
    });
  } catch (err) {
    console.warn("Could not read from IndexedDB:", err);
    return { papers: [], total: 0, hasMore: false };
  }
}

/**
 * Fetch all stored papers for project assistant bot context.
 */
export async function getAllPapersFromLocalDB(projectId: string): Promise<any[]> {
  try {
    const db = await openLocalDB();
    const transaction = db.transaction(STORE_PAPERS, "readonly");
    const store = transaction.objectStore(STORE_PAPERS);
    const request = store.get(projectId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const record = request.result as StoredPaperRecord | undefined;
        resolve(record?.papers || []);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
