/**
 * Content reminder — Emerald Study House: original, calm, Bangla-supported study prompts.
 * These local starter activities are deliberately short and rights-clear; they prove the
 * Skill Engine without claiming a complete commercial course library.
 */
import type { LabSkill, LevelCode, Phrase, SkillActivity, SkillActivityKind, SkillActivityStage, SkillContentSource } from "@/domain/learning/types";

const sourceId = "source-original-phase4-skills";
const activityVersion = "phase4-skills-1";
const updatedAt = "2026-08-19T00:00:00.000Z";

export const phase4SkillSources: SkillContentSource[] = [{
  id: sourceId,
  schemaVersion: 6,
  updatedAt,
  name: "English Academy original language-skills starter library",
  creator: "English Academy",
  license: "Original",
  attribution: "Original instructional content authored for English Academy.",
  commercialUseAllowed: true,
  notice: "Short original demonstration activities. No third-party audio, image, book, article, film, podcast or video material is included.",
}];

type Seed = {
  level: LevelCode; topic: string; title: string; banglaTitle: string; text?: string; prompt: string; banglaPrompt: string;
  options?: string[]; correctOption?: number; explanation?: string; role?: string; goal?: string; expectedLanguage?: string[];
};

const stages: SkillActivityStage[] = ["learn", "guided-practice", "independent-practice", "assessment", "review"];
const kindFor: Record<LabSkill, SkillActivityKind> = {
  listening: "listen-choose", pronunciation: "minimal-pair", speaking: "roleplay", reading: "reading-check", writing: "writing-task", communication: "communication-scenario",
};

function makeActivities(skill: LabSkill, seeds: Seed[]): SkillActivity[] {
  return seeds.map((seed, index) => {
    const stage = stages[index % stages.length];
    const options = seed.options?.map((text, optionIndex) => ({ id: `option-${optionIndex + 1}`, text }));
    const correctOptionId = seed.correctOption === undefined ? undefined : `option-${seed.correctOption + 1}`;
    const scored = Boolean(correctOptionId);
    return {
      id: `skill-${skill}-${String(index + 1).padStart(2, "0")}`,
      schemaVersion: 6,
      updatedAt,
      contentVersion: activityVersion,
      status: "published",
      tags: [skill, seed.topic, seed.level],
      skill,
      stage,
      kind: kindFor[skill],
      level: seed.level,
      topic: seed.topic,
      difficulty: Math.min(5, Math.max(1, Math.ceil((index + 1) / 4))) as 1 | 2 | 3 | 4 | 5,
      title: seed.title,
      banglaTitle: seed.banglaTitle,
      instructions: seed.prompt,
      banglaInstructions: seed.banglaPrompt,
      content: {
        text: seed.text,
        transcript: skill === "listening" ? seed.text : undefined,
        prompt: seed.prompt,
        banglaPrompt: seed.banglaPrompt,
        options,
        correctOptionId,
        explanation: seed.explanation,
        expectedLanguage: seed.expectedLanguage,
        role: seed.role,
        goal: seed.goal,
        preparationSeconds: skill === "speaking" || skill === "communication" ? 30 : undefined,
        speakingSeconds: skill === "speaking" || skill === "communication" ? 45 : undefined,
      },
      estimatedTime: skill === "reading" || skill === "writing" ? 6 : 4,
      prerequisites: [],
      assessment: { required: stage === "assessment", minimumScore: scored && stage === "assessment" ? 70 : undefined, transcriptAllowed: skill !== "listening" || stage !== "assessment", confidenceRequired: !scored },
      completionRule: scored ? { type: "correct" } : { type: "self-reflection" },
      sourceId,
      license: "Original",
      attribution: "Original instructional content authored for English Academy.",
      commercialUseAllowed: true,
    };
  });
}

