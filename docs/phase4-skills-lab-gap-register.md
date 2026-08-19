# Phase 4 Complete Language Skills Lab — Gap Register

> **Delivery boundary.** This phase builds the offline-first interactive six-skill laboratory described in `Pasted_content_47.txt`. It does not add an AI Tutor, cloud speech scoring, external content scraping, or a provider-specific conversation service.

## Current baseline

| Area | Already present | Gap to close in this phase |
|---|---|---|
| Routes | Dedicated Listening, Pronunciation, Speaking, Writing and Reading routes exist. | Communication has no route; skill routes are sample-oriented rather than catalogue- and activity-driven. |
| Audio | Browser speech playback, replay, progress and a small cached audio shelf exist. | The lab needs assessment-aware transcript access, 0.75×/1×/1.25×/1.5× controls, volume, source metadata and a safe unavailable-audio state. |
| Recording | Local microphone permission, record, stop, retry and explicit no-AI-score messaging exist. | Learners need replay, recorded-duration feedback, interrupted-session recovery and activity attempts; recordings remain device-local and are not automatically scored. |
| Writing | IndexedDB draft save and a basic writing desk exist. | The lab needs autosave, character count, deliberate clear protection, task metadata, real submission attempts and a feedback-ready analyzer boundary. |
| Activities | One sample listening, pronunciation and writing experience exists. | Every laboratory requires levelled, original, source-attributed activity records and Learn → Guided Practice → Independent Practice → Assessment → Feedback → Review flows. |
| Progress | Lesson/question attempts and question-only mistakes are persisted. | Per-skill attempts, mastery, skill-specific errors, recommendations, dashboard and progress ledger integration are absent. |
| Reading & communication | Reading is a truthful placeholder. | Interactive reading passages, vocabulary lookup, annotation tools, comprehension checks, communication scenarios and phrase content must be implemented. |

## Architecture decisions

The work will use a **unified Skill Engine** rather than six unrelated pages. A typed `SkillActivity` base record will carry stable IDs, level, topic, difficulty, instructions, content, prerequisites, assessment rules, source and licence metadata. Narrow activity payloads will model Listening, Pronunciation, Speaking, Reading, Writing and Communication without pretending that browser-only tools can provide automatic speech or writing scores.

The engine will persist `SkillAttempt`, `SkillError`, `SkillMastery` and `Phrase` records locally. Completion and mastery are calculated solely from actual locally stored attempts, accuracy, confidence and submission data. A recommendation only appears when there is concrete evidence, such as repeated incorrect listening checks or a submitted writing task that needs manual/AI feedback; it will never invent performance.

All starter content will be original, authored demonstration material with explicit `Original` source records and local-use metadata. No copyrighted books, articles, film audio, podcasts, YouTube content or unknown-rights imagery will be imported. Browser text-to-speech and microphone recording remain capability-dependent local tools; an unavailable browser capability must produce a usable alternate path rather than trapping the learner.

## Delivery register

| Workstream | Success condition |
|---|---|
| Data and migration | Versioned IndexedDB stores, searchable activity indexes, rights metadata and safe export/reset coverage exist. |
| Shared runtime | Audio playback, transcript gating, recording, assessment answer capture, feedback panels and writing autosave are reusable across labs. |
| Six laboratories | Each skill has levelled activity selection, an interactive practice path, real attempt capture and an honest feedback/review state. |
| Learning record | Skill progress, mastery state, errors and recommendations render from persisted evidence rather than demo percentages. |
| Quality and release | Tests cover core scoring/persistence, mobile paths and browser capability fallbacks; the GitHub Pages build is published after validation. |

## Known non-goals for this phase

The product will expose extension interfaces for `PronunciationAnalyzer`, `WritingAnalyzer` and conversation evaluation. They intentionally return **unavailable/manual-review** states until a real, separately enabled analysis service is available. The lab will not claim CEFR certification, assess accent authenticity, upload microphone recordings, or fabricate personalised scores.
