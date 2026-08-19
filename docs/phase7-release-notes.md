# English Academy — Phase 7 Release Notes

## Personal Learning, Study Rhythm & Motivation Ledger

**Release boundary.** Phase 7 adds a private, offline-first personal-learning layer to English Academy. It turns completed learning activity into a calm local record: an evidence ledger, study rhythm, small learner-defined goals, rule-based daily plans and recorded learning milestones. The `/growth` workspace presents those records through the Academy’s Pre-A1–C2 study-path motif and Bangla-supportive guidance.

> This release is a **personal study record**. It does not award, verify, predict or claim any official CEFR level, certificate, score or qualification.

| Area | What Phase 7 provides | What it deliberately does not provide |
|---|---|---|
| Study record | A local ledger for meaningful lesson, review, skill, assessment and certificate events | Cloud backup, account sync, teacher dashboard or external reporting |
| Study rhythm | Current and longest study continuity, plus a non-punitive seven-day record | Social comparison, leaderboards, pressure notifications or ranking |
| Personal goals | Small, user-owned goals and a rule-based daily plan | A diagnostic prescription, adaptive AI plan or guaranteed outcome |
| Progress language | CEFR study-path context, local evidence and recorded milestones | Official CEFR assessment or certification |
| Privacy | Browser-resident storage by default with no external transmission from this feature | Recovery after the learner clears browser/site data without a separate backup |

## What Is Recorded Locally

Phase 7 stores eight related local data groups in IndexedDB schema version 9. The application records a learning event only when the learner completes a meaningful existing action. The deterministic engine then derives the evidence amount, study-day record, study continuity, relevant goals, achievement progress and a daily plan. This keeps the user-interface layer separate from persistence and calculation rules.

| Local record | Purpose | Example source action |
|---|---|---|
| Personal profile | Holds local evidence total, Academy ledger level, study continuity and optional freeze credits | Any recorded meaningful learning event |
| Learning goals | Holds learner-defined targets and their actual measured progress | A lesson, review or completed practice that matches the goal metric |
| Learning events | Provides the traceable source of the learner’s study record | Lesson completion or an assessed pass |
| Evidence ledger | Records the derived local XP accounting entry and reason | A vocabulary review response |
| Study days | Records dates, minutes, meaningful-event count and local evidence | A day containing a meaningful activity |
| Achievement definitions and progress | Stores predefined academic milestones alongside actual progress | Completing a first lesson or reaching a review rhythm |
| Daily study plans | Stores a small rule-based plan for the current day | Generated from active goals and available learning actions |

## Evidence Rules

The system recognises six meaningful event types: `lesson-completed`, `lesson-practiced`, `vocabulary-reviewed`, `skill-completed`, `assessment-passed` and `certificate-issued`. Their evidence values are deterministic and use same-day diminishing returns for repeated activity. The values exist to make the learner’s own record legible; they are not a mark, grade, public reputation signal or proof of proficiency.

| Event | Base local evidence | Integration point |
|---|---:|---|
| Lesson completion | 20 XP | Course lesson completion |
| Lesson practice | 6 XP | Supported by the domain engine for qualifying practice flows |
| Vocabulary review | 3 XP | Flashcard rating |
| Skill completion | 12 XP | Supported by the domain engine for qualifying skill flows |
| Passed assessment | 35 XP | Assessment result completion |
| Certificate issued | 25 XP | Local certificate creation |

## Privacy, Offline and User-Control Limitations

All Phase 7 records remain in the current browser’s local storage by default. The feature has no account requirement, telemetry export, external AI service, chatbot, remote coach, social feed, public profile or leaderboard. The plan and achievement calculations are deterministic and can function without a network connection once the application content has been installed locally.

Because this release is intentionally local-first, records are tied to the browser profile and device where they were created. Clearing site data, using a different browser profile or changing device can make the records unavailable. The present release does not include cloud synchronization, cross-device merge, encrypted remote backup, teacher visibility or data recovery. Learners should treat the ledger as a helpful local study aid rather than the sole durable record of their learning.

Browser vibration remains optional through the existing **haptic feedback** preference. No motivation element requires vibration, and disabling the preference does not change any learning calculation.

## Design and Content Boundaries

The Growth workspace follows the **Emerald Study House** system: Academy Emerald and soft mint are the only brand accents, with no decorative warm reward colours. Its central visual structure is a connected Pre-A1–C2 ribbon, factual evidence ledger and one small next action. Language avoids leaderboard, trophy and reward-game framing. Bangla explains the record and supports the next learning action, while English names the study structures.

Milestones are internal learning records only. A local certificate event may contribute to the learner’s ledger, but it does not transform a certificate into an accredited or official credential. The application remains transparent that its CEFR labels are study-path context rather than a formal proficiency determination.

## Verification Record

The following Phase 7 checks passed on **19 August 2026**. The production bundle emits an advisory size warning for the existing main client chunk, but the build completes successfully; it is not a release-blocking error for this static application.

| Verification | Required evidence |
|---|---|
| Static typing | `pnpm check` completes without TypeScript errors |
| Domain regression | `pnpm test` passes the Phase 7 personal-learning engine tests and all existing tests |
| Production packaging | `GITHUB_ACTIONS=true pnpm build` completes with the GitHub Pages base path |
| Responsive review | `/growth` and `/settings` are inspected at mobile width, with the evidence-ledger hierarchy preserved |
| Delivery boundary | No AI, chatbot, external AI dependency, external data transmission, official-certification claim or remote assessment dependency is introduced |

| Completed release validation | Result |
|---|---|
| Static typing | `pnpm check` passed with no TypeScript errors |
| Automated regression | `pnpm test` passed: 10 test files and 28 tests, including the three personal-learning engine tests |
| GitHub Pages packaging | `GITHUB_ACTIONS=true pnpm build` passed using the `/english-academy/` base path |
| Interface inspection | Desktop and 375px mobile inspections confirmed the evidence-ledger hierarchy, CEFR ribbon, responsive study plan and optional haptic setting |

GitHub Pages republication remains an operational deployment step. It requires an authenticated GitHub session and is tracked separately from the completed application validation.

## Publication Record

The Phase 7 corrective release was published successfully on **19 August 2026** through GitHub Pages Actions run [#32245479325](https://github.com/sheikhrashel47-stack/english-academy/actions/runs/32245479325). The public application is available at [sheikhrashel47-stack.github.io/english-academy](https://sheikhrashel47-stack.github.io/english-academy/). The published [`/growth`](https://sheikhrashel47-stack.github.io/english-academy/growth) deep link was opened in a fresh browser session and rendered the complete CEFR-led personal learning ledger and rule-based daily plan.

## Future Considerations

Future phases may add new learning actions that emit the same carefully bounded event types, but they must preserve deterministic calculation, learner control and local-first storage. Any future export, backup, identity, teacher-view, analytics or synchronization capability requires a separate privacy review, explicit user control and its own release documentation.