const listeningSeeds: Seed[] = [
  { level: "Pre-A1", topic: "greetings", title: "A first hello", banglaTitle: "প্রথম hello", text: "Hello. I am Nila.", prompt: "Listen and choose the speaker's name.", banglaPrompt: "শুনে বক্তার নাম বেছে নাও।", options: ["Nila", "Rafi", "Maya"], correctOption: 0, explanation: "The speaker says: I am Nila." },
  { level: "Pre-A1", topic: "numbers", title: "Two apples", banglaTitle: "দুটি আপেল", text: "I have two apples.", prompt: "How many apples do you hear?", banglaPrompt: "কয়টি আপেল শুনতে পাও?", options: ["One", "Two", "Three"], correctOption: 1, explanation: "Listen for the number word two." },
  { level: "Pre-A1", topic: "classroom", title: "A blue pen", banglaTitle: "নীল কলম", text: "This is a blue pen.", prompt: "Choose the colour you hear.", banglaPrompt: "শোনা রঙটি বেছে নাও।", options: ["Blue", "Red", "Green"], correctOption: 0, explanation: "The colour is blue." },
  { level: "A1", topic: "daily-life", title: "Morning tea", banglaTitle: "সকালের চা", text: "I drink tea at seven in the morning.", prompt: "When does the speaker drink tea?", banglaPrompt: "বক্তা কখন চা পান করেন?", options: ["At seven", "At noon", "At night"], correctOption: 0, explanation: "The time phrase is at seven in the morning." },
  { level: "A1", topic: "family", title: "My sister", banglaTitle: "আমার বোন", text: "My sister walks to school with me.", prompt: "Who walks to school?", banglaPrompt: "কে স্কুলে হেঁটে যায়?", options: ["My sister", "My father", "My teacher"], correctOption: 0, explanation: "The sentence begins with My sister." },
  { level: "A1", topic: "shopping", title: "A small list", banglaTitle: "ছোট বাজারের তালিকা", text: "Please buy milk, bread, and eggs.", prompt: "Which item is not on the list?", banglaPrompt: "কোন জিনিসটি তালিকায় নেই?", options: ["Milk", "Rice", "Eggs"], correctOption: 1, explanation: "Rice is not mentioned." },
  { level: "A2", topic: "travel", title: "The bus stop", banglaTitle: "বাসস্টপ", text: "The bus to the museum leaves at half past nine.", prompt: "What time does the bus leave?", banglaPrompt: "বাসটি কখন ছাড়ে?", options: ["9:30", "8:30", "10:30"], correctOption: 0, explanation: "Half past nine means 9:30." },
  { level: "A2", topic: "food", title: "Dinner plan", banglaTitle: "রাতের খাবারের পরিকল্পনা", text: "Let's cook rice and vegetables because our guest is vegetarian.", prompt: "Why are they cooking vegetables?", banglaPrompt: "তারা সবজি রান্না করছে কেন?", options: ["A guest is vegetarian", "They have no rice", "It is breakfast"], correctOption: 0, explanation: "The reason is stated after because." },
  { level: "A2", topic: "health", title: "A doctor's reminder", banglaTitle: "ডাক্তারের পরামর্শ", text: "Take this medicine after lunch and drink plenty of water.", prompt: "When should the medicine be taken?", banglaPrompt: "ওষুধটি কখন খেতে হবে?", options: ["After lunch", "Before breakfast", "Before sleep"], correctOption: 0, explanation: "The timing phrase is after lunch." },
  { level: "B1", topic: "work", title: "Changed meeting", banglaTitle: "পরিবর্তিত মিটিং", text: "Our meeting has moved to Thursday because the manager is travelling on Wednesday.", prompt: "Why has the meeting moved?", banglaPrompt: "মিটিংটি কেন বদলানো হয়েছে?", options: ["The manager is travelling", "The room is closed", "The team is ill"], correctOption: 0, explanation: "The cause is directly stated." },
  { level: "B1", topic: "community", title: "Library volunteers", banglaTitle: "লাইব্রেরি স্বেচ্ছাসেবক", text: "The library needs volunteers to sort donated books on Saturday afternoon.", prompt: "What will volunteers do?", banglaPrompt: "স্বেচ্ছাসেবকেরা কী করবে?", options: ["Sort donated books", "Paint walls", "Teach music"], correctOption: 0, explanation: "The task is to sort donated books." },
  { level: "B1", topic: "environment", title: "Rainy commute", banglaTitle: "বৃষ্টির যাত্রাপথ", text: "Although it rained heavily, the train arrived only ten minutes late.", prompt: "How late was the train?", banglaPrompt: "ট্রেনটি কত মিনিট দেরি করেছিল?", options: ["Ten minutes", "One hour", "It was early"], correctOption: 0, explanation: "Only ten minutes late is the key detail." },
  { level: "B2", topic: "study", title: "Research method", banglaTitle: "গবেষণার পদ্ধতি", text: "The researcher interviewed thirty students before comparing their answers with survey results.", prompt: "What happened before the comparison?", banglaPrompt: "তুলনার আগে কী করা হয়েছিল?", options: ["Thirty students were interviewed", "The report was published", "The survey was cancelled"], correctOption: 0, explanation: "Interviewing happened first." },
  { level: "B2", topic: "work", title: "Project risk", banglaTitle: "প্রকল্পের ঝুঁকি", text: "The deadline is realistic provided that the design team receives the final brief today.", prompt: "What condition makes the deadline realistic?", banglaPrompt: "কোন শর্তে deadline বাস্তবসম্মত?", options: ["Receiving the final brief today", "Hiring a new team", "Reducing the budget"], correctOption: 0, explanation: "Provided that introduces the condition." },
  { level: "B2", topic: "culture", title: "Museum guide", banglaTitle: "জাদুঘর গাইড", text: "The guide encouraged visitors to notice how the artist used empty space to create tension.", prompt: "What did the guide encourage visitors to notice?", banglaPrompt: "গাইড দর্শনার্থীদের কী লক্ষ্য করতে বলেছিলেন?", options: ["Empty space", "Ticket prices", "The café"], correctOption: 0, explanation: "The artistic focus is empty space." },
  { level: "C1", topic: "society", title: "A careful claim", banglaTitle: "সতর্ক দাবি", text: "The report does not prove that remote work improves productivity; it merely identifies a possible relationship.", prompt: "What is the report's position?", banglaPrompt: "report-এর অবস্থান কী?", options: ["It identifies a possible relationship", "It proves productivity rises", "It rejects remote work"], correctOption: 0, explanation: "Merely signals a cautious conclusion." },
  { level: "C1", topic: "education", title: "Seminar conclusion", banglaTitle: "সেমিনারের উপসংহার", text: "The lecturer concluded that memorisation has value, though it should not replace critical interpretation.", prompt: "What balance does the lecturer propose?", banglaPrompt: "lecturer কোন ভারসাম্যের কথা বলেছেন?", options: ["Memorisation with critical interpretation", "Only memorisation", "No interpretation"], correctOption: 0, explanation: "The word though marks the qualification." },
  { level: "C1", topic: "technology", title: "Pilot programme", banglaTitle: "pilot programme", text: "The pilot succeeded technically, yet the cost of maintaining it may prevent a wider rollout.", prompt: "What may stop wider rollout?", banglaPrompt: "বড় পরিসরে চালু হতে কী বাধা হতে পারে?", options: ["Maintenance cost", "Technical failure", "Lack of pilots"], correctOption: 0, explanation: "The technical side succeeded; cost is the issue." },
  { level: "C2", topic: "argument", title: "Nuanced evidence", banglaTitle: "সূক্ষ্ম প্রমাণ", text: "The evidence is suggestive rather than conclusive, so the proposal warrants further scrutiny before adoption.", prompt: "What should happen before adoption?", banglaPrompt: "গ্রহণের আগে কী হওয়া উচিত?", options: ["Further scrutiny", "Immediate approval", "No discussion"], correctOption: 0, explanation: "Suggestive rather than conclusive calls for scrutiny." },
  { level: "C2", topic: "academic", title: "Interpretive contrast", banglaTitle: "ব্যাখ্যাগত বৈপরীত্য", text: "While the figures appear stable overall, regional variation complicates any simple narrative of improvement.", prompt: "What complicates the narrative?", banglaPrompt: "কী কারণে সরল উন্নতির গল্প জটিল হয়েছে?", options: ["Regional variation", "Stable figures", "Missing data"], correctOption: 0, explanation: "The contrast introduces regional variation." },
];

