# Phase 1 GitHub Pages Verification

**Verified commit:** `f98de89f1b93f159dce9fbaeb63ba02f2591adb6`  
**Workflow:** `deploy-pages.yml` run `32213290682`  
**Result:** Successful on 19 August 2026.

| Public route | Verification outcome |
|---|---|
| `/english-academy/` | Dashboard rendered with the Emerald Study House workspace shell, navigation, daily-plan cards, and offline-first capability notice. |
| `/english-academy/skills/listening` | Listening Lab rendered successfully with local browser-voice controls, replay, playback-speed control, transcript disclosure, and answer options. |

The app continues to use the GitHub Pages subpath-aware router base. The `/skills/listening` alias was added specifically to ensure canonical deep links render rather than fall through to the branded 404 route.
