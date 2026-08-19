# English Academy — Master Product Design Specification

**সংস্করণ:** 1.0  
**অবস্থা:** Initial UI shell-এর নকশাগত source of truth  
**ভাষা:** বাংলা-সমর্থিত English-learning product  
**বাস্তবায়ন সীমা:** এই সংস্করণে sample data, design system এবং core UI shell থাকবে; বৃহৎ course, হাজারো শব্দ/প্রশ্ন, অথবা কার্যকর AI tutor থাকবে না।

> **Product principle:** English Academy কোনো বিচ্ছিন্ন tool collection নয়। এটি শূন্য থেকে fluent হওয়ার একটি সংযুক্ত learning system, যেখানে প্রতিটি screen শিক্ষার্থীকে বলে দেয়—আমি কোথায় আছি, কেন এটি করছি এবং পরের সঠিক পদক্ষেপ কী।

## A. Product vision, learner and learning journey

English Academy মূলত Bangla-speaking শিক্ষার্থীর জন্য একটি premium, calm এবং academically credible web application। শিক্ষার্থী Bangla Support থেকে শুরু করে প্রয়োজনমতো Mixed Mode ও English Immersion-এ যেতে পারবে। Interface English target-কে visually prominent রাখবে; Bangla হবে প্রয়োজনীয় explanation, confidence ও error recovery-এর সহায়ক ভাষা।

| বিষয় | নকশাগত সিদ্ধান্ত |
| --- | --- |
| প্রধান learner | Absolute beginner থেকে advanced learner; মোবাইল-প্রধান, কিন্তু desktop study session-ও গুরুত্বপূর্ণ |
| শেখার লক্ষ্য | Grammar, vocabulary, pronunciation, listening, speaking, reading, writing এবং real-life communication-এর একীভূত progression |
| Learning loop | Assess → start point → learn → understand → practice → recall → review → test → analyse → adapt |
| প্রথম release | Persisted progress সহ dashboard, learning map, course/unit/lesson, practice, vocabulary, progress, tools এবং settings |
| ভাষার mode | **Bangla Support**, **Mixed**, **English Immersion**; manual preference এবং level-sensitive defaults |
| Trust boundary | Progress ও review history বাস্তব learner data থেকে আসবে; কখনও fabricated review, score, testimonial বা mastery percentage দেখানো হবে না |

### Primary personas

| Persona | প্রয়োজন | Interface response |
| --- | --- | --- |
| নতুন শিক্ষার্থী “রিমা” | কোথা থেকে শুরু করবে, Bangla ব্যাখ্যা, ভয়হীন practice | ছোট mission, clear next lesson, gentle error copy, Bangla Support |
| ধারাবাহিক learner “আরিফ” | দ্রুত continuation, review queue, progress evidence | Continue card, smart review, recent history, shortcut tools |
| লক্ষ্যভিত্তিক learner “সাবা” | Exam/skill-specific preparation, weakness recovery | Practice setup, future exam hub, weakness insight, filtered study paths |

## B. Information architecture

```text
English Academy
├── Start
│   ├── Onboarding
│   ├── Goal selection
│   └── Diagnostic and personalised plan
├── Home
│   ├── Current learning
│   ├── Daily mission
│   ├── Smart review
│   └── Skill and progress insight
├── Learn
│   ├── Learning map (Pre-A1 → C2)
│   ├── Course
│   ├── Unit
│   ├── Lesson player
│   └── Lesson completion
├── Practice
│   ├── Quick / smart / weakness / custom modes
│   ├── Question session
│   └── Practice result
├── Skills
│   ├── Vocabulary and flashcards
│   ├── Grammar
│   ├── Pronunciation
│   ├── Listening
│   ├── Speaking
│   ├── Reading
│   └── Writing
├── Review
│   ├── Smart review
│   └── Mistake bank
├── Progress
│   ├── Overview
│   ├── Skill analytics
│   ├── Learning history
│   └── Achievements
├── Tools
│   ├── Language tools
│   ├── Learning tools
│   ├── Skill tools
│   └── Future AI tools
└── Profile and settings
    ├── Appearance, language and learning preferences
    ├── Sound, motion, privacy and data
    └── Backup, restore and reset
```

### Navigation architecture