const pronunciationSeeds: Seed[] = [
  { level: "Pre-A1", topic: "phonics", title: "Sound /m/", banglaTitle: "ধ্বনি /m/", text: "map, moon, me", prompt: "Listen, then record the three /m/ words slowly.", banglaPrompt: "শোনো, তারপর ধীরে তিনটি /m/ শব্দ record করো।", expectedLanguage: ["map", "moon", "me"] },
  { level: "Pre-A1", topic: "phonics", title: "Sound /s/", banglaTitle: "ধ্বনি /s/", text: "sun, sip, see", prompt: "Repeat the /s/ sound at the start of each word.", banglaPrompt: "প্রতিটি শব্দের শুরুতে /s/ ধ্বনি বলো।", expectedLanguage: ["sun", "sip", "see"] },
  { level: "Pre-A1", topic: "vowels", title: "Short a", banglaTitle: "ছোট a", text: "cat, hat, bag", prompt: "Say the short vowel in cat, hat, and bag.", banglaPrompt: "cat, hat এবং bag-এর ছোট vowel বলো।", expectedLanguage: ["cat", "hat", "bag"] },
  { level: "A1", topic: "minimal-pairs", title: "Ship and sheep", banglaTitle: "ship ও sheep", text: "ship / sheep", prompt: "Listen, choose a pair, and record both words clearly.", banglaPrompt: "শোনো, জোড়াটি বেছে নিয়ে দুই শব্দ স্পষ্ট করে record করো।", expectedLanguage: ["ship", "sheep"] },
  { level: "A1", topic: "minimal-pairs", title: "Bit and beat", banglaTitle: "bit ও beat", text: "bit / beat", prompt: "Keep the first vowel short and the second vowel longer.", banglaPrompt: "প্রথম vowel ছোট এবং দ্বিতীয়টি দীর্ঘ রাখো।", expectedLanguage: ["bit", "beat"] },
  { level: "A1", topic: "consonants", title: "Fan and van", banglaTitle: "fan ও van", text: "fan / van", prompt: "Practise the air sound in fan and voice in van.", banglaPrompt: "fan-এর বাতাসের ধ্বনি ও van-এর voiced ধ্বনি অনুশীলন করো।", expectedLanguage: ["fan", "van"] },
  { level: "A2", topic: "syllables", title: "Three syllables", banglaTitle: "তিন syllable", text: "en-er-gy", prompt: "Clap three beats, then say energy.", banglaPrompt: "তিনবার clap করে energy বলো।", expectedLanguage: ["energy"] },
  { level: "A2", topic: "word-stress", title: "PHOtograph", banglaTitle: "PHOtograph", text: "PHOtograph", prompt: "Place the strongest stress on the first syllable.", banglaPrompt: "প্রথম syllable-এ সবচেয়ে বেশি stress দাও।", expectedLanguage: ["photograph"] },
  { level: "A2", topic: "word-stress", title: "phoTOGraphy", banglaTitle: "phoTOGraphy", text: "phoTOGraphy", prompt: "Move the strongest stress to TOG.", banglaPrompt: "সবচেয়ে বেশি stress TOG-এ দাও।", expectedLanguage: ["photography"] },
  { level: "B1", topic: "sentence-stress", title: "Important word", banglaTitle: "গুরুত্বপূর্ণ শব্দ", text: "I ordered the BLUE notebook.", prompt: "Say the sentence with extra stress on BLUE.", banglaPrompt: "BLUE শব্দে বাড়তি stress দিয়ে বাক্যটি বলো।", expectedLanguage: ["blue"] },
  { level: "B1", topic: "intonation", title: "Yes or no question", banglaTitle: "হ্যাঁ/না প্রশ্ন", text: "Are you ready?", prompt: "Use rising intonation at the end.", banglaPrompt: "শেষে উঠতি intonation ব্যবহার করো।", expectedLanguage: ["Are you ready?"] },
  { level: "B1", topic: "intonation", title: "WH question", banglaTitle: "WH প্রশ্ন", text: "Where are you going?", prompt: "Use a natural falling intonation at the end.", banglaPrompt: "শেষে স্বাভাবিক falling intonation ব্যবহার করো।", expectedLanguage: ["Where are you going?"] },
  { level: "B2", topic: "linking", title: "Link it together", banglaTitle: "ধ্বনি জোড়া দাও", text: "pick it up", prompt: "Connect the final consonant to the next vowel naturally.", banglaPrompt: "শেষ consonant-টি পরের vowel-এর সঙ্গে স্বাভাবিকভাবে জোড়া দাও।", expectedLanguage: ["pick it up"] },
  { level: "B2", topic: "rhythm", title: "Content-word rhythm", banglaTitle: "content word rhythm", text: "She SENT the REPORT this MORNING.", prompt: "Keep the content words clear and let function words stay lighter.", banglaPrompt: "content word স্পষ্ট বলো, function word তুলনামূলক হালকা রাখো।", expectedLanguage: ["sent", "report", "morning"] },
  { level: "B2", topic: "connected-speech", title: "Could you", banglaTitle: "Could you", text: "Could you help me?", prompt: "Say the phrase smoothly as one short request.", banglaPrompt: "ছোট অনুরোধ হিসেবে বাক্যটি মসৃণভাবে বলো।", expectedLanguage: ["Could you help me?"] },
  { level: "C1", topic: "emphasis", title: "Contrastive stress", banglaTitle: "তুলনামূলক stress", text: "I said Tuesday, not Thursday.", prompt: "Use stress to correct the day politely.", banglaPrompt: "ভদ্রভাবে দিনের ভুল ঠিক করতে stress ব্যবহার করো।", expectedLanguage: ["Tuesday", "Thursday"] },
  { level: "C1", topic: "pace", title: "Clear pacing", banglaTitle: "স্পষ্ট গতি", text: "The proposal requires careful consideration.", prompt: "Record at a measured pace with clear word boundaries.", banglaPrompt: "পরিমিত গতিতে এবং শব্দ আলাদা করে record করো।", expectedLanguage: ["The proposal requires careful consideration."] },
  { level: "C1", topic: "intonation", title: "Qualified opinion", banglaTitle: "শর্তযুক্ত মতামত", text: "It may be useful, although we need more evidence.", prompt: "Show caution in the first clause and firm emphasis on evidence.", banglaPrompt: "প্রথম clause-এ সতর্কতা ও evidence-এ স্পষ্ট জোর দাও।", expectedLanguage: ["It may be useful"] },
  { level: "C2", topic: "rhetoric", title: "Balanced claim", banglaTitle: "ভারসাম্যপূর্ণ দাবি", text: "The findings are compelling, but not yet definitive.", prompt: "Use intonation to balance confidence with reservation.", banglaPrompt: "আত্মবিশ্বাস ও সংরক্ষণের ভারসাম্য দেখাতে intonation ব্যবহার করো।", expectedLanguage: ["compelling", "not yet definitive"] },
  { level: "C2", topic: "presentation", title: "Formal transition", banglaTitle: "formal transition", text: "With that limitation in mind, I will turn to the results.", prompt: "Deliver the transition clearly, with a short purposeful pause.", banglaPrompt: "উদ্দেশ্যমূলক ছোট বিরতি দিয়ে transition-টি স্পষ্ট বলো।", expectedLanguage: ["With that limitation in mind"] },
];

