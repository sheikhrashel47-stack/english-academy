import type { FillBlankQuestion, GrammarTopic, LearningSeed, McqQuestion, Question, SentenceBuilderQuestion, VocabularyItem, VocabularyRecallQuestion } from "@/domain/learning/types";

const timestamp = "2026-08-19T00:00:00.000Z";
const base = { schemaVersion: 2, updatedAt: timestamp };
type VocabRow = [string, string, string, string, string, string, string, "A1" | "A2", 1 | 2];

const vocabRows: VocabRow[] = [
  ["hello", "হ্যালো", "a greeting used when meeting someone", "interjection", "হেলো", "Hello, I am Rafi.", "greetings", "A1", 1],
  ["goodbye", "বিদায়", "words used when leaving someone", "interjection", "গুডবাই", "Goodbye, see you tomorrow.", "greetings", "A1", 1],
  ["morning", "সকাল", "the early part of the day", "noun", "মর্নিং", "Good morning, teacher.", "greetings", "A1", 1],
  ["name", "নাম", "the word by which a person is known", "noun", "নেইম", "My name is Nila.", "introductions", "A1", 1],
  ["from", "থেকে", "showing origin", "preposition", "ফ্রম", "I am from Dhaka.", "introductions", "A1", 1],
  ["meet", "দেখা করা", "to come together with someone", "verb", "মিট", "Nice to meet you.", "introductions", "A1", 1],
  ["friend", "বন্ধু", "a person you know and like", "noun", "ফ্রেন্ড", "She is my friend.", "introductions", "A1", 1],
  ["family", "পরিবার", "parents and close relations", "noun", "ফ্যামিলি", "My family is small.", "be-verbs", "A1", 1],
  ["teacher", "শিক্ষক", "a person who teaches", "noun", "টিচার", "She is a teacher.", "be-verbs", "A1", 1],
  ["student", "শিক্ষার্থী", "a person who learns", "noun", "স্টুডেন্ট", "He is a student.", "be-verbs", "A1", 1],
  ["today", "আজ", "on this day", "adverb", "টুডে", "Today I study English.", "daily-routine", "A1", 1],
  ["evening", "সন্ধ্যা", "the later part of the day", "noun", "ইভনিং", "I read in the evening.", "daily-routine", "A1", 1],
  ["home", "বাড়ি", "the place where you live", "noun", "হোম", "I go home at five.", "daily-routine", "A1", 1],
  ["wake", "জাগা", "to stop sleeping", "verb", "ওয়েইক", "I wake at seven.", "present-simple", "A1", 1],
  ["eat", "খাওয়া", "to take food", "verb", "ইট", "They eat breakfast early.", "present-simple", "A1", 1],
  ["go", "যাওয়া", "to move to another place", "verb", "গো", "I go to school by bus.", "present-simple", "A1", 1],
  ["study", "পড়াশোনা করা", "to learn about a subject", "verb", "স্টাডি", "We study every day.", "present-simple", "A1", 1],
  ["yesterday", "গতকাল", "the day before today", "adverb", "ইয়েস্টারডে", "Yesterday I visited my aunt.", "past-simple", "A2", 2],
  ["walked", "হেঁটেছিল", "moved on foot in the past", "verb", "ওয়ক্ট", "We walked to the market.", "past-simple", "A2", 2],
  ["visited", "দেখতে গিয়েছিল", "went to see in the past", "verb", "ভিজিটেড", "She visited her cousin.", "past-simple", "A2", 2],
  ["watched", "দেখেছিল", "looked at in the past", "verb", "ওয়াচ্ট", "I watched a film last night.", "past-simple", "A2", 2],
  ["last", "গত", "most recent before now", "adjective", "লাস্ট", "Last week was busy.", "past-simple", "A2", 2],
  ["short", "ছোট", "not long", "adjective", "শর্ট", "Read this short message.", "reading", "A2", 2],
  ["message", "বার্তা", "a short piece of information", "noun", "মেসেজ", "The message is clear.", "reading", "A2", 2],
  ["information", "তথ্য", "facts or details", "noun", "ইনফরমেশন", "Find the information in the text.", "reading", "A2", 2],
  ["understand", "বোঝা", "to know the meaning", "verb", "আন্ডারস্ট্যান্ড", "I understand the question.", "reading", "A2", 2],
  ["read", "পড়া", "to understand written words", "verb", "রিড", "I read a short story.", "review", "A2", 2],
  ["speak", "কথা বলা", "to say words aloud", "verb", "স্পিক", "Please speak slowly.", "review", "A2", 2],
  ["listen", "শোনা", "to pay attention to sound", "verb", "লিসেন", "Listen to the dialogue.", "review", "A2", 2],
  ["write", "লেখা", "to make words", "verb", "রাইট", "Write your name here.", "review", "A2", 2],
  ["learn", "শেখা", "to gain a skill", "verb", "লার্ন", "I learn five words today.", "review", "A2", 2],
  ["practice", "অনুশীলন", "repeated activity to improve", "noun", "প্র্যাকটিস", "Practice makes speaking easier.", "review", "A2", 2],
  ["progress", "অগ্রগতি", "improvement over time", "noun", "প্রোগ্রেস", "Your progress is visible.", "review", "A2", 2],
];

