/** Emerald Study House / Phase 3: original MIT-licensed demonstration corpus; production bulk data remains import-only. */
import type { GrammarConcept, Question, VocabularyItem, VocabularySource } from "@/domain/learning/types";

const stamp = "2026-08-19T00:00:00.000Z";
const sourceId = "source-english-academy-original-sample";
const licenseUrl = "https://opensource.org/license/mit";

export const originalSampleSource: VocabularySource = {
  id: sourceId, schemaVersion: 5, createdAt: stamp, updatedAt: stamp, name: "English Academy original demonstration content", url: "https://sheikhrashel47-stack.github.io/english-academy/", license: "MIT", licenseUrl,
  commercialUseAllowed: true, attribution: "English Academy original demonstration content (MIT).", dataVersion: "phase3.0",
};

type WordRow = [string, string, string, string, "Pre-A1" | "A1" | "A2" | "B1"];
const rows: WordRow[] = [
  ["accept", "গ্রহণ করা", "verb", "Study", "A2"], ["achieve", "অর্জন করা", "verb", "Study", "A2"], ["adapt", "মানিয়ে নেওয়া", "verb", "Life skills", "B1"], ["advice", "পরামর্শ", "noun", "Communication", "A2"], ["afford", "সামর্থ্য থাকা", "verb", "Daily life", "A2"], ["agree", "একমত হওয়া", "verb", "Communication", "A1"],
  ["allow", "অনুমতি দেওয়া", "verb", "Daily life", "A2"], ["answer", "উত্তর", "noun", "Study", "A1"], ["appear", "দেখা দেওয়া", "verb", "Description", "A2"], ["apply", "আবেদন করা", "verb", "Work", "B1"], ["arrange", "ব্যবস্থা করা", "verb", "Daily life", "A2"], ["attend", "উপস্থিত থাকা", "verb", "Study", "A2"],
  ["balance", "ভারসাম্য", "noun", "Life skills", "B1"], ["basic", "মৌলিক", "adjective", "Study", "A1"], ["believe", "বিশ্বাস করা", "verb", "Communication", "A2"], ["borrow", "ধার নেওয়া", "verb", "Daily life", "A1"], ["brave", "সাহসী", "adjective", "People", "A2"], ["build", "তৈরি করা", "verb", "Work", "A1"],
  ["calm", "শান্ত", "adjective", "Feelings", "A2"], ["careful", "সতর্ক", "adjective", "Life skills", "A1"], ["challenge", "চ্যালেঞ্জ", "noun", "Study", "A2"], ["choose", "বেছে নেওয়া", "verb", "Daily life", "A1"], ["clear", "স্পষ্ট", "adjective", "Communication", "A1"], ["collect", "সংগ্রহ করা", "verb", "Daily life", "A1"],
  ["compare", "তুলনা করা", "verb", "Study", "A2"], ["complete", "সম্পূর্ণ করা", "verb", "Study", "A1"], ["confident", "আত্মবিশ্বাসী", "adjective", "Feelings", "A2"], ["connect", "সংযুক্ত করা", "verb", "Technology", "A2"], ["consider", "বিবেচনা করা", "verb", "Study", "B1"], ["continue", "চালিয়ে যাওয়া", "verb", "Study", "A1"],
  ["create", "তৈরি করা", "verb", "Work", "A1"], ["curious", "কৌতূহলী", "adjective", "People", "A2"], ["decide", "সিদ্ধান্ত নেওয়া", "verb", "Daily life", "A1"], ["depend", "নির্ভর করা", "verb", "Daily life", "A2"], ["describe", "বর্ণনা করা", "verb", "Communication", "A1"], ["develop", "উন্নত করা", "verb", "Study", "B1"],
  ["discover", "আবিষ্কার করা", "verb", "Study", "A2"], ["discuss", "আলোচনা করা", "verb", "Communication", "A2"], ["divide", "ভাগ করা", "verb", "Study", "A2"], ["effective", "কার্যকর", "adjective", "Study", "B1"], ["effort", "চেষ্টা", "noun", "Study", "A2"], ["encourage", "উৎসাহ দেওয়া", "verb", "People", "A2"],
  ["enjoy", "উপভোগ করা", "verb", "Daily life", "A1"], ["enough", "যথেষ্ট", "adjective", "Daily life", "A1"], ["explain", "ব্যাখ্যা করা", "verb", "Communication", "A1"], ["explore", "অনুসন্ধান করা", "verb", "Study", "A2"], ["fair", "ন্যায্য", "adjective", "People", "A2"], ["familiar", "পরিচিত", "adjective", "Daily life", "A2"],
  ["focus", "মনোযোগ", "noun", "Study", "A1"], ["follow", "অনুসরণ করা", "verb", "Study", "A1"], ["future", "ভবিষ্যৎ", "noun", "Time", "A1"], ["goal", "লক্ষ্য", "noun", "Study", "A1"], ["growth", "উন্নতি", "noun", "Study", "B1"], ["habit", "অভ্যাস", "noun", "Daily life", "A2"],
  ["handle", "সামলানো", "verb", "Life skills", "A2"], ["healthy", "স্বাস্থ্যকর", "adjective", "Health", "A1"], ["helpful", "সহায়ক", "adjective", "People", "A1"], ["honest", "সৎ", "adjective", "People", "A2"], ["imagine", "কল্পনা করা", "verb", "Study", "A2"], ["improve", "উন্নতি করা", "verb", "Study", "A1"],
  ["include", "অন্তর্ভুক্ত করা", "verb", "Study", "A2"], ["independent", "স্বনির্ভর", "adjective", "Life skills", "B1"], ["inform", "জানানো", "verb", "Communication", "A2"], ["interesting", "আকর্ষণীয়", "adjective", "Description", "A1"], ["invite", "আমন্ত্রণ করা", "verb", "Communication", "A1"], ["join", "যোগ দেওয়া", "verb", "Daily life", "A1"],
  ["journey", "যাত্রা", "noun", "Travel", "A1"], ["knowledge", "জ্ঞান", "noun", "Study", "A2"], ["learn", "শেখা", "verb", "Study", "Pre-A1"], ["listen", "শোনা", "verb", "Communication", "Pre-A1"], ["local", "স্থানীয়", "adjective", "Travel", "A2"], ["manage", "পরিচালনা করা", "verb", "Life skills", "A2"],
  ["meaningful", "অর্থবহ", "adjective", "Study", "B1"], ["measure", "মাপা", "verb", "Study", "A2"], ["method", "পদ্ধতি", "noun", "Study", "A2"], ["notice", "খেয়াল করা", "verb", "Study", "A2"], ["offer", "প্রস্তাব করা", "verb", "Communication", "A2"], ["organize", "সংগঠিত করা", "verb", "Study", "A2"],
  ["patient", "ধৈর্যশীল", "adjective", "People", "A2"], ["pattern", "ধরণ", "noun", "Study", "A2"], ["plan", "পরিকল্পনা", "noun", "Daily life", "A1"], ["practice", "অনুশীলন", "noun", "Study", "A1"], ["prepare", "প্রস্তুত করা", "verb", "Study", "A1"], ["present", "উপস্থাপন করা", "verb", "Communication", "B1"],
  ["progress", "অগ্রগতি", "noun", "Study", "A2"], ["protect", "রক্ষা করা", "verb", "Environment", "A2"], ["purpose", "উদ্দেশ্য", "noun", "Study", "A2"], ["quality", "মান", "noun", "Study", "A2"], ["question", "প্রশ্ন", "noun", "Study", "Pre-A1"], ["realize", "উপলব্ধি করা", "verb", "Study", "B1"],
  ["receive", "গ্রহণ করা", "verb", "Communication", "A2"], ["reduce", "কমানো", "verb", "Environment", "A2"], ["reflect", "ভাবা ও পর্যালোচনা করা", "verb", "Study", "B1"], ["remember", "মনে রাখা", "verb", "Study", "A1"], ["request", "অনুরোধ", "noun", "Communication", "A2"], ["respect", "সম্মান", "noun", "People", "A2"],
  ["respond", "উত্তর দেওয়া", "verb", "Communication", "A2"], ["result", "ফলাফল", "noun", "Study", "A2"], ["review", "পুনরালোচনা", "verb", "Study", "A1"], ["routine", "নিয়মিত রুটিন", "noun", "Daily life", "A1"], ["safe", "নিরাপদ", "adjective", "Daily life", "A1"], ["share", "ভাগাভাগি করা", "verb", "Communication", "A1"],
  ["simple", "সহজ", "adjective", "Study", "Pre-A1"], ["skill", "দক্ষতা", "noun", "Study", "A1"], ["solution", "সমাধান", "noun", "Study", "A2"], ["speak", "কথা বলা", "verb", "Communication", "Pre-A1"], ["specific", "নির্দিষ্ট", "adjective", "Study", "B1"], ["strategy", "কৌশল", "noun", "Study", "B1"],
  ["support", "সহায়তা", "noun", "People", "A2"], ["target", "লক্ষ্য", "noun", "Study", "A2"], ["task", "কাজ", "noun", "Study", "A1"], ["team", "দল", "noun", "People", "A1"], ["thoughtful", "বিবেচক", "adjective", "People", "B1"], ["travel", "ভ্রমণ করা", "verb", "Travel", "A1"],
  ["understand", "বোঝা", "verb", "Study", "Pre-A1"], ["useful", "উপকারী", "adjective", "Daily life", "A1"], ["value", "মূল্য দেওয়া", "verb", "People", "A2"], ["welcome", "স্বাগত জানানো", "verb", "Communication", "A1"], ["whole", "সম্পূর্ণ", "adjective", "Description", "A2"], ["wonder", "ভাবা ও কৌতূহল করা", "verb", "Study", "A2"],
];

