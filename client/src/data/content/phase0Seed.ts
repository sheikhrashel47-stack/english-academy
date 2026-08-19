import type { LearningSeed } from "@/domain/learning/types";

const version = 1;
const now = "2026-08-19T00:00:00.000Z";
const base = { schemaVersion: version, updatedAt: now };

export const phase0Seed: LearningSeed = {
  courses: [{
    ...base,
    id: "course-foundations",
    title: "English Foundations",
    banglaTitle: "ইংরেজির ভিত্তি",
    description: "দৈনন্দিন ইংরেজি বাক্য বুঝতে, বলতে ও গড়তে একটি ধাপে ধাপে পথ।",
    levelIds: ["level-a1", "level-a2"],
    contentVersion: "phase0.1",
  }],
  levels: [
    { ...base, id: "level-a1", courseId: "course-foundations", code: "A1", title: "First Steps", summary: "পরিচিত শব্দ ও সহজ বাক্য দিয়ে শুরু।", unitIds: ["unit-a1-hello"], order: 1 },
    { ...base, id: "level-a2", courseId: "course-foundations", code: "A2", title: "Everyday English", summary: "দৈনন্দিন পরিস্থিতিতে সহজ কথোপকথন।", unitIds: ["unit-a2-routine"], order: 2 },
  ],
  units: [
    { ...base, id: "unit-a1-hello", levelId: "level-a1", title: "Hello, English", summary: "নিজের পরিচয় ও ছোট ছোট প্রয়োজনীয় বাক্য।", lessonIds: ["lesson-a1-greetings", "lesson-a1-introduce", "lesson-a1-people"], order: 1 },
    { ...base, id: "unit-a2-routine", levelId: "level-a2", title: "A Day in English", summary: "সময়, কাজ ও প্রতিদিনের কথাবার্তা।", lessonIds: ["lesson-a2-time", "lesson-a2-routine"], order: 1 },
  ],
  lessons: [
    {
      ...base, id: "lesson-a1-greetings", unitId: "unit-a1-hello", title: "Say hello", banglaTitle: "শুভেচ্ছা দিয়ে শুরু", objectives: ["সঠিক greeting নির্বাচন করা", "দিনের সময় অনুযায়ী hello বলা"], skillFocus: ["vocabulary", "speaking"], estimatedMinutes: 6, order: 1, status: "published",
      vocabularyIds: ["vocab-hello", "vocab-good-morning"], questionIds: ["question-greeting-1", "question-greeting-2"],
      blocks: [
        { id: "block-greeting-heading", type: "heading", text: "Start with a greeting" },
        { id: "block-greeting-explain", type: "explanation", title: "একটি ছোট অভ্যাস", text: "কারও সঙ্গে দেখা হলে একটি সহজ greeting কথোপকথনের দরজা খুলে দেয়। সকালে “Good morning”, আর সাধারণভাবে “Hello” ব্যবহার করা যায়।", tip: "শব্দটি জোরে একবার বলো—শোনা ও বলা একসঙ্গে শেখা সহজ হয়।" },
        { id: "block-greeting-example", type: "example", english: "Hello, I’m Rafi.", bangla: "হ্যালো, আমি রাফি।", note: "I’m = I am" },
        { id: "block-greeting-vocabulary", type: "vocabulary", vocabularyIds: ["vocab-hello", "vocab-good-morning"] },
        { id: "block-greeting-question", type: "question", questionId: "question-greeting-1" },
        { id: "block-greeting-review", type: "review", text: "মনে রাখো: greeting ঠিক হলে পরের কথাটি বলা অনেক সহজ।" },
      ],
    },
    { ...base, id: "lesson-a1-introduce", unitId: "unit-a1-hello", title: "Introduce yourself", banglaTitle: "নিজের পরিচয় দাও", objectives: ["নাম বলা", "I am ব্যবহার করা"], skillFocus: ["speaking"], estimatedMinutes: 7, order: 2, status: "published", vocabularyIds: ["vocab-name", "vocab-meet"], questionIds: ["question-intro-1", "question-intro-2"], blocks: [{ id: "block-intro-heading", type: "heading", text: "Your first introduction" }, { id: "block-intro-example", type: "example", english: "My name is Rafi. Nice to meet you.", bangla: "আমার নাম রাফি। তোমার সঙ্গে দেখা হয়ে ভালো লাগল।" }, { id: "block-intro-question", type: "question", questionId: "question-intro-1" }] },
    { ...base, id: "lesson-a1-people", unitId: "unit-a1-hello", title: "People around you", banglaTitle: "তোমার চারপাশের মানুষ", objectives: ["পরিবারের মানুষ চেনা"], skillFocus: ["vocabulary"], estimatedMinutes: 6, order: 3, status: "published", vocabularyIds: ["vocab-friend", "vocab-family"], questionIds: ["question-people-1", "question-people-2"], blocks: [{ id: "block-people-heading", type: "heading", text: "People you know" }, { id: "block-people-explain", type: "explanation", text: "নতুন শব্দকে নিজের জীবনের সঙ্গে যুক্ত করো।" }, { id: "block-people-question", type: "question", questionId: "question-people-1" }] },
    { ...base, id: "lesson-a2-time", unitId: "unit-a2-routine", title: "Tell the time", banglaTitle: "সময় বলো", objectives: ["সময় নিয়ে সহজ প্রশ্ন বোঝা"], skillFocus: ["listening", "vocabulary"], estimatedMinutes: 8, order: 1, status: "published", vocabularyIds: ["vocab-today", "vocab-work"], questionIds: ["question-time-1", "question-time-2"], blocks: [{ id: "block-time-heading", type: "heading", text: "Time matters" }, { id: "block-time-example", type: "example", english: "What time is it?", bangla: "কয়টা বাজে?" }, { id: "block-time-question", type: "question", questionId: "question-time-1" }] },
    { ...base, id: "lesson-a2-routine", unitId: "unit-a2-routine", title: "My daily routine", banglaTitle: "আমার প্রতিদিন", objectives: ["দৈনন্দিন কাজ বলা"], skillFocus: ["writing", "speaking"], estimatedMinutes: 9, order: 2, status: "published", vocabularyIds: ["vocab-home", "vocab-learn"], questionIds: ["question-routine-1", "question-routine-2"], blocks: [{ id: "block-routine-heading", type: "heading", text: "A day in your words" }, { id: "block-routine-explain", type: "explanation", text: "ছোট বাক্য দিয়েই routine বলা শুরু করা যায়: I work. I learn. I go home." }, { id: "block-routine-question", type: "question", questionId: "question-routine-1" }] },
  ],
  vocabulary: [
    { ...base, id: "vocab-hello", word: "hello", meaning: "হ্যালো", definition: "a greeting", partOfSpeech: "interjection", pronunciation: "/həˈloʊ/", example: "Hello, Rafi!", topic: "greetings", level: "A1", difficulty: 1, synonyms: ["hi"], antonyms: [], collocations: ["say hello"] },
    { ...base, id: "vocab-good-morning", word: "good morning", meaning: "সুপ্রভাত", definition: "a greeting used before noon", partOfSpeech: "phrase", pronunciation: "/ɡʊd ˈmɔːrnɪŋ/", example: "Good morning, teacher.", topic: "greetings", level: "A1", difficulty: 1, synonyms: [], antonyms: [], collocations: ["say good morning"] },
    { ...base, id: "vocab-name", word: "name", meaning: "নাম", definition: "the word used to identify a person", partOfSpeech: "noun", pronunciation: "/neɪm/", example: "My name is Rafi.", topic: "introduction", level: "A1", difficulty: 1, synonyms: [], antonyms: [], collocations: ["my name"] },
    { ...base, id: "vocab-meet", word: "meet", meaning: "দেখা করা", definition: "to come together with someone", partOfSpeech: "verb", pronunciation: "/miːt/", example: "Nice to meet you.", topic: "introduction", level: "A1", difficulty: 1, synonyms: ["see"], antonyms: [], collocations: ["meet you"] },
    { ...base, id: "vocab-friend", word: "friend", meaning: "বন্ধু", definition: "a person you know and like", partOfSpeech: "noun", pronunciation: "/frend/", example: "He is my friend.", topic: "people", level: "A1", difficulty: 1, synonyms: [], antonyms: [], collocations: ["good friend"] },
    { ...base, id: "vocab-family", word: "family", meaning: "পরিবার", definition: "a group of related people", partOfSpeech: "noun", pronunciation: "/ˈfæməli/", example: "My family is small.", topic: "people", level: "A1", difficulty: 1, synonyms: [], antonyms: [], collocations: ["my family"] },
    { ...base, id: "vocab-today", word: "today", meaning: "আজ", definition: "on this day", partOfSpeech: "adverb", pronunciation: "/təˈdeɪ/", example: "I study today.", topic: "time", level: "A2", difficulty: 1, synonyms: [], antonyms: ["tomorrow"], collocations: ["today is"] },
    { ...base, id: "vocab-work", word: "work", meaning: "কাজ করা", definition: "to do a job or task", partOfSpeech: "verb", pronunciation: "/wɜːrk/", example: "I work in Dhaka.", topic: "routine", level: "A2", difficulty: 1, synonyms: [], antonyms: [], collocations: ["go to work"] },
    { ...base, id: "vocab-home", word: "home", meaning: "বাড়ি", definition: "the place where you live", partOfSpeech: "noun", pronunciation: "/hoʊm/", example: "I go home.", topic: "routine", level: "A2", difficulty: 1, synonyms: ["house"], antonyms: [], collocations: ["go home"] },
    { ...base, id: "vocab-learn", word: "learn", meaning: "শেখা", definition: "to get knowledge or skill", partOfSpeech: "verb", pronunciation: "/lɜːrn/", example: "I learn English.", topic: "study", level: "A2", difficulty: 1, synonyms: ["study"], antonyms: [], collocations: ["learn English"] },
  ],
  questions: [
    { ...base, id: "question-greeting-1", lessonId: "lesson-a1-greetings", type: "mcq", prompt: "Which greeting fits the morning?", banglaPrompt: "সকালে কোন greeting ব্যবহার করবে?", options: [{ id: "q-g1-a", text: "Good morning" }, { id: "q-g1-b", text: "Good night" }, { id: "q-g1-c", text: "Goodbye" }], correctOptionId: "q-g1-a", explanation: "সকালে দেখা হলে “Good morning” বলা হয়।", skill: "vocabulary", difficulty: 1, tags: ["greeting", "morning"] },
    { ...base, id: "question-greeting-2", lessonId: "lesson-a1-greetings", type: "mcq", prompt: "Choose the most common general greeting.", banglaPrompt: "সাধারণভাবে সবচেয়ে প্রচলিত greeting কোনটি?", options: [{ id: "q-g2-a", text: "Hello" }, { id: "q-g2-b", text: "Thank you" }, { id: "q-g2-c", text: "Sorry" }], correctOptionId: "q-g2-a", explanation: "“Hello” একটি সাধারণ greeting।", skill: "vocabulary", difficulty: 1, tags: ["greeting"] },
    { ...base, id: "question-intro-1", lessonId: "lesson-a1-introduce", type: "mcq", prompt: "Complete: My ___ is Rafi.", banglaPrompt: "বাক্যটি পূরণ করো: My ___ is Rafi.", options: [{ id: "q-i1-a", text: "name" }, { id: "q-i1-b", text: "morning" }, { id: "q-i1-c", text: "home" }], correctOptionId: "q-i1-a", explanation: "নাম বলার জন্য “My name is ...” ব্যবহার করা হয়।", skill: "speaking", difficulty: 1, tags: ["introduction"] },
    { ...base, id: "question-intro-2", lessonId: "lesson-a1-introduce", type: "mcq", prompt: "Which phrase is polite after an introduction?", options: [{ id: "q-i2-a", text: "Nice to meet you" }, { id: "q-i2-b", text: "Good night" }, { id: "q-i2-c", text: "Go home" }], correctOptionId: "q-i2-a", explanation: "পরিচয়ের পরে “Nice to meet you” বলা যায়।", skill: "speaking", difficulty: 1, tags: ["introduction"] },
    { ...base, id: "question-people-1", lessonId: "lesson-a1-people", type: "mcq", prompt: "A person you know and like is a ___.", options: [{ id: "q-p1-a", text: "friend" }, { id: "q-p1-b", text: "morning" }, { id: "q-p1-c", text: "time" }], correctOptionId: "q-p1-a", explanation: "A friend is a person you know and like.", skill: "vocabulary", difficulty: 1, tags: ["people"] },
    { ...base, id: "question-people-2", lessonId: "lesson-a1-people", type: "mcq", prompt: "Which word means পরিবার?", options: [{ id: "q-p2-a", text: "family" }, { id: "q-p2-b", text: "learn" }, { id: "q-p2-c", text: "work" }], correctOptionId: "q-p2-a", explanation: "Family means পরিবার।", skill: "vocabulary", difficulty: 1, tags: ["people"] },
    { ...base, id: "question-time-1", lessonId: "lesson-a2-time", type: "mcq", prompt: "What time is it? asks about ___.", options: [{ id: "q-t1-a", text: "the clock" }, { id: "q-t1-b", text: "a name" }, { id: "q-t1-c", text: "a family" }], correctOptionId: "q-t1-a", explanation: "This question asks for the time on a clock.", skill: "listening", difficulty: 1, tags: ["time"] },
    { ...base, id: "question-time-2", lessonId: "lesson-a2-time", type: "mcq", prompt: "Which word means আজ?", options: [{ id: "q-t2-a", text: "today" }, { id: "q-t2-b", text: "friend" }, { id: "q-t2-c", text: "name" }], correctOptionId: "q-t2-a", explanation: "Today means আজ।", skill: "vocabulary", difficulty: 1, tags: ["time"] },
    { ...base, id: "question-routine-1", lessonId: "lesson-a2-routine", type: "mcq", prompt: "Complete: I ___ English.", options: [{ id: "q-r1-a", text: "learn" }, { id: "q-r1-b", text: "family" }, { id: "q-r1-c", text: "morning" }], correctOptionId: "q-r1-a", explanation: "“I learn English” একটি সঠিক সহজ বাক্য।", skill: "writing", difficulty: 1, tags: ["routine"] },
    { ...base, id: "question-routine-2", lessonId: "lesson-a2-routine", type: "mcq", prompt: "Which phrase means বাড়ি যাই?", options: [{ id: "q-r2-a", text: "go home" }, { id: "q-r2-b", text: "say hello" }, { id: "q-r2-c", text: "meet friend" }], correctOptionId: "q-r2-a", explanation: "Go home means বাড়ি যাই।", skill: "speaking", difficulty: 1, tags: ["routine"] },
  ],
};
