# Optional website analytics

The native macOS app has no analytics. This setup applies only to the website.

## Current production setup

Checked on 5 November 2026: the supplied GA4 stream has Enhanced measurement disabled. User and event retention are both 2 months, with the activity-based retention reset disabled. Google signals and user-provided data collection are not activated. The processing terms were already accepted in the existing account. Account-wide sharing options are described on the privacy page.

`file_download` is registered as a key event, counted once per event without an assigned monetary value. The event-scoped “Download Position” dimension uses `cta_location`. These definitions do not generate events themselves; the website's consent-gated code sends them when an installer is available.

## Activate a dedicated GA4 web stream

1. Create or select the Mail Markdown GA4 property and its web stream for `https://markdown-mail.einser.at`. Check the Analytics terms and data processing terms for the account. Do not add Google Ads links or connected destinations.
2. Turn **Enhanced measurement off for the entire stream**. The site sends page views and download clicks explicitly. Leaving automatic history, form, search or outbound-link measurement enabled can create extra events or send unfiltered URLs. `send_page_view: false` alone does not disable enhanced measurement's history events. [Google page-view documentation](https://developers.google.com/analytics/devguides/collection/ga4/views).
3. Keep Google signals, advertising personalization, user-provided data collection and User-ID off. Review account data-sharing settings. Use the shortest appropriate user/event retention period (2 months), and disable resetting retention on new activity. These are account settings, not settings established merely by deploying this repository. [Google privacy controls](https://developers.google.com/tag-platform/security/guides/privacy), [data retention](https://support.google.com/analytics/answer/7667196?hl=en).
4. In Vercel, set the public `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable to the stream's `G-…` measurement ID for Production. Redeploy after changing it. Never put a Measurement Protocol API secret in a `NEXT_PUBLIC_` variable. Keep Preview and Development unset unless deliberately testing an isolated stream.
5. Verify a fresh visit, rejection, acceptance and revocation in Chrome and Google Tag Assistant. Confirm accepted events in the property's Realtime report. The measurement ID alone cannot confirm receipt by the intended property.

An absent or invalid measurement ID keeps Google Analytics disabled. No Google script, consent ping or measurement request should be sent before statistics consent or after rejection. The consent dialog can always be opened using “Cookie-Einstellungen”.

## Consent behavior

The site uses Basic Consent Mode v2. All four Google consent signals start as `denied`. Explicit statistics acceptance changes only `analytics_storage` to `granted`; `ad_storage`, `ad_user_data` and `ad_personalization` stay denied. Default and updated consent states precede configuration and measurement. [Google's basic-mode description](https://developers.google.com/tag-platform/security/concepts/consent-mode), [implementation order](https://developers.google.com/tag-platform/security/guides/consent).

The local consent record contains the choice, policy version and timestamps, with a 180-day expiry. It contains no unique visitor identifier. Accept and reject receive equal prominence; statistics start off in preferences. Settings remain accessible from the homepage footer and legal pages. A withdrawal stops application event dispatch immediately, disables the configured Google tag and removes its first-party Analytics cookies. Already transmitted data is not retroactively deleted by withdrawing consent.

The consent implementation supports the technical requirements; operating the property also requires accurate disclosures and appropriate account and processing settings. [Austrian DSB guidance](https://dsb.gv.at/faqs/datenschutz-cookies).

## Events

| Event | Trigger | Custom fields |
| --- | --- | --- |
| `page_view` | Accepted statistics and navigation to an allowlisted site path | Clean page location and static title; no query, fragment or referrer |
| `file_download` | Activation of an available installer link | Fixed `file_name`, `file_extension`, `link_url`, and `cta_location` (`header`, `hero`, `source`, `final`) |

No event contains Markdown, clipboard contents, editor selections, form values, email addresses, or a user ID. Events are not buffered while consent is missing. Disabled download buttons send no event. A download event records initiation, not a completed transfer or installation. The installer is hosted by GitHub.

GA4's enhanced download measurement does not include `.dmg` in its documented extension list, which is another reason for the explicit event. [Enhanced measurement events](https://support.google.com/analytics/answer/9216061?hl=en).

To compare CTA performance in reports, register `cta_location` as an event-scoped custom dimension. Mark `file_download` as a key event if download initiation is the project's conversion goal. Do not simultaneously create another automatic rule that emits the same event.
