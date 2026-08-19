import { phase0Seed } from "@/data/content/phase0Seed";
import type { Chapter, LearningSeed, Lesson, McqQuestion, Question, Skill, Unit, VocabularyItem } from "@/domain/learning/types";

const timestamp = "2026-08-19T00:00:00.000Z";
const base = { schemaVersion: 4, updatedAt: timestamp, createdAt: timestamp, contentVersion: "2.0", status: "published" as const };

type ExtensionLesson = {
  id: string; unitId: string; title: string; banglaTitle: string; order: number; text: string; example: string; banglaExample: string;
  word: string; meaning: string; skill: Skill; questionPrompt: string; correct: string; wrong: string[];
};

const extensions: ExtensionLesson[] = [
  { id: "lesson-prea1-first-sounds", unitId: "unit-prea1-start", title: "First English sounds", banglaTitle: "প্রথম ইংরেজি ধ্বনি", order: 1, text: "ইংরেজি শব্দ ছোট ছোট ধ্বনি দিয়ে তৈরি হয়। আজ শোনো, বলো এবং একটি শব্দ চিনে নাও।", example: "A is for apple.", banglaExample: "A দিয়ে apple বোঝায়।", word: "apple", meaning: "আপেল", skill: "pronunciation", questionPrompt: "Which word begins with A?", correct: "apple", wrong: ["book", "cat", "dog"] },
  { id: "lesson-prea1-classroom", unitId: "unit-prea1-start", title: "Classroom words", banglaTitle: "ক্লাসরুমের শব্দ", order: 2, text: "শেখার জায়গার কয়েকটি পরিচিত শব্দ দিয়ে শুরু করো।", example: "This is a book.", banglaExample: "এটি একটি বই।", word: "book", meaning: "বই", skill: "vocabulary", questionPrompt: "Choose the word for ‘বই’.", correct: "book", wrong: ["pen", "door", "chair"] },
  { id: "lesson-prea1-my-name", unitId: "unit-prea1-start", title: "My first sentence", banglaTitle: "আমার প্রথম বাক্য", order: 3, text: "নিজের নাম বলা একটি গুরুত্বপূর্ণ প্রথম ধাপ।", example: "My name is Rafi.", banglaExample: "আমার নাম রাফি।", word: "name", meaning: "নাম", skill: "speaking", questionPrompt: "Choose the sentence for introducing your name.", correct: "My name is Rafi.", wrong: ["I name Rafi.", "Name my Rafi.", "Rafi am name."] },
  { id: "lesson-a1-schedule", unitId: "unit-a1-routine", title: "My schedule", banglaTitle: "আমার সময়সূচি", order: 3, text: "সময় বললে দিনের কাজগুলো সহজে সাজানো যায়।", example: "I study at seven.", banglaExample: "আমি সাতটায় পড়ি।", word: "schedule", meaning: "সময়সূচি", skill: "writing", questionPrompt: "Which sentence tells a time?", correct: "I study at seven.", wrong: ["I seven study.", "Study I at.", "At study seven."] },
  { id: "lesson-a1-family", unitId: "unit-a1-people", title: "My family", banglaTitle: "আমার পরিবার", order: 1, text: "পরিবারের মানুষদের সহজ পরিচয় দিয়ে বলা শেখো।", example: "She is my sister.", banglaExample: "সে আমার বোন।", word: "sister", meaning: "বোন", skill: "speaking", questionPrompt: "Choose the sentence about family.", correct: "She is my sister.", wrong: ["She sister my.", "My is sister she.", "Sister is my she."] },
  { id: "lesson-a1-people-work", unitId: "unit-a1-people", title: "People at work", banglaTitle: "কাজের মানুষ", order: 2, text: "মানুষের কাজ বলার সময় job word-এর আগে a বা an ব্যবহার করতে পারো।", example: "He is a driver.", banglaExample: "সে একজন চালক।", word: "driver", meaning: "চালক", skill: "vocabulary", questionPrompt: "Which word names a job?", correct: "driver", wrong: ["family", "morning", "home"] },
  { id: "lesson-a1-describe", unitId: "unit-a1-people", title: "Describe a person", banglaTitle: "একজন মানুষকে বর্ণনা", order: 3, text: "নাম, সম্পর্ক আর একটি সহজ তথ্য দিয়ে কাউকে বর্ণনা করা যায়।", example: "My friend is kind.", banglaExample: "আমার বন্ধু দয়ালু।", word: "kind", meaning: "দয়ালু", skill: "writing", questionPrompt: "Choose the describing word.", correct: "kind", wrong: ["seven", "from", "today"] },
  { id: "lesson-a1-home", unitId: "unit-a1-daily-life", title: "At home", banglaTitle: "বাড়িতে", order: 1, text: "ঘরের পরিচিত জিনিস দিয়ে ছোট বাক্য বলো।", example: "The door is open.", banglaExample: "দরজাটি খোলা।", word: "door", meaning: "দরজা", skill: "reading", questionPrompt: "Which word is something in a home?", correct: "door", wrong: ["teacher", "morning", "friend"] },
  { id: "lesson-a1-food-time", unitId: "unit-a1-daily-life", title: "Food and time", banglaTitle: "খাবার ও সময়", order: 2, text: "খাবার আর সময় একসঙ্গে বললে দৈনন্দিন জীবন নিয়ে কথা বলা যায়।", example: "We eat lunch at one.", banglaExample: "আমরা একটায় দুপুরের খাবার খাই।", word: "lunch", meaning: "দুপুরের খাবার", skill: "listening", questionPrompt: "Which word means a midday meal?", correct: "lunch", wrong: ["morning", "home", "book"] },
  { id: "lesson-a1-plans", unitId: "unit-a1-daily-life", title: "Plans for today", banglaTitle: "আজকের পরিকল্পনা", order: 3, text: "Today দিয়ে আজকের সহজ পরিকল্পনা বলো।", example: "Today I will read.", banglaExample: "আজ আমি পড়ব।", word: "plan", meaning: "পরিকল্পনা", skill: "speaking", questionPrompt: "Which sentence is a plan for today?", correct: "Today I will read.", wrong: ["Yesterday I read.", "Read today I.", "I yesterday read."] },
];

