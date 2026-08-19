# GitHub Pages verification — 2026-08-19

- Repository: `sheikhrashel47-stack/english-academy`
- Commit verified: `816041f` (`fix: support GitHub Pages router base`)
- GitHub Actions Pages run: `32210305349`
- Workflow result: `completed / success` at `2026-08-19T02:56:25Z`
- Workflow URL: https://github.com/sheikhrashel47-stack/english-academy/actions/runs/32210305349

## Browser checks

The first visit to the root URL immediately after deployment still showed an old branded 404 response, which was consistent with a transient CDN/browser cache state. A cache-busted request to `https://sheikhrashel47-stack.github.io/english-academy/?v=816041f` rendered the English Academy dashboard correctly, including the route-prefixed navigation links. This confirms that the deployed build includes the GitHub Pages router-base fix.

## Deep-link verification

The following cache-busted deep links rendered their intended application interfaces rather than the 404 fallback:

- `https://sheikhrashel47-stack.github.io/english-academy/lesson/lesson-a1-greetings?v=816041f` — Lesson 01, “Hello & goodbye,” including checkpoint options.
- `https://sheikhrashel47-stack.github.io/english-academy/vocabulary?v=816041f` — Word Atlas with 33 vocabulary entries.

The final browser checks confirm that root and representative deep links resolve correctly under the `/english-academy/` GitHub Pages subpath.
