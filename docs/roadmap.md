# Roadmap

Delivered: local-only IndexedDB wheels, fragment share links, real name/number/yes-no/team
tools and static public pages. Backend/API/sync are retired.

Before permanent hosting: static host/domain/DNS access, operator/contact information
and HTTPS verification. Docker/Droplet is optional.
Physical iOS/Android installation, audio, keyboard, safe areas and human screen-reader
testing remain. Existing fourteen-language menus stay; new public copy is English.

Next refinements: large-history pagination, local backup reminders, storage usage display
and native-speaker translation review. Fragment links cannot expire or be revoked.

## Separate store path — not started

**Android:** after a stable HTTPS origin and verified domain ownership, use a Trusted Web
Activity with Bubblewrap. Digital Asset Links binds the signing certificate/package to
the website. This reuses the browser/PWA engine and local browser storage. It needs
a signed build, real-device testing and a Play developer account; none has been purchased
or submitted. [Chrome guide](https://developer.chrome.com/docs/android/trusted-web-activity/quick-start).

**iOS:** evaluate Capacitor around the static React build. Bundle assets and add useful
native file import/export and sharing. Verify IndexedDB retention and migration in the
native webview. There is no API/authentication service. Use Xcode/TestFlight and real devices.
Apple reviews minimum functionality; wrapping a URL alone does not guarantee approval.
[Capacitor](https://capacitorjs.com/docs/ios),
[Apple guidelines](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality).

Accounts/cross-device login, live rooms, payments, AI suggestions and store publishing
remain separate future work. No inactive store or paid-feature buttons are shown.
