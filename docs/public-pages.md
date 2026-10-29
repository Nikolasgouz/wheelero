# Footer information pages

Updated 2026-10-29. Changes are local, not deployed.

Latest change supersedes the email-link/Tools notes below: Tools is removed and the
recipient is absent from the browser source. Contact now uses a Formspree message form,
with real delivery verified locally. See [contact form status](contact-form.md).

| Footer link | Route | Content |
| --- | --- | --- |
| Help & FAQ | /how-to-use | Expandable answers about entries, customisation, Save/Open, results, randomness, rounds, sharing and installation |
| About Wheelero | /about | Short product description, customisation and offline use |
| Contact & support | /contact | Reply-email/message form and guidance for problem reports |
| Privacy Policy | /privacy | Names and other local data, offline files, public snapshot links, hosting requests and deleting site data |
| Terms of Use | /terms | Lawful use, content permissions, limits of random results, local storage and sharing responsibilities |
| Cookie settings | /cookies | Actual storage mechanisms and the absence of optional cookies/trackers |

Install app remains available. Footer labels and page content use the existing
14-language system. FAQs live on their own route, not under the homepage wheel. English
HTML is prerendered, with translated content after client initialization. All six pages
are included in offline caching and the production sitemap through the pages map.

The footer groups its links under Help & information and Privacy & terms, with the
existing logo, visible keyboard focus and aria-current on the active route. Information
pages use a narrow reading width, bordered content panels and a return-to-wheel link.
Contact has an accessible form. Native details/summary makes FAQ answers expandable
without custom interaction state. Mobile stacks the identity row above two link columns.
The wheel's layout and data are unchanged. Intros/About/report guidance were refreshed in
every language. Obsolete backend-migration details were removed from public Privacy copy.

## Boundaries and future publication work

The user supplied a support inbox and then requested that it be hidden everywhere in the
website. It must be configured privately with the submission provider, never bundled into
the site. Contact uses Formspree form xljjlgrl with verified inbox delivery from the local
production preview. Nothing has been deployed. Operator identity remains
unspecified. Contact copy is translated in all 14 languages.

There is no optional advertising/analytics service in this build. Cookie settings is
therefore informational, not a pretend consent manager. It explains IndexedDB, localStorage
and app caches, including the consequence of clearing site data. No storage deletion or
new cookies are triggered by reading any page. If optional tracking is added later, both
the implementation and these statements need review before publishing it.

Privacy and Terms describe the implementation and basic usage rules. They are not a
complete jurisdiction-specific legal assessment. Actual operator identity, hosting data
retention, applicable rights and contact arrangements need operator review before treating
these pages as final legal documents. No contractual jurisdiction, company identity or
compliance guarantee has been invented.

Background references consulted: [EU guidance on cookies](https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm)
and [privacy notice guidance](https://europa.eu/youreurope/business/growing/digitalising/securing-website/index_en.htm).
The application copy is based on the repository's actual storage behavior.

## Verification

Visual/copy polish: lint and build/typecheck passed, as did the existing mobile accessibility
and metadata/404 cases (2/2). Chromium checked all 14 languages for complete translations,
six routes, active links, Tools keyboard behavior, expandable FAQ answers and overflow.
After final contact spacing changes, both E2E cases passed again. Verified English/Greek
at 360/390/1440px and explicit dark mode, including intact email text and link. Screenshots:
artifacts/professional-{en,el}-{mobile,desktop,dark}.png. No full-suite or worker-update rerun.

Email follow-up: lint and build/typecheck passed. Chromium verified Contact/Privacy links,
translations in all 14 languages, keyboard focus and no horizontal overflow at 360px.
Both prerendered pages include the correct mailto address. No email was sent and native
email clients were not launched. Earlier page checks below remain the previous results.

Lint and build/typecheck passed. Existing metadata/404 E2E now covers all 11 public routes,
and the existing 390px keyboard/accessibility case passed (2/2). Direct Chromium checks
covered all six links, localized headings and mobile overflow in all 14 languages, absent
cookies/contact submissions/consent toggles, and offline navigation to all six pages.
Catalog audit found translations for every public page string. English/Greek screenshots
were captured on mobile and desktop, including explicitly selected dark mode. Full E2E,
real worker-update regression, physical devices and legal/native-speaker review were not run.
