# Google AdSense onboarding

Requested on 2026-10-30 for wheelero.com. Publisher: `pub-8954880355873863`.
The publisher ID is public, not a credential. Personal payment information must stay out
of the repository and client assets.

`frontend/index.html` includes Google's `google-adsense-account` ownership meta tag.
The existing prerenderer preserves it on public pages. `frontend/public/ads.txt` declares
Google as the authorized direct seller and is copied to `/ads.txt` by Vite. The existing
main-branch Pages workflow publishes both files without hosting or DNS changes.

This stage connects the site for review. It does not load an advertising script, request
ads or reinterpret existing Analytics consent as advertising consent. Google's meta-tag
verification method permits ownership verification and a review request before ad serving.
The existing wheel layout, local data, Analytics isolation and cookie choices remain intact.

Published on 2026-10-30 as commit `2adafbc` through successful
[Pages run 41066940511](https://github.com/Nikolasgouz/wheelero/actions/runs/41066940511).
All build checks, four browser shards, the isolated PWA update and deployment passed.
Live HTTP 200 checks confirmed the exact head metadata on all six tool routes and the
exact `/ads.txt` line. AdSense confirmed ownership, accepted the review request and now
shows **Getting ready / Review requested**. This is pending review, not approval.
The new Individual payment profile still requires the payee's name and postal address.

Local validation: locked install, typecheck, lint, all 31 existing unit tests and the
production build passed. Parsed all 15 generated public HTML files to confirm the exact
publisher meta tag is in the head, checked the emitted ads.txt line and confirmed no
ad-serving script was introduced.

## Activation checklist

1. Confirm the live homepage contains the publisher meta tag and `/ads.txt` returns the
   exact seller line above with HTTP 200.
2. In AdSense > Sites > wheelero.com, select Meta tag, confirm placement and Verify,
   then Request review. Site approval is Google's decision, not a deployment result.
3. Complete the Individual payments profile using the payee's actual legal name and
   address. Do not reuse an Organization profile or infer personal details.
4. Configure Google's certified CMP with Consent, Manage options and Do not consent.
   Before serving ads, update the privacy/cookie text in every supported language,
   provide a way to change advertising consent and verify refusal/withdrawal behavior.
   The existing Analytics-only consent is not permission for advertising.
5. Integrate and test the AdSense serving script after the consent work, using this
   publisher ID. Keep advertising away from editable wheel content, contact inputs,
   controls and results. Do not claim ads or earnings are active until verified.

Official references:
- [Connect a site and select a verification method](https://support.google.com/adsense/answer/7584263?hl=en)
- [Ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=en)
- [Google CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en)
