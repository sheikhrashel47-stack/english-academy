/** Emerald Study House — diagnostic results are a calm placement signal, not a high-stakes exam. */
import type { DiagnosticResult, DiagnosticSkill, LevelCode } from "@/domain/learning/types";

export type DiagnosticQuestion = {
  id: string;
  skill: DiagnosticSkill;
  level: LevelCode;
  prompt: string;
  banglaPrompt: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation: string;
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  { id: "diag-v-1", skill: "vocabulary", level: "Pre-A1", prompt: "Choose the meaning of ‘book’.", banglaPrompt: "‘book’ শব্দটির সঠিক অর্থ বেছে নাও।", options: [{ id: "a", text: "a thing to read" }, { id: "b", text: "a meal" }, { id: "c", text: "a colour" }], correctOptionId: "a", explanation: "Book means a thing to read." },
  { id: "diag-g-1", skill: "grammar", level: "Pre-A1", prompt: "I ___ a student.", banglaPrompt: "I ___ a student. শূন্যস্থানে সঠিক শব্দ বসাও।", options: [{ id: "a", text: "am" }, { id: "b", text: "is" }, { id: "c", text: "are" }], correctOptionId: "a", explanation: "Use am with I." },
  { id: "diag-r-1", skill: "reading", level: "Pre-A1", prompt: "Read: ‘Mina is at home.’ Where is Mina?", banglaPrompt: "বাক্যটি পড়ো: Mina is at home. Mina কোথায়?", options: [{ id: "a", text: "at home" }, { id: "b", text: "at school" }, { id: "c", text: "at work" }], correctOptionId: "a", explanation: "The sentence says Mina is at home." },
  { id: "diag-l-1", skill: "listening", level: "A1", prompt: "Which word has the /iː/ sound in ‘see’?", banglaPrompt: "‘see’-এর মতো /iː/ sound কোন শব্দে আছে?", options: [{ id: "a", text: "tea" }, { id: "b", text: "cat" }, { id: "c", text: "cup" }], correctOptionId: "a", explanation: "Tea and see share the long /iː/ sound." },
  { id: "diag-v-2", skill: "vocabulary", level: "A1", prompt: "‘Careful’ most nearly means:", banglaPrompt: "‘Careful’ শব্দটির সবচেয়ে কাছের অর্থ কোনটি?", options: [{ id: "a", text: "taking care" }, { id: "b", text: "very noisy" }, { id: "c", text: "very late" }], correctOptionId: "a", explanation: "Careful means taking care to avoid mistakes or danger." },
  { id: "diag-g-2", skill: "grammar", level: "A1", prompt: "She ___ English every day.", banglaPrompt: "She ___ English every day. সঠিক verb বেছে নাও।", options: [{ id: "a", text: "study" }, { id: "b", text: "studies" }, { id: "c", text: "studying" }], correctOptionId: "b", explanation: "Third-person singular takes studies in the present simple." },
  { id: "diag-r-2", skill: "reading", level: "A1", prompt: "Read: ‘The shop opens at nine and closes at six.’ When does it close?", banglaPrompt: "বাক্যটি পড়ো। দোকানটি কখন বন্ধ হয়?", options: [{ id: "a", text: "at six" }, { id: "b", text: "at nine" }, { id: "c", text: "at noon" }], correctOptionId: "a", explanation: "The shop closes at six." },
  { id: "diag-l-2", skill: "listening", level: "A2", prompt: "Which sentence is a polite request?", banglaPrompt: "কোন বাক্যটি ভদ্র অনুরোধ?", options: [{ id: "a", text: "Could you repeat that, please?" }, { id: "b", text: "Repeat that now." }, { id: "c", text: "You repeat it." }], correctOptionId: "a", explanation: "Could you ... please? is a polite request." },
  { id: "diag-v-3", skill: "vocabulary", level: "A2", prompt: "‘Improve’ means:", banglaPrompt: "‘Improve’ শব্দটির অর্থ কী?", options: [{ id: "a", text: "become better" }, { id: "b", text: "become smaller" }, { id: "c", text: "become silent" }], correctOptionId: "a", explanation: "Improve means to become better." },
  { id: "diag-g-3", skill: "grammar", level: "A2", prompt: "We have lived here ___ 2022.", banglaPrompt: "We have lived here ___ 2022. সঠিক preposition বেছে নাও।", options: [{ id: "a", text: "since" }, { id: "b", text: "for" }, { id: "c", text: "during" }], correctOptionId: "a", explanation: "Use since with a starting point in time." },
  { id: "diag-r-3", skill: "reading", level: "A2", prompt: "Read: ‘Although it was raining, the match continued.’ What happened?", banglaPrompt: "বাক্যটি পড়ো। কী হয়েছিল?", options: [{ id: "a", text: "The match continued." }, { id: "b", text: "The match was cancelled." }, { id: "c", text: "It was sunny." }], correctOptionId: "a", explanation: "Although signals contrast: rain did not stop the match." },
  { id: "diag-l-3", skill: "listening", level: "B1", prompt: "Which phrase shows an opinion?", banglaPrompt: "কোন phrase-টি মতামত প্রকাশ করে?", options: [{ id: "a", text: "In my view, this is useful." }, { id: "b", text: "The book is on the desk." }, { id: "c", text: "Please open the door." }], correctOptionId: "a", explanation: "In my view introduces an opinion." },
];

export function scoreDiagnostic(answers: Record<string, string>): DiagnosticResult {
  const skillScores: DiagnosticResult["skillScores"] = { vocabulary: { correct: 0, total: 0 }, grammar: { correct: 0, total: 0 }, reading: { correct: 0, total: 0 }, listening: { correct: 0, total: 0 } };
  let correct = 0;
  for (const question of diagnosticQuestions) {
    skillScores[question.skill].total += 1;
    if (answers[question.id] === question.correctOptionId) { correct += 1; skillScores[question.skill].correct += 1; }
  }
  const score = Math.round((correct / diagnosticQuestions.length) * 100);
  const suggestedLevel: LevelCode = score < 35 ? "Pre-A1" : score < 58 ? "A1" : score < 78 ? "A2" : "B1";
  const focusSkill = (Object.entries(skillScores) as Array<[DiagnosticSkill, { correct: number; total: number }]>).sort(([, a], [, b]) => (a.correct / Math.max(1, a.total)) - (b.correct / Math.max(1, b.total)))[0][0];
  return { completedAt: new Date().toISOString(), score, suggestedLevel, focusSkill, skillScores };
}
