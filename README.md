# Beerlympics

Live game night scoreboard.

## PWA / Installability

This site now works as a normal website **and** as an installable PWA.

### How it works
- `manifest.webmanifest` defines app name, colors, icons, and standalone display mode.
- `service-worker.js` caches core static assets for a smoother app-like experience and offline fallback to `index.html` for navigation.
- `app.js` registers the service worker and powers an install flow:
  - Chromium/Android: native browser install prompt via `beforeinstallprompt`.
  - iPhone/iOS: guided “Add to Home Screen” instructions modal.
- Install UI hides when already installed (standalone mode).

### Android install test (Chrome)
1. Deploy to GitHub Pages over HTTPS.
2. Open the site in Chrome on Android.
3. Wait a few seconds for install criteria to be met.
4. Tap **Install App** and accept the prompt.
5. Relaunch from home screen and confirm standalone behavior.

### iPhone install test (Safari)
1. Open the deployed site in Safari on iPhone.
2. Tap **Add to Home Screen** button in-app (or install button in header) to view guided steps.
3. Tap **Share** → **Add to Home Screen**.
4. Launch from home screen and confirm standalone behavior.

### Icon assets you should provide
Current icon files are placeholders and already wired:
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `assets/icons/apple-touch-icon-180.png`

Replace them with final brand assets at the same paths/sizes for production polish.

### GitHub Pages notes
- Paths are relative (`./...`) so hosting works at root domain or repository subpath.
- `start_url` and `scope` use `.` in the manifest to stay compatible with Pages project URLs.
- Keep `service-worker.js` in the published root of the site.
