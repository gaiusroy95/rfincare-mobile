# Rfincare Mobile App (Expo)



React Native Expo app with **Customer** and **Agent** portal parity vs the web frontend, integrated with the Rfincare backend.



## Stack



- Expo SDK 56 + Expo Router

- TypeScript + React Native

- API: `https://rfincare.onrender.com` (configurable)



## Setup



```bash

cd mobile

cp .env.example .env

npm install

npx expo start -c

```



## Environment



| Variable | Description |

|----------|-------------|

| `EXPO_PUBLIC_API_BASE_URL` | Backend API origin (default: `https://rfincare.onrender.com`) |



## Parity status (by function)



| Function | Status |

|----------|--------|

| Phase 0 — Shared components & hooks | Done |

| Assessment wizard (8 steps + draft/resume) | Done |

| Bank selection & consent | Done |

| Additional questionnaire (5 sections) | Done |

| Eligibility lead OTP | Done |

| Bank marketplace (filter/compare) | Done |

| Customer dashboard (4 tabs, PDF) | Done |

| Profile & document center | Done |

| Auth & registration validation | Done |

| Marketing (home FAQ, contact API, product matrix) | Done |

| Agent dashboard (kanban, charts, messaging) | Done |

| Agent clients & assisted application | Done |

| Agent learning, settings, documents | Done |

| i18n (8 locales + switcher) | Done |

| Deep links & EAS builds | Ready |



## App structure



- **Launch** — Role picker (Customer / Agent)

- **Customer** — Home, Apply, Bank Marketplace, Dashboard, More

- **Agent** — Login, Dashboard (pipeline), Clients, Documents, Learning, Settings



Deep links:

- `rfincare://resume/{token}` — Resume saved application

- `rfincare://oauth/callback` — Dormant (OAuth excluded from mobile UI)



## EAS Build



```bash
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
npx eas build --profile production --platform all
```

## Android vs iOS builds

| Platform | Apple account needed? | Notes |
|----------|----------------------|--------|
| **Android** | No | Preview APK works on emulators (e.g. MuMu) and real devices. |
| **iOS (standalone app)** | **Yes** — Apple Developer Program ($99/year) | An Expo account alone is not enough; Apple signs all real iOS apps. |
| **iOS (quick demo)** | No (limited) | Use **Expo Go** on someone's iPhone — not a production build. |

## iOS when ready

Use this when you need a real iPhone build (preview IPA, TestFlight, or App Store).

### Prerequisites

1. **Apple ID** (free) — create at [appleid.apple.com](https://appleid.apple.com) and enable two-factor authentication.
2. **Apple Developer Program** ($99/year) — enroll at [developer.apple.com/programs](https://developer.apple.com/programs/enroll/).
3. **Expo account** — already linked to this project (`eas.json` project ID).
4. **A tester with an iPhone** — required for install/QA (iOS Simulator needs a Mac; Windows cannot run it locally).

### First-time iOS build (preview)

```bash
cd mobile
npm install
eas login
eas build --profile preview --platform ios
```

When prompted:

- **Log in to your Apple account?** → `yes`
- Enter your **Apple ID** (email) and password
- Complete **2FA** (6-digit code from a trusted Apple device)

EAS will create signing credentials on Expo’s servers. Download the build from the Expo dashboard when it finishes.

### Distribute to testers (no Mac required on your side)

**Option A — Internal / ad hoc (preview profile)**

1. Open the build on [expo.dev](https://expo.dev) → your project → Builds.
2. Share the install link with testers whose devices are registered (EAS can register UDIDs during the flow).

**Option B — TestFlight (recommended for wider testing)**

```bash
eas submit --platform ios --profile production
```

Or upload the `.ipa` in [App Store Connect](https://appstoreconnect.apple.com) → TestFlight → add testers by email.

### iOS smoke test checklist (for your tester)

Ask someone with an iPhone to verify:

- [ ] App installs and opens (role picker)
- [ ] Customer login and dashboard
- [ ] Assessment wizard (all steps, save/back)
- [ ] Document upload and signature/OTP step
- [ ] PDF download from dashboard
- [ ] Deep link: `rfincare://resume/{token}` (if you have a test token)
- [ ] Agent login and dashboard pipeline

### Free alternative before paying Apple

For a quick demo only (not a store-ready build):

```bash
npx expo start
```

Tester installs **Expo Go** from the App Store, scans the QR code, and opens the project. Custom native build features may differ from the standalone APK/IPA.

### Current recommendation

- **Now:** Ship and QA the **Android preview APK** (already working on MuMu).
- **Later:** Enroll in Apple Developer when you need TestFlight, App Store, or a standalone iPhone app.




- [ ] Role picker → Customer home loads

- [ ] Eligibility OTP → results → marketplace badges

- [ ] Assessment 8-step wizard → auto-save → submit

- [ ] Resume deep link `rfincare://resume/{token}`

- [ ] Bank selection → consent → OTP → questionnaire

- [ ] Customer dashboard tabs, PDF download

- [ ] Agent login → kanban pipeline → assisted application

- [ ] Language switcher in More screen

- [ ] EAS preview build succeeds (Android + iOS)



## Theme



Matches web frontend: Primary `#2D4A87`, Customer `#6366F1`, Agent `#EC4899`