const vocabulary: VocabularyItem[] = vocabRows.map(([word, meaning, definition, partOfSpeech, pronunciation, example, topic, level, difficulty]) => ({ ...base, id: `vocab-${word}`, word, meaning, definition, partOfSpeech, pronunciation, example, topic, level, difficulty, synonyms: [], antonyms: [], collocations: [] }));

const mcq = (id: string, lessonId: string, prompt: string, correct: string, wrong: string[], skill: "grammar" | "vocabulary", explanation: string): McqQuestion => ({ ...base, id, lessonId, type: "mcq", prompt, banglaPrompt: "সঠিক উত্তরটি বেছে নাও।", explanation, skill, difficulty: 1, tags: [skill, "practice"], options: [correct, ...wrong].map((text, index) => ({ id: `${id}-${index + 1}`, text })), correctOptionId: `${id}-1` });
const fill = (id: string, lessonId: string, prompt: string, answer: string, explanation: string): FillBlankQuestion => ({ ...base, id, lessonId, type: "fill-blank", prompt, banglaPrompt: "শূন্যস্থানে সঠিক শব্দটি লেখো।", explanation, skill: "grammar", difficulty: 1, tags: ["grammar", "fill"], acceptedAnswers: [answer] });
const build = (id: string, lessonId: string, tokens: string[], correctSentence: string, explanation: string): SentenceBuilderQuestion => ({ ...base, id, lessonId, type: "sentence-builder", prompt: "শব্দগুলো সাজিয়ে সঠিক বাক্য তৈরি করো।", banglaPrompt: "প্রতিটি token একবার ব্যবহার করো।", explanation, skill: "grammar", difficulty: 2, tags: ["grammar", "builder"], tokens, correctSentence });