const vocabulary: VocabularyItem[] = extensions.map((item, index) => ({ ...base, id: `vocab-${item.word}-${index + 1}`, word: item.word, meaning: item.meaning, definition: `A useful early English word: ${item.word}.`, partOfSpeech: "noun", pronunciation: item.word, example: item.example, topic: item.unitId, level: item.id.startsWith("lesson-prea1") ? "Pre-A1" : "A1", difficulty: 1, synonyms: [], antonyms: [], collocations: [] }));

const questions: McqQuestion[] = extensions.map((item, index) => ({ ...base, id: `q-${item.id}`, lessonId: item.id, type: "mcq", prompt: item.questionPrompt, banglaPrompt: "সঠিক উত্তরটি বেছে নাও।", explanation: `সঠিক উত্তর: ${item.correct}`, skill: item.skill, difficulty: 1, tags: [item.skill, "phase2-sample"], options: [item.correct, ...item.wrong].map((text, option) => ({ id: `q-${item.id}-${option + 1}`, text })), correctOptionId: `q-${item.id}-1` }));

const lessons: Lesson[] = extensions.map((item, index) => {
  const vocabularyId = vocabulary[index].id;
  const questionId = questions[index].id;
  return { ...base, id: item.id, unitId: item.unitId, title: item.title, banglaTitle: item.banglaTitle, objectives: [`${item.word} শব্দটি চিনতে পারা`, "একটি সহজ ইংরেজি বাক্য ব্যবহার করা"], skillFocus: [item.skill], estimatedMinutes: 8, order: item.order, vocabularyIds: [vocabularyId], questionIds: [questionId], tags: ["phase2-sample", item.skill], difficultyBand: "beginner", completionPolicy: { requiredQuestionIds: [questionId], minimumScore: 100, allowSkip: false, allowTestOut: false }, blocks: [
    { id: `${item.id}-heading`, type: "heading", text: item.banglaTitle },
    { id: `${item.id}-explanation`, type: "explanation", title: "আজ কী শিখবে", text: item.text, tip: "উদাহরণটি ধীরে জোরে পড়ো।" },
    { id: `${item.id}-example`, type: "example", english: item.example, bangla: item.banglaExample },
    { id: `${item.id}-dialogue`, type: "dialogue", title: "ছোট কথোপকথন", turns: [{ speaker: "A", english: item.example, bangla: item.banglaExample }, { speaker: "B", english: "Thank you.", bangla: "ধন্যবাদ।" }] },
    { id: `${item.id}-vocabulary`, type: "vocabulary", vocabularyIds: [vocabularyId] },
    { id: `${item.id}-audio`, type: "audio", label: "শোনো ও বলো", transcript: item.example },
    { id: `${item.id}-question`, type: "question", questionId },
    { id: `${item.id}-writing`, type: "writing", promptId: `prompt-${item.id}`, prompt: `Write one sentence using “${item.word}”.`, minWords: 3, hint: "ছোট বাক্যই যথেষ্ট।" },
    { id: `${item.id}-self-check`, type: "self-check", prompt: "কেমন লাগল?", options: ["Easy", "Okay", "Difficult"] },
    { id: `${item.id}-review`, type: "review", text: "একটি নতুন শব্দ এবং একটি ছোট বাক্য আবার বলো।" },
  ] };
});

