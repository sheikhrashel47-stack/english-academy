/** Emerald Study House / Phase 8: original, local reference samples. These records prove the expandable library system; they are not a copied dictionary or textbook. */
import type { LibraryCategory, LibraryReferenceSection, LibraryResource, LibraryResourceType, LibrarySource } from "@/domain/learning/types";

const createdAt = "2026-08-19T00:00:00.000Z";
const schemaVersion = 10;

export const phase8OriginalLibrarySource: LibrarySource = {
  id: "library-source-english-academy-original", schemaVersion, createdAt, updatedAt: createdAt, contentVersion: "phase8.library.1", status: "published",
  name: "English Academy Original Reference Samples", creator: "English Academy Editorial Team", license: "Original", commercialUseAllowed: true,
  attribution: "Original bilingual reference material created for English Academy.", notice: "Do not treat these curated samples as a complete dictionary, grammar book, corpus or audio library.",
};

const category = (slug: string, title: string, banglaTitle: string, description: string, iconKey: string, order: number, resourceTypes: LibraryResourceType[]): LibraryCategory => ({
  id: `library-category-${slug}`, schemaVersion, createdAt, updatedAt: createdAt, contentVersion: "phase8.library.1", status: "published", slug, title, banglaTitle, description, iconKey, order, resourceTypes,
});

export const phase8LibraryCategories: LibraryCategory[] = [
  category("grammar", "Grammar", "ব্যাকরণ", "Rules, forms and clear examples.", "BookOpen", 1, ["grammar", "tense"]),
  category("vocabulary", "Vocabulary", "শব্দ ও ব্যবহার", "Word relations, differences and useful combinations.", "Languages", 2, ["word-family", "synonym-antonym", "confusing-word"]),
  category("pronunciation", "Pronunciation", "উচ্চারণ", "Sound, stress and IPA reference.", "AudioLines", 3, ["pronunciation", "ipa"]),
  category("phrasal-verbs", "Phrasal Verbs", "Phrasal verb", "Verb and particle combinations.", "Shuffle", 4, ["phrasal-verb"]),
  category("idioms", "Idioms", "Idioms", "Meaning and register-aware use.", "MessageCircleMore", 5, ["idiom"]),
  category("collocations", "Collocations", "Collocation", "Natural word partnerships.", "Link2", 6, ["collocation"]),
  category("prepositions", "Prepositions", "Preposition", "Time, place, movement and fixed expressions.", "MapPin", 7, ["preposition"]),
  category("irregular-verbs", "Irregular Verbs", "Irregular verb", "Useful verb forms in a scan-friendly table.", "Table2", 8, ["irregular-verb"]),
  category("common-errors", "Common Errors", "সাধারণ ভুল", "Compare an error, correction and reason.", "CircleAlert", 9, ["common-error"]),
  category("useful-phrases", "Useful Phrases", "দরকারি বাক্যাংশ", "Context-aware everyday phrases.", "MessagesSquare", 10, ["useful-phrase"]),
  category("sentence-patterns", "Sentence Patterns", "বাক্য গঠন", "Reusable structures for clear expression.", "Brackets", 11, ["sentence-pattern"]),
  category("writing", "Writing", "লেখা", "Original writing structures and checklists.", "PenLine", 12, ["writing"]),
  category("reading", "Reading", "পড়া", "How to read with a purpose.", "BookMarked", 13, ["reading"]),
  category("listening", "Listening", "শোনা", "Transcript-aware listening strategy.", "Headphones", 14, ["listening"]),
  category("communication", "Communication", "যোগাযোগ", "Practical clarification and response patterns.", "Handshake", 15, ["communication"]),
  category("english-usage", "English Usage", "স্বাভাবিক ব্যবহার", "Choose a natural word for the situation.", "Sparkles", 16, ["english-usage"]),
  category("quick-reference", "Quick Reference", "দ্রুত রেফারেন্স", "Fast tables and revision prompts.", "ListChecks", 17, ["quick-reference"]),
];

