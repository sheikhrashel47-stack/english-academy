# Phase 6 — Exam, Assessment & Local Completion Records

> **Release boundary.** এটি একটি offline-first educational assessment release। Assessment result, certificate record এবং privacy-safe verification payload browser-এর local database-এ থাকে। কোনো তথ্য স্বয়ংক্রিয়ভাবে বাইরের service-এ পাঠানো হয় না।

## কী যুক্ত হয়েছে

| Surface | Delivered behavior |
|---|---|
| Assessment catalogue | Original, approved ও source-tagged starter questions থেকে diagnostic, placement, lesson, unit, skill, level, mock এবং final blueprint চালু করা হয়েছে। |
| Persistent exam runner | Timer, autosave, resume, review marker, question/section navigation এবং expiry-তে automatic submit আছে; meaningful interaction-এর পরে answer record local database-এ লেখা হয়। |
| Scoring and placement | Deterministic question selection, objective scoring, justified partial credit, optional negative marking, section/skill passing rules এবং estimated placement logic আছে। |
| Results and recovery | Result breakdown, supportive “not passed yet” recovery path, mistake-bank linkage, local history এবং same-blueprint score delta পাওয়া যায়। |
| Completion evidence | Fully scored ও passed level/final result থেকে real-data-driven completion badge এবং local educational completion record তৈরি করা যায়। |
| Offline certificate artifact | Certificate desk-এ learner name দিয়ে printable record তৈরি হয়। এটি browser print dialog দিয়ে save/print করা যায় এবং online verifier না থাকায় স্পষ্টভাবে **Offline Certificate** হিসেবে label হয়। |

## Certificate provenance and privacy

| Item | Policy |
|---|---|
| Eligibility | শুধু passed level অথবা final assessment এবং কোনো unresolved manual-review item না থাকলে certificate তৈরি করা যায়। |
| Evidence | Certificate-এ passed assessment result, level, issue date ও unique local certificate number-এর সম্পর্ক browser-local record হিসেবে থাকে। |
| QR-ready payload | Payload-এ learner name, user ID এবং assessment result ID রাখা হয় না। এটি version, certificate number, issued date, level এবং local-record status-এর সীমিত reference বহন করে। |
| Verification | কোনো hosted verifier বা online attestation এখন নেই; verification status হলো `local-educational-record`। |
| Claim boundary | এটি **official CEFR certification**, accredited certification বা government certificate নয়। এটি English Academy local learning workspace-এর educational completion record। |

## Learner-safe behaviors

Assessment expiry হলে runner available saved answer ব্যবহার করে submit করে। Interrupted session আবার খুললে current question, remaining-time calculation, answer এবং review state restore করার চেষ্টা করে। Subjective skill response-এর ক্ষেত্রে platform fabricated score দেয় না; প্রয়োজন হলে manual-review বা analysis-unavailable state দেখায়।

## Content and scope limitations

এই release-এর assessment catalogue একটি original demonstration starter set। এটি কোনো massive exam bank, high-stakes admission examination বা complete standardized test replacement নয়। Estimated placement একটি learning recommendation, আনুষ্ঠানিক CEFR determination নয়। Proctoring, remote identity verification, cloud synchronization, external QR verification, AI Tutor এবং automatic scoring of unavailable subjective analysis এই phase-এর বাইরে রাখা হয়েছে।

## Validation record

| Check | Result |
|---|---|
| TypeScript | `pnpm check` completed with zero errors. |
| Automated tests | 9 test files and 25 tests passed, including assessment and certificate domain tests. |
| Production bundle | `GITHUB_ACTIONS=true pnpm build` succeeded with the GitHub Pages base path. |
| Responsive review | Certificate desk এবং Progress page desktop ও 375px mobile viewport-এ reviewed; branded local-record states, safe primary action এবং printable artifact layout are present. |

## Use and backup guidance

Local data browser storage-নির্ভর। Learner তাদের Settings backup/export ব্যবহার করলে certificate records এবং related local evidence একই backup-এ রাখতে পারে। Browser storage clear করা, device reset করা বা private browsing ব্যবহার করা হলে saved assessment/certificate record নাও থাকতে পারে; তাই meaningful completion record তৈরির পরে backup নেওয়া যুক্তিযুক্ত।