const phase2Units: Unit[] = [
  { ...base, id: "unit-prea1-start", levelId: "level-pre-a1", title: "First English", summary: "ধ্বনি, পরিচিত শব্দ এবং প্রথম বাক্য।", objective: "ইংরেজির প্রথম শব্দে স্বাচ্ছন্দ্য তৈরি করা।", lessonIds: ["lesson-prea1-first-sounds", "lesson-prea1-classroom", "lesson-prea1-my-name"], chapterIds: ["chapter-prea1-start"], order: 1, completionPolicy: { requiredQuestionIds: questions.slice(0, 3).map((item) => item.id) } },
  { ...base, id: "unit-a1-people", levelId: "level-a1", title: "People and family", summary: "পরিবার, পরিচিত মানুষ এবং সহজ বর্ণনা।", objective: "পরিচিত মানুষ নিয়ে সহজ বাক্য বলা।", lessonIds: ["lesson-a1-family", "lesson-a1-people-work", "lesson-a1-describe"], chapterIds: ["chapter-a1-people"], order: 3, prerequisites: [{ kind: "unit", id: "unit-a1-routine" }] },
  { ...base, id: "unit-a1-daily-life", levelId: "level-a1", title: "Daily life", summary: "বাড়ি, খাবার, সময় ও ছোট পরিকল্পনা।", objective: "দৈনন্দিন জীবন নিয়ে ছোট কথোপকথন করা।", lessonIds: ["lesson-a1-home", "lesson-a1-food-time", "lesson-a1-plans"], chapterIds: ["chapter-a1-daily"], order: 4, prerequisites: [{ kind: "unit", id: "unit-a1-people" }] },
];

