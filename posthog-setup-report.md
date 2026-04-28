<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly – Smart Billing Expo app. Here is a summary of all changes made:

- **`app.config.js`** (new): Created to replace static `app.json` configuration. Exposes `posthogProjectToken` and `posthogHost` as Expo extras read from environment variables at build time, making them available via `expo-constants`.
- **`lib/posthog.ts`** (new): Singleton PostHog client configured from `expo-constants` extras. Disables itself gracefully if the token is not set, enables lifecycle event capture, debug mode in dev, and sensible batching settings.
- **`.env.local`** (updated): Added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` values.
- **`app/_layout.tsx`** (updated): Added `PostHogProvider` wrapping the app inside `ClerkProvider`. Added manual screen tracking using `usePathname` + `useGlobalSearchParams` + `useRef` to fire `posthog.screen()` on every route change (Expo Router compatible pattern).
- **`app/(auth)/sign-in.tsx`** (updated): Captures `user_signed_in` and `user_sign_in_failed`. On success, calls `posthog.identify()` with the Clerk user ID as distinct ID.
- **`app/(auth)/sign-up.tsx`** (updated): Captures `user_sign_up_failed`, `verification_code_submitted`, and `user_signed_up`. On completion, calls `posthog.identify()` with the Clerk user ID.
- **`app/(tabs)/settings.tsx`** (updated): Captures `user_signed_out` and calls `posthog.reset()` before Clerk sign-out to clear the PostHog session.
- **`components/SubscriptionCard.tsx`** (updated): Captures `subscription_card_expanded` and `subscription_card_collapsed` with non-PII properties (subscription name, billing cycle, status, category).
- **`app/subscriptions/[id].tsx`** (updated): Captures `subscription_detail_viewed` with the subscription ID on mount.
- **`app/onboarding.tsx`** (updated): Captures `onboarding_viewed` on mount.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signed in with password | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Sign-in attempt failed | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | Account created and verified | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | Sign-up attempt failed | `app/(auth)/sign-up.tsx` |
| `verification_code_submitted` | Verification code submitted during sign-up | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signed out of the app | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expanded a subscription card to view details | `components/SubscriptionCard.tsx` |
| `subscription_card_collapsed` | User collapsed a subscription card | `components/SubscriptionCard.tsx` |
| `subscription_detail_viewed` | User navigated to a subscription detail screen | `app/subscriptions/[id].tsx` |
| `onboarding_viewed` | User arrived at the onboarding screen | `app/onboarding.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard – Analytics basics**: https://eu.posthog.com/project/168438/dashboard/649233
- **Sign-up Funnel** (conversion funnel): https://eu.posthog.com/project/168438/insights/nSd2TJjW
- **Daily Active Users (Sign-ins)**: https://eu.posthog.com/project/168438/insights/tIPu3EMv
- **Subscription Card Engagement**: https://eu.posthog.com/project/168438/insights/UeSLK1nh
- **Sign-in vs Sign-up vs Sign-out** (churn indicator): https://eu.posthog.com/project/168438/insights/Mx6UbMre
- **Sign-in Failure Rate**: https://eu.posthog.com/project/168438/insights/hkjZJT9i

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