Desktop uses a collapsible **left sidebar** grouped as Home, Learn, Practice, Skills, Review, Progress and Tools, with Settings anchored at the bottom. It deliberately does not expose every future module as a first-level destination. Vocabulary and Grammar sit in the Skills group; Mistake Bank and Smart Review sit in Review.

| Context | Persistent navigation | Contextual actions |
| --- | --- | --- |
| Mobile | Home, Learn, Practice, AI, Progress — exactly five bottom items | Menu sheet for Skills, Review, Tools and Settings |
| Desktop | Grouped sidebar with icon + text labels | Collapsible groups and a contextual topbar |
| Lesson / test / writing | Back, title, meaningful progress, focus toggle | Previous, next, submit, audio/settings |
| Focus mode | Minimal session header only | Exit focus, accessibility and audio controls |

The **AI** mobile item opens the AI section of Tools in this shell. It never pretends that an AI conversation is available before that service is implemented.

## C. Master screen inventory

The following inventory defines the complete product surface. Screens marked **Shell** are included in this initial implementation; **Planned** screens are documented so future modules can be added without redesign.

| Screen | Status | Purpose and entry point | Primary action | Main components and fallback state |
| --- | --- | --- | --- | --- |
| Welcome / onboarding | Planned | First open; establish goal and language preference | Continue | Step header, option cards; resume safely after exit |
| Goal selection | Planned | Onboarding | Save goal | Goal cards, time target selector; default “explore” |
| Diagnostic | Planned | Onboarding or profile | Submit answer | Minimal question player; retry on data error |
| Diagnostic result | Planned | End of diagnostic | Start plan | Level result, strengths, next route |
| Dashboard | Shell | Default Home route | Continue lesson | Current learning, mission, skill overview, review, tools; useful zero-progress state |
| Learning map | Shell | Learn | Open active level | CEFR ribbon, level cards, lock/unlock state |
| Course | Shell | Learning map / Learn | Open unit | Course hero, unit cards, actual progress |
| Unit | Shell | Course | Start/continue lesson | Unit summary, lessons, test placeholder |
| Lesson player | Shell | Unit, dashboard, search | Complete current step | Focus header, block renderer, progress, feedback; loading skeleton/error recovery |
| Lesson complete | Planned | Completed lesson | Next lesson / review | Result summary, real completion events |
| Practice hub | Shell | Practice | Start practice | Mode cards, filters, current limits, empty filters state |
| Question session | Shell | Practice / lesson checkpoint | Check answer / next | Question card, answer state, explanation, gentle incorrect feedback |
| Practice result | Planned | End of session | Review mistakes | Score, accuracy, next recommendation based on real attempts |
| Vocabulary atlas | Shell | Skills / Tools / search | Listen, practise or review | Search, topic chapters, word cards, no-results state |
| Vocabulary detail | Planned | Atlas / search | Add to review | Word, audio, definition, example, collocation and CEFR |
| Flashcards | Planned | Vocabulary / Smart Review | Grade recall | Front/back card, Again–Easy controls |
| Grammar library | Shell | Skills | Open topic / practise | Level sections, topic cards, weakness slot |
| Grammar detail | Planned | Grammar library | Start mini practice | Explanation, Bangla support, examples, common mistakes |
| Pronunciation | Planned | Skills / Tools | Start exercise | Sound routes, record UI, permission fallback |
| Listening | Planned | Skills / Tools | Start listening | Level cards, audio player, task types |
| Speaking | Planned | Skills / Tools | Start speaking | Prompt, duration, recording control, graceful no-analysis state |
| Reading | Planned | Skills / Tools | Start reading | Passage cards, vocabulary assist, questions |
| Writing | Planned | Skills / Tools | Save draft / submit | Prompt, editor, word counter, unsaved-change guard |
| Smart review | Shell-ready | Dashboard / Review | Start review | Due, overdue, weak and mistake count; truthful zero state |
| Mistake bank | Shell | Review | Retry item | Filtered mistake cards; “No mistakes yet” empty state |
| Exam center | Planned | Practice / Progress | Choose exam | Test cards, status, filters |
| Exam setup / player / result | Planned | Exam center | Start / submit / review | Focus timer, navigator, score and real performance data |
| AI Tutor | Planned UI | Tools / mobile AI item | Select prompt | Conversation frame, quick prompts, unavailable-service state |
| AI roleplay | Planned UI | AI Tutor | Start scenario | Scenario cards, goal, difficulty |
| Progress overview | Shell | Progress | Open skill / study next step | CEFR progress, real completion metrics, history |
| Skill analytics / history | Planned expansion | Progress tabs | Choose focused practice | Sparse, purposeful charts; no invented values |
| Achievements | Planned | Progress | View milestone | Elegant milestones driven by real events |
| Tools | Shell | Sidebar / dashboard | Open a tool | Grouped tool cards and “coming next” treatment |
| Profile | Planned | Avatar | Update plan | Learner goal, target, mode, statistics |
| Settings / backup | Shell | Sidebar footer / avatar | Save preference or export data | Appearance, language, sound, motion, data; confirm destructive actions |
| Search / notifications / help | Planned | Topbar | Select result / adjust notification | Grouped results, intentional notification settings, help articles |

