import { AppError } from "@/core/errors/AppError";

export const DB_NAME = "english-academy";
export const DB_VERSION = 10;

export const stores = {
  courses: "courses", levels: "levels", units: "units", chapters: "chapters", lessons: "lessons", vocabulary: "vocabulary", questions: "questions",
  grammarTopics: "grammarTopics", grammarConcepts: "grammarConcepts", vocabularySources: "vocabularySources", sentences: "sentences", srsCards: "srsCards",
  progress: "progress", activityProgress: "activityProgress", vocabularyProgress: "vocabularyProgress", attempts: "attempts", mistakes: "mistakes",
  reviewItems: "reviewItems", objectives: "objectives", bookmarks: "bookmarks", notes: "notes", sessions: "sessions", settings: "settings", writingDrafts: "writingDrafts",
  skillActivities: "skillActivities", skillSources: "skillSources", phrases: "phrases", skillAttempts: "skillAttempts", skillErrors: "skillErrors", skillMastery: "skillMastery",
  assessmentSources: "assessmentSources", assessmentQuestions: "assessmentQuestions", assessmentBlueprints: "assessmentBlueprints", assessmentSessions: "assessmentSessions", assessmentAnswers: "assessmentAnswers", assessmentResults: "assessmentResults", educationalCertificates: "educationalCertificates",
  personalProfiles: "personalProfiles", learningGoals: "learningGoals", personalLearningEvents: "personalLearningEvents", xpLedger: "xpLedger", studyDays: "studyDays", achievementDefinitions: "achievementDefinitions", achievementProgress: "achievementProgress", dailyStudyPlans: "dailyStudyPlans",
  librarySources: "librarySources", libraryCategories: "libraryCategories", libraryResources: "libraryResources", libraryActivities: "libraryActivities", librarySearchHistory: "librarySearchHistory",
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
    const create = (name: StoreName, keyPath = "id") => db.objectStoreNames.contains(name) ? transaction.objectStore(name) : db.createObjectStore(name, { keyPath });
    const index = (store: IDBObjectStore, name: string, keyPath: string | string[], unique = false) => { if (!store.indexNames.contains(name)) store.createIndex(name, keyPath, { unique }); };

    create(stores.courses);
    const levelStore = create(stores.levels); index(levelStore, "courseId", "courseId");
    const unitStore = create(stores.units); index(unitStore, "levelId", "levelId");
    const chapterStore = create(stores.chapters); index(chapterStore, "unitId", "unitId");
    const lessonStore = create(stores.lessons); index(lessonStore, "unitId", "unitId"); index(lessonStore, "chapterId", "chapterId");
    const vocabularyStore = create(stores.vocabulary);
    index(vocabularyStore, "word", "word"); index(vocabularyStore, "lemma", "lemma"); index(vocabularyStore, "level", "level"); index(vocabularyStore, "topic", "topic");
    index(vocabularyStore, "partOfSpeech", "partOfSpeech"); index(vocabularyStore, "levelTopic", ["level", "topic"]); index(vocabularyStore, "sourceId", "sourceId");
    create(stores.grammarTopics);
    const grammarConceptStore = create(stores.grammarConcepts); index(grammarConceptStore, "level", "level"); index(grammarConceptStore, "category", "category"); index(grammarConceptStore, "levelCategory", ["level", "category"]);
    create(stores.vocabularySources);
    const sentenceStore = create(stores.sentences); index(sentenceStore, "vocabularyId", "vocabularyId"); index(sentenceStore, "sourceId", "sourceId");
    const srsStore = create(stores.srsCards); index(srsStore, "userVocabulary", ["userId", "vocabularyId"], true); index(srsStore, "nextReview", "nextReviewAt"); index(srsStore, "masteryState", "masteryState"); index(srsStore, "userMastery", ["userId", "masteryState"]);
    const questionStore = create(stores.questions); index(questionStore, "lessonId", "lessonId");
    const progressStore = create(stores.progress); index(progressStore, "userLesson", ["userId", "lessonId"], true);
    const activityStore = create(stores.activityProgress); index(activityStore, "userBlock", ["userId", "lessonId", "blockId"], true); index(activityStore, "lessonId", "lessonId");
    const vocabularyProgressStore = create(stores.vocabularyProgress); index(vocabularyProgressStore, "userVocabulary", ["userId", "vocabularyId"], true);
    create(stores.attempts);
    const mistakeStore = create(stores.mistakes); index(mistakeStore, "userQuestion", ["userId", "questionId"]);
    const reviewStore = create(stores.reviewItems); index(reviewStore, "due", "nextReviewAt");
    const objectiveStore = create(stores.objectives); index(objectiveStore, "userObjective", ["userId", "lessonId", "objective"], true);
    const bookmarkStore = create(stores.bookmarks); index(bookmarkStore, "userContent", ["userId", "contentId"], true); index(bookmarkStore, "userType", ["userId", "contentType"]);
    const noteStore = create(stores.notes); index(noteStore, "userContent", ["userId", "contentId"], true);
    const sessionStore = create(stores.sessions); index(sessionStore, "userStarted", ["userId", "startedAt"]);
    create(stores.settings);
    const draftStore = create(stores.writingDrafts); index(draftStore, "userPrompt", ["userId", "promptId"], true);
    const skillActivityStore = create(stores.skillActivities); index(skillActivityStore, "skill", "skill"); index(skillActivityStore, "level", "level"); index(skillActivityStore, "stage", "stage"); index(skillActivityStore, "skillLevel", ["skill", "level"]); index(skillActivityStore, "skillStage", ["skill", "stage"]);
    create(stores.skillSources);
    const phraseStore = create(stores.phrases); index(phraseStore, "topic", "topic"); index(phraseStore, "level", "level"); index(phraseStore, "topicLevel", ["topic", "level"]);
    const skillAttemptStore = create(stores.skillAttempts); index(skillAttemptStore, "userActivity", ["userId", "activityId"]); index(skillAttemptStore, "userSkill", ["userId", "skill"]); index(skillAttemptStore, "activityId", "activityId");
    const skillErrorStore = create(stores.skillErrors); index(skillErrorStore, "userSkill", ["userId", "skill"]); index(skillErrorStore, "userActivity", ["userId", "activityId"]); index(skillErrorStore, "resolved", "resolved");
    const skillMasteryStore = create(stores.skillMastery); index(skillMasteryStore, "userSkill", ["userId", "skill"], true);
    create(stores.assessmentSources);
    const assessmentQuestionStore = create(stores.assessmentQuestions); index(assessmentQuestionStore, "approved", "approved"); index(assessmentQuestionStore, "skill", "skill"); index(assessmentQuestionStore, "level", "level"); index(assessmentQuestionStore, "sourceId", "sourceId"); index(assessmentQuestionStore, "approvedSkill", ["approved", "skill"]); index(assessmentQuestionStore, "approvedLevel", ["approved", "level"]);
    const assessmentBlueprintStore = create(stores.assessmentBlueprints); index(assessmentBlueprintStore, "assessmentType", "assessmentType"); index(assessmentBlueprintStore, "level", "level");
    const assessmentSessionStore = create(stores.assessmentSessions); index(assessmentSessionStore, "userStatus", ["userId", "status"]); index(assessmentSessionStore, "userBlueprint", ["userId", "blueprintId"]); index(assessmentSessionStore, "status", "status");
    const assessmentAnswerStore = create(stores.assessmentAnswers); index(assessmentAnswerStore, "sessionId", "sessionId"); index(assessmentAnswerStore, "sessionQuestion", ["sessionId", "questionId"], true);
    const assessmentResultStore = create(stores.assessmentResults); index(assessmentResultStore, "userCompleted", ["userId", "completedAt"]); index(assessmentResultStore, "userBlueprint", ["userId", "blueprintId"]); index(assessmentResultStore, "assessmentType", "assessmentType");
    const certificateStore = create(stores.educationalCertificates); index(certificateStore, "userIssued", ["userId", "issuedAt"]); index(certificateStore, "certificateNumber", "certificateNumber", true);
    const profileStore = create(stores.personalProfiles); index(profileStore, "userId", "userId", true);
    const goalStore = create(stores.learningGoals); index(goalStore, "userPeriodStatus", ["userId", "period", "goalStatus"]); index(goalStore, "userEndsOn", ["userId", "endsOn"]);
    const personalEventStore = create(stores.personalLearningEvents); index(personalEventStore, "userOccurred", ["userId", "occurredAt"]); index(personalEventStore, "userEventKey", ["userId", "eventKey"], true); index(personalEventStore, "type", "type");
    const xpLedgerStore = create(stores.xpLedger); index(xpLedgerStore, "userOccurred", ["userId", "occurredAt"]); index(xpLedgerStore, "eventId", "eventId", true);
    const studyDayStore = create(stores.studyDays); index(studyDayStore, "userDate", ["userId", "date"], true);
    const achievementDefinitionStore = create(stores.achievementDefinitions); index(achievementDefinitionStore, "code", "code", true); index(achievementDefinitionStore, "criterion", "criterion");
    const achievementProgressStore = create(stores.achievementProgress); index(achievementProgressStore, "userAchievement", ["userId", "achievementId"], true); index(achievementProgressStore, "userAchievementStatus", ["userId", "achievementStatus"]);
    const studyPlanStore = create(stores.dailyStudyPlans); index(studyPlanStore, "userDate", ["userId", "date"], true);
    const librarySourceStore = create(stores.librarySources); index(librarySourceStore, "license", "license");
    const libraryCategoryStore = create(stores.libraryCategories); index(libraryCategoryStore, "slug", "slug", true); index(libraryCategoryStore, "order", "order");
    const libraryResourceStore = create(stores.libraryResources); index(libraryResourceStore, "categoryId", "categoryId"); index(libraryResourceStore, "type", "type"); index(libraryResourceStore, "level", "level"); index(libraryResourceStore, "categoryType", ["categoryId", "type"]); index(libraryResourceStore, "typeLevel", ["type", "level"]); index(libraryResourceStore, "searchTerms", "searchTerms", false);
    const libraryActivityStore = create(stores.libraryActivities); index(libraryActivityStore, "userResource", ["userId", "resourceId"], true); index(libraryActivityStore, "userViewed", ["userId", "lastViewedAt"]);
    const libraryHistoryStore = create(stores.librarySearchHistory); index(libraryHistoryStore, "userSearched", ["userId", "searchedAt"]); index(libraryHistoryStore, "userNormalizedQuery", ["userId", "normalizedQuery"]);
  }

  async get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> { return this.run<T | undefined>(store, "readonly", (objectStore) => objectStore.get(key)); }
  async getAll<T>(store: StoreName): Promise<T[]> { return this.run<T[]>(store, "readonly", (objectStore) => objectStore.getAll()); }
  async getByIndex<T>(store: StoreName, index: string, key: IDBValidKey): Promise<T[]> { return this.run<T[]>(store, "readonly", (objectStore) => objectStore.index(index).getAll(key)); }
  async getByIndexRange<T>(store: StoreName, index: string, range: IDBKeyRange, limit?: number): Promise<T[]> { return this.run<T[]>(store, "readonly", (objectStore) => objectStore.index(index).getAll(range, limit)); }
  async countByIndex(store: StoreName, index: string, query?: IDBValidKey | IDBKeyRange): Promise<number> {
    return this.run<number>(store, "readonly", (objectStore) => query === undefined ? objectStore.index(index).count() : objectStore.index(index).count(query));
  }
  async getPage<T>(store: StoreName, options: { index?: string; query?: IDBValidKey | IDBKeyRange | null; offset?: number; limit: number; direction?: IDBCursorDirection } ): Promise<{ items: T[]; total: number }> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readonly");
      const objectStore = transaction.objectStore(store);
      const source: IDBObjectStore | IDBIndex = options.index ? objectStore.index(options.index) : objectStore;
      const query = options.query ?? undefined;
      const items: T[] = [];
      let skipped = 0;
      const offset = Math.max(0, options.offset ?? 0);
      const cursor = source.openCursor(query, options.direction ?? "next");
      const count = source.count(query);
      cursor.onerror = () => reject(new AppError("StorageError", "লোকাল তথ্য প্রক্রিয়াকরণে সমস্যা হয়েছে।", cursor.error));
      count.onerror = () => reject(new AppError("StorageError", "লোকাল তথ্য গণনা করা যায়নি।", count.error));
      cursor.onsuccess = () => {
        const current = cursor.result;
        if (!current || items.length >= options.limit) return;
        if (skipped < offset) { skipped += 1; current.continue(); return; }
        items.push(current.value as T);
        current.continue();
      };
      transaction.oncomplete = () => resolve({ items, total: count.result ?? 0 });
      transaction.onerror = () => reject(new AppError("StorageError", "লোকাল তথ্য প্রক্রিয়াকরণে সমস্যা হয়েছে।", transaction.error));
    });
  }
  async getFilteredPage<T>(store: StoreName, options: { index?: string; query?: IDBValidKey | IDBKeyRange | null; offset?: number; limit: number; matches: (value: T) => boolean; direction?: IDBCursorDirection }): Promise<{ items: T[]; total: number }> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readonly");
      const objectStore = transaction.objectStore(store);
      const source: IDBObjectStore | IDBIndex = options.index ? objectStore.index(options.index) : objectStore;
      const items: T[] = []; let matched = 0; const offset = Math.max(0, options.offset ?? 0);
      const cursor = source.openCursor(options.query ?? undefined, options.direction ?? "next");
      cursor.onerror = () => reject(new AppError("StorageError", "লোকাল তথ্য প্রক্রিয়াকরণে সমস্যা হয়েছে।", cursor.error));
      cursor.onsuccess = () => {
        const current = cursor.result;
        if (!current) return;
        const value = current.value as T;
        if (options.matches(value)) {
          if (matched >= offset && items.length < options.limit) items.push(value);
          matched += 1;
        }
        current.continue();
      };
      transaction.oncomplete = () => resolve({ items, total: matched });
      transaction.onerror = () => reject(new AppError("StorageError", "লোকাল তথ্য প্রক্রিয়াকরণে সমস্যা হয়েছে।", transaction.error));
    });
  }
  async put<T>(store: StoreName, value: T): Promise<void> { await this.run<IDBValidKey>(store, "readwrite", (objectStore) => objectStore.put(value)); }
  async putMany<T>(store: StoreName, values: T[]): Promise<void> {
    if (!values.length) return;
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);
      for (const value of values) objectStore.put(value);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new AppError("StorageError", "লোকাল তথ্যের একটি batch সংরক্ষণ করা যায়নি।", transaction.error));
      transaction.onabort = () => reject(new AppError("StorageError", "লোকাল তথ্যের batch সংরক্ষণ বাতিল হয়েছে।", transaction.error));
    });
  }
  async count(store: StoreName): Promise<number> { return this.run<number>(store, "readonly", (objectStore) => objectStore.count()); }
  async delete(store: StoreName, key: IDBValidKey): Promise<void> { await this.run<undefined>(store, "readwrite", (objectStore) => objectStore.delete(key)); }
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
