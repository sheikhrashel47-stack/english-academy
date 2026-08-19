# Phase 6 — Assessment, Exam and Educational Completion Foundation

> **Scope boundary.** This phase adds an offline-first educational assessment system. Every result remains local by default. Estimated placement is not an official CEFR determination, and completion documents are not accredited, government, or official CEFR certificates.

## Existing baseline and delivery gap

| Existing surface | Available today | Phase 6 extension |
|---|---|---|
| Diagnostic | A truthful 12-question Vocabulary, Grammar, Reading and Listening diagnostic produces a persisted study-path suggestion. | Preserve this as a short diagnostic while moving assessment records into a versioned assessment engine and labelling outcomes as **Estimated Level**. |
| Practice | Objective grammar/vocabulary practice can collect one answer at a time. | Add reusable assessment modes, question types, section rules, scoring policies, attempts and result records without degrading ordinary practice. |
| Learning data | Courses, levels, units, lessons, objective questions, skill activities and mistakes already persist locally. | Add approved assessment questions, blueprint versions, exam sessions, answer records, results, certificates and integrity-safe local recovery. |
| Placeholder routes | `/exams`, `/history` and `/certificates` are explicitly labelled future/prototype routes. | Replace them with the Assessment Hub, Assessment History and local educational-completion certificate foundation. |
| Score model | Existing practice validation covers MCQ, fill blank, sentence builder and vocabulary recall, with simple percent correctness. | Introduce deterministic scoring for objective types, configurable negative marking, partial credit where justified, manual-review states for subjective responses, section/skill passing rules and feedback. |

## Architecture decisions

| Decision | Rationale |
|---|---|
| **Assessment engine is separate from lesson practice.** | Ordinary practice may show immediate feedback; test and mock modes must defer feedback until submission. |
| **All assessment content is approved, versioned and source-tagged.** | Results retain the question/blueprint version used at the time of the attempt; draft or rejected questions cannot be selected. |
| **Exam session is the source of truth for recovery.** | Current question, answers, review flags, section, timer baseline and last-save time are written to IndexedDB on each meaningful change. |
| **Subjective answers are truthful review states.** | Writing, speaking and pronunciation responses can be saved and marked `manual-review` or `analysis-unavailable`; the product will not invent scores. |
| **Original starter catalogue, not a massive bank.** | Phase 6 ships original demonstration assessments sufficient to exercise every engine path. Future approved content can be added without changing the runtime. |
| **Certificate is educational only.** | The certificate model includes a privacy-safe verification code and QR payload, but never claims accreditation or official language certification. |

## Delivery sequence

The build begins with an indexed, versioned assessment data model and pure selection/scoring functions. The persistent runner then uses those functions for diagnostic, placement, lesson, unit, skill, level, final and mock modes. Results feed local mistake records, progress signals, history comparison and a supportive recovery plan. A completion badge and local certificate artifact are enabled only from actual persisted completion and passing evidence.

## Explicit exclusions

The phase will not create an AI Tutor, proctoring, remote identity verification, cloud score transmission, an official CEFR determination, an accredited certificate, a fabricated subjective score, or a final massive question bank. A missing local audio asset, an insufficient eligible question pool, or an unavailable future analysis service will surface a clear learner-safe state rather than silently changing results.
