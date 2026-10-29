# Entries editor

Reference inspected in Chromium on 2026-10-27: https://wheelofnames.com/.
The basic Entries tab has one editable text region, a live count, Shuffle/Sort, an
Add image menu and an Advanced switch. Enter creates another line. Entering duplicate
Alex lines and then Emma/Noah produced four entries; duplicates remained separate.
Reference screenshot and inspection script are ignored under artifacts/reference-entries.png
and artifacts/inspect-reference-entries.mjs. No reference code or assets were copied.

Wheelero now uses a native textarea in WheelSidebar.tsx for the same basic editing flow:

| Reference behavior | Wheelero implementation / difference |
| --- | --- |
| One editable region, one name per line | One labeled textarea; Enter, selection, deletion and whole-list paste |
| Immediate wheel/count changes | Existing local store updates and IndexedDB autosave |
| Shuffle / Sort | Existing actions retained, together with the requested Clear button |
| Separate Results tab | Existing result timing, sort, clear and TXT export retained |
| Duplicate lines | Separate entry IDs and chances; no implicit deduplication |
| Advanced / Add image | Existing More options screen edits images, order and no-repeat state; no inline rich-text images or weighted editor are added |

lib/entries.ts parses line endings and spreadsheet tabs, ignores blank lines and trims
outer whitespace. The textarea retains raw text while typing so spaces/newlines do not
move the caret. Refresh restores the saved entries, not empty formatting-only lines.
Lists live in IndexedDB; the full text is not duplicated into limited localStorage.
Limits remain 10,000 entries and 160 characters per entry; an over-limit edit is rejected
with the existing translated limit message. Editing/actions are disabled during a draw.

Reconciliation retains untouched prefix/suffix entries, matches moved names separately
(including duplicates), and preserves IDs/images/active flags for unambiguous renames.
The caret distinguishes which identical adjacent line was deleted. Unmatched replacements
become new entries; plain-text editing is not a metadata undo/history system. The detailed
editor remains available for image and no-repeat inspection. No database migration occurs.

Keep the current changes local: do not commit, push or deploy until explicitly requested.

## Top menu

Customise opens the existing settings dialog. New and the library's New wheel create a draft wheel with the initial
Pick a name title, Alex/Emma/James/Olivia/Noah/Sofia entries and default customization.
Both open the wheel directly; previous wheels remain saved.
Open shows the existing local library; opening a card returns
to the wheel, while Rename opens the detailed editor. Templates opens the existing collection
in a keyboard-accessible dialog and creates a draft on selection. Save names a wheel and
adds it to Open. All six top-menu actions
are disabled during a draw, translated in all menu languages, and visible on mobile.
The mobile bottom navigation remains. The duplicate wheel gear has been removed; the
instructions below the wheel now refer to Customise and Save/Open, translated in all
14 languages. Open lists actual saved records only; see data-model.md for the v13 migration.

## Center spin control

The full localized spin label wraps within an inner area of the round button. Its font
scales with the button diameter instead of viewport width. Wheel.tsx measures and reduces
the font as needed to fit a 68% inner square, after text changes, font loads and resizes. Both idle and spinning labels
were checked in Chromium in all 14 menu languages at five widths (360-1920px); none
exceeded the circle. The complete accessible button name and click behavior are unchanged.

## Larger wheel / compact homepage

The homepage H1 and normal-view wheel name are visually hidden (retained for assistive
technology). Save/Open and the detailed editor retain real wheel names; presentation mode
still honors show_title. Desktop controls sit in the upper corners, with the wheel centered
on the viewport and sized to both available width and height. The sidebar uses 21vw
(clamped to 260-320px). On mobile the wheel uses an extra 8px per side within page margins.
SVG segments scale together; short/zoomed screens can still scroll.

Open shows the saved-wheel library directly; the Stored in your browser panel and its
Protect local storage action were removed at the user's request. Save/Open behavior is unchanged; standard JSON import/export was subsequently removed. Storage explanations remain in help and Privacy.

Open now starts with three real saved wheels: the default name wheel and two empty wheels.
They can be edited, renamed or deleted normally. Startup seeding/migration happens once
(v14); new drafts still require Save. See data-model.md.

Latest layout follow-up (2026-10-29): the actual wheel title is an editable input in the
free left desktop column. Clicking or tabbing into it edits through the existing local
store, with the same 120-character limit and empty-on-blur fallback as the detailed editor.
Enter leaves the field. It is disabled during draws and follows show_title. Long names
scroll inside the input. Mobile keeps this field above the wheel; presentation retains its
heading. Existing translated labels are reused in all 14 languages.

Removing the desktop title/control row, using 8px vertical viewport padding and 12px grid
gaps grows the centered wheel and Entries height without changing the renderer or data.
At 1366x768 the wheel stage is 688px and Entries is 688px tall. At 1440x900 the stage is
779px and Entries is 820px tall. Both fit inside the initial desktop viewport.

## Simplified editor and saved versions

Add multiple entries and its extra panel were removed from More options. Paste directly
into Entries. The remaining single-entry draft input still persists across refresh/PWA
updates; old bulk-draft fields are retained in storage but not rendered.

Save with the same name updates the saved wheel while retaining its ID. A new name
creates a copy and preserves the previous wheel. Open edits a working draft; saving
applies those changes to the matching name. Save explanatory paragraphs are hidden in every language.
See data-model.md for handling existing duplicate names and working drafts.

Visual cleanup: the winner popup has no decorative sparkle, and the evening-plans
template uses a moon icon. The More options editor heading also has no decorative star.
These changes apply across languages without changing entries.
The More options save bar no longer displays Draft for unsaved wheels. Save and the
saved-wheel indicator remain available; draft persistence and library behavior are unchanged.

Share now lives in the top menu and opens the existing local-link dialog. It is disabled
during a spin. The mobile menu uses two rows of three below 481px for readable labels.
