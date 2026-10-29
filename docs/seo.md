# Targeted SEO and number generator

Updated 2026-10-29. Publication verification pending.

## Inspection and decisions

The site already used React/TypeScript, Bun/Vite, GitHub Pages and build-time React
prerendering. There is no active backend. Existing robots/sitemap/canonical/OG and
WebApplication structured data were present. The gaps were generic prerender-only
instructions, repeated homepage copy across wheel routes, no instant number generator,
limited task-specific content, and no dedicated Twitter title/description/image fields.
The homepage H1 was visually hidden. Its new visible H1 is below the tool, preserving
the viewport-fitting centered wheel and avoiding new text above it.

Live inspection found that GitHub Pages already returns 301 from extensionless subpage
URLs to their trailing-slash directory URLs. Canonicals, sitemap, related links and footer
links now use those existing final URLs. Old URLs remain functional. The client no longer
rewrites the canonical to the redirecting URL. 404 HTML is noindex with no canonical to
the homepage. launch.html is noindex and canonicalizes to the homepage. No invented
lastmod values are emitted.

Reference review: [Wheel of Names](https://wheelofnames.com/) emphasizes practical name
selection and classroom uses, with instructions below the wheel. [Picker Wheel](https://pickerwheel.com/)
links specialized tools and explains controls below the interaction. Its
[number wheel](https://pickerwheel.com/tools/random-number-generator/) and
[team tool](https://pickerwheel.com/tools/random-team-generator/) describe different tasks.
The two attempted yes/no reference URLs could not be fetched through the web tool.
We used these observations only to separate intent and improve useful navigation, not
to copy content, design, feature claims, popularity figures or algorithms. No paid keyword
tool, search-volume estimates, ranking estimates or competitor superiority claims were used.

Technical references: [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
and [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Page map

| Canonical path | Main intent | Title | H1 |
| --- | --- | --- | --- |
| / | spin the wheel | Spin the Wheel – Custom Wheel Spinner \| Wheelero | Spin the Wheel |
| /random-name-picker/ | random name picker | Random Name Picker – Paste a List & Pick a Winner \| Wheelero | Random Name Picker |
| /random-number-generator/ | random number generator | Random Number Generator – With or Without Repeats \| Wheelero | Random Number Generator |
| /random-number-wheel/ | random number wheel | Random Number Wheel – Choose Your Range \| Wheelero | Random Number Wheel |
| /yes-no-wheel/ | yes or no wheel | Yes or No Wheel – A Simple Random Decision \| Wheelero | Yes or No Wheel |
| /random-team-generator/ | random team generator | Random Team Generator – Split Names into Balanced Teams \| Wheelero | Random Team Generator |

Related phrases are covered naturally by the actual task and examples, not by repeating
every synonym. One page covers each need. Existing useful specialist metadata was retained
rather than rewritten without need. Homepage intent is now the general wheel, distinct
from name selection. Wheelero remains the sole brand.

## Content and rendering

- `src/site.ts`: route metadata, canonical path helper and the new numbers route.
- `src/tool-content.ts`: distinct instructions, examples, FAQs and related paths for six tools.
- `components/ToolGuide.tsx`: the same meaningful guide HTML in prerender and client views,
  six crawlable tool links, current-route state and related-tool explanations.
- `components/PageLoading.tsx`: shared prerender/client loading layout reserves tool space
  while IndexedDB opens. JavaScript is required for draws, but instructions, headings,
  links and FAQs are real initial HTML. No second rendering framework was added.
- `scripts/pages.tsx`: escaped metadata, canonical/OG/Twitter consistency, accurate
  WebApplication/WebPage JSON-LD, sitemap and noindex/404 output.

React still uses createRoot, not hydration of a server-rendered interactive wheel. Public
content is rendered from the same components in both phases, and an E2E compares the six
guides before/after JavaScript initialization. No crawler-specific rendering or consent
bypass exists. English is the prerender/indexing default. All new visible copy and errors
have translations in the 13 other catalogs, using the existing automatic/saved language.
There are no separate locale URLs, so no fabricated hreflang alternates were added.

The existing homepage features remain. Specialist routes now show their own guides instead
of duplicating the entire general homepage article. The latest request authorizes task FAQs
and tool navigation again, below the actual tool. FAQ markup is ordinary visible details,
not a promise of FAQ rich results. No ratings, reviews, company identity or usage numbers
were invented. Free/no-signup claims reflect the absence of accounts or payment gates.

## Number generator

`lib/numbers.ts` validates integer endpoints from -1,000,000,000 to 1,000,000,000,
minimum <= maximum, and quantity 1–1,000. Both endpoints are included. Without repeats,
quantity cannot exceed the range cardinality. Uniqueness is per batch, not across batches.

Each random index uses Web Crypto Uint32 rejection sampling: discard values outside the
largest multiple of the current range below 2^32 before taking modulo. All accepted
remainders have the same number of preimages. Without replacement, a sparse Fisher–Yates
map swaps a sampled position with the last remaining position. This is uniform and uses
O(quantity) space/time rather than allocating the full interval. The existing wheel/team
randomIndex function and its bounds are unchanged.

`components/NumberGenerator.tsx` provides keyboard-friendly labeled inputs, validation,
an opt-in repeats checkbox, results textarea, clipboard copy with visible manual-copy
fallback and live announcements. Outputs stay in component memory, never in Analytics,
URLs or network payloads. They reset on reload. Offline use follows the existing PWA cache.

## Analytics and preservation

GA4 G-JB9ZRMKRKR, the basic-consent gate and isolated analytics iframe remain. The new
route joins the existing validated route map, with one explicit page_view. There is no
new tag, result event or input parameter. The analytics E2E verifies a generated sentinel
number and private URL parameters never appear in events. Existing names, save/open,
sharing, customization, sound-on-load and the 12 templates remain intact.

## Validation

Local results so far: typecheck/build/lint passed, all 31 unit tests passed, including 15
number cases for invalid inputs, negative/zero/singleton ranges, endpoint inclusion,
biased-tail rejection, all six permutations of a three-element range, limits and uniqueness.
The focused SEO/Analytics run passed nine cases initially. Its clipboard assertion needed
Windows CRLF normalization, then the remaining copy/offline case passed. The first run
also exposed an old preview process holding the previous route map. Restarting only that
verified preview process fixed it; the production build itself contained the new route.

Full local runs exposed a test-fixture teardown race in Analytics: proxied audio requests
could outlive a navigation. The fixture now serves the actual dist files directly under
the production origin and drains routes on teardown, without suppressing exceptions.
All seven Analytics cases passed afterward. A short-spin assertion in the unchanged
1,000-entry test missed its disabled window under heavy eight-worker load, then passed
with two diagnostic workers. The project default/CI concurrency remains eight workers.
All 44 distinct browser cases passed across these runs. The isolated PWA update passed,
preserving saved content and unsubmitted editor work across a real worker replacement.
Rendered copy/controls and mobile overflow also passed for all six tools in all 14 languages.

The visual inspection covered six tools at 1366x768, 1440x900, 1920x1080 and 390x844 in
light/dark: 48 views, no horizontal overflow or browser errors. The homepage wheel stayed
centered and fully visible on desktop. A short local headless Chromium sample measured
maximum summed layout shift 0.022 and LCP 320 ms. These are localhost lab observations,
not real-user Core Web Vitals or a production performance guarantee. Screenshots and
measurements are ignored under artifacts/seo-*.png and artifacts/seo-layout.json.

Final CI and live release checks are pending. Physical devices, human screen-reader
testing, real-user performance, Search Console indexing and ranking changes are unverified.

## Search Console follow-up

Submit/check https://wheelero.com/sitemap.xml. Inspect each of the six canonical URLs
above for Google-selected canonical, crawl status, rendered content and indexing.
Request indexing for the new generator and materially changed tool pages if appropriate.
Compare query/page impressions and clicks over time after crawling. No Search Console
access is connected, and publication alone does not prove indexing or improved rankings.

To reproduce the SEO tests, build with PUBLIC_URL=https://wheelero.com,
PUBLIC_INDEXING=true and VITE_ANALYTICS_ENABLED=true, then run the Bun e2e script.
The analytics tests mock collection. The actual local origin is never tracked.