const coreQuestions: Question[] = [
  mcq("q-greeting-1", "lesson-a1-greetings", "Which phrase is a greeting?", "Good morning", ["Thank you", "My name is Rafi", "See you yesterday"], "vocabulary", "‘Good morning’ দিয়ে সকালে কাউকে অভিবাদন জানানো হয়।"),
  fill("q-greeting-2", "lesson-a1-greetings", "Good ___, Nila!", "morning", "Good morning একটি সম্পূর্ণ greeting।"),
  build("q-greeting-3", "lesson-a1-greetings", ["meet", "you", "Nice", "to"], "Nice to meet you", "নতুন কারও সঙ্গে দেখা হলে বলি: Nice to meet you."),
  mcq("q-intro-1", "lesson-a1-introduce", "Choose the correct sentence.", "I am from Dhaka.", ["I from am Dhaka.", "I is from Dhaka.", "From I Dhaka."], "grammar", "I-এর পরে am বসে।"),
  fill("q-intro-2", "lesson-a1-introduce", "My ___ is Nila.", "name", "নিজের নাম বলার সময় বলি: My name is…"),
  build("q-intro-3", "lesson-a1-introduce", ["am", "I", "Bangladesh", "from"], "I am from Bangladesh", "I + am + from + place এই বিন্যাসটি মনে রাখো।"),
  mcq("q-be-1", "lesson-a1-be-verbs", "She ___ a teacher.", "is", ["am", "are", "be"], "grammar", "She-এর পরে is বসে।"),
  fill("q-be-2", "lesson-a1-be-verbs", "They ___ my friends.", "are", "They-এর সঙ্গে are বসে।"),
  build("q-be-3", "lesson-a1-be-verbs", ["a", "student", "He", "is"], "He is a student", "He-এর পরে is, তারপর পরিচয়।"),
  mcq("q-routine-1", "lesson-a1-routine", "Which word means ‘সকাল’?", "morning", ["evening", "family", "home"], "vocabulary", "Morning মানে সকাল।"),
  fill("q-routine-2", "lesson-a1-routine", "I ___ English every day.", "study", "I-এর সঙ্গে মূল verb study বসে।"),
  build("q-routine-3", "lesson-a1-routine", ["home", "go", "I", "at", "five"], "I go home at five", "সময়ের আগে at ব্যবহার করা হয়।"),
  mcq("q-present-1", "lesson-a1-present", "He ___ to school by bus.", "goes", ["go", "going", "gone"], "grammar", "He/She/It হলে present simple-এ verb-এর সঙ্গে সাধারণত s/es যোগ হয়।"),
  fill("q-present-2", "lesson-a1-present", "We ___ breakfast at eight.", "eat", "We-এর সঙ্গে মূল verb eat বসে।"),
  build("q-present-3", "lesson-a1-present", ["reads", "She", "every", "evening"], "She reads every evening", "She-এর সঙ্গে reads; সময়ের অংশটি শেষে।"),
  mcq("q-past-1", "lesson-a2-past", "Yesterday I ___ my aunt.", "visited", ["visit", "visits", "visiting"], "grammar", "Yesterday অতীত সময় বোঝায়, তাই visited।"),
  fill("q-past-2", "lesson-a2-past", "We ___ to the market yesterday.", "walked", "Walk-এর past form walked।"),
  build("q-past-3", "lesson-a2-past", ["a", "watched", "film", "I", "last", "night"], "I watched a film last night", "Past tense verb watched-এর পরে object, শেষে সময়।"),
  mcq("q-reading-1", "lesson-a2-reading", "A short message usually gives ___.", "information", ["weather", "money", "music"], "vocabulary", "Message থেকে প্রয়োজনীয় information পাওয়া যায়।"),
  fill("q-reading-2", "lesson-a2-reading", "I ___ the question now.", "understand", "I-এর সঙ্গে understand-এর মূল form বসে।"),
  build("q-reading-3", "lesson-a2-reading", ["this", "Read", "short", "message"], "Read this short message", "Read দিয়ে নির্দেশ শুরু হয়।"),
  mcq("q-review-1", "lesson-a2-review", "Choose the sentence about a routine.", "I study every day.", ["I studied yesterday.", "I am from Dhaka.", "Goodbye, friend."], "grammar", "Every day হলে simple present ব্যবহার করি।"),
  fill("q-review-2", "lesson-a2-review", "My friend ___ from Sylhet.", "is", "একজন ব্যক্তি friend-এর জন্য is ব্যবহার করি।"),
  build("q-review-3", "lesson-a2-review", ["practice", "English", "I", "every", "day"], "I practice English every day", "I + practice + object + time হলো স্বাভাবিক বিন্যাস।"),
];

const topicLesson: Record<string, string> = { greetings: "lesson-a1-greetings", introductions: "lesson-a1-introduce", "be-verbs": "lesson-a1-be-verbs", "daily-routine": "lesson-a1-routine", "present-simple": "lesson-a1-present", "past-simple": "lesson-a2-past", reading: "lesson-a2-reading", review: "lesson-a2-review" };
const recallQuestions: VocabularyRecallQuestion[] = vocabulary.map((item) => ({ ...base, id: `q-recall-${item.id}`, lessonId: topicLesson[item.topic], type: "vocabulary-recall", prompt: `“${item.word}” শব্দটির বাংলা অর্থ লেখো।`, banglaPrompt: "অর্থটি বাংলায় লেখো।", explanation: `“${item.word}” অর্থ “${item.meaning}”।`, skill: "vocabulary", difficulty: item.difficulty, tags: ["vocabulary", item.topic], word: item.word, vocabularyId: item.id, acceptedAnswers: [item.meaning] }));
const questions: Question[] = [...coreQuestions.map((question, index) => index % 11 === 0 ? { ...question, difficulty: 3 as const } : question), ...recallQuestions.map((question, index) => index % 9 === 0 ? { ...question, difficulty: 3 as const } : question)];