const prefixesFor = (value: string) => {
  const words = value.toLocaleLowerCase("en-US").normalize("NFKC").replace(/[.,;:!?()[\]{}"'“”‘’/\\|+*=<>—–-]+/g, " ").split(/\s+/).filter(Boolean);
  return words.flatMap((word) => Array.from({ length: Math.min(18, word.length) }, (_, index) => word.slice(0, index + 1)));
};

const section = (id: string, label: string, banglaLabel: string, body: string, banglaBody?: string, tone: LibraryReferenceSection["tone"] = "tip"): LibraryReferenceSection => ({ id, label, banglaLabel, body, banglaBody, tone });

type ResourceInput = Omit<LibraryResource, "id" | "schemaVersion" | "createdAt" | "updatedAt" | "contentVersion" | "status" | "sourceId" | "license" | "commercialUseAllowed" | "attribution" | "searchTerms" | "relatedResourceIds" | "relatedConceptIds" | "relatedLessonIds" | "relatedVocabularyIds" | "facts" | "sections" | "examples" | "commonMistakes" | "audioStatus"> & {
  id: string; search?: string[]; facts?: LibraryResource["facts"]; sections?: LibraryResource["sections"]; examples?: LibraryResource["examples"]; commonMistakes?: LibraryResource["commonMistakes"]; audioStatus?: LibraryResource["audioStatus"]; relatedResourceIds?: string[]; relatedConceptIds?: string[]; relatedLessonIds?: string[]; relatedVocabularyIds?: string[];
};

const resource = (input: ResourceInput): LibraryResource => {
  const searchText = [input.title, input.banglaTitle, input.summary, input.banglaSummary, input.topic ?? "", ...(input.search ?? []), ...(input.facts ?? []).flatMap((fact) => [fact.label, fact.value, fact.banglaLabel ?? "", fact.banglaValue ?? ""]), ...(input.sections ?? []).flatMap((item) => [item.label, item.banglaLabel, item.body, item.banglaBody ?? ""]), ...(input.examples ?? []).flatMap((item) => [item.english, item.bangla])].join(" ");
  return {
    schemaVersion, createdAt, updatedAt: createdAt, contentVersion: "phase8.library.1", status: "published", sourceId: phase8OriginalLibrarySource.id, license: "Original", commercialUseAllowed: true, attribution: phase8OriginalLibrarySource.attribution,
    audioStatus: "not-included", facts: [], sections: [], examples: [], commonMistakes: [], relatedResourceIds: [], relatedConceptIds: [], relatedLessonIds: [], relatedVocabularyIds: [], ...input,
    searchTerms: Array.from(new Set(prefixesFor(searchText))),
  };
};

export const phase8LibraryResources: LibraryResource[] = [
  resource({
    id: "library-grammar-parts-of-speech", categoryId: "library-category-grammar", type: "grammar", title: "Parts of Speech: a practical map", banglaTitle: "Parts of Speech: সহজ মানচিত্র", level: "A1", topic: "grammar", estimatedMinutes: 5,
    summary: "Recognise the job a word does before choosing it in a sentence.", banglaSummary: "বাক্যে শব্দটি কী কাজ করছে তা আগে চিনুন।", search: ["noun pronoun verb adjective adverb article determiner conjunction"],
    facts: [{ label: "Core idea", value: "A word class explains its usual job, not every possible meaning.", banglaLabel: "মূল কথা", banglaValue: "শব্দের শ্রেণি তার সাধারণ কাজ বোঝায়; সব সম্ভাব্য অর্থ নয়।" }],
    sections: [section("quick", "Quick explanation", "সংক্ষিপ্ত ব্যাখ্যা", "Nouns name; verbs express an action or state; adjectives describe nouns; adverbs modify verbs, adjectives or other adverbs.", "Noun নাম বোঝায়, verb কাজ বা অবস্থা বোঝায়, adjective noun বর্ণনা করে এবং adverb অন্য শব্দকে আরও স্পষ্ট করে।", "rule"), section("choice", "Use the sentence position", "বাক্যের অবস্থান দেখুন", "Ask what the word is doing in this sentence. The same form can sometimes do a different job.", "একই শব্দ কখনও ভিন্ন কাজ করতে পারে। বাক্যে তার কাজটি দেখুন।")],
    examples: [{ english: "They work carefully.", bangla: "তারা মনোযোগ দিয়ে কাজ করে।", note: "work = verb; carefully = adverb" }],
    commonMistakes: [{ incorrect: "She sings beautiful.", corrected: "She sings beautifully.", banglaExplanation: "এখানে sings verb-কে বর্ণনা করছে, তাই adverb beautifully প্রয়োজন।" }],
  }),
  resource({
    id: "library-tense-present-simple", categoryId: "library-category-grammar", type: "tense", title: "Present Simple", banglaTitle: "Present Simple", level: "A1", topic: "tenses", estimatedMinutes: 6,
    summary: "Use it for routines, facts and repeated actions.", banglaSummary: "অভ্যাস, সত্য এবং নিয়মিত কাজের জন্য ব্যবহার করুন।", search: ["do does routine habit fact always usually every day negative question short answer"],
    facts: [{ label: "Positive", value: "I/You/We/They work. He/She/It works.", banglaLabel: "ইতিবাচক", banglaValue: "He/She/It-এর সঙ্গে সাধারণত verb-এ -s/-es লাগে।" }, { label: "Question", value: "Do you work? Does she work?", banglaLabel: "প্রশ্ন", banglaValue: "Does-এর পরে মূল verb ব্যবহার করুন।" }],
    sections: [section("use", "When to use it", "কখন ব্যবহার করবেন", "Use the present simple for a habit, a timetable, a general truth or a permanent situation.", "অভ্যাস, সময়সূচি, সাধারণ সত্য ও স্থায়ী অবস্থার জন্য ব্যবহার করুন।", "rule"), section("signals", "Useful signal words", "চেনার শব্দ", "often, usually, every day, on Mondays, never.", "often, usually, every day, on Mondays, never।", "tip")],
    examples: [{ english: "Rina studies English every evening.", bangla: "রিনা প্রতি সন্ধ্যায় ইংরেজি পড়ে।" }, { english: "Does he live near the station? — Yes, he does.", bangla: "সে কি স্টেশনের কাছে থাকে? — হ্যাঁ, থাকে।" }],
    commonMistakes: [{ incorrect: "Does he lives here?", corrected: "Does he live here?", banglaExplanation: "Does-এর পরে live মূল verb থাকে; lives নয়।" }], relatedResourceIds: ["library-common-error-third-person-s"],
  }),
  resource({
    id: "library-preposition-time-at-on-in", categoryId: "library-category-prepositions", type: "preposition", title: "Time prepositions: at, on and in", banglaTitle: "সময়: at, on ও in", level: "A1", topic: "time", estimatedMinutes: 4,
    summary: "Choose the preposition by the size of the time expression.", banglaSummary: "সময়ের পরিধি দেখে preposition বাছুন।", search: ["at 7 o'clock on Monday in June morning night date time"],
    facts: [{ label: "at", value: "at 7:30, at night", banglaLabel: "at", banglaValue: "নির্দিষ্ট সময় ও night-এর আগে।" }, { label: "on", value: "on Monday, on 12 May", banglaLabel: "on", banglaValue: "দিন ও তারিখের আগে।" }, { label: "in", value: "in June, in 2026, in the morning", banglaLabel: "in", banglaValue: "মাস, বছর ও দিনের অংশের আগে।" }],
    sections: [section("choice", "A useful contrast", "সহজ তুলনা", "Say at 8 o'clock, on Friday and in August. Fixed expressions may have their own pattern, so save useful examples.", "at 8 o'clock, on Friday এবং in August বলুন। কিছু fixed expression আলাদা হতে পারে, তাই উদাহরণ সংরক্ষণ করুন।", "rule")],
    examples: [{ english: "The class starts at 8:00 on Monday in July.", bangla: "ক্লাসটি জুলাই মাসের সোমবার সকাল ৮টায় শুরু হয়।" }],
    commonMistakes: [{ incorrect: "I was born on 2005.", corrected: "I was born in 2005.", banglaExplanation: "বছরের আগে in ব্যবহার করুন।" }],
  }),
  resource({
    id: "library-irregular-verbs-go", categoryId: "library-category-irregular-verbs", type: "irregular-verb", title: "go — went — gone", banglaTitle: "go-এর verb forms", level: "A1", topic: "irregular verbs", estimatedMinutes: 2,
    summary: "A compact form table for a common irregular verb.", banglaSummary: "একটি প্রচলিত irregular verb-এর ছোট form table।", search: ["go went gone going goes যাওয়া"],
    facts: [{ label: "Base", value: "go", banglaLabel: "মূল রূপ", banglaValue: "go" }, { label: "Past", value: "went", banglaLabel: "Past", banglaValue: "went" }, { label: "Past participle", value: "gone", banglaLabel: "Past participle", banglaValue: "gone" }, { label: "-ing / third person", value: "going / goes", banglaLabel: "অন্য রূপ", banglaValue: "going / goes" }],
    sections: [section("use", "Use the right form", "সঠিক রূপ", "Use went for a finished past action. Use gone with have/has for a completed movement or change.", "শেষ হওয়া অতীত কাজের জন্য went ব্যবহার করুন। have/has-এর সঙ্গে gone ব্যবহার করুন।", "rule")],
    examples: [{ english: "We went home early.", bangla: "আমরা তাড়াতাড়ি বাড়ি গিয়েছিলাম।" }, { english: "She has gone to the library.", bangla: "সে লাইব্রেরিতে গেছে।" }],
  }),
  resource({
    id: "library-phrasal-look-after", categoryId: "library-category-phrasal-verbs", type: "phrasal-verb", title: "look after", banglaTitle: "look after", level: "A2", topic: "daily life", estimatedMinutes: 3,
    summary: "To take care of a person, animal or thing.", banglaSummary: "কোনো ব্যক্তি, প্রাণী বা জিনিসের যত্ন নেওয়া।", search: ["take care of care for দেখাশোনা করা separable inseparable"],
    facts: [{ label: "Pattern", value: "look after + person/thing", banglaLabel: "গঠন", banglaValue: "look after + ব্যক্তি/বস্তু" }, { label: "Separability", value: "Inseparable", banglaLabel: "আলাদা করা যায়?", banglaValue: "না; look the child after বলবেন না।" }],
    sections: [section("register", "Natural use", "স্বাভাবিক ব্যবহার", "This is a neutral everyday phrase. In some contexts, care for is a related alternative with a slightly different feeling.", "এটি everyday neutral phrase। care for কাছাকাছি বিকল্প, তবে অনুভূতি ভিন্ন হতে পারে।")],
    examples: [{ english: "Can you look after my bag for a moment?", bangla: "তুমি কি একটু আমার ব্যাগটা দেখবে?" }],
  }),
  resource({
    id: "library-idiom-piece-of-cake", categoryId: "library-category-idioms", type: "idiom", title: "a piece of cake", banglaTitle: "a piece of cake", level: "A2", topic: "daily life", estimatedMinutes: 2,
    summary: "Something that is very easy to do.", banglaSummary: "খুব সহজ কোনো কাজ।", search: ["easy simple very easy সহজ কাজ casual idiom"],
    facts: [{ label: "Register", value: "Casual", banglaLabel: "ভঙ্গি", banglaValue: "আনুষ্ঠানিক পরীক্ষার উত্তরে না বলাই ভালো।" }],
    sections: [section("use", "Use it carefully", "সতর্ক ব্যবহার", "It is friendly and informal. Use a plain word such as easy in formal or academic writing.", "এটি বন্ধুসুলভ ও informal। formal বা academic লেখায় easy-এর মতো সরাসরি শব্দ ব্যবহার করুন।", "warning")],
    examples: [{ english: "Once you know the route, the walk is a piece of cake.", bangla: "রাস্তা জানা থাকলে হাঁটাটা খুব সহজ।" }],
  }),
  resource({
    id: "library-collocation-make-decision", categoryId: "library-category-collocations", type: "collocation", title: "make a decision", banglaTitle: "make a decision", level: "A2", topic: "work and study", estimatedMinutes: 2,
    summary: "A common verb + noun partnership for choosing after consideration.", banglaSummary: "ভেবে কোনো সিদ্ধান্ত নেওয়ার সাধারণ verb + noun combination।", search: ["decision decide take a decision সিদ্ধান্ত নেওয়া verb noun"],
    facts: [{ label: "Type", value: "Verb + noun", banglaLabel: "ধরন", banglaValue: "Verb + noun" }],
    sections: [section("contrast", "A natural combination", "স্বাভাবিক জোড়া", "In international English, make a decision is widely natural. Do not assume every nearby verb has the same pattern.", "make a decision খুব স্বাভাবিক ব্যবহার। কাছাকাছি সব verb একইভাবে ব্যবহার হয় না।", "tip")],
    examples: [{ english: "Please make a decision after reading the instructions.", bangla: "নির্দেশনা পড়ে সিদ্ধান্ত নিন।" }],
  }),
  resource({
    id: "library-common-error-third-person-s", categoryId: "library-category-common-errors", type: "common-error", title: "He go → He goes", banglaTitle: "He go নয়, He goes", level: "A1", topic: "grammar", estimatedMinutes: 2,
    summary: "In the present simple, third-person singular subjects usually need -s or -es.", banglaSummary: "Present simple-এ third-person singular subject-এর সঙ্গে সাধারণত -s বা -es লাগে।", search: ["he she it goes works third person singular s es ভুল"],
    facts: [{ label: "Incorrect", value: "He go to college every day.", banglaLabel: "ভুল", banglaValue: "He go to college every day." }, { label: "Correct", value: "He goes to college every day.", banglaLabel: "সঠিক", banglaValue: "He goes to college every day." }],
    sections: [section("why", "Why this changes", "কেন বদলায়", "The subject he is third-person singular. In a present-simple positive statement, go changes to goes.", "he হলো third-person singular। Present simple-এর positive বাক্যে go থেকে goes হয়।", "rule")],
    examples: [{ english: "My sister watches English videos at home.", bangla: "আমার বোন বাসায় ইংরেজি ভিডিও দেখে।" }],
  }),
  resource({
    id: "library-confusing-borrow-lend", categoryId: "library-category-vocabulary", type: "confusing-word", title: "borrow and lend", banglaTitle: "borrow ও lend-এর পার্থক্য", level: "A2", topic: "confusing words", estimatedMinutes: 3,
    summary: "Borrow means receive temporarily; lend means give temporarily.", banglaSummary: "borrow মানে সাময়িকভাবে নেওয়া; lend মানে সাময়িকভাবে দেওয়া।", search: ["take give temporarily ধার নেওয়া ধার দেওয়া"],
    facts: [{ label: "borrow", value: "borrow something from someone", banglaLabel: "borrow", banglaValue: "কারও কাছ থেকে ধার নেওয়া" }, { label: "lend", value: "lend something to someone", banglaLabel: "lend", banglaValue: "কাউকে ধার দেওয়া" }],
    sections: [section("direction", "Remember the direction", "দিকটি মনে রাখুন", "Borrow moves an item toward you; lend moves it from you to another person.", "borrow-এ জিনিস আপনার কাছে আসে; lend-এ আপনার কাছ থেকে অন্যের কাছে যায়।", "tip")],
    examples: [{ english: "May I borrow your pen?", bangla: "আমি কি তোমার কলমটি ধার নিতে পারি?" }, { english: "I can lend you my pen.", bangla: "আমি তোমাকে আমার কলমটি ধার দিতে পারি।" }],
  }),
  resource({
    id: "library-word-family-success", categoryId: "library-category-vocabulary", type: "word-family", title: "Word family: success", banglaTitle: "success-এর word family", level: "B1", topic: "word families", estimatedMinutes: 4,
    summary: "See how a related noun, verb, adjective and adverb serve different roles.", banglaSummary: "একই পরিবারের noun, verb, adjective ও adverb ভিন্ন কাজ করে।", search: ["success successful successfully succeed unsuccessful সফলতা সফল হওয়া"],
    facts: [{ label: "Noun", value: "success", banglaLabel: "Noun", banglaValue: "সফলতা" }, { label: "Verb", value: "succeed", banglaLabel: "Verb", banglaValue: "সফল হওয়া" }, { label: "Adjective / adverb", value: "successful / successfully", banglaLabel: "Adjective / adverb", banglaValue: "সফল / সফলভাবে" }],
    sections: [section("choice", "Choose by job", "কাজ অনুযায়ী বাছুন", "Use success for a thing or result, succeed for an action, successful to describe a noun, and successfully to describe how an action happens.", "ফল বা বস্তু বোঝাতে success, কাজ বোঝাতে succeed, noun বর্ণনায় successful এবং কাজের ধরন বোঝাতে successfully ব্যবহার করুন।", "rule")],
    examples: [{ english: "Her success came after she worked successfully on a difficult project.", bangla: "কঠিন একটি প্রকল্পে সফলভাবে কাজ করার পর তার সাফল্য আসে।" }],
  }),
  resource({
    id: "library-synonym-big-large", categoryId: "library-category-vocabulary", type: "synonym-antonym", title: "big and large: similar, not identical", banglaTitle: "big ও large: কাছাকাছি, এক নয়", level: "A2", topic: "word choice", estimatedMinutes: 3,
    summary: "Both can describe size, but natural combinations can differ.", banglaSummary: "দুটিই আকার বোঝাতে পারে, তবে সব ক্ষেত্রে একইভাবে স্বাভাবিক নয়।", search: ["size great huge antonym small word choice বড়"],
    facts: [{ label: "Shared meaning", value: "greater than average size", banglaLabel: "মিল", banglaValue: "গড়ের চেয়ে বড় আকার" }, { label: "Usage note", value: "a big mistake is natural; a large mistake is less natural", banglaLabel: "ব্যবহারের নোট", banglaValue: "big mistake স্বাভাবিক; large mistake কম স্বাভাবিক।" }],
    sections: [section("warning", "Do not swap automatically", "স্বয়ংক্রিয়ভাবে বদলাবেন না", "Synonyms often overlap, but context and collocation decide whether a replacement sounds natural.", "Synonym-এর অর্থ মিললেও context ও collocation দেখে শব্দ বদলাতে হয়।", "warning")],
    examples: [{ english: "They live in a large house, but it was a big decision to move.", bangla: "তারা বড় একটি বাড়িতে থাকে, কিন্তু স্থান বদলানো ছিল বড় একটি সিদ্ধান্ত।" }],
  }),
  resource({
    id: "library-pattern-would-you-mind", categoryId: "library-category-sentence-patterns", type: "sentence-pattern", title: "Would you mind + -ing?", banglaTitle: "Would you mind + -ing?", level: "B1", topic: "requests", estimatedMinutes: 3,
    summary: "A polite pattern for asking someone to do something.", banglaSummary: "ভদ্রভাবে কাউকে কিছু করতে বলার pattern।", search: ["polite request opening window gerund would you mind অনুরোধ"],
    facts: [{ label: "Pattern", value: "Would you mind + verb-ing?", banglaLabel: "গঠন", banglaValue: "Would you mind + verb-ing?" }, { label: "Register", value: "Polite and neutral", banglaLabel: "ভঙ্গি", banglaValue: "ভদ্র ও নিরপেক্ষ" }],
    sections: [section("reply", "A useful reply", "উত্তরের ধরন", "A positive reply usually means you are willing: “Not at all.” Avoid reading the word mind as an automatic refusal.", "সম্মতিসূচক উত্তরে “Not at all” বলা হয়। mind শব্দটি দেখে ভুল করে না ভাববেন না।", "tip")],
    examples: [{ english: "Would you mind closing the door? — Not at all.", bangla: "আপনি কি দরজাটি বন্ধ করতে আপত্তি করবেন? — একদম না।" }],
  }),
  resource({
    id: "library-phrase-clarify", categoryId: "library-category-useful-phrases", type: "useful-phrase", title: "Could you clarify that, please?", banglaTitle: "আরেকটু পরিষ্কার করে বলবেন, অনুগ্রহ করে?", level: "A2", topic: "clarifying", estimatedMinutes: 2,
    summary: "A neutral phrase for asking for a clearer explanation.", banglaSummary: "কোনো কথা আরও পরিষ্কার করে জানতে চাওয়ার neutral বাক্য।", search: ["clarify explain again understand clarification পরিষ্কার বুঝিনি"],
    facts: [{ label: "Context", value: "Class, meeting or everyday conversation", banglaLabel: "প্রসঙ্গ", banglaValue: "ক্লাস, মিটিং বা দৈনন্দিন কথোপকথন" }, { label: "Formality", value: "Neutral", banglaLabel: "ভঙ্গি", banglaValue: "নিরপেক্ষ" }],
    sections: [section("alternative", "A simpler alternative", "সহজ বিকল্প", "You can also say, “Could you explain that again?” when you need repetition rather than detail.", "পুনরায় বলতে বললে “Could you explain that again?”-ও বলতে পারেন।", "tip")],
    examples: [{ english: "Could you clarify that, please? I am not sure which form to use.", bangla: "আরেকটু পরিষ্কার করে বলবেন? কোন form ব্যবহার করব বুঝতে পারছি না।" }],
  }),
  resource({
    id: "library-pronunciation-word-stress", categoryId: "library-category-pronunciation", type: "pronunciation", title: "Word stress: make one syllable clear", banglaTitle: "Word stress: একটি syllable স্পষ্ট করুন", level: "A2", topic: "word stress", estimatedMinutes: 4,
    summary: "English words often have one syllable that is clearer, longer or stronger.", banglaSummary: "ইংরেজি শব্দে একটি syllable সাধারণত বেশি স্পষ্ট, দীর্ঘ বা জোরালো হয়।", search: ["syllable stress pronunciation record present stress জোর"],
    facts: [{ label: "Audio", value: "No standalone audio sample in this reference", banglaLabel: "Audio", banglaValue: "এই reference-এ আলাদা audio নেই।" }],
    sections: [section("notice", "Listen for clarity, not force", "জোর নয়, স্পষ্টতা শুনুন", "Stressed syllables are not only louder. Vowel length and clear vowel quality can also matter. English varieties differ.", "Stressed syllable শুধু জোরে বলা নয়; vowel-এর দৈর্ঘ্য ও স্পষ্টতাও গুরুত্বপূর্ণ। ভিন্ন English variety-তে ভিন্নতা থাকতে পারে।", "tip")],
    examples: [{ english: "PREsent (noun) and preSENT (verb) can have different stress.", bangla: "PREsent (noun) এবং preSENT (verb)-এ stress ভিন্ন হতে পারে।" }],
  }),
  resource({
    id: "library-ipa-i-ee", categoryId: "library-category-pronunciation", type: "ipa", title: "/ɪ/ and /iː/: a useful contrast", banglaTitle: "/ɪ/ ও /iː/ ধ্বনির পার্থক্য", level: "A2", topic: "minimal pairs", estimatedMinutes: 4,
    summary: "A short versus longer vowel contrast in many English accents.", banglaSummary: "অনেক English accent-এ ছোট ও তুলনামূলক দীর্ঘ vowel-এর পার্থক্য।", search: ["ipa vowel ship sheep bit beat sound উচ্চারণ vowel"],
    facts: [{ label: "Symbols", value: "/ɪ/ and /iː/", banglaLabel: "চিহ্ন", banglaValue: "/ɪ/ এবং /iː/" }, { label: "Audio", value: "Use the existing pronunciation lab for browser-audio practice", banglaLabel: "Audio", banglaValue: "অনুশীলনের জন্য বিদ্যমান Pronunciation Lab ব্যবহার করুন।" }], audioStatus: "available",
    sections: [section("care", "Accent-aware note", "accent বিষয়ক নোট", "IPA examples are a learning guide, not a promise that every regional English variety produces an identical sound.", "IPA উদাহরণ শেখার সহায়তা; সব regional English-এ একদম একই ধ্বনির দাবি নয়।", "warning")],
    examples: [{ english: "ship /ʃɪp/ — sheep /ʃiːp/", bangla: "ship ও sheep-এর vowel শুনে পার্থক্য করুন।" }],
  }),
  resource({
    id: "library-writing-formal-email", categoryId: "library-category-writing", type: "writing", title: "A simple formal email structure", banglaTitle: "Formal email-এর সহজ গঠন", level: "B1", topic: "formal email", estimatedMinutes: 6,
    summary: "Write a clear purpose, focused details and respectful closing.", banglaSummary: "উদ্দেশ্য, প্রয়োজনীয় তথ্য ও সম্মানজনক শেষাংশ স্পষ্ট রাখুন।", search: ["email subject greeting purpose request closing sincerely আবেদন formal"],
    facts: [{ label: "Structure", value: "Subject → greeting → purpose → details → action → closing", banglaLabel: "গঠন", banglaValue: "Subject → greeting → উদ্দেশ্য → তথ্য → অনুরোধ → শেষাংশ" }],
    sections: [section("purpose", "State the purpose early", "উদ্দেশ্য আগে লিখুন", "In the first sentence, say why you are writing. Keep one main request per message when possible.", "প্রথম বাক্যেই কেন লিখছেন বলুন। সম্ভব হলে একটি email-এ একটি প্রধান অনুরোধ রাখুন।", "rule"), section("check", "Before sending", "পাঠানোর আগে", "Check the subject line, the name, dates, attachments and tone. Do not copy a template without adapting the facts.", "subject, নাম, তারিখ, attachment এবং tone পরীক্ষা করুন। তথ্য না বদলে কোনো template কপি করবেন না।", "warning")],
    examples: [{ english: "Subject: Request for an appointment\nDear Ms Rahman,\nI am writing to request a short appointment to discuss my course plan.\nKind regards,\nNadia", bangla: "Subject, greeting, purpose এবং respectful closing—চারটি অংশ খেয়াল করুন।" }],
  }),
  resource({
    id: "library-reading-main-idea", categoryId: "library-category-reading", type: "reading", title: "Find the main idea before every detail", banglaTitle: "বিস্তারিতের আগে মূল ভাব খুঁজুন", level: "A2", topic: "reading strategy", estimatedMinutes: 4,
    summary: "Use headings, first sentences and repeated words to identify a text's main point.", banglaSummary: "Heading, প্রথম বাক্য ও বারবার আসা শব্দ দেখে মূল ভাব ধরুন।", search: ["reading main idea heading topic sentence skim scan পড়া"],
    facts: [{ label: "Skill", value: "Skim first, then scan for a question.", banglaLabel: "কৌশল", banglaValue: "আগে skim করুন, তারপর প্রশ্ন অনুযায়ী scan করুন।" }],
    sections: [section("steps", "A short routine", "ছোট routine", "Read the title, notice the first sentence of each paragraph, then name the main point in your own words before answering detail questions.", "শিরোনাম ও প্রতিটি paragraph-এর প্রথম বাক্য দেখুন। তারপর নিজের ভাষায় মূল ভাব বলুন।", "rule")],
    examples: [{ english: "If “recycling” appears in the title and throughout the text, it is likely central to the main idea.", bangla: "শিরোনাম ও লেখাজুড়ে recycling থাকলে সেটি মূল ভাবের গুরুত্বপূর্ণ অংশ হতে পারে।" }],
  }),
  resource({
    id: "library-listening-transcript", categoryId: "library-category-listening", type: "listening", title: "Use a transcript in two passes", banglaTitle: "Transcript দুই ধাপে ব্যবহার করুন", level: "A2", topic: "listening strategy", estimatedMinutes: 4,
    summary: "Listen for the main message first; use a transcript to check what you missed afterwards.", banglaSummary: "আগে মূল কথা শুনুন; পরে transcript দেখে বাদ পড়া অংশ মিলিয়ে নিন।", search: ["transcript listen first second time শুনে transcript"],
    facts: [{ label: "Audio status", value: "This is a strategy reference; it has no standalone audio file.", banglaLabel: "Audio অবস্থা", banglaValue: "এটি কৌশল বিষয়ক reference; আলাদা audio নেই।" }],
    sections: [section("two-pass", "Two-pass routine", "দুই ধাপ", "First listen without reading. On the second pass, compare your notes with the transcript and save unfamiliar phrases for review.", "প্রথমবার না পড়ে শুনুন। দ্বিতীয়বার নিজের note-এর সঙ্গে transcript মিলিয়ে নতুন phrase সংরক্ষণ করুন।", "rule")],
    examples: [{ english: "First: “The speaker changed the meeting time.” Second: check the exact day and time in the transcript.", bangla: "প্রথমে মূল পরিবর্তন ধরুন, পরে transcript-এ সঠিক দিন ও সময় মিলিয়ে নিন।" }],
  }),
  resource({
    id: "library-communication-clarification", categoryId: "library-category-communication", type: "communication", title: "Clarify without stopping the conversation", banglaTitle: "কথোপকথন না থামিয়ে clarification", level: "B1", topic: "conversation", estimatedMinutes: 4,
    summary: "Ask a short follow-up question when a word, instruction or meaning is unclear.", banglaSummary: "কোনো শব্দ, নির্দেশ বা অর্থ অস্পষ্ট হলে ছোট follow-up প্রশ্ন করুন।", search: ["conversation follow up clarification mean by could you repeat যোগাযোগ"],
    facts: [{ label: "Goal", value: "Keep the exchange moving while checking meaning.", banglaLabel: "লক্ষ্য", banglaValue: "অর্থ নিশ্চিত করেও কথোপকথন চালিয়ে যাওয়া।" }],
    sections: [section("patterns", "Three useful moves", "তিনটি সহজ উপায়", "Ask “What do you mean by…?”, request “Could you repeat the last part?”, or confirm “Do you mean that…?”.", "“What do you mean by…?”, “Could you repeat the last part?” অথবা “Do you mean that…?” ব্যবহার করুন।", "rule")],
    examples: [{ english: "Do you mean that I should submit it today?", bangla: "আপনি কি বোঝাতে চেয়েছেন যে আজই জমা দেব?" }],
  }),
  resource({
    id: "library-usage-say-tell", categoryId: "library-category-english-usage", type: "english-usage", title: "say and tell", banglaTitle: "say ও tell", level: "A2", topic: "word choice", estimatedMinutes: 3,
    summary: "Say focuses on words spoken; tell commonly needs a person who receives information.", banglaSummary: "say কথাটির ওপর জোর দেয়; tell সাধারণত যাকে বলা হচ্ছে তাকে নেয়।", search: ["say tell speak talk someone something বলা বলা"],
    facts: [{ label: "Pattern", value: "say something; tell someone something", banglaLabel: "গঠন", banglaValue: "say something; tell someone something" }],
    sections: [section("contrast", "Check the object", "object দেখুন", "You can say “She said hello.” You usually tell a person: “She told me the news.”", "She said hello বলা যায়। tell-এর সঙ্গে সাধারণত ব্যক্তি আসে: She told me the news।", "rule")],
    examples: [{ english: "Please tell me the answer, not “say me the answer.”", bangla: "Please tell me the answer বলুন; say me the answer নয়।" }],
  }),
  resource({
    id: "library-quick-question-words", categoryId: "library-category-quick-reference", type: "quick-reference", title: "Question words at a glance", banglaTitle: "Question words এক নজরে", level: "A1", topic: "questions", estimatedMinutes: 3,
    summary: "Choose a question word according to the information you need.", banglaSummary: "যে তথ্য দরকার, সে অনুযায়ী question word বাছুন।", search: ["what where when who why how question words প্রশ্নবোধক শব্দ"],
    facts: [{ label: "what", value: "thing or information", banglaLabel: "what", banglaValue: "বস্তু বা তথ্য" }, { label: "where", value: "place", banglaLabel: "where", banglaValue: "স্থান" }, { label: "when", value: "time", banglaLabel: "when", banglaValue: "সময়" }, { label: "why / how", value: "reason / method or condition", banglaLabel: "why / how", banglaValue: "কারণ / উপায় বা অবস্থা" }],
    sections: [section("order", "Question order", "প্রশ্নের ক্রম", "With many present-simple questions, use a question word + do/does + subject + base verb.", "অনেক present simple প্রশ্নে question word + do/does + subject + base verb ব্যবহার হয়।", "rule")],
    examples: [{ english: "Where does your class begin?", bangla: "তোমার ক্লাস কোথায় শুরু হয়?" }],
  }),
];

export const phase8LibrarySeed = { source: phase8OriginalLibrarySource, categories: phase8LibraryCategories, resources: phase8LibraryResources };
