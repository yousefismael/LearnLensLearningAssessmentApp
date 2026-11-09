# LearnLens — Phase 1 Code Organization

This revision reorganizes the existing Figma Make React app **without intentionally changing screens, mock data, UI behavior, or CSS**.

## What changed

- `src/App.tsx`: top-level role selection, shared demo state, localStorage persistence and reset.
- `src/models/types.ts`: shared TypeScript types for roles, questions and demo state.
- `src/models/demoData.ts`: original mock assessments, grading questions and previous results.
- `src/components/ui.tsx`: original shared Icon, Button, Badge, ProgressSteps and Logo components.
- `src/student/`: student navigation, home, exam upload, receipt, results, progress and notifications.
- `src/teacher/`: teacher navigation, dashboard, assessment setup, marking guide, submissions, OCR, grading, gaps, publishing, saved examples and history.
- `src/index.css`: unchanged original styles.

## Run in VS Code

```bash
npm install
npm run dev
```

To check types and build:

```bash
npx tsc --noEmit
npm run build
```

## How to use these changes in your existing clone

Make a safety commit of your current working tree first. Then **replace the `src/` directory** with the one from this package. Preserve your existing Git remote and history. You may also copy `README_PHASE1.md` for reference.

On your machine run `npm install` if required and `npm run dev`, then test role switching, upload, OCR correction, marks, publication and demo reset. For any issue compare with your pre-refactor commit.

## Validation performed

- TypeScript check (`npx tsc --noEmit`) **passed** after the refactor.
- A production build could **not** be verified in the execution environment because the ZIP's `node_modules` lacks Linux's optional native Rolldown binding. This does not indicate a source-code error. Reinstall dependencies on your local computer and run `npm run build`.
- Full in-browser regression testing is still needed.

## Scope

This is only **Phase 1 (structural refactor)**. It does not fix the functional limitations identified in the audit. Those belong to Phase 2.
