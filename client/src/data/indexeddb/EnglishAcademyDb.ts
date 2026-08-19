import { AppError } from "@/core/errors/AppError";

export const DB_NAME = "english-academy";
export const DB_VERSION = 3;

export const stores = {
  courses: "courses", levels: "levels", units: "units", lessons: "lessons", vocabulary: "vocabulary", questions: "questions",
  grammarTopics: "grammarTopics", progress: "progress", vocabularyProgress: "vocabularyProgress", attempts: "attempts", mistakes: "mistakes",
  reviewItems: "reviewItems", settings: "settings", writingDrafts: "writingDrafts",
} as const;

export type StoreName = (typeof stores)[keyof typeof stores];

class EnglishAcademyDb {
  private database?: Promise<IDBDatabase>;

  open(): Promise<IDBDatabase> {
    if (!this.database) {
      this.database = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(new AppError("StorageError", "লোকাল ডাটাবেস চালু করা যায়নি।", request.error));
        request.onupgradeneeded = () => this.migrate(request.result, request.transaction!);
        request.onsuccess = () => resolve(request.result);
      });
    }
    return this.database;
  }

  private migrate(db: IDBDatabase, transaction: IDBTransaction) {
    const create = (name: StoreName, keyPath = "id"): IDBObjectStore => db.objectStoreNames.contains(name) ? transaction.objectStore(name) : db.createObjectStore(name, { keyPath });
    create(stores.courses); create(stores.levels); create(stores.units);
    const lessonStore = create(stores.lessons); if (!lessonStore.indexNames.contains("unitId")) lessonStore.createIndex("unitId", "unitId", { unique: false });
    create(stores.vocabulary); create(stores.grammarTopics);
    const questionStore = create(stores.questions); if (!questionStore.indexNames.contains("lessonId")) questionStore.createIndex("lessonId", "lessonId", { unique: false });
    const progressStore = create(stores.progress); if (!progressStore.indexNames.contains("userLesson")) progressStore.createIndex("userLesson", ["userId", "lessonId"], { unique: true });
    const vocabularyProgressStore = create(stores.vocabularyProgress); if (!vocabularyProgressStore.indexNames.contains("userVocabulary")) vocabularyProgressStore.createIndex("userVocabulary", ["userId", "vocabularyId"], { unique: true });
    create(stores.attempts);
    const mistakeStore = create(stores.mistakes); if (!mistakeStore.indexNames.contains("userQuestion")) mistakeStore.createIndex("userQuestion", ["userId", "questionId"], { unique: false });
    const reviewStore = create(stores.reviewItems); if (!reviewStore.indexNames.contains("due")) reviewStore.createIndex("due", "nextReviewAt", { unique: false });
    create(stores.settings);
    const draftStore = create(stores.writingDrafts); if (!draftStore.indexNames.contains("userPrompt")) draftStore.createIndex("userPrompt", ["userId", "promptId"], { unique: true });
  }

  async get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> { return this.run<T | undefined>(store, "readonly", (objectStore) => objectStore.get(key)); }
  async getAll<T>(store: StoreName): Promise<T[]> { return this.run<T[]>(store, "readonly", (objectStore) => objectStore.getAll()); }
  async getByIndex<T>(store: StoreName, index: string, key: IDBValidKey): Promise<T[]> { return this.run<T[]>(store, "readonly", (objectStore) => objectStore.index(index).getAll(key)); }
  async put<T>(store: StoreName, value: T): Promise<void> { await this.run<IDBValidKey>(store, "readwrite", (objectStore) => objectStore.put(value)); }
  async clear(store: StoreName): Promise<void> { await this.run<undefined>(store, "readwrite", (objectStore) => objectStore.clear()); }

  private async run<T>(store: StoreName, mode: IDBTransactionMode, action: (objectStore: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.open();
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(store, mode); const request = action(transaction.objectStore(store));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new AppError("StorageError", "লোকাল তথ্য সংরক্ষণ করা যায়নি।", request.error));
      transaction.onerror = () => reject(new AppError("StorageError", "লোকাল তথ্য প্রক্রিয়াকরণে সমস্যা হয়েছে।", transaction.error));
    });
  }
}

export const englishAcademyDb = new EnglishAcademyDb();
