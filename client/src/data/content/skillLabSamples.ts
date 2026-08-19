/** Limited, content-driven samples for Phase 1 skill labs. */
export const skillLabSamples = {
  listening: {
    title: "A short greeting",
    transcript: "Hello! My name is Rina. Nice to meet you.",
    prompt: "Who is speaking?",
    options: ["Rina", "Rahim", "A teacher"],
    answer: "Rina",
  },
  pronunciation: {
    title: "Clear first introductions",
    transcript: "Hello, my name is Rina. Nice to meet you.",
    prompt: "শুনে তারপর একই বাক্যটি নিজের কণ্ঠে বলার চেষ্টা করো। এই phase-এ কোনো AI scoring নেই।",
  },
  writing: {
    id: "writing-introduction-v1",
    title: "Introduce yourself",
    prompt: "Write 3–5 simple English sentences about yourself. Include your name, where you are from, and one thing you like.",
  },
} as const;