const toTitle = (word: string) => word[0].toUpperCase() + word.slice(1);
export const phase3Vocabulary: VocabularyItem[] = rows.map(([word, meaning, partOfSpeech, topic, level], index) => ({
  id: `vocabulary-phase3-${word}`, schemaVersion: 5, createdAt: stamp, updatedAt: stamp, word, lemma: word, meaning, definition: `${toTitle(word)} is a useful ${partOfSpeech} for everyday English learning.`, partOfSpeech,
  pronunciation: `/${word}/`, ipa: `/${word}/`, example: `I use ${word} in a short English sentence every day.`, topic, level, difficulty: level === "Pre-A1" ? 1 : level === "A1" ? 2 : level === "A2" ? 3 : 4,
  synonyms: [], antonyms: [], collocations: [`${word} clearly`, `${word} every day`], wordFamily: [], phrasalVerbs: [], idioms: [], frequencyRank: index + 1,
  sourceId, license: "MIT", licenseUrl, commercialUseAllowed: true, attribution: originalSampleSource.attribution,
}));

export const phase3PracticeQuestions: Question[] = phase3Vocabulary.map((item, index) => ({
  id: `question-phase3-vocabulary-${item.lemma}`, schemaVersion: 5, createdAt: stamp, updatedAt: stamp, lessonId: "lesson-a1-people-work", type: "vocabulary-recall" as const,
  prompt: `What is the Bangla meaning of “${item.word}”?`, banglaPrompt: `“${item.word}” শব্দের বাংলা অর্থ কী?`, explanation: `${item.word} মানে ${item.meaning}।`, skill: "vocabulary", difficulty: item.difficulty, tags: ["phase3", item.topic.toLocaleLowerCase()], word: item.word, vocabularyId: item.id, acceptedAnswers: [item.meaning], hint: index % 2 === 0 ? item.partOfSpeech : undefined,
}));