const speakingSeeds: Seed[] = [
  { level: "Pre-A1", topic: "greetings", title: "Say hello", banglaTitle: "hello বলো", prompt: "Record: Hello. My name is ___.", banglaPrompt: "record করো: Hello. My name is ___.", role: "New classmate", goal: "Give a simple greeting", expectedLanguage: ["Hello", "My name is"] },
  { level: "Pre-A1", topic: "classroom", title: "Ask for a pen", banglaTitle: "কলম চাও", prompt: "Ask politely for a pen.", banglaPrompt: "ভদ্রভাবে একটি কলম চাও।", role: "Student", goal: "Make one simple request", expectedLanguage: ["Can I have", "please"] },
  { level: "Pre-A1", topic: "feelings", title: "Name a feeling", banglaTitle: "অনুভূতি বলো", prompt: "Record one sentence: I am happy today.", banglaPrompt: "একটি বাক্য record করো: I am happy today.", role: "Learner", goal: "Use I am", expectedLanguage: ["I am"] },
  { level: "A1", topic: "daily-life", title: "My morning", banglaTitle: "আমার সকাল", prompt: "Describe two things you do in the morning.", banglaPrompt: "সকালে তুমি দুটি কী কাজ করো বলো।", role: "Friend", goal: "Use present simple", expectedLanguage: ["I", "in the morning"] },
  { level: "A1", topic: "family", title: "Introduce family", banglaTitle: "পরিবার পরিচয়", prompt: "Introduce one family member in two sentences.", banglaPrompt: "দুই বাক্যে পরিবারের একজনকে পরিচয় করাও।", role: "Class partner", goal: "Use he or she", expectedLanguage: ["This is", "He/She"] },
  { level: "A1", topic: "food", title: "Order a drink", banglaTitle: "পানীয় অর্ডার", prompt: "Order a drink politely at a café.", banglaPrompt: "café-তে ভদ্রভাবে একটি পানীয় order করো।", role: "Customer", goal: "Use I would like", expectedLanguage: ["I would like"] },
  { level: "A2", topic: "travel", title: "Ask for directions", banglaTitle: "পথ জিজ্ঞেস", prompt: "Ask how to get to the station, then thank the person.", banglaPrompt: "station-এ যাওয়ার পথ জিজ্ঞেস করে ধন্যবাদ দাও।", role: "Visitor", goal: "Ask for directions", expectedLanguage: ["How can I get", "Thank you"] },
  { level: "A2", topic: "shopping", title: "Return an item", banglaTitle: "পণ্য ফেরত", prompt: "Explain that a shirt is too small and ask to exchange it.", banglaPrompt: "shirt ছোট হয়েছে বলো এবং বদলাতে চাও।", role: "Customer", goal: "Explain a simple problem", expectedLanguage: ["too small", "exchange"] },
  { level: "A2", topic: "health", title: "Describe a symptom", banglaTitle: "উপসর্গ বলো", prompt: "Tell a doctor that you have had a headache since yesterday.", banglaPrompt: "ডাক্তারকে বলো গতকাল থেকে তোমার মাথাব্যথা হচ্ছে।", role: "Patient", goal: "Use since", expectedLanguage: ["headache", "since yesterday"] },
  { level: "B1", topic: "experience", title: "A useful trip", banglaTitle: "উপকারী ভ্রমণ", prompt: "Describe a trip that taught you something useful.", banglaPrompt: "তোমাকে কিছু শিখিয়েছে এমন ভ্রমণের বর্ণনা দাও।", role: "Storyteller", goal: "Sequence an experience", expectedLanguage: ["First", "then", "because"] },
  { level: "B1", topic: "work", title: "Suggest a solution", banglaTitle: "সমাধান প্রস্তাব", prompt: "Suggest one practical way to reduce delays in a team project.", banglaPrompt: "team project-এ দেরি কমানোর একটি বাস্তব উপায় বলো।", role: "Team member", goal: "Make a suggestion", expectedLanguage: ["I suggest", "because"] },
  { level: "B1", topic: "opinion", title: "Screen time", banglaTitle: "screen time", prompt: "Give your opinion about screen time for students and one reason.", banglaPrompt: "শিক্ষার্থীদের screen time নিয়ে মতামত ও একটি কারণ বলো।", role: "Discussion partner", goal: "State an opinion", expectedLanguage: ["I think", "because"] },
  { level: "B2", topic: "work", title: "Meeting update", banglaTitle: "মিটিং update", prompt: "Give a concise project update: progress, challenge, and next step.", banglaPrompt: "progress, challenge এবং next stepসহ সংক্ষিপ্ত project update দাও।", role: "Project lead", goal: "Structure an update", expectedLanguage: ["progress", "challenge", "next"] },
  { level: "B2", topic: "education", title: "Defend a choice", banglaTitle: "পছন্দের পক্ষে যুক্তি", prompt: "Recommend one study method and respond to one possible objection.", banglaPrompt: "একটি study method recommend করো এবং সম্ভাব্য একটি আপত্তির উত্তর দাও।", role: "Presenter", goal: "Support a position", expectedLanguage: ["although", "however"] },
  { level: "B2", topic: "travel", title: "Solve a booking problem", banglaTitle: "booking সমস্যা সমাধান", prompt: "Explain a booking error to a hotel receptionist and ask for a solution.", banglaPrompt: "hotel receptionist-কে booking error বুঝিয়ে সমাধান চাও।", role: "Guest", goal: "Negotiate politely", expectedLanguage: ["There seems to be", "Could you"] },
  { level: "C1", topic: "argument", title: "Qualified argument", banglaTitle: "শর্তযুক্ত যুক্তি", prompt: "Present a balanced argument about remote work, including one limitation.", banglaPrompt: "remote work নিয়ে ভারসাম্যপূর্ণ যুক্তি দাও এবং একটি সীমাবদ্ধতা বলো।", role: "Seminar speaker", goal: "Qualify a claim", expectedLanguage: ["on the one hand", "however"] },
  { level: "C1", topic: "presentation", title: "Interpret data", banglaTitle: "data ব্যাখ্যা", prompt: "Explain a trend, an exception, and what further data you would need.", banglaPrompt: "একটি trend, ব্যতিক্রম এবং আর কী data দরকার তা ব্যাখ্যা করো।", role: "Analyst", goal: "Use cautious language", expectedLanguage: ["suggests", "may indicate"] },
  { level: "C1", topic: "discussion", title: "Build consensus", banglaTitle: "সম্মতি তৈরি", prompt: "Summarise two positions and propose a compromise.", banglaPrompt: "দুটি অবস্থান সংক্ষেপে বলো এবং একটি compromise প্রস্তাব করো।", role: "Meeting chair", goal: "Facilitate discussion", expectedLanguage: ["Both sides", "perhaps we could"] },
  { level: "C2", topic: "academic", title: "Nuanced response", banglaTitle: "সূক্ষ্ম উত্তর", prompt: "Respond to a complex claim by distinguishing correlation from causation.", banglaPrompt: "correlation ও causation আলাদা করে জটিল দাবির উত্তর দাও।", role: "Academic discussant", goal: "Make a precise distinction", expectedLanguage: ["does not necessarily", "correlation"] },
  { level: "C2", topic: "presentation", title: "Close a proposal", banglaTitle: "proposal সমাপ্তি", prompt: "Conclude a proposal with a recommendation, risk, and condition for success.", banglaPrompt: "recommendation, risk এবং সাফল্যের শর্তসহ proposal শেষ করো।", role: "Senior presenter", goal: "Conclude persuasively", expectedLanguage: ["recommend", "provided that"] },
];

