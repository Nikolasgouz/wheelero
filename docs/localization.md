# Website languages

English is the default. The menu offers English, Greek, Spanish, French, German, Italian,
Portuguese, Dutch, Polish, Turkish, Russian, Romanian, Japanese and Simplified Chinese.
Language names remain in their own language so visitors can find them. Local flag SVGs
identify the choices. Wheelero remains the brand in every locale.

`frontend/src/locale.ts` owns selection, subscriptions and English-key lookup. App subscribes
using useSyncExternalStore; message modules update before React renders. Selection changes
the interface without navigation or loss of drafts and is disabled during a draw.
The spinaro-language localStorage preference survives reload; unknown saved codes fall
back to English. No database migration is needed.

All thirteen translated catalogs contain 464 common messages; Polish, Russian and Romanian
also contain two plural forms. Coverage includes menus, accessible labels, Customize,
themes/images/sounds, templates, tools, storage/sharing messages, application validation
errors, home descriptions, instructions, FAQs, About, Privacy, 404 and page metadata.
The usability additions cover paste preview/actions, classroom, attendance, round status,
tool navigation and the shorter home introduction in every language.
Public copy lives in site.ts and i18n.ts; components translate it at render time.
Static HTML/SEO and the install manifest use English by default. After startup, document
language/title/description/OG metadata follow the selected language. Browser-owned dialogs,
permission prompts and installation UI follow the browser/OS language.

Keep source keys and {n}/{min}/{max} placeholders aligned in every catalog. Missing keys
fall back to English, so audit additions before delivery. Counts use Intl.PluralRules.
History dates use the selected language. Catalogs are bundled and precached for offline
use. No remote translation service, tracker or translation dependency. No RTL languages.

## Content and persistence

User entry names, wheel titles, custom popup messages and recorded winners are not
translated or rewritten. Proper names in examples stay unchanged. Template titles,
categories and options are translated when displayed and when a new wheel is created;
already saved wheels retain their content. New yes/no and number wheels use the selected
language. Numeric entries remain numeric; team headings and TXT exports are localized.

Only the exact default And The Winner is... is localized in results and the Customize
input. Opening, cancelling or confirming untouched settings does not replace that stored
default with its translation. A user-edited message is preserved. Image gallery names are
resolved on each render, not captured in the initial language. Status/error state stores
source messages so visible notices change language too. Malformed share payloads show a
localized application error instead of raw parser output.

## Presentation

The center uses container-relative font sizing, balanced wrapping and a 68% text width
for space inside the circular boundary. The full translated label remains accessible.
Decorative sparkle/asterisk symbols were removed from the wheel, winner popup and editor;
the Wheelero logo remains intact.

## Verification

2026-10-27: source-key and placeholder audit passed for all thirteen files. TypeScript,
ESLint, 16 existing unit tests, production build and all 36 existing E2E tests passed.
All 14 languages passed public-route, Customize/gallery/template, library, reload and
draw checks. Center labels fit at 360/390/768/1440px (idle and spinning). Offline language
switching, draft/data preservation, popup OK/cancel and malformed sharing passed. Mobile
modal tabs fit in all languages; Greek/German/Japanese dialogs passed axe. Screenshots
were inspected. PROJECT_CONTEXT.md records the results. Native-speaker review of every language and physical-device/screen-reader testing
have not been performed. Temporary checks/screenshots are ignored under artifacts/.

The subsequent usability work passed all 14 languages for desktop wheel fit, mobile paste,
class creation and attendance, with no missing catalog keys/placeholders, browser errors
or horizontal overflow. English/Greek new dialogs passed axe. Current suite: 20 unit tests
and 40 E2E tests; final focused rerun: 4/4 usability tests. See PROJECT_CONTEXT.md.

The user approved committing and pushing these reviewed changes on 2026-10-27.
