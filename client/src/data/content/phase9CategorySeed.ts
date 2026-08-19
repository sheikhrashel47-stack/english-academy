import type { LevelCode } from "@/domain/learning/types";

export type Phase9Category = {
  id: string;
  slug: string;
  family: string;
  familyBangla: string;
  title: string;
  banglaTitle: string;
  description: string;
  level: LevelCode;
  existingTopic?: string;
  /** Phase 9 primary allocation; 200 categories × 250 words = 50,000 words. */
  targetWordCount: 250;
};

type CategoryGroup = {
  family: string;
  familyBangla: string;
  level: LevelCode;
  entries: Array<[string, string, string]>;
};

const groups: CategoryGroup[] = [
  { family: "Study & learning", familyBangla: "পড়াশোনা ও শেখা", level: "A1", entries: [
    ["Focus & goals", "মনোযোগ ও লক্ষ্য", "study"], ["Classroom actions", "শ্রেণিকক্ষের কাজ", "study"], ["Memory & review", "মনে রাখা ও পুনরালোচনা", "study"], ["Questions & answers", "প্রশ্ন ও উত্তর", "study"], ["Learning methods", "শেখার পদ্ধতি", "study"], ["Research & discovery", "গবেষণা ও আবিষ্কার", "study"], ["Progress & growth", "অগ্রগতি ও উন্নতি", "study"], ["Tests & results", "পরীক্ষা ও ফলাফল", "study"], ["Books & reading", "বই ও পড়া", "study"], ["Plans for learning", "শেখার পরিকল্পনা", "study"],
  ]},
  { family: "Daily life", familyBangla: "দৈনন্দিন জীবন", level: "A1", entries: [
    ["Morning routines", "সকালের রুটিন", "daily"], ["Home & rooms", "বাড়ি ও ঘর", "daily"], ["Food & meals", "খাবার ও খাবারের সময়", "daily"], ["Shopping basics", "কেনাকাটার ভিত্তি", "daily"], ["Money & prices", "টাকা ও দাম", "daily"], ["Plans & appointments", "পরিকল্পনা ও সময় নির্ধারণ", "daily"], ["Household tasks", "ঘরের কাজ", "daily"], ["Clothes & belongings", "পোশাক ও জিনিসপত্র", "daily"], ["Free time", "অবসর সময়", "daily"], ["Safety at home", "বাড়ির নিরাপত্তা", "daily"],
  ]},
  { family: "Communication", familyBangla: "যোগাযোগ", level: "A2", entries: [
    ["Greetings & introductions", "শুভেচ্ছা ও পরিচয়", "Communication"], ["Opinions & agreement", "মতামত ও সম্মতি", "Communication"], ["Polite requests", "ভদ্র অনুরোধ", "Communication"], ["Explaining ideas", "ভাব ব্যাখ্যা করা", "Communication"], ["Clarifying meaning", "অর্থ পরিষ্কার করা", "Communication"], ["Phone conversations", "ফোনে কথোপকথন", "Communication"], ["Messages & email", "বার্তা ও ইমেইল", "Communication"], ["Feedback & response", "মতামত ও জবাব", "Communication"], ["Meetings & discussion", "সভা ও আলোচনা", "Communication"], ["Presentation language", "উপস্থাপনার ভাষা", "Communication"],
  ]},
  { family: "People & relationships", familyBangla: "মানুষ ও সম্পর্ক", level: "A2", entries: [
    ["Personal qualities", "ব্যক্তিগত গুণ", "People"], ["Family & relatives", "পরিবার ও আত্মীয়", "People"], ["Friends & support", "বন্ধু ও সহায়তা", "People"], ["Feelings & mood", "অনুভূতি ও মন-মেজাজ", "Feelings"], ["Conflict & repair", "দ্বন্দ্ব ও সমাধান", "People"], ["Respect & trust", "সম্মান ও বিশ্বাস", "People"], ["Describing people", "মানুষের বর্ণনা", "People"], ["Social invitations", "সামাজিক আমন্ত্রণ", "People"], ["Community life", "সামাজিক জীবন", "People"], ["Teamwork", "দলগত কাজ", "People"],
  ]},
  { family: "Life skills", familyBangla: "জীবনদক্ষতা", level: "B1", entries: [
    ["Decision making", "সিদ্ধান্ত নেওয়া", "Life skills"], ["Problem solving", "সমস্যা সমাধান", "Life skills"], ["Time management", "সময় ব্যবস্থাপনা", "Life skills"], ["Habits & routines", "অভ্যাস ও রুটিন", "Life skills"], ["Independence", "স্বনির্ভরতা", "Life skills"], ["Balance & wellbeing", "ভারসাম্য ও সুস্থতা", "Life skills"], ["Adaptation & change", "মানিয়ে নেওয়া ও পরিবর্তন", "Life skills"], ["Practical instructions", "ব্যবহারিক নির্দেশনা", "Life skills"], ["Goals & motivation", "লক্ষ্য ও অনুপ্রেরণা", "Life skills"], ["Confidence building", "আত্মবিশ্বাস তৈরি", "Life skills"],
  ]},
  { family: "Travel", familyBangla: "ভ্রমণ", level: "A1", entries: [
    ["Getting around", "যাতায়াত", "Travel"], ["Airports & flights", "বিমানবন্দর ও ফ্লাইট", "Travel"], ["Hotels & rooms", "হোটেল ও কক্ষ", "Travel"], ["Directions & maps", "দিকনির্দেশ ও মানচিত্র", "Travel"], ["Tickets & transport", "টিকিট ও পরিবহন", "Travel"], ["Places to visit", "দর্শনীয় স্থান", "Travel"], ["Travel problems", "ভ্রমণের সমস্যা", "Travel"], ["Local culture", "স্থানীয় সংস্কৃতি", "Travel"], ["Food while travelling", "ভ্রমণে খাবার", "Travel"], ["Travel stories", "ভ্রমণের গল্প", "Travel"],
  ]},
  { family: "Health & wellbeing", familyBangla: "স্বাস্থ্য ও সুস্থতা", level: "A2", entries: [
    ["Body & symptoms", "শরীর ও উপসর্গ", "Health"], ["Healthy habits", "স্বাস্থ্যকর অভ্যাস", "Health"], ["Exercise & movement", "ব্যায়াম ও নড়াচড়া", "Health"], ["Food & nutrition", "খাবার ও পুষ্টি", "Health"], ["Doctors & appointments", "ডাক্তার ও সাক্ষাৎ", "Health"], ["Medicine & care", "ওষুধ ও যত্ন", "Health"], ["Sleep & rest", "ঘুম ও বিশ্রাম", "Health"], ["Stress & calm", "চাপ ও শান্ত থাকা", "Health"], ["First aid", "প্রাথমিক চিকিৎসা", "Health"], ["Public health", "জনস্বাস্থ্য", "Health"],
  ]},
  { family: "Environment", familyBangla: "পরিবেশ", level: "B1", entries: [
    ["Nature & landscapes", "প্রকৃতি ও ভূদৃশ্য", "Environment"], ["Weather & climate", "আবহাওয়া ও জলবায়ু", "Environment"], ["Animals & habitats", "প্রাণী ও আবাসস্থল", "Environment"], ["Water & energy", "পানি ও শক্তি", "Environment"], ["Waste & recycling", "বর্জ্য ও পুনর্ব্যবহার", "Environment"], ["Pollution & protection", "দূষণ ও সুরক্ষা", "Environment"], ["Cities & green space", "শহর ও সবুজ স্থান", "Environment"], ["Farming & food systems", "কৃষি ও খাদ্যব্যবস্থা", "Environment"], ["Natural disasters", "প্রাকৃতিক দুর্যোগ", "Environment"], ["Sustainable choices", "টেকসই পছন্দ", "Environment"],
  ]},
  { family: "Technology", familyBangla: "প্রযুক্তি", level: "B1", entries: [
    ["Devices & screens", "ডিভাইস ও স্ক্রিন", "Technology"], ["Apps & accounts", "অ্যাপ ও অ্যাকাউন্ট", "Technology"], ["Search & information", "সার্চ ও তথ্য", "Technology"], ["Online learning", "অনলাইন শেখা", "Technology"], ["Files & documents", "ফাইল ও নথি", "Technology"], ["Privacy & safety", "গোপনীয়তা ও নিরাপত্তা", "Technology"], ["Messages & networks", "বার্তা ও নেটওয়ার্ক", "Technology"], ["Digital habits", "ডিজিটাল অভ্যাস", "Technology"], ["Tools & workflows", "টুল ও কাজের ধারা", "Technology"], ["Future technology", "ভবিষ্যৎ প্রযুক্তি", "Technology"],
  ]},
  { family: "Work & career", familyBangla: "কাজ ও পেশা", level: "B1", entries: [
    ["Jobs & roles", "চাকরি ও ভূমিকা", "Work"], ["Workplace basics", "কর্মক্ষেত্রের ভিত্তি", "Work"], ["Applications & CVs", "আবেদন ও CV", "Work"], ["Interviews", "সাক্ষাৎকার", "Work"], ["Projects & tasks", "প্রকল্প ও কাজ", "Work"], ["Deadlines & priorities", "শেষ সময় ও অগ্রাধিকার", "Work"], ["Meetings at work", "কর্মক্ষেত্রের সভা", "Work"], ["Customers & service", "গ্রাহক ও সেবা", "Work"], ["Leadership & teamwork", "নেতৃত্ব ও দলগত কাজ", "Work"], ["Career development", "পেশাগত উন্নয়ন", "Work"],
  ]},
  { family: "Description", familyBangla: "বর্ণনা", level: "A2", entries: [
    ["Size & shape", "আকার ও আকৃতি", "Description"], ["Colour & appearance", "রং ও চেহারা", "Description"], ["Quality & condition", "মান ও অবস্থা", "Description"], ["Movement & position", "নড়াচড়া ও অবস্থান", "Description"], ["Comparing things", "তুলনা করা", "Description"], ["Strong description", "জোরালো বর্ণনা", "Description"], ["Useful adjectives", "উপকারী adjective", "Description"], ["Objects around us", "আমাদের আশেপাশের বস্তু", "Description"], ["Places & atmosphere", "স্থান ও পরিবেশ", "Description"], ["First impressions", "প্রথম ধারণা", "Description"],
  ]},
  { family: "Time & planning", familyBangla: "সময় ও পরিকল্পনা", level: "A2", entries: [
    ["Days & dates", "দিন ও তারিখ", "Time"], ["Frequency", "কত ঘনঘন", "Time"], ["Duration", "সময়কাল", "Time"], ["Past events", "অতীত ঘটনা", "Time"], ["Current situations", "বর্তমান পরিস্থিতি", "Time"], ["Future plans", "ভবিষ্যৎ পরিকল্পনা", "Time"], ["Sequences", "ঘটনার ক্রম", "Time"], ["Deadlines", "শেষ সময়", "Time"], ["Schedules", "সময়সূচি", "Time"], ["Change over time", "সময়ের সঙ্গে পরিবর্তন", "Time"],
  ]},
  { family: "Culture & media", familyBangla: "সংস্কৃতি ও মিডিয়া", level: "B1", entries: [
    ["Music & sound", "সঙ্গীত ও শব্দ", "Culture"], ["Films & series", "সিনেমা ও সিরিজ", "Culture"], ["Books & stories", "বই ও গল্প", "Culture"], ["News & reports", "খবর ও প্রতিবেদন", "Culture"], ["Art & design", "শিল্প ও নকশা", "Culture"], ["Festivals & traditions", "উৎসব ও ঐতিহ্য", "Culture"], ["Opinions in media", "মিডিয়ায় মতামত", "Culture"], ["Reviews & ratings", "রিভিউ ও রেটিং", "Culture"], ["Creative projects", "সৃজনশীল প্রকল্প", "Culture"], ["Local stories", "স্থানীয় গল্প", "Culture"],
  ]},
  { family: "Society & community", familyBangla: "সমাজ ও কমিউনিটি", level: "B1", entries: [
    ["Rules & public places", "নিয়ম ও জনস্থান", "Community"], ["Services & facilities", "সেবা ও সুবিধা", "Community"], ["Education systems", "শিক্ষাব্যবস্থা", "Community"], ["Local government", "স্থানীয় সরকার", "Community"], ["Rights & duties", "অধিকার ও দায়িত্ব", "Community"], ["Equality & inclusion", "সমতা ও অন্তর্ভুক্তি", "Community"], ["Volunteering", "স্বেচ্ছাসেবা", "Community"], ["Neighbourhood life", "পাড়ার জীবন", "Community"], ["Community problems", "কমিউনিটির সমস্যা", "Community"], ["Civic participation", "নাগরিক অংশগ্রহণ", "Community"],
  ]},
  { family: "Ideas & reasoning", familyBangla: "ভাবনা ও যুক্তি", level: "B2", entries: [
    ["Causes & effects", "কারণ ও ফল", "Ideas"], ["Evidence & examples", "প্রমাণ ও উদাহরণ", "Ideas"], ["Problems & solutions", "সমস্যা ও সমাধান", "Ideas"], ["Advantages & risks", "সুবিধা ও ঝুঁকি", "Ideas"], ["Possibility & certainty", "সম্ভাবনা ও নিশ্চয়তা", "Ideas"], ["Agreement & contrast", "সম্মতি ও বৈপরীত্য", "Ideas"], ["Explaining process", "প্রক্রিয়া ব্যাখ্যা", "Ideas"], ["Summarising", "সারসংক্ষেপ", "Ideas"], ["Formal reasoning", "আনুষ্ঠানিক যুক্তি", "Ideas"], ["Critical thinking", "সমালোচনামূলক চিন্তা", "Ideas"],
  ]},
  { family: "Academic language", familyBangla: "একাডেমিক ভাষা", level: "B2", entries: [
    ["Academic verbs", "একাডেমিক verb", "Academic"], ["Research nouns", "গবেষণার noun", "Academic"], ["Data & charts", "ডেটা ও চার্ট", "Academic"], ["Essays & paragraphs", "রচনা ও অনুচ্ছেদ", "Academic"], ["Citations & sources", "উৎস ও citation", "Academic"], ["Definitions", "সংজ্ঞা", "Academic"], ["Trends & comparisons", "ধারা ও তুলনা", "Academic"], ["Conclusions", "উপসংহার", "Academic"], ["Seminars & lectures", "সেমিনার ও বক্তৃতা", "Academic"], ["Study strategy", "স্টাডি কৌশল", "Academic"],
  ]},
  { family: "Professional English", familyBangla: "পেশাগত ইংরেজি", level: "B2", entries: [
    ["Business updates", "ব্যবসায়িক আপডেট", "Professional"], ["Negotiation", "আলোচনা ও দরকষাকষি", "Professional"], ["Reports & briefings", "রিপোর্ট ও briefing", "Professional"], ["Professional email", "পেশাগত ইমেইল", "Professional"], ["Planning & delivery", "পরিকল্পনা ও বাস্তবায়ন", "Professional"], ["Performance & feedback", "কাজের ফল ও মতামত", "Professional"], ["Client communication", "ক্লায়েন্ট যোগাযোগ", "Professional"], ["Risk & decisions", "ঝুঁকি ও সিদ্ধান্ত", "Professional"], ["Policies & procedures", "নীতি ও প্রক্রিয়া", "Professional"], ["Professional growth", "পেশাগত উন্নতি", "Professional"],
  ]},
  { family: "Science & society", familyBangla: "বিজ্ঞান ও সমাজ", level: "B2", entries: [
    ["Basic science", "বিজ্ঞানের ভিত্তি", "Science"], ["Health science", "স্বাস্থ্যবিজ্ঞান", "Science"], ["Space & exploration", "মহাকাশ ও অনুসন্ধান", "Science"], ["Materials & energy", "উপাদান ও শক্তি", "Science"], ["The human body", "মানবদেহ", "Science"], ["Experiments", "পরীক্ষা-নিরীক্ষা", "Science"], ["Measurements", "পরিমাপ", "Science"], ["Scientific change", "বৈজ্ঞানিক পরিবর্তন", "Science"], ["Science news", "বিজ্ঞানের খবর", "Science"], ["Ethics & evidence", "নৈতিকতা ও প্রমাণ", "Science"],
  ]},
  { family: "Advanced fluency", familyBangla: "উন্নত সাবলীলতা", level: "C1", entries: [
    ["Nuance & emphasis", "সূক্ষ্মতা ও জোর", "Advanced"], ["Register & tone", "ভাষার ধরন ও tone", "Advanced"], ["Idiomatic meaning", "বাগধারার অর্থ", "Advanced"], ["Collocations", "শব্দ-সহযোগ", "Advanced"], ["Phrasal verbs", "phrasal verb", "Advanced"], ["Abstract concepts", "বিমূর্ত ধারণা", "Advanced"], ["Persuasive language", "প্রভাবশালী ভাষা", "Advanced"], ["Diplomatic language", "কূটনৈতিক ভাষা", "Advanced"], ["Natural conversation", "স্বাভাবিক কথোপকথন", "Advanced"], ["Precision & style", "নির্ভুলতা ও style", "Advanced"],
  ]},
  { family: "Everyday expressions", familyBangla: "দৈনন্দিন expression", level: "A2", entries: [
    ["Useful reactions", "দরকারি প্রতিক্রিয়া", "Expressions"], ["Agreeing naturally", "স্বাভাবিকভাবে সম্মতি", "Expressions"], ["Disagreeing politely", "ভদ্রভাবে অসম্মতি", "Expressions"], ["Starting a conversation", "কথা শুরু করা", "Expressions"], ["Keeping a conversation", "কথা চালিয়ে যাওয়া", "Expressions"], ["Ending a conversation", "কথা শেষ করা", "Expressions"], ["Making suggestions", "পরামর্শ দেওয়া", "Expressions"], ["Apologising", "ক্ষমা চাওয়া", "Expressions"], ["Thanking & responding", "ধন্যবাদ ও জবাব", "Expressions"], ["Surprise & excitement", "বিস্ময় ও উত্তেজনা", "Expressions"],
  ]},
];