## D. Tool inventory

| Category | Tool | Purpose | Access | Icon family | Primary action |
| --- | --- | --- | --- | --- | --- |
| Language | Vocabulary Atlas | Find and retain words | Skills, Tools, Dashboard | BookOpen | Search word |
| Language | Grammar Reference | Browse clear grammar concepts | Skills, Tools | BookMarked | Open topic |
| Language | Dictionary / synonym / collocation | Future contextual lookup | Tools | Languages | Search term |
| Learning | Flashcards | Spaced recall | Vocabulary, Review | Layers | Start deck |
| Learning | Smart Review | Resolve due learning work | Home, Review, Tools | RotateCcw | Start review |
| Learning | Mistake Bank | Retry incorrect work | Review, Tools | CircleAlert | Retry item |
| Learning | Sentence Builder | Practise word order | Practice, Tools | Rows3 | Start activity |
| Skills | Pronunciation / listening / speaking | Guided skill laboratories | Skills, Tools | Mic, Headphones | Begin session |
| Skills | Reading / writing | Comprehend and produce English | Skills, Tools | BookText, PenLine | Begin task |
| Assessment | Practice / exams | Measure and adapt learning | Practice | ListChecks, ClipboardCheck | Configure session |
| AI | AI Coach / roleplay / writing feedback | Future guided support | Mobile AI, Tools | Sparkles, MessagesSquare | Choose a prompt |

## E. Component library

| Component family | Reusable components | Variants and states |
| --- | --- | --- |
| Navigation | AcademyLogo, SidebarNav, NavGroup, MobileBottomNav, PageHeader, Breadcrumb | Default, active, compact, focus-session, collapsed |
| Actions | Button, IconButton, TextAction, SplitAction | Primary, secondary, tertiary, ghost, danger, success; hover, active, focus, disabled, loading |
| Surfaces | StandardCard, HeroCard, InsightCard, ProgressCard, LessonCard, ToolCard, EmptyStateCard | Quiet, elevated, selected, disabled, loading |
| Forms | SearchField, TextField, Textarea, Select, Toggle, RadioGroup, Slider | Default, focus, error, success, disabled |
| Learning | CEFRLevelRibbon, LessonProgress, SkillMeter, MissionList, ReviewQueue, LearningBlock, ExampleCard | Active, complete, locked, no-data |
| Questions | QuestionCard, OptionList, FillBlank, SentenceBuilder, AnswerFeedback | Neutral, selected, correct, incorrect, reveal, submitted |
| Media | AudioButton, CompactAudioPlayer, TranscriptDrawer, RecorderControl | Ready, loading, playing, denied, unavailable |
| Feedback | Toast, InlineNotice, StatusBadge, Skeleton, ErrorRecovery | Info, success, warning, error, empty |
| Overlays | Dialog, Sheet, FilterSheet, QuestionNavigator | Desktop dialog, mobile bottom sheet, focus-trapped |

Components must consume shared tokens and variants rather than create visually unrelated one-off cards. Existing `shadcn/ui` primitives remain the accessible foundation; product components compose them.

## F. Design system

### 1. Design movement and visual rules

The chosen movement is **Premium Light Academic**: a calm, considered learning workspace that combines an editorial study desk with high-confidence academic product design. It rejects cartoon gamification, gradient gloss and dense dashboard grids. Components are soft but not pill-heavy, with subtle borders, restrained elevation and a deep emerald signal for committed learning actions.

