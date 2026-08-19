# Phase 7 — Personal Learning, Gamification & Motivation Engine

> **Delivery boundary.** Phase 7 adds an offline-first, deterministic personal-learning layer to English Academy. It is not an AI system: no AI Tutor, chatbot, LLM dependency, remote personalization service or external learner-data transmission is included.

## Existing assets and Phase 7 extension path

| Existing surface | Current evidence | Phase 7 extension |
|---|---|---|
| Dashboard | It already loads roadmap, continue-learning, due review, personal study path, skill mastery and rule-based skill recommendations. | Keep it as the learner home; add a compact daily plan, goal signal, Academy XP, streak, achievement summary and recent activity without crowding the current study action. |
| Settings and preferences | It already stores language mode, theme, sound, animation, reduced motion and a time-only daily-goal choice locally. | Expand this stable local preference path for goal mix, preferred duration, preferred learning areas, reminders, haptic choice and distraction-free session focus. |
| Course, review, skill and assessment engines | Existing records contain meaningful completion, review, mastery, attempt and assessment evidence. | Add a central event adapter that derives duplicate-safe learning events from those records; individual screens will not contain their own XP formulas. |
| Certificates and CEFR completion | Local passed level/final assessment and completion badge evidence already exist. | Preserve the distinction between CEFR learning milestones and independent Academy XP levels. Neither becomes official certification. |
| Backup and reset | Existing local export/import and learning-data reset work through the repository facade. | Include Phase 7 records in export/import. Gamification-only reset must be explicit and must not erase course progress, assessments or certificates. |

## Domain and persistence decisions

The Phase 7 schema will add versioned, indexed records for a learner profile, goals, goal-period snapshots, study sessions, learning events, XP ledger, streak record, achievement progress, milestones, activity timeline, personal preferences and notification preference. The central source of truth remains **IndexedDB**; the UI only calls application use cases, which call the repository and then the domain engines.

| Concern | Decision |
|---|---|
| Learning event | One idempotent event record represents a meaningful completion such as lesson, review, skill attempt, mastery or passed assessment. It carries an event key so repeated submission cannot duplicate XP. |
| XP | Configurable rule table and diminishing-repeat guard calculate rewards in a pure domain engine. Opening a page, button clicks and abandoned starts receive no XP. |
| Academy level | Derived from cumulative XP and named **Academy Level** everywhere; it is visibly separate from the learner's English/CEFR level. |
| Streak | Only meaningful activity updates the local streak. A missed day receives supportive restart language; one locally managed freeze is optional and never purchased. |
| Goals | Learners can set time, lesson, question, review, activity and skill-minute goals across daily, weekly and monthly periods. Rule-based daily plan prioritizes due reviews, current lesson and under-practiced skills. |
| Achievement | Seed definitions are data-driven with measurable condition/threshold values. UI reads unlocked, in-progress and locked state; it does not hard-code qualification logic. |
| Calendar and analytics | Indexed dates and compact daily aggregates support month/week history, study balance and habits with years of local records. |

## Sample content boundary

Achievement definitions, XP rules, milestone labels, goal templates and supportive messages are product configuration, not fake learner history. Production users begin with empty personal event/XP/streak records. Demo copy may describe an achievable state but must never pre-seed a learner as having completed lessons, earned XP or unlocked achievements.

## UI and language decisions

The **Emerald Study House** style remains restrained and academic: paper-like study cards, quiet emerald hierarchy, factual progress evidence and compact status language. Celebration is available only for meaningful completion and respects sound, haptic, animation and reduced-motion preferences. Focus mode hides XP, streak and achievement cues until a session ends. Bangla Support, Mixed Mode and Immersion preserve the existing language-mode model; no-guilt copy replaces punitive streak or failure messages.

## Explicit non-goals

Phase 7 will not introduce AI features, chat, AI-generated feedback, remote proctoring, cloud sync, paid reward mechanics, manipulative notifications, external push notifications, false user history or official/accredited certification claims. Browser-local reminder configuration is a foundation only and is not a guarantee of operating-system delivery while the app is closed.

## Validation obligations

The release must include pure-domain tests for XP, duplicate/anti-grind behavior, streak transitions, goal progress, achievement qualification and deterministic plan generation. Integration verification must cover offline IndexedDB persistence, backup/import, the existing course/review/skill/assessment flows, mobile layout, accessible labels and a GitHub Pages production build.