const lesson = (id: string, unitId: string, title: string, banglaTitle: string, order: number, vocabularyIds: string[], questionIds: string[], text: string, skillFocus: ("grammar" | "vocabulary" | "pronunciation" | "listening" | "speaking" | "reading" | "writing")[]) => ({ ...base, id, unitId, title, banglaTitle, order, status: "published" as const, objectives: ["মূল বাক্য ও শব্দ ব্যবহার করা", "একটি ছোট অনুশীলন সম্পন্ন করা"], skillFocus, estimatedMinutes: 9, vocabularyIds, questionIds, blocks: [{ id: `${id}-heading`, type: "heading" as const, text: banglaTitle }, { id: `${id}-explain`, type: "explanation" as const, title: "পথের নোট", text, tip: "উদাহরণটি একবার জোরে পড়ো।" }, { id: `${id}-vocab`, type: "vocabulary" as const, vocabularyIds }, { id: `${id}-audio`, type: "audio" as const, label: "উচ্চারণের জায়গা", transcript: "এই অংশে ভবিষ্যতে রেকর্ড করা audio যুক্ত হবে।" }, { id: `${id}-question`, type: "question" as const, questionId: questionIds[0] }, { id: `${id}-test`, type: "mini-test" as const, questionIds: questionIds.slice(1) }, { id: `${id}-speaking`, type: "speaking" as const, prompt: "আজ শেখা বাক্যটি নিজের মতো করে বলো।", hint: "ধীরে বললেই যথেষ্ট।" }, { id: `${id}-review`, type: "review" as const, text: "ভুল হলে সমস্যা নেই—Mistake Bank থেকে পরে আবার চেষ্টা করতে পারবে।" }] });

const lessons = [
  lesson("lesson-a1-greetings", "unit-a1-hello", "Hello & goodbye", "প্রথম অভিবাদন", 1, ["vocab-hello", "vocab-goodbye", "vocab-morning"], ["q-greeting-1", "q-greeting-2", "q-greeting-3"], "সকালে বা প্রথম দেখা হলে একটি সহজ greeting কথোপকথনের দরজা খুলে দেয়।", ["vocabulary", "speaking"]),
  lesson("lesson-a1-introduce", "unit-a1-hello", "Say who you are", "নিজেকে পরিচয় করাও", 2, ["vocab-name", "vocab-from", "vocab-meet", "vocab-friend"], ["q-intro-1", "q-intro-2", "q-intro-3"], "নিজের নাম ও শহর বলার জন্য I am এবং My name is ব্যবহার করো।", ["grammar", "speaking"]),
  lesson("lesson-a1-be-verbs", "unit-a1-hello", "Am, is & are", "Be verb-এর ভিত্তি", 3, ["vocab-family", "vocab-teacher", "vocab-student"], ["q-be-1", "q-be-2", "q-be-3"], "I-এর সঙ্গে am, he/she-এর সঙ্গে is, আর you/we/they-এর সঙ্গে are বসে।", ["grammar", "writing"]),
  lesson("lesson-a1-routine", "unit-a1-routine", "Your day", "দিনের গল্প", 4, ["vocab-today", "vocab-evening", "vocab-home"], ["q-routine-1", "q-routine-2", "q-routine-3"], "সময় ও কাজের শব্দ একসঙ্গে বললে সহজ বাক্য তৈরি হয়।", ["vocabulary", "speaking"]),
  lesson("lesson-a1-present", "unit-a1-routine", "Present simple", "প্রতিদিনের কাজ", 5, ["vocab-wake", "vocab-eat", "vocab-go", "vocab-study"], ["q-present-1", "q-present-2", "q-present-3"], "নিয়মিত কাজের জন্য simple present ব্যবহার করি; he বা she হলে verb-এ s/es যোগ হয়।", ["grammar", "writing"]),
  lesson("lesson-a2-past", "unit-a2-time", "Yesterday", "গতকালের গল্প", 6, ["vocab-yesterday", "vocab-walked", "vocab-visited", "vocab-watched", "vocab-last"], ["q-past-1", "q-past-2", "q-past-3"], "গতকালের কাজ বলতে regular verb-এর সঙ্গে সাধারণত -ed যোগ হয়।", ["grammar", "vocabulary"]),
  lesson("lesson-a2-reading", "unit-a2-reading", "Read a message", "ছোট বার্তা পড়ো", 7, ["vocab-short", "vocab-message", "vocab-information", "vocab-understand"], ["q-reading-1", "q-reading-2", "q-reading-3"], "পড়ার সময় সব শব্দের অনুবাদ নয়; আগে কে, কী এবং কখন খুঁজে নাও।", ["reading", "vocabulary"]),
  lesson("lesson-a2-review", "unit-a2-reading", "Map checkpoint", "পথের পুনরাবৃত্তি", 8, ["vocab-read", "vocab-speak", "vocab-listen", "vocab-write", "vocab-learn", "vocab-practice", "vocab-progress"], ["q-review-1", "q-review-2", "q-review-3"], "এই checkpoint-এ greeting, পরিচয়, দৈনন্দিন কাজ এবং past time একসঙ্গে মনে করো।", ["grammar", "vocabulary", "writing"]),
];

