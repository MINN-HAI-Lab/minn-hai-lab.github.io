# Session state

Branch: `auto/site`. Never pushed.

This run builds the site to the aesthetic override in the brief, which
supersedes `CLAUDE.md` and `design/DESIGN.md` on every visual point. The
conflict is logged as Q-19 rather than halted on.

---

## IN PROGRESS

Nothing.

## QUEUE

Nothing. The site is the canvas.

---

## DONE

- **C-1** — 2026-09-14. Kaung's instruction: throw away the previous UI, follow only
  `MINN HAI LAB UI Design/`, copy its code in. Done: one page, the canvas's
  2a hero and 1d site transcribed with their own markup, values and copy;
  the scene and the fields copied to `public/design/` untouched; the old
  routes redirect to the page's anchors. Everything from the earlier build —
  artefacts, tokens, self-hosted fonts, the suite — removed. D-028.
- **C-2** — CLAUDE.md, DESIGN.md, decisions.md, plan.md, phase.md, handbook.md
  rewritten around the canvas.

## NOTES

- Live at https://minn-hai-lab.github.io/ — the root, since the repo was
  renamed to `minn-hai-lab.github.io`; it was under `/MINN-HAI-LAB-WEBSITE/`
  from 2026-09-14. Deployed by the workflow on every push to `main`. `main` and `auto/site`
  are the same commit.

- The canvas is drawn at 1340px. The page adds four stacking rules below
  900px and hides the hero's nav below 640px; nothing else.
- The canvas's copy is on the page as written, including claims Kaung should
  confirm — listed in `docs/phase.md`.
- The previous build's history is in git; `docs/review-queue.md` Q-1 to Q-27
  and `docs/self-critique.md` describe it and are kept as record.
