# LearnLens — Phase 2 functionality fixes

## Install / run (VS Code)

Open `LearnLensLearningAssessmentApp` (the folder containing `package.json`), then:

```bash
npm install
npm run dev
```

The Figma-specific Vite config has been replaced with a local Vite config (localhost:5173). The `.figma` folder is no longer required.

If copying into your existing repository, copy `src/` and `vite.config.ts` into the project root (not into `src/`). Back up or commit current work first.

## Improved in this version

- Fixed startup failure from missing `.figma/make/site.json`.
- Student file selection now reads actual JPG/PNG/WEBP/PDF data and displays previews; supports replacement, deletion and reordering of selected **files** (not individual PDF pages).
- Camera selection uses browser-supported file/camera control. The demo-page option remains available.
- Uploads are validated (supported type; up to 2 MB per file, 2.5 MB total) to reduce browser storage failures. For bigger exams, use demo pages. The app uses localStorage, not a server.
- Submitted files, exam name, subject and page count appear in state and receipt. Uploaded files are previewable inside teacher OCR review. OCR output is still simulated and should be manually checked.
- Assessment setup now saves named fields, question-boundary values, mark totals and real **reference filenames** to shared demo state. Reference files are selected via the browser; contents are not semantically processed.
- Marking-guide edits are saved into question data when approved. Its approval is tracked separately and blocks grading until approved.
- Editing OCR text invalidates its previously checked state and downstream approvals.
- Editing a confirmed grade invalidates its confirmation and downstream publication.
- Saving a correction as a grading example is restricted to confirmed overridden marks.
- Editing feedback or changing a support decision invalidates prior approval/publication and requires re-approval.
- Publishing requires OCR, marking-guide, all marks, support decision and feedback approval.
- Student receipt and notification labels use submitted exam details.

## Remaining limitations (important for milestone planning)

This is still **one main demonstration assessment/student** with predefined OCR and AI mock suggestions. Creating a new assessment records the setup data but does not automatically generate real new question responses, create new student accounts or a real multi-exam database. Teacher OCR verification uses the actual uploaded file preview but the accompanying OCR transcript is deliberately mocked. PDF upload preview shows a PDF viewer; the app does not split or reorder pages **inside** a PDF. "Reference uploads" store their names but don't perform real AI reading or calibration. Class grouping is illustrative, not a multi-student grading engine. English/German full end-to-end scenarios and external school export are not implemented.

## Checks

- `node node_modules/typescript/bin/tsc --noEmit`: passed in the development environment.
- Production build/browser regression tests: not completed here. The uploaded Windows node_modules is missing Linux-native rolldown binding. Run `npm install`, `npm run build` locally and test end-to-end.

## Suggested smoke tests

1. Run `npm run dev`; verify teacher and student dashboards.
2. Switch to Student > Upload, select two small images, preview, replace, reorder, remove, confirm, submit; inspect receipt.
3. Switch to Teacher > Submissions > OCR; preview uploaded files, edit transcription, recheck and approve.
4. Open Teacher > Review Marks; accept or override each mark; save a confirmed override example.
5. Open Learning Gaps, decide red flag, edit and approve feedback, publish.
6. Switch to Student and verify results and notification.
7. Use Reset Demo to restore the seeded scenario.

Important: This is a front-end-only prototype and does not send actual external notifications or invoke AI services.
