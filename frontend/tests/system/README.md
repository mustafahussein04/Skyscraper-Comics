# SCRUM-174 system tests

From `frontend/`:

```sh
npm ci
npm --prefix ../backend ci
npx playwright install firefox
# Install Google Chrome if it is not already installed.
npm run test:system
npm run test:system:report
```

The suite uses installed **Google Chrome** (`channel: chrome`) and Playwright's
Firefox build, headlessly, with a 1440 × 1000 viewport. Ports 5174 and 3101 must
be free. Both servers are managed by Playwright; existing servers are never reused.
The backend source is copied into a temporary directory, with an isolated SQLite
database and test-only login credentials. Local `.env` files are not copied.
The fixture is removed when the backend exits. No production services are needed.

The lifecycle case adds a comic through the UI, checks persistence after reload,
checks its public card/detail and image loading, changes price to 6.99 and stock
to 3, checks all views again, then deletes and checks absence/404. It uses the
existing Image URL field. A separate upload case requires an actual file input
and then checks the uploaded image on both public views.

Seven independent UI cases check the exact acceptance-criteria error strings.
They preserve native browser validation: the tests do not bypass it to force
application messages to appear. The API case separately checks all seven inputs
against POST and PUT, exact HTTP 400 responses, and unchanged persisted data.
The detail page shows stock availability rather than a numeric count; numeric
stock is checked in admin and the public card. Public changes are checked after
navigation/reload; live updates to an already open tab are outside this run.

`test-results/` includes JSON results, screenshots, native validation text, and
failure traces. `playwright-report/` contains the interactive HTML report. Both
are generated and ignored by Git. Curated evidence and the recorded outcome are
in `docs/testing/SCRUM-174/` at the repository root. Failure exit codes are
intentional until the acceptance criteria are met; do not turn failures into
expected failures or skips.
