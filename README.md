# FinTrack Pro

A simple client-side personal finance tracker. No backend — everything is stored in the browser's `localStorage`.

## File structure

Keep all of these files in **one folder**, at the same level (don't nest any of them in subfolders):

```
fintrack-pro/
├── register.html
├── register.css
├── login.html
├── login.css
├── index.html
├── style.css
└── script.js
```

## Running it

1. Open the folder in VS Code (or any editor).
2. Right-click `register.html` (or `login.html` if you already have an account) and choose **"Open with Live Server"**.
3. Register a username/password, then log in.
4. You'll land on `index.html` — the dashboard.

**Don't** open `index.html` first — it will bounce you to `login.html` if you're not logged in yet, since there's no account until you register.

### "Cannot GET /index.html"

This means the server (Live Server, Express, etc.) couldn't find `index.html` at the path it tried. It almost always means:
- The files aren't all in the same folder, or
- Live Server was started from a parent/different folder than where `index.html` actually lives.

Fix: confirm all 7 files sit directly inside the same folder, then re-launch Live Server from `register.html` or `login.html` in that folder.

## How it works

- **Accounts**: `register.html` saves a username/password to `localStorage`. `login.html` checks credentials and sets `loggedIn = "true"`. `index.html` checks that flag on load and redirects to `login.html` if missing.
- **Transactions**: stored as a JSON array under the `transactions` key in `localStorage`. Add, edit, and delete all read/write this array.
- **Settings**: your name and preferred currency symbol are stored under the `settings` key and used to format every amount shown in the app.
- **Theme**: dark/light mode is stored under the `theme` key and applied automatically on `login.html` and `register.html` too, so the whole app looks consistent.

## Features

- Add / edit / delete transactions
- Live search (by description or category) and type filter (income/expense/all)
- Dashboard summary cards + income vs. expense bar chart
- Dark mode toggle
- Reset All Data (clears transactions only, not your login)
- Logout
- Settings page to update display name and currency symbol

## Notes / limitations

- This is a **local-only demo app** — passwords are stored in plain text in `localStorage`, which is fine for learning/prototyping but not appropriate for anything with real user data.
- Data lives in the browser: clearing site data/cookies or switching browsers will lose transactions.