const activeTopicMap: Record<string, string> = {
  study: "Study", daily: "Daily life", Communication: "Communication", People: "People", Feelings: "Feelings", "Life skills": "Life skills", Travel: "Travel", Health: "Health", Environment: "Environment", Technology: "Technology", Work: "Work", Description: "Description", Time: "Time",
};

export const phase9Categories: Phase9Category[] = groups.flatMap((group, groupIndex) => group.entries.map(([title, banglaTitle, topicKey], entryIndex) => {
  const slug = `${title.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${groupIndex + 1}-${entryIndex + 1}`;
  const existingTopic = activeTopicMap[topicKey];
  return {
    id: `phase9-category-${groupIndex + 1}-${entryIndex + 1}`,
    slug,
    family: group.family,
    familyBangla: group.familyBangla,
    title,
    banglaTitle,
    description: `এই category-তে ${title.toLocaleLowerCase("en-US")} নিয়ে ব্যবহারিক English vocabulary ধাপে ধাপে সাজানো হবে।`,
    level: group.level,
    targetWordCount: 250,
    ...(existingTopic ? { existingTopic } : {}),
  } satisfies Phase9Category;
}));

export const phase9Families = Array.from(new Set(phase9Categories.map((category) => category.family)));
export const phase9ActiveCategories = phase9Categories.filter((category) => category.existingTopic);
