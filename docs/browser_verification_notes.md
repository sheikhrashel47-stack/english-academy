# Browser verification notes

Date: 2026-08-20

The Vite app loads successfully at the exposed development URL. The dashboard renders the English Academy shell in Bengali/English, including links to Study plan, Practice, Vocabulary, Assessments, Diagnostic, Progress, and Certificates. The dashboard currently shows Pre-A1 Foundation as the current level and exposes both “CEFR পাঠক্রম দেখো” and “Diagnostic শুরু” actions. The page reports local/offline learning state and no runtime error was visible in the initial dashboard view.

The next checks should verify `/course/course-english-master`, `/diagnostic`, and a generated lesson route such as `/lesson/master-lesson-0001`.

Build and test status at this point: production build passed; Vitest passed 11 files / 31 tests. Runtime curriculum audit passed with 10 sections, 99 units, 1,290 lessons, 3,870 vocabulary records, 3,870 questions, and 1,290 grammar topics; lesson IDs were contiguous and prerequisite continuity passed.

## Master route verification

The corrected route `/course/course-english-master` now renders “Master English Journey” and reports `0/1290 lesson`. The page exposes all 10 curriculum sections and their units, with links such as `/unit/master-unit-01-01`. The shared Study plan navigation now points to the master route. Browser review also revealed that the CEFR ribbon is derived from 10 section records, so C1 and C2 appear more than once; this is structurally valid for section-based content but should be improved visually by labeling the ribbon as section progression or de-duplicating CEFR labels.

## Placement route verification

The `/diagnostic` route renders the `Foundation placement` assessment with a 20-minute timer, 20-question navigator, grammar question categories, answer choices, review flag, and previous/next controls. The top navigation correctly links Study plan to the master course. The placement result flow remains to be checked after submitting a sample session.

## 2026-08-19 Phase 9 corpus verification

Opened `/vocabulary/categories` on the running app. The category hub rendered 200/200 mapped categories, the hero reported a 50,000-word library and 30,000 bilingual sentence corpus, and the Focus & goals preview rendered 250 base words with 133 bilingual examples. The browser content confirmed each visible word card shows an English usage example and Bangla translation.
