# English Academy — Phase 1 Functional Foundation Reconciliation

**Source:** `Pasted_content_44.txt` (approved Phase 1 app-shell specification)  
**Status:** Active implementation register  
**Boundary:** This phase adds functional foundations and sample-data demonstrations only. It deliberately excludes mass course generation, large vocabulary/question libraries, remote AI services, and simulated learner outcomes.

## Current foundation

The project already meets the architectural core of the specification. It is a standalone React and TypeScript application with a layered UI → application → domain → repository → IndexedDB flow, schema versioning, a data-driven sample curriculum, functional objective-practice flows, a PWA base, and a GitHub Pages-safe router. The latest visual shell also provides responsive navigation, light/dark/focus themes, and a production deployment workflow.

| Area | Current position | Reconciliation action |
|---|---|---|
| Learning data | Course, level, unit, lesson, vocabulary, grammar, question, attempt, mistake and review contracts exist. | Extend settings/draft media state without bypassing the repository layer. |
| Dashboard and progress | Data-driven dashboard, learning-map, practice, mistake bank and progress ledger exist. | Retain zero-progress start states and add canonical route aliases. |
| Theme | Premium Light, Soft Dark and Focus are persisted. | Add reduced-motion and daily-goal preferences to the persisted settings model. |
| Language mode | Bangla-first copy exists but mode selection is absent. | Add Bangla Support, Mixed Mode and English Immersion as a persisted, reusable presentation preference. |
| Routes | Existing routes are stable but use the first product route vocabulary. | Add the specification’s `/learn/*`, skill, AI, profile/history, review and exam routes as production-safe aliases or dedicated functional prototypes. |
| Skill foundations | Tools hub is truthful, but audio, pronunciation, listening, speaking and writing screens do not yet exist. | Add reusable AudioPlayer, sample listening and pronunciation tasks, a permission-aware recording prototype, and a persisted writing draft editor. |
| Vocabulary | Sample vocabulary and recall exist. | Add detail and flashcard views, with locally stored review feedback. |
| AI and exams | Neither uses a live service or advanced engine yet. | Build clear UI foundations only; every unavailable action must say **Coming soon** and never imply a completed AI analysis or examination result. |

## Delivery sequence

| Stage | Included work | Acceptance condition |
|---|---|---|
| Core preferences and routing | Language mode, reduced motion, daily goal, canonical routes and aliases. | Preferences persist locally; deep links work under `/english-academy/`. |
| Skill lab foundation | Audio controls, listening and pronunciation samples, recording state UI, writing drafts. | Each interaction has a genuine local state or a clear unavailable state. |
| Study utility extensions | Vocabulary detail/flashcards, review landing, search, profile/history and exam/AI prototypes. | Existing sample data is reused; no fake completion, score or AI outcome is presented. |
| Quality gate | Responsive checks, keyboard flow, persistence tests, production build and Pages validation. | Mobile-first layouts remain readable with no navigation collision or blank/error screens. |

## Route compatibility approach

Existing published routes remain valid. The specified route vocabulary is added alongside them rather than replacing persisted links. Each canonical route either presents a functional sample experience, routes to its data-driven equivalent, or visibly identifies an unimplemented advanced feature as **Coming soon**.

> A UI state is only presented as functional when it has a meaningful local action, persistence outcome, or browser-supported capability. Unsupported audio, microphone, AI, and advanced examination behavior always has a clear explanatory fallback.

## Known intentional limitations after this reconciliation

The application will retain a small course and vocabulary dataset, will not use external AI, will not claim pronunciation scoring, and will not cache large media corpora. These constraints preserve the approved Phase 1 boundary while keeping the domain, repository and component systems ready for later expansion.
