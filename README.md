# CSM-485 Form

Starter project for the HomeHealth CSM-485 Form experience.

## Run locally

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`

## Branding assets

Place your approved PNG logo files in:

- `public/branding/logo-dark.png` (for light backgrounds)
- `public/branding/logo-light.png` (for dark backgrounds, if needed later)

The app currently renders `logo-dark.png` in the header.

## Moodle completion integration

The final card now attempts completion in this order:

1. SCORM 2004 (`window.API_1484_11`) or SCORM 1.2 (`window.API`) when launched inside SCORM player
2. Optional xAPI statement POST (if xAPI query params are present)
3. Optional webhook POST (if `completionEndpoint` is present)
4. LTI-friendly parent message via `window.parent.postMessage(...)`

### Query parameters

- `completionEndpoint` → POST JSON completion payload to webhook
- `xapiEndpoint` → xAPI statements endpoint URL
- `xapiAuth` → `Authorization` header value for xAPI (for example `Basic ...` or `Bearer ...`)
- `xapiActorEmail` → learner email used for xAPI actor mailbox
- `xapiActorName` → learner display name for xAPI actor
- `xapiActivityId` → activity ID for xAPI object (optional)
- `ltiTargetOrigin` → postMessage target origin (default `*`)
- `debugLms=1` → show LMS diagnostics panel in the UI (for test sessions)

### Local test examples

- Webhook only:
   - `http://localhost:5173/?completionEndpoint=https://your-domain.example/webhook`
- xAPI + LTI target origin:
   - `http://localhost:5173/?xapiEndpoint=https://lrs.example/xapi/statements&xapiAuth=Bearer%20token&xapiActorEmail=nurse@company.com&xapiActorName=Jane%20Nurse&ltiTargetOrigin=https://moodle.example.com`

## Vercel (when ready)

This project is Vercel-ready as a Vite app.

### Public access

- When deployed to Vercel, this app is publicly accessible by default (no built-in login gate in this codebase).
- Share the production URL directly with Moodle or QA users.

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Use defaults (Vite is auto-detected):
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

### Optional Vercel CLI flow

- Install CLI: `npm i -g vercel`
- Login: `vercel login`
- Create project: `vercel`
- Production deploy: `vercel --prod`
