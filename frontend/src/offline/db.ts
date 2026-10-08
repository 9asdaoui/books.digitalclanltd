const DB_NAME = "digital-clan-books-offline";
const DB_VERSION = 1;
const STORE_BOOKS = "books";

export interface OfflineBookRecord {
  id: string;
  title: string;
  content: string;
  savedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: "id" });
      }
    };
  });
}

export async function saveBook(record: OfflineBookRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKS, "readwrite");
    tx.objectStore(STORE_BOOKS).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBook(id: string): Promise<OfflineBookRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKS, "readonly");
    const req = tx.objectStore(STORE_BOOKS).get(id);
    req.onsuccess = () => resolve(req.result as OfflineBookRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function listOfflineBooks(): Promise<OfflineBookRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKS, "readonly");
    const req = tx.objectStore(STORE_BOOKS).getAll();
    req.onsuccess = () => resolve((req.result as OfflineBookRecord[]) || []);
    req.onerror = () => reject(req.error);
  });
}
