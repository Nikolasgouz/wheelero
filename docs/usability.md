# Focused usability improvements

Reviewed locally and approved for GitHub push, 2026-10-27. Existing Wheelero branding, renderer, customization tabs,
RNG and local-only PWA architecture remain. No new dependencies, account system or backend.

## Everyday use

- The desktop wheel fits available width and height below the compact introduction and
  tool navigation. Short windows/zoom can scroll instead of clipping. Mobile stacks the
  wheel and Entries in one column. Large lists scroll inside the sidebar and paginate.
- Customize is a labelled button beside sound/fullscreen and opens the existing settings.
- Paste a list is directly above Entries. The preview counts trimmed, nonempty spreadsheet
  cells/lines. Duplicates remain separate chances. Cancel changes nothing. Replace creates
  a fresh list/round; Add preserves existing IDs, attendance and progress. Both keep history.
- The compact navigation links to all four existing functional tools and the main wheel;
  the active route is indicated. Footer links remain. No unfinished tool is advertised.
- Home copy is shorter; backup/privacy/share details remain in My wheels, Share and help.
  All new interface copy uses the existing fourteen-language system.

## Classroom

1. Open Classroom, create a named class or select a saved one. An existing general wheel
   can also be explicitly converted. Classes are ordinary reusable My wheels records.
2. Paste or edit students. Attendance lets the teacher check absent students without
   deleting them. Checkboxes use entry IDs and numbered labels, even for duplicate names.
3. No repeats is on for a new class. Available count excludes absent and already-picked
   students. The sidebar reveals the updated count/results only after the spin completes.
4. Start new round restores picked students and cancels pending timed winner removals,
   while keeping absent students excluded. All-absent and completed-round states differ.

Attendance has temporary edits until Save; Cancel/Escape preserve the saved state.
Turning No repeats off allows present students to repeat without clearing stored progress.
Manual Remove winner and existing automatic removal still delete that entry as explicitly
configured; Restore entries in More options can recover removed entries. Ordinary class
rounds need only Close, with No repeats handling eligibility without deleting the roster.

JSON exports/local copies include attendance. Class share links include all student names
but reset attendance and round progress, with disclosure in Share. Existing links/backups
without classroom metadata still work. Storage upgrade details are in data-model.md.

## Verification

Targeted unit tests cover spreadsheet parsing, duplicate IDs, absence, no-repeat, new
rounds, backup validation and share privacy. Browser regressions cover cancel/replace/add,
refresh, offline class rounds, migration recovery, viewport sizing and modal keyboard use.
Actual final counts and device limitations are recorded in PROJECT_CONTEXT.md.

Verified 2026-10-27: 20 unit tests, 40 E2E tests, typecheck/lint/build passed. The final
attendance-reference change was rechecked with all four usability E2E tests. Desktop
1366x768, 1440x900, 1920x1080 and mobile 390x844 passed light/dark, no-overflow and keyboard
checks; screenshots inspected. All 14 languages passed desktop fit and mobile new dialogs;
English/Greek new dialogs passed axe. Physical-device/real screen-reader tests were not run.
Small 683x384 layout was checked as an effective zoomed viewport, not browser-native zoom.
