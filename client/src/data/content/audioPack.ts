/** Emerald Study House — small, intentional audio pack; downloads are cached locally only after learner action. */
export type AudioPackTrack = { id: string; title: string; banglaTitle: string; level: string; transcript: string; url: string; durationLabel: string };

export const audioPackVersion = "starter-audio-1";
export const starterAudioPack: AudioPackTrack[] = [
  { id: "a1-shadowing", title: "A1 introduction shadowing", banglaTitle: "A1 পরিচিতি অনুশীলন", level: "A1", transcript: "Good morning. My name is Rafi. I live in Dhaka. I study English every day. I like reading short stories. Can you help me, please? Thank you. See you tomorrow.", url: "/manus-storage/english-academy-a1-shadowing_73ea2b5e.wav", durationLabel: "~25 sec" },
  { id: "essential-words", title: "Essential study words", banglaTitle: "প্রয়োজনীয় study words", level: "A1–A2", transcript: "learn. practice. understand. remember. answer. question. sentence. conversation. confident. improve. careful. useful. example. meaning. pronunciation. grammar. vocabulary. review. progress. goal.", url: "/manus-storage/english-academy-essential-words_3c8631fe.wav", durationLabel: "~45 sec" },
  { id: "a2-conversation", title: "A2 study conversation", banglaTitle: "A2 study conversation", level: "A2", transcript: "What are you working on today? I am reviewing vocabulary and practicing pronunciation. That sounds useful. How do you remember new words? I read an example sentence, say the word aloud, and review it again tomorrow.", url: "/manus-storage/english-academy-a2-conversation_ccea2760.wav", durationLabel: "~22 sec" },
];