const readingSeeds: Seed[] = [
  { level: "Pre-A1", topic: "objects", title: "My red bag", banglaTitle: "আমার লাল ব্যাগ", text: "This is my red bag. It has one book.", prompt: "What is in the bag?", banglaPrompt: "ব্যাগে কী আছে?", options: ["One book", "Two pens", "A cup"], correctOption: 0, explanation: "The passage says it has one book." },
  { level: "Pre-A1", topic: "animals", title: "A small cat", banglaTitle: "ছোট বিড়াল", text: "Mimi is a small cat. Mimi likes milk.", prompt: "What does Mimi like?", banglaPrompt: "Mimi কী পছন্দ করে?", options: ["Milk", "Tea", "Rice"], correctOption: 0, explanation: "Mimi likes milk." },
  { level: "Pre-A1", topic: "weather", title: "Sunny day", banglaTitle: "রৌদ্রোজ্জ্বল দিন", text: "Today is sunny. I wear my hat.", prompt: "Why does the writer wear a hat?", banglaPrompt: "লেখক কেন টুপি পরে?", options: ["It is sunny", "It is snowy", "It is dark"], correctOption: 0, explanation: "The weather is sunny." },
  { level: "A1", topic: "routine", title: "After school", banglaTitle: "স্কুলের পরে", text: "After school, Arif plays football for one hour. Then he does his homework.", prompt: "What does Arif do after football?", banglaPrompt: "football-এর পরে Arif কী করে?", options: ["Homework", "Dinner", "Sleep"], correctOption: 0, explanation: "Then introduces the next action." },
  { level: "A1", topic: "food", title: "A simple recipe", banglaTitle: "সহজ recipe", text: "To make a fruit salad, wash the fruit and cut it into small pieces.", prompt: "What should you do first?", banglaPrompt: "প্রথমে কী করবে?", options: ["Wash the fruit", "Eat the fruit", "Add salt"], correctOption: 0, explanation: "Washing comes first." },
  { level: "A1", topic: "friends", title: "Weekend plan", banglaTitle: "সপ্তাহান্তের পরিকল্পনা", text: "Lima and Sumi will meet at the park on Saturday. They will bring a ball.", prompt: "Where will they meet?", banglaPrompt: "তারা কোথায় দেখা করবে?", options: ["At the park", "At school", "At a shop"], correctOption: 0, explanation: "The meeting place is the park." },
  { level: "A2", topic: "travel", title: "Lost umbrella", banglaTitle: "হারানো ছাতা", text: "Nabil left his umbrella on the bus. He called the bus company to ask if it had been found.", prompt: "Why did Nabil call the company?", banglaPrompt: "Nabil কেন company-তে ফোন করেছিল?", options: ["To find his umbrella", "To buy a ticket", "To change a route"], correctOption: 0, explanation: "He wants to know whether it was found." },
  { level: "A2", topic: "community", title: "Clean street day", banglaTitle: "পরিচ্ছন্ন রাস্তা দিবস", text: "Neighbours cleaned the street together. Afterwards, they planted flowers near the corner.", prompt: "What happened after the street was cleaned?", banglaPrompt: "রাস্তা পরিষ্কারের পরে কী হয়েছিল?", options: ["Flowers were planted", "Cars were sold", "A shop closed"], correctOption: 0, explanation: "Afterwards introduces the final action." },
  { level: "A2", topic: "study", title: "A quiet place", banglaTitle: "শান্ত জায়গা", text: "Rupa studies in the library because her home is noisy in the evening. She usually stays for two hours.", prompt: "Why does Rupa study in the library?", banglaPrompt: "Rupa কেন library-তে পড়ে?", options: ["Her home is noisy", "The library is closed", "She dislikes books"], correctOption: 0, explanation: "The reason follows because." },
  { level: "B1", topic: "environment", title: "Reusable cup", banglaTitle: "পুনর্ব্যবহারযোগ্য cup", text: "A local café offered a small discount to customers who brought reusable cups. Within a month, fewer disposable cups were used.", prompt: "What was one result of the discount?", banglaPrompt: "discount-এর একটি ফল কী ছিল?", options: ["Fewer disposable cups", "Higher ticket prices", "Shorter opening hours"], correctOption: 0, explanation: "The result is stated in the second sentence." },
  { level: "B1", topic: "work", title: "Team notes", banglaTitle: "team notes", text: "The team began writing shared notes after meetings. This helped absent members understand decisions without asking for a second meeting.", prompt: "What problem did the notes solve?", banglaPrompt: "notes কোন সমস্যার সমাধান করেছিল?", options: ["Absent members missing decisions", "Late buses", "No meeting room"], correctOption: 0, explanation: "They helped absent members understand decisions." },
  { level: "B1", topic: "health", title: "Walking group", banglaTitle: "হাঁটার দল", text: "A walking group met twice a week. Members said the regular schedule made it easier to continue the habit.", prompt: "Why did members continue walking?", banglaPrompt: "সদস্যরা কেন হাঁটা চালিয়ে যেতে পেরেছিল?", options: ["A regular schedule", "A competition", "A new gym"], correctOption: 0, explanation: "The schedule supported consistency." },
  { level: "B2", topic: "technology", title: "Public feedback", banglaTitle: "জনমত", text: "Before launching the app, the team invited a small group of users to test it. Their feedback revealed navigation problems that the designers had not noticed.", prompt: "What did testing reveal?", banglaPrompt: "testing কী প্রকাশ করেছে?", options: ["Navigation problems", "A new price", "A legal issue"], correctOption: 0, explanation: "The feedback revealed navigation problems." },
  { level: "B2", topic: "education", title: "Peer review", banglaTitle: "সহপাঠী review", text: "Students exchanged draft reports and used a checklist to give feedback. Many revised their conclusions after receiving questions from classmates.", prompt: "What encouraged revisions?", banglaPrompt: "কী কারণে revision হয়েছিল?", options: ["Questions from classmates", "A shorter deadline", "New textbooks"], correctOption: 0, explanation: "Classmate questions led to revision." },
  { level: "B2", topic: "society", title: "Local survey", banglaTitle: "স্থানীয় survey", text: "The survey found broad support for more green spaces, although residents disagreed about which neighbourhood should be improved first.", prompt: "What did residents disagree about?", banglaPrompt: "বাসিন্দারা কী বিষয়ে একমত ছিল না?", options: ["Which neighbourhood first", "Whether green space helps", "Who conducted the survey"], correctOption: 0, explanation: "Although introduces the disagreement." },
  { level: "C1", topic: "research", title: "Method and meaning", banglaTitle: "পদ্ধতি ও অর্থ", text: "The study combines interviews with numerical data, allowing the researchers to compare personal accounts with wider patterns. However, the sample remains too small for sweeping conclusions.", prompt: "What limitation does the passage identify?", banglaPrompt: "passage কোন সীমাবদ্ধতা বলেছে?", options: ["A small sample", "No interviews", "No data"], correctOption: 0, explanation: "The sample is too small for broad claims." },
  { level: "C1", topic: "policy", title: "A measured change", banglaTitle: "পরিমিত পরিবর্তন", text: "The policy may reduce congestion, but only if public transport becomes reliable enough to offer a genuine alternative. Its success therefore depends on more than restrictions alone.", prompt: "What does success depend on?", banglaPrompt: "সাফল্য কিসের ওপর নির্ভর করে?", options: ["Reliable public transport", "Restrictions alone", "Fewer passengers"], correctOption: 0, explanation: "The condition is reliable transport." },
  { level: "C1", topic: "media", title: "Headline and detail", banglaTitle: "headline ও detail", text: "The headline suggests a dramatic change, whereas the report itself describes a gradual shift over several years. Reading only the headline would oversimplify the evidence.", prompt: "Why is the headline misleading?", banglaPrompt: "headline কেন বিভ্রান্তিকর?", options: ["It simplifies a gradual shift", "It has no date", "It is too long"], correctOption: 0, explanation: "The report describes a gradual change." },
  { level: "C2", topic: "argument", title: "Evidence threshold", banglaTitle: "প্রমাণের মানদণ্ড", text: "A persuasive anecdote can illuminate a problem without establishing how widespread it is. Policy decisions require evidence that is both vivid and representative.", prompt: "What does the writer distinguish?", banglaPrompt: "লেখক কী আলাদা করেছেন?", options: ["Anecdote and representative evidence", "Policy and language", "Problem and solution"], correctOption: 0, explanation: "The passage contrasts a vivid anecdote with broad evidence." },
  { level: "C2", topic: "academic", title: "Careful synthesis", banglaTitle: "সতর্ক synthesis", text: "The authors do not reject earlier findings; instead, they argue that those findings apply under narrower conditions than previously assumed. Their contribution is refinement, not reversal.", prompt: "How do the authors position their contribution?", banglaPrompt: "authors তাঁদের অবদান কীভাবে ব্যাখ্যা করেছেন?", options: ["As refinement", "As total rejection", "As repetition"], correctOption: 0, explanation: "The final sentence makes the distinction explicit." },
];

