# Menu languages

English is the default. The header offers English, Ελληνικά, Español, Français,
Deutsch, Italiano, Português, Nederlands, Polski and Türkçe using native language names.
The native select supports keyboard navigation and screen readers; selection is disabled
during a draw or pending operation. It updates the interface without reloading, remounting
the app, losing entry drafts or writing to a wheel. Preference lives in localStorage as
`spinaro-language`; an unrecognized stored code falls back to English.

`frontend/src/locale.ts` owns selection, subscriptions and message lookup. App subscribes
with `useSyncExternalStore`; the existing message modules refresh their exported objects
before React rerenders. `document.documentElement.lang` follows selection on startup
and subsequent changes. JSON catalogs are bundled and therefore precached with the app.
No remote translation service or extra dependency is used. No database/API shape change.

Each catalog translates 196 interface messages: navigation, entries/results, My wheels,
sharing/import/export controls, installation help, client-side errors, Customize tabs,
controls, sound names and accessible labels. Polish includes two additional plural forms.
English source strings are lookup keys; unmapped text falls back explicitly to English.
Keep all nine catalogs aligned when changing a menu string. Placeholders such as `{n}`
must remain intact. Counts use Intl.PluralRules, including Polish one/few/many forms.

User entry names, wheel titles, custom popup messages and recorded results are never
translated. Only the exact default `And The Winner is...` is localized when displayed;
the stored configuration stays unchanged. TXT result-export headings use the current
language, while user names/UTC timestamps/JSON backup fields are preserved.

Scope: menu localization, not complete website translation. HomeInfo editorial copy,
template contents, most theme/gallery names, backend validation responses and installed-app
manifest text remain English. Translating these is separate future work. No RTL languages
are offered in this release. Native-speaker review of every translation is still needed.

Verification (2026-10-25–26): typecheck, lint, production build and 10 unit checks passed.
Chromium exercised every language across navigation, My wheels and Customize; the
document and unsaved entry draft survive switching. Stored preference survives reload;
Greek/German switching and a localized winner work offline. Draw locking, keyboard
selection/focus, accessible labels and invalid saved-code fallback passed. Header axe
WCAG A/AA and layout checks passed at 360/390/768/1440px. Longer mobile sound labels
use a full-width selector row; screenshots were inspected. Catalog keys/placeholders
were checked across all nine JSON files. Physical-device/screen-reader and native-speaker
reviews were not performed.
The full existing E2E suite passed 28/30 initially. Two 15-second action timeouts
(bulk input and a 390px Customize tab) passed on a focused rerun, without code or
timeout changes. All 30 scenarios have therefore passed, across those two runs.
