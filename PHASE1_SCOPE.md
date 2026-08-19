# English Academy — Phase 1 Scope

## Product objective

Phase 1 expands the existing Phase 0 foundation into a functional, static English-learning web application. The application remains independent from Admission Hub, uses browser-first persistence, and is prepared for GitHub Pages deployment without introducing a backend dependency.

## Existing foundation retained

The current implementation already separates the presentation layer from application use cases, learning-domain contracts, repository access, and IndexedDB. The existing content-first lesson renderer, storage migrations, progress records, mistake records, review interface, and reusable application shell remain the governing boundaries for this phase.

## Phase 1 implementation scope

The data layer will grow to one course, six visible proficiency levels, four content-bearing units, eight to ten sample lessons, thirty to fifty vocabulary records, over fifty objective questions, and at least five grammar topics. Only the first course path becomes interactive; later proficiency levels remain clearly labelled as unavailable rather than simulating content that does not exist.

The application layer will add support for text-input, sentence-building, and vocabulary-recall question formats while retaining a common attempt and mistake-recording flow. Vocabulary learning state, user preferences, safe sample-data reset, JSON import/export, sound/animation preferences, and last-lesson continuity will persist through IndexedDB.

The presentation layer will add unit, grammar, and mistake-bank routes; a mobile-first bottom navigation model; accessible loading, empty, completed, unavailable, and error states; and new lesson-block renderers for image placeholders, audio placeholders, speaking tasks, mini-tests, and data-driven practice.

## Deployment boundaries

The application will be configured as a static single-page application for GitHub Pages, including a base-path-aware Vite build and an Actions workflow. A lightweight web manifest and service-worker foundation will be included for installability and an initial offline cache strategy. No AI provider, authentication, cloud synchronisation, real audio generation, or full curriculum authoring interface is included in this phase.

## Acceptance checks

The completion review will verify navigation; Level → Unit → Lesson flow; interactive exercise feedback; refresh persistence; vocabulary practice; mistake-bank retry; settings actions; mobile presentation; production build; and GitHub Pages workflow configuration.