const writingSeeds: Seed[] = [
  { level: "Pre-A1", topic: "identity", title: "Copy and complete", banglaTitle: "লিখে পূরণ করো", prompt: "Complete: My name is ___. I am from ___.", banglaPrompt: "পূর্ণ করো: My name is ___. I am from ___." },
  { level: "Pre-A1", topic: "objects", title: "One object", banglaTitle: "একটি জিনিস", prompt: "Write two words about one object near you: colour and name.", banglaPrompt: "তোমার কাছে থাকা একটি জিনিসের রঙ ও নাম লিখো।" },
  { level: "Pre-A1", topic: "feelings", title: "Today", banglaTitle: "আজ", prompt: "Write: Today I feel ___.", banglaPrompt: "লিখো: Today I feel ___." },
  { level: "A1", topic: "routine", title: "Three daily actions", banglaTitle: "তিনটি দৈনন্দিন কাজ", prompt: "Write three simple sentences about your day.", banglaPrompt: "তোমার দিন নিয়ে তিনটি সহজ বাক্য লেখো।" },
  { level: "A1", topic: "place", title: "My room", banglaTitle: "আমার ঘর", prompt: "Describe your room in three sentences. Use there is or there are.", banglaPrompt: "there is বা there are ব্যবহার করে ঘরটি তিন বাক্যে বর্ণনা করো।" },
  { level: "A1", topic: "message", title: "A friendly message", banglaTitle: "বন্ধুসুলভ message", prompt: "Write a short message inviting a friend for tea.", banglaPrompt: "একজন বন্ধুকে চায়ের নিমন্ত্রণ দিয়ে ছোট message লেখো।" },
  { level: "A2", topic: "travel", title: "A short postcard", banglaTitle: "ছোট postcard", prompt: "Write 40–60 words about a place you visited or want to visit.", banglaPrompt: "তুমি যে জায়গায় গিয়েছ বা যেতে চাও তা নিয়ে 40–60 শব্দ লেখো।" },
  { level: "A2", topic: "email", title: "Ask for information", banglaTitle: "তথ্য চাও", prompt: "Write a polite email asking a course centre about class times.", banglaPrompt: "class time জানতে একটি course centre-এ ভদ্র email লেখো।" },
  { level: "A2", topic: "story", title: "A rainy afternoon", banglaTitle: "বৃষ্টির বিকেল", prompt: "Write a 50-word story beginning: It started to rain when…", banglaPrompt: "It started to rain when… দিয়ে 50 শব্দের গল্প লেখো।" },
  { level: "B1", topic: "opinion", title: "Study habits", banglaTitle: "পড়াশোনার অভ্যাস", prompt: "Write one structured paragraph about an effective study habit and explain why it works.", banglaPrompt: "কার্যকর একটি study habit নিয়ে structured paragraph লেখো এবং কেন কাজ করে বলো।" },
  { level: "B1", topic: "review", title: "Useful service", banglaTitle: "উপকারী service", prompt: "Write a short review of a useful local service. Include one strength and one suggestion.", banglaPrompt: "একটি উপকারী local service-এর ছোট review লেখো। একটি strength ও suggestion দাও।" },
  { level: "B1", topic: "application", title: "Volunteer message", banglaTitle: "স্বেচ্ছাসেবক message", prompt: "Write a 90-word message applying to help at a community event.", banglaPrompt: "community event-এ সহায়তার জন্য 90 শব্দের application message লেখো।" },
  { level: "B2", topic: "argument", title: "Balanced essay", banglaTitle: "ভারসাম্যপূর্ণ essay", prompt: "Write 140–180 words: Should schools limit phone use? Include a counterargument.", banglaPrompt: "140–180 শব্দে লেখো: স্কুলে phone use সীমিত করা উচিত কি? counterargument দাও।" },
  { level: "B2", topic: "report", title: "Club report", banglaTitle: "club report", prompt: "Write a brief report on what a student club did well and what it should improve.", banglaPrompt: "student club কী ভালো করেছে এবং কী উন্নত করা উচিত তা নিয়ে brief report লেখো।" },
  { level: "B2", topic: "summary", title: "Meeting summary", banglaTitle: "মিটিং সারাংশ", prompt: "Summarise a meeting decision, its reason, and the next action in 120 words.", banglaPrompt: "120 শব্দে meeting decision, কারণ এবং next action-এর summary লেখো।" },
  { level: "C1", topic: "academic", title: "Evidence-based response", banglaTitle: "প্রমাণভিত্তিক উত্তর", prompt: "Write 180–220 words explaining why one source is not enough for a strong conclusion.", banglaPrompt: "180–220 শব্দে ব্যাখ্যা করো কেন একটি source শক্ত উপসংহারের জন্য যথেষ্ট নয়।" },
  { level: "C1", topic: "proposal", title: "Improvement proposal", banglaTitle: "উন্নয়ন প্রস্তাব", prompt: "Write a proposal with a problem, recommended action, benefits, and a foreseeable risk.", banglaPrompt: "সমস্যা, action, benefit ও সম্ভাব্য riskসহ proposal লেখো।" },
  { level: "C1", topic: "analysis", title: "Compare viewpoints", banglaTitle: "দৃষ্টিভঙ্গি তুলনা", prompt: "Compare two viewpoints on online learning and reach a qualified conclusion.", banglaPrompt: "online learning নিয়ে দুটি মত তুলনা করে শর্তযুক্ত উপসংহার দাও।" },
  { level: "C2", topic: "academic", title: "Nuanced critique", banglaTitle: "সূক্ষ্ম সমালোচনা", prompt: "Write a critical response that acknowledges a claim's value while testing its assumptions.", banglaPrompt: "দাবির মূল্য স্বীকার করে তার assumptions পরীক্ষা করে critical response লেখো।" },
  { level: "C2", topic: "professional", title: "Executive brief", banglaTitle: "executive brief", prompt: "Write an executive brief recommending a course of action with conditions and trade-offs.", banglaPrompt: "conditions ও trade-offসহ একটি action recommend করে executive brief লেখো।" },
];