const grammarTitles: Array<[string, string, string, "Pre-A1" | "A1" | "A2" | "B1"]> = [
  ["grammar-sentence-order", "Basic sentence order", "বাক্যের মৌলিক ক্রম", "Pre-A1"], ["grammar-be-positive", "Be verb: positive", "Be verb-এর ইতিবাচক ব্যবহার", "Pre-A1"], ["grammar-subject-pronouns", "Subject pronouns", "কর্তা সর্বনাম", "Pre-A1"], ["grammar-articles", "A and an", "A এবং an", "A1"], ["grammar-plurals", "Plural nouns", "বহুবচন বিশেষ্য", "A1"], ["grammar-present-simple", "Present simple", "সাধারণ বর্তমান কাল", "A1"],
  ["grammar-present-continuous", "Present continuous", "বর্তমান চলমান কাল", "A1"], ["grammar-there-is", "There is and there are", "There is এবং there are", "A1"], ["grammar-possessives", "Possessive adjectives", "মালিকানা বোঝানো adjective", "A1"], ["grammar-past-simple", "Past simple", "সাধারণ অতীত কাল", "A2"], ["grammar-future-will", "Future with will", "Will দিয়ে ভবিষ্যৎ", "A2"], ["grammar-countable", "Countable and uncountable nouns", "গণনাযোগ্য ও অগণনাযোগ্য বিশেষ্য", "A2"],
  ["grammar-comparatives", "Comparative adjectives", "তুলনামূলক adjective", "A2"], ["grammar-superlatives", "Superlative adjectives", "সর্বোচ্চ বোঝানো adjective", "A2"], ["grammar-adverbs-frequency", "Adverbs of frequency", "ঘনত্ব বোঝানো adverb", "A2"], ["grammar-prepositions-time", "Prepositions of time", "সময়ের preposition", "A2"], ["grammar-modals-can", "Can and can’t", "Can এবং can’t", "A1"], ["grammar-questions", "Question forms", "প্রশ্ন গঠন", "A1"],
  ["grammar-requests", "Polite requests", "ভদ্র অনুরোধ", "A2"], ["grammar-present-perfect", "Present perfect", "বর্তমান সম্পূর্ণ কাল", "B1"], ["grammar-conditionals-zero", "Zero conditional", "শূন্য শর্তযুক্ত বাক্য", "B1"], ["grammar-relative-clauses", "Defining relative clauses", "নির্ধারক relative clause", "B1"], ["grammar-passive-basic", "Basic passive voice", "মৌলিক passive voice", "B1"], ["grammar-linkers", "Linking ideas", "ভাব সংযোগ", "B1"],
];