const chapters: Chapter[] = [
  { ...base, id: "chapter-prea1-start", unitId: "unit-prea1-start", title: "Start with confidence", banglaTitle: "আত্মবিশ্বাসের শুরু", summary: "ছোট ধাপে প্রথম ইংরেজি ব্যবহার।", lessonIds: phase2Units[0].lessonIds, order: 1 },
  { ...base, id: "chapter-a1-hello", unitId: "unit-a1-hello", title: "Meeting people", banglaTitle: "মানুষের সঙ্গে দেখা", summary: "অভিবাদন ও পরিচয়ের ভিত্তি।", lessonIds: ["lesson-a1-greetings", "lesson-a1-introduce", "lesson-a1-be-verbs"], order: 1 },
  { ...base, id: "chapter-a1-routine", unitId: "unit-a1-routine", title: "Daily rhythm", banglaTitle: "দিনের ছন্দ", summary: "সময়, কাজ এবং নিয়মিত অভ্যাস।", lessonIds: ["lesson-a1-routine", "lesson-a1-present", "lesson-a1-schedule"], order: 1 },
  { ...base, id: "chapter-a1-people", unitId: "unit-a1-people", title: "People around you", banglaTitle: "তোমার চারপাশের মানুষ", summary: "পরিবার ও পরিচিত মানুষ।", lessonIds: phase2Units[1].lessonIds, order: 1 },
  { ...base, id: "chapter-a1-daily", unitId: "unit-a1-daily-life", title: "Everyday moments", banglaTitle: "প্রতিদিনের মুহূর্ত", summary: "বাড়ি, খাবার ও পরিকল্পনা।", lessonIds: phase2Units[2].lessonIds, order: 1 },
];

export const phase2Seed: LearningSeed = {
  courses: phase0Seed.courses.map((course) => ({ ...course, ...base, description: "Bangla-speaking learners-এর জন্য offline-first, CEFR-aligned English learning path.", tags: ["cefr", "offline", "phase2"] })),
  levels: phase0Seed.levels.map((level) => {
    if (level.id === "level-pre-a1") return { ...level, ...base, availability: "available" as const, unitIds: ["unit-prea1-start"], objective: "চেনা শব্দ ও এক লাইনের পরিচয়ে আত্মবিশ্বাস।" };
    if (level.id === "level-a1") return { ...level, ...base, availability: "available" as const, unitIds: ["unit-a1-hello", "unit-a1-routine", "unit-a1-people", "unit-a1-daily-life"], objective: "পরিচয় ও দৈনন্দিন জীবন নিয়ে সহজ যোগাযোগ।", prerequisites: [{ kind: "level", id: "level-pre-a1" }] };
    if (level.id === "level-a2") return { ...level, ...base, prerequisites: [{ kind: "level", id: "level-a1" }] };
    return { ...level, ...base };
  }),
  units: [...phase0Seed.units.map((unit) => {
    if (unit.id === "unit-a1-hello") return { ...unit, ...base, chapterIds: ["chapter-a1-hello"], prerequisites: [{ kind: "level" as const, id: "level-pre-a1" }] };
    if (unit.id === "unit-a1-routine") return { ...unit, ...base, lessonIds: [...unit.lessonIds, "lesson-a1-schedule"], chapterIds: ["chapter-a1-routine"], prerequisites: [{ kind: "unit" as const, id: "unit-a1-hello" }] };
    return { ...unit, ...base };
  }), ...phase2Units],
  chapters,
  lessons: [...phase0Seed.lessons.map((lesson) => ({ ...lesson, ...base, tags: ["phase1-migrated", ...lesson.skillFocus], completionPolicy: { requiredQuestionIds: lesson.questionIds, minimumScore: 67, allowSkip: false, allowTestOut: false }, difficultyBand: lesson.unitId.startsWith("unit-a2") ? "elementary" as const : "beginner" as const })), ...lessons],
  vocabulary: [...phase0Seed.vocabulary.map((item) => ({ ...item, ...base, tags: [item.level, item.topic] })), ...vocabulary],
  questions: [...phase0Seed.questions.map((item) => ({ ...item, ...base, contentVersion: "2.0" })), ...questions] as Question[],
  grammarTopics: phase0Seed.grammarTopics.map((item) => ({ ...item, ...base, tags: [item.level, "grammar"] })),
};