const communicationSeeds: Seed[] = [
  { level: "Pre-A1", topic: "greetings", title: "Meet a neighbour", banglaTitle: "প্রতিবেশীর সঙ্গে দেখা", prompt: "Greet a neighbour and say your name.", banglaPrompt: "প্রতিবেশীকে অভিবাদন জানিয়ে নিজের নাম বলো।", role: "New neighbour", goal: "Open a short conversation", expectedLanguage: ["Hello", "My name is"] },
  { level: "Pre-A1", topic: "shopping", title: "Buy water", banglaTitle: "পানি কেনো", prompt: "Ask for one bottle of water and say thank you.", banglaPrompt: "এক বোতল পানি চেয়ে ধন্যবাদ দাও।", role: "Customer", goal: "Buy one item", expectedLanguage: ["one bottle", "thank you"] },
  { level: "Pre-A1", topic: "classroom", title: "Ask to repeat", banglaTitle: "আবার বলতে বলো", prompt: "Ask a teacher to repeat one word.", banglaPrompt: "teacher-কে একটি শব্দ আবার বলতে বলো।", role: "Learner", goal: "Ask for clarification", expectedLanguage: ["Please repeat"] },
  { level: "A1", topic: "restaurant", title: "Choose a meal", banglaTitle: "খাবার বেছে নাও", prompt: "Order a simple meal and ask for water.", banglaPrompt: "একটি সহজ meal order করে পানি চাও।", role: "Customer", goal: "Place an order", expectedLanguage: ["I would like", "water"] },
  { level: "A1", topic: "travel", title: "Buy a ticket", banglaTitle: "টিকিট কেনো", prompt: "Ask for a ticket to the city centre.", banglaPrompt: "city centre-এর টিকিট চাও।", role: "Passenger", goal: "State a destination", expectedLanguage: ["ticket", "to the city centre"] },
  { level: "A1", topic: "social", title: "Accept an invitation", banglaTitle: "নিমন্ত্রণ গ্রহণ", prompt: "Accept an invitation and ask about the time.", banglaPrompt: "নিমন্ত্রণ গ্রহণ করে সময় জিজ্ঞেস করো।", role: "Friend", goal: "Respond warmly", expectedLanguage: ["I'd love to", "What time"] },
  { level: "A2", topic: "hotel", title: "Check in", banglaTitle: "hotel check-in", prompt: "Give your name, booking detail, and ask about breakfast.", banglaPrompt: "নাম ও booking detail বলে breakfast সম্পর্কে জিজ্ঞেস করো।", role: "Guest", goal: "Check in", expectedLanguage: ["reservation", "breakfast"] },
  { level: "A2", topic: "phone", title: "Leave a message", banglaTitle: "phone message", prompt: "Leave a short message saying why you called and when you can talk.", banglaPrompt: "কেন phone করেছ এবং কখন কথা বলা যাবে তা বলে message দাও।", role: "Caller", goal: "Leave a message", expectedLanguage: ["calling about", "available"] },
  { level: "A2", topic: "emergency", title: "Ask for help", banglaTitle: "সাহায্য চাও", prompt: "Explain that you are lost and ask for a safe place to wait.", banglaPrompt: "তুমি পথ হারিয়েছ বলো এবং অপেক্ষার নিরাপদ জায়গা জিজ্ঞেস করো।", role: "Traveller", goal: "Ask for practical help", expectedLanguage: ["I am lost", "Could you help"] },
  { level: "B1", topic: "university", title: "Extension request", banglaTitle: "সময় বাড়ানোর অনুরোধ", prompt: "Explain why you need more time for an assignment and propose a new date.", banglaPrompt: "assignment-এর জন্য বেশি সময় কেন দরকার ও নতুন date প্রস্তাব করো।", role: "Student", goal: "Make a respectful request", expectedLanguage: ["extension", "would it be possible"] },
  { level: "B1", topic: "work", title: "Clarify a task", banglaTitle: "কাজ পরিষ্কার করো", prompt: "Ask a colleague to clarify the expected outcome and deadline.", banglaPrompt: "colleague-কে expected outcome ও deadline পরিষ্কার করতে বলো।", role: "Colleague", goal: "Clarify responsibilities", expectedLanguage: ["Could you clarify", "deadline"] },
  { level: "B1", topic: "social", title: "Disagree politely", banglaTitle: "ভদ্রভাবে অসম্মতি", prompt: "Disagree with a plan while recognising one good point.", banglaPrompt: "একটি ভালো দিক মেনে নিয়ে plan-এর সঙ্গে ভদ্রভাবে অসম্মতি জানাও।", role: "Friend", goal: "Disagree respectfully", expectedLanguage: ["I see your point", "however"] },
  { level: "B2", topic: "interview", title: "Describe a strength", banglaTitle: "strength বর্ণনা", prompt: "Answer an interview question about a strength using an example.", banglaPrompt: "উদাহরণসহ strength নিয়ে interview প্রশ্নের উত্তর দাও।", role: "Candidate", goal: "Give evidence", expectedLanguage: ["One strength", "For example"] },
  { level: "B2", topic: "meeting", title: "Move an agenda", banglaTitle: "agenda পরিবর্তন", prompt: "Suggest changing a meeting agenda and explain the benefit.", banglaPrompt: "meeting agenda বদলানোর প্রস্তাব ও benefit বলো।", role: "Team member", goal: "Propose a change", expectedLanguage: ["I suggest", "so that"] },
  { level: "B2", topic: "online", title: "Professional follow-up", banglaTitle: "professional follow-up", prompt: "Write and say a concise follow-up after an online meeting.", banglaPrompt: "online meeting-এর পরে সংক্ষিপ্ত follow-up বলো ও লেখো।", role: "Participant", goal: "Confirm next steps", expectedLanguage: ["as discussed", "next steps"] },
  { level: "C1", topic: "presentation", title: "Handle a question", banglaTitle: "প্রশ্ন সামলাও", prompt: "Acknowledge a difficult question, answer partly, and state what you will verify.", banglaPrompt: "কঠিন প্রশ্ন স্বীকার করে আংশিক উত্তর ও কী যাচাই করবে বলো।", role: "Presenter", goal: "Respond transparently", expectedLanguage: ["important question", "I will verify"] },
  { level: "C1", topic: "negotiation", title: "Find a compromise", banglaTitle: "সমঝোতা খোঁজো", prompt: "Summarise competing needs and propose a compromise with one condition.", banglaPrompt: "ভিন্ন প্রয়োজন সংক্ষেপে বলে একটি শর্তসহ compromise প্রস্তাব করো।", role: "Negotiator", goal: "Build agreement", expectedLanguage: ["If we", "provided that"] },
  { level: "C1", topic: "work", title: "Raise a concern", banglaTitle: "উদ্বেগ জানাও", prompt: "Raise a risk in a plan without blaming anyone, then suggest a response.", banglaPrompt: "কাউকে দোষ না দিয়ে plan-এর risk জানিয়ে response প্রস্তাব করো।", role: "Project lead", goal: "Communicate risk", expectedLanguage: ["I am concerned", "we could"] },
  { level: "C2", topic: "discussion", title: "Reframe a debate", banglaTitle: "debate নতুনভাবে দেখো", prompt: "Reframe a polarised debate by identifying a shared objective and a useful distinction.", banglaPrompt: "shared objective ও একটি পার্থক্য দেখিয়ে polarized debate নতুনভাবে উপস্থাপন করো।", role: "Facilitator", goal: "Increase nuance", expectedLanguage: ["both perspectives", "distinguish"] },
  { level: "C2", topic: "professional", title: "Strategic recommendation", banglaTitle: "কৌশলগত recommendation", prompt: "Make a strategic recommendation, explain trade-offs, and state the evidence threshold for review.", banglaPrompt: "trade-off ও review-এর evidence threshold ব্যাখ্যা করে strategic recommendation দাও।", role: "Advisor", goal: "Recommend with precision", expectedLanguage: ["recommend", "trade-off", "evidence"] },
];

