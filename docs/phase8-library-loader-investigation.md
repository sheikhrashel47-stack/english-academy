# Phase 8 Library Loader Investigation

## Fresh Production Observation

On 19 August 2026, a fresh GitHub Pages visit to `/library` successfully opened the application database named `english-academy`. The library hero and shell rendered, while the catalogue stayed at **“Local index পড়া হচ্ছে…”** after the initial wait. This establishes that the failure is not a missing database or route fallback.

## Diagnostic Direction

The Library Hub loads categories, resources, saved references, search history and recent reading records concurrently. The remaining investigation therefore focuses on identifying any unresolved or rejected IndexedDB read in that parallel startup path, then ensuring loading is released through a user-safe local error state.

## IndexedDB Read Check

Direct fresh-session checks confirmed that all five underlying reads resolve: 17 categories, 21 resources, and zero saved, search-history and activity records. The product-level correction therefore keeps the catalogue’s critical category/resource reads separate from secondary personal-list reads. A delayed optional read can no longer prevent a learner from browsing the seeded reference notes.

## Root Cause and Correction

The fresh browser’s settings record still carried the prior `phase7.personal-learning.1` seed marker while the licensed corpus was already present. The Phase 8 seed therefore began its migration path, but Phase 3 compatibility enrichment attempted to rewrite every existing vocabulary record—including the 20,000+ already licensed corpus records—before it could commit the new Phase 8 marker. The migration now enriches only records without source metadata, preserving the full corpus and allowing the lightweight Phase 8 seed to finish and update the version marker.

## Correction Verification

After the correction, the fresh development library rendered all 21 reference records and the settings record committed `seedVersion: phase8.library.1` while retaining the licensed corpus version. This validates both the migration completion and the catalogue’s local-read readiness. The corrected build must now replace the earlier GitHub Pages artifact before final public verification.