| Principle | Application |
| --- | --- |
| Learning before decoration | Hero imagery is supporting context; the next learning action remains dominant |
| Calm hierarchy | One primary action per section; secondary actions use quiet text or outline treatments |
| Honest signals | Progress, review count and weakness clues are shown only when derived from learner data |
| Guided density | More tools exist than are visible at once; groups, tabs and sheets reveal them progressively |
| Bangla support, English focus | Target English is heavier/larger; Bangla explanation is clear but visually secondary |

### 2. Color tokens

The signature color is **Academy Emerald `#146B4D`**. It signals forward learning, selected navigation and primary CTA. The light canvas is cool-warm neutral rather than paper-textured, so long reading remains calm and the product feels contemporary.

| Token | Light | Dark | Intended use |
| --- | --- | --- | --- |
| `canvas` | `#F6F8F5` | `#0D1712` | App background |
| `surface` | `#FFFFFF` | `#14231B` | Cards and panels |
| `surface-raised` | `#FBFCFA` | `#1A2C22` | Hovered/secondary surfaces |
| `ink` | `#16372A` | `#F0F7F1` | Main text |
| `ink-muted` | `#607167` | `#AAB9AE` | Supporting text |
| `emerald` | `#146B4D` | `#54C498` | Primary action and active state |
| `mint` | `#E2F1E8` | `#193C2D` | Safe learning context / completion |
| `border` | `#DCE5DD` | `#294237` | Low-emphasis separation |
| `success` | `#177A56` | `#5CD3A0` | Correct, complete, saved |
| `warning` | `#A85E08` | `#F0B86A` | Caution / pending work |
| `danger` | `#B42318` | `#FF9E96` | Errors / destructive actions |
| `info` | `#2765A4` | `#8CBDF5` | Informational notes |

### 3. Typography tokens

The UI uses **Manrope** for English UI and **Noto Sans Bengali** for Bangla, with the browser’s system sans-serif as fallback. This maintains a readable, modern sans-serif system across bilingual screens and avoids cramped Bangla text.

| Role | Desktop | Mobile | Weight / leading | Usage |
| --- | --- | --- | --- | --- |
| Display | 40–48px | 30–36px | 700 / 1.15 | Page hero statement only |
| H1 | 30–36px | 26–30px | 700 / 1.2 | Page title |
| H2 | 22–26px | 20–24px | 700 / 1.3 | Section title |
| H3 | 18–20px | 17–18px | 700 / 1.35 | Card and lesson title |
| Body L | 16px | 16px | 500 / 1.65 | Explanations |
| Body | 14px | 15px | 500 / 1.65 | Default reading copy |
| Body S | 13px | 13px | 500 / 1.55 | Supporting content |
| Label / button | 12–14px | 12–14px | 700 / 1.2 | Action and navigation label |
| Caption | 11–12px | 11–12px | 600 / 1.4 | Metadata, CEFR, helper text |

### 4. Spatial, radius, elevation and motion tokens

| Token group | Values / rule |
| --- | --- |
| Spacing | `4, 8, 12, 16, 20, 24, 32, 40, 48, 64` px; sections use 32–48px, component internals use 12–24px |
| Radius | `8px` compact, `12px` standard, `16px` hero, `999px` reserved for compact status only |
| Shadow | None; subtle `0 1px 2px`; medium `0 8px 24px / 8%`; elevated `0 16px 40px / 12%` |
| Motion | 120–180ms micro action; 180–240ms surface/route entry; transform + opacity only; `prefers-reduced-motion` disables nonessential movement |
| Focus | Visible 2px emerald outline with offset, never colour-only indication |
| Z-index | Base `0`, sticky `20`, sidebar `30`, overlay `40`, sheet/dialog `50`, toast `60` |

### 5. Theme system and focus mode

Light, Dark and Focus are complete themes, not simple inversions. Dark mode maintains emerald’s meaning with a lighter mint-compatible primary. Focus mode retains the light canvas but removes sidebar, streak, decorative imagery and secondary rails; it shows only the learning session header, task, answer control and next step.

| Mode | Learner purpose | Visible chrome |
| --- | --- | --- |
| Light | Daily learning and browsing | Full navigation, calm white surfaces |
| Dark | Low-light study | Full navigation, independently tuned dark surfaces |
| Focus | Lesson, practice, reading, listening, speaking or writing | Compact session bar and essential task controls only |

## G. Interaction, feedback, audio and state rules

