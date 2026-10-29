# Google Analytics 4

Measurement ID: `G-JB9ZRMKRKR`. Installation requested on 2026-10-29. No earlier Analytics
or Tag Manager installation was found. The existing Cookie settings page was informational.
Published on wheelero.com as 6bb5296 through successful run 40893717840.

## Consent and production gating

`AnalyticsConsent.tsx` presents equally styled accept/reject buttons. `/cookies` retains
both choices so consent can be changed later. Labels and privacy text cover all 14 locales.
The versioned preference `wheelero-analytics-consent-v1` in localStorage is either accepted
or rejected. Unknown values require a new choice. Choosing nothing or rejecting loads no
Google script and sends no consent pings. The wheel works independently of this choice.

Both parent and frame require a production build, `VITE_ANALYTICS_ENABLED=true`, and the
exact origin `https://wheelero.com`. The Pages workflow sets the flag. Local preview and
temporary hosts cannot send analytics even if someone accepts. For browser integration
tests, build with the flag and serve that local build through Playwright's production-origin
route interception. Google is mocked in those tests; no test data reaches the property.

## Official tag and data boundary

`analytics.html` is a Vite entry point with noindex and no-referrer. Only after consent does
`lib/analytics.ts` create this hidden same-origin frame. `analytics-frame.ts` loads Google's
official asynchronous `https://www.googletagmanager.com/gtag/js?id=G-JB9ZRMKRKR` and official
gtag arguments queue. This frame has no user forms, links, names, wheel results or editor
DOM for enhanced measurement to inspect. Its URL never contains a query or fragment.
This is isolation from automatic DOM measurement, not a security boundary against Google
as a trusted script provider. Scripts run same-origin so Analytics cookies can function.

Frame messages require the parent source, same origin, a currently accepted preference
and a strict Zod allowlist (`analytics-message.ts`). Unknown fields/events/paths and invalid
counts are rejected. Only static page titles and known routes are used. Unknown routes map
to `/404`. Referrer is empty, query/fragment/UTM/click identifiers are never forwarded, and
script/frame HTTP referrers are disabled. Attribution is intentionally limited by this policy.

The tag receives consent defaults denied, then analytics_storage granted. ad_storage,
ad_user_data and ad_personalization remain denied. Google signals and advertising
personalization are disabled. `send_page_view:false` prevents the config view, and the
parent sends one explicit view per document/route. Internal tabs, fragment cleanup and
repeated consent choices do not generate more views. Public routes use full navigations.
Back/forward cache restorations count as a new visit. Enhanced-history tracking sees no
history changes in the empty frame. No tag runs in the parent page.

The only custom events are:

| Event | Trigger | Allowed metadata |
| --- | --- | --- |
| wheel_spin_complete | Result revealed after the animation | entry_count of eligible entries |
| wheel_save | IndexedDB save transaction succeeds, either Save interface | entry_count |
| wheel_share | A snapshot link is successfully generated | entry_count |
| teams_generate | Valid teams successfully generated | entry_count, team_count |

No wheel/entry/result identifiers, names, titles supplied by users, contacts, images or
sharing payloads are sent. Google still receives ordinary technical data such as network
IP, browser/device information and its random cookie identifier after acceptance. Google
may produce standard session/engagement information and scroll events (observed live, with
safe page metadata). Events before acceptance or while
offline are discarded, not stored for later upload. Events during the local frame's load
are held in memory only after consent and cleared if consent is withdrawn.

Revoking consent sets Google's disable flag, destroys its frame (including timers/listeners),
clears pending events and deletes `_ga`/`_ga_JB9ZRMKRKR` cookies at host/domain scope. No
reload or spin interruption occurs. Other tabs react through the storage event. A request
already sent while consent was granted cannot be recalled. Cookies have a configured
maximum one-year lifetime; the consent preference remains until changed or browser data
is cleared. No wheels or drafts are cleared by this control.

## Temporary debug

On wheelero.com, in the current tab's developer console:

```js
sessionStorage.setItem('wheelero-analytics-debug', 'true')
```

Accept analytics and reload if needed. Explicit events include debug_mode only for this tab.
Turn it off with `sessionStorage.removeItem('wheelero-analytics-debug')`. Debug never bypasses
consent, build or hostname gates. No query-string switch is supported.

## Verification and limits

`e2e/analytics.spec.ts` routes the local production build to wheelero.com and intercepts
Google scripts to inspect the gtag queue. It checks zero pre-consent/rejected requests,
single page views, safe event payloads, success-only saves/team generation, cross-tab
revocation/cookie removal, local-host exclusion, debug, invalid messages and mobile keyboard/
accessibility. Existing unrelated E2E cases start with a rejected localhost preference.

An additional manual Chromium check executed the real Google tag against the local build
at the production origin, intercepting collection requests before transmission. It emitted
one page_view and one wheel_spin_complete with clean page_location, empty referrer and no
synthetic private markers. This confirms request construction, not receipt in GA reports.
Live Chromium subsequently verified HTTP204 collection acknowledgements for page_view and
all four custom events, one homepage view, zero requests before consent and no requests
from a subsequent draw after revocation. GA cookies disappeared on revocation. Actual tag
requests from the contact page contained no test reply email/message values. All 41 browser
cases, the PWA-update regression, 16 unit tests and build/lint/typecheck passed in CI.
No GA admin/Realtime/DebugView access is connected. Do not claim report ingestion from an
HTTP acknowledgement alone. Review property retention/access settings in Google Analytics.

Sources: [basic consent](https://developers.google.com/tag-platform/security/concepts/consent-mode),
[manual views](https://developers.google.com/analytics/devguides/collection/ga4/views),
[privacy controls](https://developers.google.com/tag-platform/security/guides/privacy),
[configuration](https://developers.google.com/analytics/devguides/collection/ga4/reference/config).