export const phase4SkillActivities: SkillActivity[] = [
  ...makeActivities("listening", listeningSeeds),
  ...makeActivities("pronunciation", pronunciationSeeds),
  ...makeActivities("speaking", speakingSeeds),
  ...makeActivities("reading", readingSeeds),
  ...makeActivities("writing", writingSeeds),
  ...makeActivities("communication", communicationSeeds),
];

const phraseSeeds = [
  ["Hello, nice to meet you.", "A friendly first greeting.", "আপনার সঙ্গে দেখা হয়ে ভালো লাগল।", "greetings", "Pre-A1", "neutral"],
  ["Could you repeat that, please?", "Ask someone to say it again.", "দয়া করে আবার বলবেন?", "clarification", "A1", "neutral"],
  ["I would like to order…", "Start a polite restaurant order.", "আমি … order করতে চাই।", "restaurant", "A1", "neutral"],
  ["How can I get to…?", "Ask for directions.", "আমি কীভাবে … যেতে পারি?", "travel", "A1", "neutral"],
  ["Would it be possible to…?", "Make a polite request.", "… করা কি সম্ভব হবে?", "requests", "A2", "formal"],
  ["I am calling about…", "Begin a phone message.", "আমি … বিষয়ে ফোন করছি।", "phone", "A2", "neutral"],
  ["Thank you for your help.", "Express thanks after support.", "আপনার সাহায্যের জন্য ধন্যবাদ।", "thanks", "Pre-A1", "neutral"],
  ["I see your point, but…", "Disagree politely.", "আপনার বক্তব্য বুঝতে পারছি, কিন্তু…", "disagreement", "B1", "neutral"],
  ["In my opinion,…", "Introduce an opinion.", "আমার মতে,…", "opinions", "B1", "neutral"],
  ["Could you clarify what you mean by…?", "Ask for precise meaning.", "আপনি … দিয়ে কী বোঝাচ্ছেন, পরিষ্কার করবেন?", "clarification", "B1", "formal"],
  ["I suggest that we…", "Make a team suggestion.", "আমি প্রস্তাব করছি যে আমরা…", "suggestions", "B1", "neutral"],
  ["As discussed, the next step is…", "Confirm an agreed action.", "আলোচনা অনুযায়ী পরের ধাপ হলো…", "work", "B2", "formal"],
  ["There seems to be a problem with…", "Raise a service problem calmly.", "… নিয়ে একটি সমস্যা আছে বলে মনে হচ্ছে।", "travel", "B2", "neutral"],
  ["On the one hand…; on the other hand…", "Balance two positions.", "একদিকে…; অন্যদিকে…", "discussion", "B2", "formal"],
  ["That is an important question.", "Acknowledge a question before answering.", "এটি গুরুত্বপূর্ণ প্রশ্ন।", "presentation", "C1", "formal"],
  ["The evidence suggests that…", "Make a cautious evidence-based claim.", "প্রমাণ ইঙ্গিত করে যে…", "academic", "C1", "formal"],
  ["With that limitation in mind,…", "Transition while noting a limitation.", "এই সীমাবদ্ধতা মাথায় রেখে,…", "presentation", "C1", "formal"],
  ["This does not necessarily mean that…", "Avoid overclaiming.", "এর অর্থ অবশ্যই এই নয় যে…", "academic", "C2", "formal"],
  ["A useful distinction is between…", "Frame a nuanced comparison.", "…-এর মধ্যে একটি গুরুত্বপূর্ণ পার্থক্য হলো…", "discussion", "C2", "formal"],
  ["Provided that we can…, I recommend…", "Recommend with a condition.", "যদি আমরা … করতে পারি, আমি … সুপারিশ করব।", "professional", "C2", "formal"],
] as const;

export const phase4Phrases: Phrase[] = phraseSeeds.map(([phrase, meaning, meaning_bn, topic, level, formality], index) => ({
  id: `phrase-phase4-${String(index + 1).padStart(2, "0")}`,
  schemaVersion: 6,
  updatedAt,
  phrase,
  meaning,
  meaning_bn,
  pronunciation: phrase,
  context: topic,
  level: level as LevelCode,
  topic,
  example: `${phrase} This is an original English Academy example.`,
  formality,
  sourceId,
  license: "Original",
  attribution: "Original instructional content authored for English Academy.",
  commercialUseAllowed: true,
}));