Primary buttons use filled emerald with white text, a 160ms response and `scale(0.97)` on press. Secondary buttons use white or transparent surfaces with a visible border. Tertiary actions are text-forward. Destructive choices use semantic red only in confirmation contexts; they are never the visual default.

| State | Copy and behavior |
| --- | --- |
| Correct | “সঠিক হয়েছে” with concise explanation, optional next action and optional sound |
| Incorrect | “এবার মিলল না—চলো, কারণটি দেখি।” followed by answer, why and Bangla support when enabled |
| Empty review | “এখন কোনো review বাকি নেই।” with an optional continue-learning link |
| Empty mistake bank | “এখনও কোনো ভুল জমেনি।” with a Start Learning action |
| Loading | Skeleton structure matching the eventual screen; never a blank app region |
| Error | “কিছুক্ষণ সমস্যা হয়েছে।” with Try Again; never raw technical error text |
| Audio unavailable | Explain that audio/recording is unavailable and keep text learning path usable |

Correct, wrong, completed and achievement sounds remain optional and respect Settings. Audio is supporting media, never a mandatory path to understand the lesson.

## H. Responsive and accessibility system

| Breakpoint | Layout rule |
| --- | --- |
| 320–479px | Single column, 44px minimum touch targets, five-item bottom nav, sheets for filters/details |
| 480–767px | Spacious mobile cards, short topbar, mobile bottom nav remains |
| 768–1023px | Two-column content only when useful; sidebar remains drawer-based |
| 1024–1439px | Persistent sidebar, flexible main canvas, optional dashboard insight rail |
| 1440px+ | Max-width content stage; lesson reading lane remains intentionally constrained |

All interactive controls require keyboard access, accessible labels and clear focus. Text, semantic colours and state patterns meet contrast and non-colour-only requirements. Long lesson content scrolls without trapping focus, question sessions preserve context, and keyboard-initiated interactions are immediate. Motion obeys `prefers-reduced-motion`; sound, animation and language preference are user-controlled.

## I. UX flow map

| Flow | Path | Decision / recovery |
| --- | --- | --- |
| First-time learner | Welcome → goal → learning preference → diagnostic → plan → first lesson | Skip/resume onboarding; a short default plan is allowed |
| Returning learner | Home → Current Learning → lesson | If no next lesson, guide to review or map |
| Start and complete lesson | Lesson header → blocks → checkpoint → completion | Persist answer/progress; show short recovery-safe completion |
| Practice | Practice → mode/filter → question → feedback → next/result | Empty filter resets; incorrect answers feed mistake bank |
| Review mistake | Review → Mistake Bank → retry → feedback | Learner can leave and resume without data loss |
| Vocabulary review | Atlas / Review → word or flashcard → recall rating | Rating feeds spaced review scheduling |
| Exam | Exam center → setup → focused player → result | Marked items stay visible; results use actual attempts only |
| Speaking / writing | Skill tool → prompt → record/save draft → submit | Permission denied and unavailable analysis have text-first fallback |
| AI conversation | Tools/AI → prompt → conversation | Until service exists, display clear unavailable status and related non-AI alternatives |
| Settings / backup | Settings → change preference / export / import / reset | Confirm destructive reset; retain locally stored learner data unless explicitly reset |

## J. Initial implementation contract and future scalability

The shell will preserve the existing clean architecture:

```text
UI → LearningUseCases → Domain contracts → Repository → IndexedDB
```

UI code must not read IndexedDB directly. Lesson, vocabulary, grammar, question and progress content remains data-driven. New future modules are added through domain contracts, use cases and page-level composition—not by embedding course content inside cards. The prototype will use only the existing small seed data and explicit unavailable/coming-next surfaces for unimplemented laboratories, exams and AI.

The initial implementation includes Dashboard, Learning Map/Course, Unit, Focus-ready Lesson, Practice, Vocabulary, Grammar, Progress, Tools and Settings; it adds grouped navigation and theme refinement without generating massive content. Future AI, transcription, notifications, exams and detailed skill labs require separate capability, privacy and service decisions before becoming operational.

## K. Quality gate

Before release, verify that every shipped screen has a clear location, purpose and next action; all visible navigation works; mobile navigation has five items only; progress is derived from real data; no fabricated social proof exists; all primary states have loading, empty and error treatment; and light/dark/focus remain readable across mobile and desktop.
