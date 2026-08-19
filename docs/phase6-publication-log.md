# Phase 6 GitHub Pages Publication Log

## Publication evidence

| UTC+6 time | Event | Evidence |
|---|---|---|
| 2026-08-19 10:14 | Phase 6 release commit `471dce9` was pushed to `main`. | [`471dce9`](https://github.com/sheikhrashel47-stack/english-academy/commit/471dce9f52968b18c5603ceccb19db4df7f64a67) |
| 2026-08-19 10:14 | GitHub Actions started **Build GitHub Pages artifact #18** for the pushed Phase 6 release. | [Workflow run 32241704808](https://github.com/sheikhrashel47-stack/english-academy/actions/runs/32241704808) |
| 2026-08-19 10:15 | Public workflow summary still reported **In progress**; its build and deploy jobs had not yet completed. | [Workflow run 32241704808](https://github.com/sheikhrashel47-stack/english-academy/actions/runs/32241704808) |
| 2026-08-19 10:17 | The public GitHub Pages `/certificates` route displayed the new English Academy shell, `Certificate desk` title and local-completion loading state. | [Published certificate route](https://sheikhrashel47-stack.github.io/english-academy/certificates) |
| 2026-08-19 10:20 | GitHub's public API confirmed that workflow run 32241704808 had completed successfully. A cache-busted request then displayed the complete **Certificates & badges** workspace, including its local-record boundary and empty eligible-result state. | [Workflow run 32241704808](https://github.com/sheikhrashel47-stack/english-academy/actions/runs/32241704808) · [Published certificate route](https://sheikhrashel47-stack.github.io/english-academy/certificates?release=471dce9) |

### Browser-local bootstrap diagnostic

At 10:18 UTC+6, the published page's local IndexedDB had already completed its Phase 6 seed: database version `7`, 8 assessment blueprints, 20,663 vocabulary records, 1 settings record, and zero learner-created assessment results/certificates. This establishes that the long-lived certificate loading UI was not caused by a missing seed or a corpus-import wait; the certificate page retrieval path requires follow-up debugging.

Direct published-browser IndexedDB queries for assessment results, certificate `userIssued` index range and assessment blueprints all resolved immediately with `0`, `0` and `8` records respectively. The page console had no application errors or unhandled promise entries. The next diagnostic focus is the React-level certificate refresh lifecycle rather than IndexedDB availability.

The cache-busted validation completed the React lifecycle successfully. The earlier transient loader was therefore treated as a first-load/static-cache observation rather than a persisted Phase 6 route failure.

The expected published URL is <https://sheikhrashel47-stack.github.io/english-academy/>. After the workflow changes to successful, the published site must be checked at `/exams`, `/progress`, and `/certificates`.
