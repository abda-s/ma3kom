<p><img src="assets/logo.svg" alt="Ma3kom — معكم" width="360"></p>

# Ma3kom (معكم) — Prototype

A clickable prototype of a family elder-care coordination app for Jordan. There is no backend: all data is mock data saved in the browser's localStorage, and "Reset demo" in the settings drawer restores the original demo data.

## Structure

- **Setup wizard** (`#/setup`) on first run: parent, family & daily check-in, escalation order, alert thresholds. "Skip — explore with demo data" goes straight to the app.
- **Family app** (caregiver / family / professional), 5 destinations — bottom tab bar on phones, left rail on desktop:
  - **Today** `#/dashboard` — status summary, one "Needs attention" list with "I'm handling it", tiles, who's doing what this week
  - **Health** `#/health/checkin|vitals|meds` — daily check-in, vitals with severity result card, medications
  - **Calendar** `#/appts` — appointments, documents, doctor-visit summary (Print → Save as PDF)
  - **Family** `#/family/tasks|costs` — task rotation, cost split (equal/custom) and settle-up (hidden for professionals)
  - **More** `#/more` — Timeline, Helper voice notes (translation check), Providers, Emergency QR, App connections, Wearables, Privacy & roles, Settings, Elderly mode info
- **Helper app** (role = helper, `#/h`) — record a note (confirmed in her own language), mark doses given, simple check-in; UI in Tagalog / English / Arabic.
- **Elderly mode** `#/elder` — full screen, four big buttons, 5-second cancellable help countdown then escalation chain.
- **Emergency QR public page** `#/e/<id>` — allergy banner first; opens in Arabic by default.

Old links (`#/checkin`, `#/meds`, `#/vitals`) still work. The role switcher, language, offline mode and "Reset demo" are in the settings drawer (gear icon).

## Run locally

The site is plain HTML, CSS and JavaScript with no build step. From the project folder, run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Deploy to GitHub Pages

1. In the project folder, initialise a Git repository and commit the files:

   ```bash
   git init
   git add .
   git commit -m "Initial prototype"
   ```

2. Create a new repository on GitHub (for example `hakeem-family-care`). Do not add a README or .gitignore there, since the project already has them.

3. Connect the local repository to GitHub and push:

   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git branch -M main
   git push -u origin main
   ```

4. In the GitHub repository, go to **Settings → Pages**. Under **Source**, choose **Deploy from a branch**, select branch **main** and folder **/ (root)**, then click **Save**.

5. After a minute or two the site is published at:

   https://<username>.github.io/<repo>/

The app uses hash-based routing (for example `#/dashboard`), so no 404 configuration is needed. The empty `.nojekyll` file tells GitHub Pages to serve the files as they are.

## Prototype limits

AI features, voice calls, SMS, licence verification and app integrations are simulated. Nothing in this prototype is real medical advice; it is for demonstrating workflows only.
