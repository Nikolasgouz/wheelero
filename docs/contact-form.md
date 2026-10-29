# Contact form

Updated 2026-10-29. Local changes only, no commit or deployment.

## Active configuration

The user supplied Formspree form xljjlgrl. Its submission endpoint is
https://formspree.io/f/xljjlgrl. Root .env sets VITE_CONTACT_FORM_ID=xljjlgrl and is ignored
by Git. The recipient is the connected Gmail inbox selected by the user and configured
privately in Formspree. No recipient address, mailto link or credential is in browser assets.
Tools has been removed from the footer. Existing tool routes remain functional.

For local setup, put VITE_CONTACT_FORM_ID=xljjlgrl in root .env, then run from frontend/:

```sh
bun run build
bun run preview --port 4173 --strictPort
```

For a future authorized deployment, set the GitHub repository variable CONTACT_FORM_ID to
xljjlgrl. The local workflow edit maps it to VITE_CONTACT_FORM_ID. No remote setting was
changed and wheelero.com has not been updated. The free plan currently allows 50 submissions
per month. No paid subscription was selected. Monitor provider limits before wider use.

## Behavior and privacy

ContactForm requires a reply email (up to 254 characters) and a message (10 to 5,000
characters), plus a hidden _gotcha honeypot. It posts only these fields on explicit Send.
No wheel data is read or uploaded. It has a single-flight lock and 20-second timeout.
Formspree's successful HTTP response clears inputs and shows a localized acknowledgement.
HTTP errors, 429 rate limits and uncertain connection errors retain input and show feedback.
There is no automatic retry or offline queue. Drafts are in page memory only.

All 14 languages include field labels, availability states, status/errors and provider
explanations. Privacy explains that contact data goes to Formspree/support. Formspree can
also retain submissions in its dashboard. Consult its policy and dashboard for retention.
The reply email belongs to the visitor, not the hidden inbox. Neither account passwords nor
SMTP credentials belong in client environment variables. Blank configuration visibly
disables sending. Build validation rejects emails/URLs in place of a form ID.

## Real verification

The actual built UI at localhost:4173/contact submitted a clearly marked setup message.
Formspree responded HTTP200 with {"next":"/thanks","ok":true}. The connected Gmail inbox
received marker WHEELERO-DELIVERY-1793269933296, message ID 1a18737b0cf2a439, in INBOX with
subject New submission from WHEELERO. Reply-To was wheelero-test@example.com, as entered
in the test form. No customer or wheel data was included. This confirms real delivery.

Lint and production build/typecheck passed. Two existing E2E checks passed (390px
accessibility and 11-route metadata/404). All generated HTML/JS was checked for both former
and current recipient addresses and mailto links, with no matches. Earlier isolated
mocked-provider checks covered declined requests, rate limits, network errors, preserved
text and simultaneous submissions. They were UI checks, not proof of actual delivery.
Full E2E, worker-update regression and physical devices were not rerun for this change.

## Superseded setup

FormSubmit was unavailable (HTTP521) and was replaced. User completed Formspree setup and
provided the integration URL. Do not reuse the rejected generated registration password
under artifacts/formspree-account.json. Private registration/browser/verification artifacts
are ignored and must not be published. No account password reset was performed.

References: [Formspree AJAX](https://formspree.io/blog/formspree-ajax/),
[plans](https://formspree.io/plans), [privacy](https://formspree.io/legal/privacy-policy/).