export const phase3GrammarConcepts: GrammarConcept[] = grammarTitles.map(([id, title, banglaTitle, level], index) => ({
  id, schemaVersion: 5, createdAt: stamp, updatedAt: stamp, title, banglaTitle, category: index < 9 ? "Foundation" : index < 18 ? "Tense & form" : "Expression", level,
  summary: `${banglaTitle} ব্যবহার করে ছোট ও অর্থপূর্ণ ইংরেজি বাক্য তৈরি করা শেখো।`,
  rules: [{ rule: `${title} follows a clear, repeatable pattern.`, banglaExplanation: "আগে সহজ pattern চিনুন, তারপর নিজের উদাহরণে ব্যবহার করুন।" }],
  examples: [{ english: "I practise English every day.", bangla: "আমি প্রতিদিন ইংরেজি অনুশীলন করি।", note: "নিজের তথ্য বসিয়ে বাক্যটি পরিবর্তন করুন।" }],
  commonMistakes: [{ incorrect: "I practise English every day is.", corrected: "I practise English every day.", banglaExplanation: "বাক্যের শেষে অপ্রয়োজনীয় verb যোগ করবেন না।" }],
  prerequisites: index === 0 ? [] : [grammarTitles[Math.max(0, index - 1)][0]], relatedConceptIds: index < grammarTitles.length - 1 ? [grammarTitles[index + 1][0]] : [grammarTitles[0][0]],
  layeredExplanations: [
    { audience: "quick", title: "দ্রুত ধারণা", banglaExplanation: "প্রথমে উদাহরণটি পড়ুন এবং মূল শব্দটি লক্ষ্য করুন।" },
    { audience: "foundation", title: "ভিত তৈরি", banglaExplanation: "কর্তা, verb এবং প্রয়োজনীয় বাকি শব্দ দিয়ে ধাপে ধাপে বাক্য গঠন করুন।" },
    { audience: "deep-dive", title: "আরও গভীরে", banglaExplanation: "কখন এই pattern প্রযোজ্য নয় তা কাছের grammar concept-এর সঙ্গে তুলনা করে দেখুন।" },
  ],
  practiceQuestionIds: [phase3PracticeQuestions[index % phase3PracticeQuestions.length].id], sourceId, license: "MIT", licenseUrl, commercialUseAllowed: true, attribution: originalSampleSource.attribution,
}));
