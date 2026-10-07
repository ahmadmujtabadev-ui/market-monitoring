# Market Monitor (frontend)

The web app for Market Monitor: log in, watch simulated crypto prices update live, and set price alerts. The API is in a separate repo: https://github.com/ahmadmujtabadev-ui/monitoring-back

Live staging: https://market-monitoring-red.vercel.app (the API sits on a free server, so the very first login can take up to a minute while it wakes up)

## What you can do in it

- Sign up, verify your email with a 6-digit code, log in and out
- Reset a forgotten password with a code sent by email
- Watch 7 prices update every second, with a small trend line for each
- Create an alert ("tell me when ETH rises to 3,500"). When it hits, a notification pops up and the alert moves to Triggered
- Filter your alerts by All, Active and Triggered, and delete them
- Settings page to change your name and password, or delete the account

The screens follow the design that was shared with me.

## Stack

React 19 and TypeScript, built with Vite. Styling is Tailwind. Forms use Formik with Yup for validation. Zustand holds the app state and the REST calls, and React Router handles the pages. Tests use Vitest and Testing Library.

## Running it

You need Node 22 or newer, and the API running somewhere (see the backend repo, `docker compose up` there is the quickest way).

```bash
cp .env.example .env
npm install
npm run dev
```

It opens on http://localhost:5173. `VITE_API_URL` in `.env` should point at the API, without `/api` at the end. The default is `http://localhost:3000`.

Other commands:

```bash
npm test          # unit and component tests
npm run lint
npm run build     # type check and production build
```

To run the whole thing (database, API and this app) with Docker, use the compose file in the backend repo. There's a Dockerfile here too, which builds the site and serves it with nginx.

## Folder layout

```
src/
  api/         fetch wrapper, endpoint functions, the live stream client
  stores/      Zustand stores (auth, symbols, alerts, prices, profile, toasts)
  pages/       one file per screen
  components/  forms, tables, header, toasts and so on
  hooks/       small hooks like the live stream connection
  lib/         validation schemas, formatting, helpers
  types/       shared types
```

## A few things worth knowing

**Requests and tokens.** All calls go through one small wrapper in `src/api/http.ts`. It adds the access token, and when the API answers 401 it asks for a new token once and retries the request. If several requests fail at the same moment they share a single refresh, so the refresh token isn't used twice.

**Live prices.** The browser's built-in EventSource can't send an Authorization header, so I used `@microsoft/fetch-event-source`. If the connection drops it reconnects by itself, and the badge in the header shows Live, Reconnecting or Offline.

**Forms.** Validation rules in `src/lib/validation.ts` match what the backend enforces. If the API still rejects something, the field errors it sends back are shown under the right input.

**The login page prices.** The three prices on the left side of the login screen are made up in the browser, just to make the page feel alive. The real prices need a login.

**Tokens in localStorage.** It's simple and fine for a test build, but httpOnly cookies would be safer against XSS and would be my next change.

## Deploying to Vercel

Import the repo in Vercel, it picks up the Vite settings on its own, and `vercel.json` takes care of page routing. Add one environment variable, `VITE_API_URL`, with the address of the deployed API. It gets baked in at build time, so redeploy after changing it. The API also has to list your Vercel address in its `CORS_ORIGIN`, otherwise the browser blocks every request.
