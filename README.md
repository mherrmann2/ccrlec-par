# CCRLEC SWAT — Post-Activation Report

Offline-first web app for post-activation reporting. Single page, no backend, no
accounts. Everything a person types stays in that person's browser.

Live: `https://<user>.github.io/<repo>/`

---

## What this is and is not

**The app distributes the form. It does not collect the reports.**

Each person's reports live in their own phone's browser storage. Nobody can see
anyone else's. There is no shared archive and no way to pull a report off
someone's device remotely.

So the workflow has to end in a document:

1. Fill out the report on the phone
2. **Print / PDF** — sign it, save the PDF
3. File the PDF wherever the council keeps activation records

The browser copy is scratch paper. If a phone is wiped, reset, or the browser's
site data is cleared before that PDF exists, the report is gone. Say this out
loud when you roll it out.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app — markup, styles, logic. No dependencies. |
| `sw.js` | Service worker. Caches the shell so it runs with no signal. |
| `manifest.webmanifest` | Home-screen install: name, icons, standalone display. |
| `icon-*.png` | App icons (192 / 512 / 180 Apple / 512 maskable). |
| `roster-template.json` | Roster-only import file. Edit and share with the team. |
| `robots.txt`, `.nojekyll` | Keep it out of search results; skip Jekyll processing. |

---

## Deploy

Repo root of `main`, Pages serving from root:

```bash
git init
git add .
git commit -m "Post-activation report v1"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Then **Settings → Pages → Source: Deploy from a branch → main / (root)**.

Fine-grained PAT needs **Administration** scope for that first Pages setup, then
**Contents** alone is enough for every push after.

---

## Publishing an update

Edit `index.html`, bump the `BUILD` constant near the bottom of the script, push.

The service worker serves the cached copy instantly and refreshes it in the
background, so **a change lands on the next launch** — the first open after your
push still shows the old build. That is deliberate: it guarantees the app opens
in a basement with no bars. When a new build is waiting, the menu shows
"update ready — reopen to apply."

Only bump `SHELL` in `sw.js` when you **add or remove a file** from `ASSETS`.
Editing `index.html` does not need it.

Anyone can confirm which build they're on: **⋯ menu → bottom line**.

---

## Roster

Ship with the roster empty — the site is a public URL and the roster is a list of
operators' names.

To load the team's names on a device:

1. Copy `roster-template.json`, replace the sample names, keep `"data": {}`
2. Send it to the team however you normally move files
3. On the phone: **⋯ menu → Import JSON backup → pick the file**

A roster-only file replaces just the names. It will not disturb a report in
progress. The roster also survives **Clear this report**.

---

## Install on a phone

- **iPhone** — open the URL in Safari → Share → *Add to Home Screen*
- **Android** — open in Chrome → menu → *Install app* / *Add to Home screen*

Opens full screen with no browser chrome, and runs with no signal after the
first load.

### Test printing from the home-screen icon before you roll out

iOS standalone mode has been inconsistent about `window.print()` across
versions. The printed PDF is the actual deliverable here, so verify it on a real
department iPhone first. If it misbehaves, the fallback is to open the same URL
in Safari proper and print from there — the data is the same, it's the same
browser storage.

---

## Editing the form

Every field lives in the `SCHEMA` array at the top of the script. Adding a field
is one line; no markup to touch.

```js
{id:"unique_id", t:"single", l:"Question shown to the user", o:["Yes","No"]}
```

`t` — `text` `textarea` `date` `time` `number` `single` `multi` `people` `sig` `calc`

Show a field only when another answer triggers it:

```js
showIf:{f:"parent_id", eq:"Yes"}        // single-select parent
showIf:{f:"parent_id", has:"Other"}     // multi-select parent
```

Hidden answers are pruned, so changing a parent answer never leaves orphan data
in the export. Other options: `sub:1` (indent as a follow-up), `ph` (placeholder),
`hint` (helper line), `one:1` (people field accepts one name),
`extra:["None"]` (exclusive option on a people field).

---

## Before wide rollout

This form holds **suspect name, DOB, and criminal history** — a different data
class than a tactical worksheet, sitting in browser storage on personal phones.
Nothing transmits anywhere, but the device is still the device.

Get whoever owns CJIS compliance and records retention for the council to sign
off on the workflow before the link goes out to the team. That conversation is
much easier now than after fifteen reports exist.

---

## Storage keys

Namespaced so this app cannot collide with other tools on the same
`github.io` origin:

```
ccrlec_par_current_v1   report in progress (autosaved)
ccrlec_par_roster_v1    team roster
ccrlec_par_saves_v1     named saved reports
```
