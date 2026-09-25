# Quick Scanner

ලෝකයේ ඉහළම තාක්ෂණයෙන් යුත් document scanning app එකක් වෙනුවෙන් — CamScanner/iScanner වගේ, ඒත් ads නැතුව, premium wall නැතුව. මේ repo එකේ තියෙන්නේ Next.js 16 + Tailwind CSS 4 + Firebase වලින් හදපු, PWA විදියට install කරගන්න පුළුවන් web app එකේ පළමු පියවර (Phase 1).

## දැනට implement කරලා තියෙන දේවල් (Phase 1)

- 🎨 **Unique Logo & Favicon** — SVG එකකින්ම හදපු, scanner viewfinder + document motif එකක් තියෙන logo එකක් (`src/components/Logo.tsx`, `public/favicon.svg`). PWA icons (192/512/maskable) auto-generate කරන්නත් script එකක් තියෙනවා (`scripts/generate-icons.mjs`).
- 🔐 **Firebase Authentication** — Email/Password, Google Sign-in, සහ Anonymous (Guest) sign-in. Guest එකෙන් login වුනාට පස්සේ Google/Email එකකට account එක "upgrade" කරන්නත් පුළුවන් (data නැති වෙන්නේ නැහැ).
- 🖥️ **Dashboard** — Login වුනාට පස්සේ පේන animated, responsive dashboard එකක්. Stat cards, "Scan a document" placeholder (Phase 2 එකේදී camera + OCR එකතු කරනවා), guest-upgrade banner.
- 🏠 **Landing Page** — Animated hero, features grid, fully responsive (mobile/tablet/desktop).
- 📱 **PWA** — `manifest.json` + Serwist (service worker) හින්දා "Add to Home Screen" කරන්න පුළුවන්. මේකම පස්සේ Bubblewrap/TWA එකකින් APK එකක් විදියටත් package කරන්න පුළුවන් (Phase 2/3).
- ✅ Vercel deploy වෙන්න ready — zero-config, `quickscanner.vercel.app` වලට push කරාම auto-deploy වෙනවා.

### Phase 2 (ඊළඟට එන දේවල්)

- Camera capture + AI edge detection + perspective correction
- OCR (text extraction) engine integration
- Firestore එකට scanned documents save කිරීම + device එකට download කිරීම
- Multi-page documents, PDF export, cloud sync

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Firebase** — Authentication + Firestore (`firebase` JS SDK v12, modular)
- **Motion** (Framer Motion) — animations
- **Serwist** — PWA / service worker
- **Vercel** — hosting + CI/CD

## Local Development

```bash
npm install
cp .env.example .env.local   # පහළ බලන්න, values ටික දාන්න
npm run dev
```

`http://localhost:3000` එකෙන් app එක බලන්න පුළුවන්.

### `.env.local` සකස් කිරීම

Firebase Console > Project settings > General > Your apps > SDK setup and configuration එකේ තියෙන `firebaseConfig` values ටික `.env.example` එකේ format එකට දාන්න:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

> ⚠️ **Security:** මේ values (`apiKey` ඇතුළුව) browser එකේ visible වෙන values — ඒවා secret keys නෙවෙයි, Firebase Security Rules සහ "Authorized domains" එකෙන් තමයි ආරක්ෂාව එන්නේ. **ඒත් OAuth Client Secret එකවත්, Firebase Admin service-account JSON key එකවත් කිසි විටෙකත් මේ `.env` files වලට හෝ code එකට දාන්න එපා** — ඒවා server-side විතරක් තියෙන්න ඕන දේවල්, සහ මේ web app එකට ඕනවත් නැහැ.

## Firebase Console සකස් කිරීම

1. **Authentication → Sign-in method** — Email/Password, Google, Anonymous සියල්ල "Enabled" කරන්න (screenshot එකේ පේන විදියටම, දැනටමත් කරලා තියෙනවා 👍).
2. **Authentication → Settings → Authorized domains** — `localhost` default තියෙනවා. `quickscanner.vercel.app` (සහ preview deployments වලට `*.vercel.app` ඕන නම්) add කරන්න. නැත්නම් production එකේ Google Sign-in fail වෙනවා.
3. **Firestore Database** — enable කරලා නැත්නම් Firestore Database එකක් create කරන්න (production mode). මේ repo එකේ තියෙන `firestore.rules` file එක deploy කරන්න:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use quick-scanner-qs
   firebase deploy --only firestore:rules
   ```
   (නැත්නම් Firebase Console > Firestore > Rules tab එකට කෙලින්ම paste කරන්නත් පුළුවන්.)

## Vercel Deploy කිරීම (`quickscanner.vercel.app`)

1. Vercel dashboard එකේ **New Project** → මේ GitHub repo එක import කරන්න (Next.js auto-detect වෙනවා, extra config ඕන නැහැ).
2. **Project → Settings → Environment Variables** එකට උඩ තියෙන `NEXT_PUBLIC_FIREBASE_*` variables ටික සියල්ල add කරන්න (Production + Preview + Development, three).
3. **Project → Settings → Domains** එකෙන් `quickscanner.vercel.app` domain එක assign කරන්න.
4. Deploy වුනාට පස්සේ, ඒ domain එකම Firebase Authorized domains list එකට (ඉහළ 2 වෙනි step එක) add කරන්න.
5. මින් ඉදිරියට `main` branch එකට push කරන හැම commit එකක්ම auto-deploy වෙනවා (Vercel Git Integration default behavior එක).

## Project Structure

```
src/
  app/
    page.tsx           # Landing page
    login/page.tsx     # Sign in
    signup/page.tsx     # Sign up
    dashboard/          # Protected dashboard (auth guard in layout.tsx)
    sw.ts               # Service worker source (Serwist)
  components/           # UI + feature components
  lib/
    firebase.ts         # Firebase app/auth/firestore init
    auth-context.tsx    # AuthProvider + useAuth() hook
    auth-errors.ts       # Friendly Firebase error messages
public/
  manifest.json          # PWA manifest
  icons/                 # Generated PWA icons
firestore.rules           # Firestore security rules
```