const grammarTopics: GrammarTopic[] = [["grammar-question-words", "lesson-a1-greetings", "Question words", "প্রশ্নের শব্দ", "Who, what, where দিয়ে শুরু হওয়া সহজ প্রশ্ন।", "A1"], ["grammar-pronouns", "lesson-a1-introduce", "Subject pronouns", "Subject pronoun", "I, you, he, she, we, they—বাক্যের মানুষ বা বিষয়।", "A1"], ["grammar-be", "lesson-a1-be-verbs", "Be verbs", "Am, is ও are", "Subject অনুযায়ী am, is ও are নির্বাচন।", "A1"], ["grammar-present", "lesson-a1-present", "Present simple", "প্রতিদিনের কাজ", "নিয়মিত কাজের জন্য simple present।", "A1"], ["grammar-past", "lesson-a2-past", "Past simple", "গতকালের কাজ", "শেষ হয়ে যাওয়া কাজের জন্য simple past।", "A2"]].map(([id, lessonId, title, banglaTitle, description, level]) => ({ ...base, id, lessonId, title, banglaTitle, description, level: level as "A1" | "A2" }));

export const phase0Seed: LearningSeed = {
  courses: [{ ...base, id: "course-english-foundations", title: "English Foundations", banglaTitle: "ইংরেজির ভিত্তি", description: "বাংলাভাষী শিক্ষার্থীর জন্য ধাপে ধাপে ব্যবহারিক ইংরেজি শেখার পথ।", levelIds: ["level-pre-a1", "level-a1", "level-a2", "level-b1", "level-b2", "level-c1", "level-c2"], contentVersion: "1.0" }],
  levels: [
    { ...base, id: "level-pre-a1", courseId: "course-english-foundations", code: "Pre-A1", title: "Starting point", summary: "ইংরেজির একদম প্রথম শব্দ ও আত্মবিশ্বাস।", unitIds: [], order: 1, availability: "coming-soon" },
    { ...base, id: "level-a1", courseId: "course-english-foundations", code: "A1", title: "First steps", summary: "পরিচয়, দৈনন্দিন জীবন ও সহজ বাক্য।", unitIds: ["unit-a1-hello", "unit-a1-routine"], order: 2, availability: "available" },
    { ...base, id: "level-a2", courseId: "course-english-foundations", code: "A2", title: "Everyday stories", summary: "সময়, ছোট লেখা ও পুনরাবৃত্তি।", unitIds: ["unit-a2-time", "unit-a2-reading"], order: 3, availability: "available" },
    { ...base, id: "level-b1", courseId: "course-english-foundations", code: "B1", title: "Independent voice", summary: "নিজের মতামত ও দীর্ঘ কথোপকথন।", unitIds: [], order: 4, availability: "coming-soon" },
    { ...base, id: "level-b2", courseId: "course-english-foundations", code: "B2", title: "Clear expression", summary: "আরও স্বচ্ছ লেখা ও আলোচনা।", unitIds: [], order: 5, availability: "coming-soon" },
    { ...base, id: "level-c1", courseId: "course-english-foundations", code: "C1", title: "Confident fluency", summary: "জটিল বিষয়েও আত্মবিশ্বাসী ব্যবহার।", unitIds: [], order: 6, availability: "coming-soon" },
    { ...base, id: "level-c2", courseId: "course-english-foundations", code: "C2", title: "Nuanced mastery", summary: "খুব সূক্ষ্ম ও স্বাভাবিক ভাষা ব্যবহার।", unitIds: [], order: 7, availability: "coming-soon" },
  ],
  units: [
    { ...base, id: "unit-a1-hello", levelId: "level-a1", title: "Meeting people", summary: "অভিবাদন ও পরিচয়।", lessonIds: ["lesson-a1-greetings", "lesson-a1-introduce", "lesson-a1-be-verbs"], order: 1 },
    { ...base, id: "unit-a1-routine", levelId: "level-a1", title: "Daily rhythm", summary: "নিজের দিনের গল্প।", lessonIds: ["lesson-a1-routine", "lesson-a1-present"], order: 2 },
    { ...base, id: "unit-a2-time", levelId: "level-a2", title: "Time & stories", summary: "গতকালের ঘটনা বলা।", lessonIds: ["lesson-a2-past"], order: 1 },
    { ...base, id: "unit-a2-reading", levelId: "level-a2", title: "Read & review", summary: "ছোট লেখা বোঝা ও পুনরাবৃত্তি।", lessonIds: ["lesson-a2-reading", "lesson-a2-review"], order: 2 },
  ],
  chapters: [],
  lessons, vocabulary, questions, grammarTopics,
};
