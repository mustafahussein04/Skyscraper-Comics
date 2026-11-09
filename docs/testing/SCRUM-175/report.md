# SCRUM-175 — System Test: Admin Events & Public Events Page

**Status: PASS** — 11 test cases × 2 browsers, all green.

| | |
|---|---|
| Run date | 2026-11-08 |
| Branch | `SCRUM-175` |
| Frontend | Vue 3 + Vite, served from `dist` |
| Backend | Next.js on `:3001`, SQLite (local dev DB) |
| Harness | Selenium WebDriver — `frontend/scripts/events-calendar.e2e.mjs` |
| Command | `E2E_BROWSER=chrome npm run test:e2e:events` (repeat with `firefox`) |

Generated results: [`frontend/test-reports/events-calendar-report-chrome.md`](../../../frontend/test-reports/events-calendar-report-chrome.md) ·
[`-firefox.md`](../../../frontend/test-reports/events-calendar-report-firefox.md) ·
[summary](../../../frontend/test-reports/events-calendar-report.md)

Screenshots: `frontend/test-reports/screenshots/<browser>-<case>.png`

## Acceptance criteria → result

| AC | Result | Evidence |
|---|---|---|
| Create event (title, date, time, category, game, capacity, entry fee, registration link) → shows on admin list and public Events page, sorted by date | **PASS** | `create-event-valid-appears-in-admin-list`, `admin-list-sorted-by-date`, `public-upcoming-events-sorted-by-date` |
| Editing date/time updates both pages | **PASS** | `edit-date-and-time-updates-both-pages` |
| Deleting removes it from both pages | **PASS** | `delete-event-removes-from-both-pages` |
| Blank registration link accepted | **PASS** | `blank-registration-link-accepted` |
| Invalid links (`http://example.com `, `/register`, `ftp://example.com`, `javascript:alert(1)`) show *"Enter a valid Registration Link starting with http:// or https://."* | **PASS** | `invalid-registration-link-trailing-space`, `-relative-path`, `-ftp-scheme`, `-javascript-scheme` |
| Public page registration link opens the correct URL | **PASS** | `public-page-shows-event-and-registration-link` (asserts `href`, `target="_blank"`, `rel` contains `noopener`) |
| Tested on Chrome and Firefox, report with screenshots | **PASS** | 11 cases on each browser, 22 screenshots |

## Test cases

1. `create-event-valid-appears-in-admin-list` — creates an event through the admin UI and asserts it appears in the admin events list.
2. `admin-list-sorted-by-date` — creates three events out of order and asserts the list renders them ascending by date.
3. `public-upcoming-events-sorted-by-date` — same three events appear date-ascending in the public "Upcoming Events" panel.
4. `public-page-shows-event-and-registration-link` — the event shows in the public calendar day panel; the Register link carries the right `href`, `target="_blank"` and `rel="noopener noreferrer"`.
5. `edit-date-and-time-updates-both-pages` — edit date + time, then assert the admin card and the public day panel both show the new values.
6. `delete-event-removes-from-both-pages` — delete with the native confirm dialog accepted; gone from admin list and public page.
7. `blank-registration-link-accepted` — event saves with no link; public page shows the disabled "Registration not available" button.
8–11. `invalid-registration-link-{trailing-space,relative-path,ftp-scheme,javascript-scheme}` — each is rejected with the exact message from the criteria, the modal stays open, and no event is persisted.

## Change made as part of this ticket

The admin edit modal showed **"Enter a valid URL starting with http:// or https://."** while the API and these acceptance criteria both specify **"Enter a valid Registration Link starting with http:// or https://."** One-line fix in `frontend/src/components/admin/AdminEventEditModal.vue` so UI and API report the same message.

## Notes / non-blocking observations

- **"Admin calendar" = the admin events list.** The admin surface (`/admin/events`) renders a list, not a calendar; the assertions treat it as a list, per the acceptance criteria.
- **Only future events are listed.** `AdminEventsPage` filters `date >= today`, so all test events are created 26–34 days out. A past-dated event is invisible in the admin list by design.
- **Public page loads once on mount.** Verifying a change there requires a reload; the tests reload explicitly rather than waiting for live updates.
- **Origin matters for CORS.** `backend/lib/cors.ts` echoes `http://localhost:5173` but not `http://127.0.0.1:5173`, so the app must be opened via `localhost` or every API call fails silently and admin login never completes. The suite therefore runs against `http://localhost:5173`.
- **Not testable as written, resolved by the run:** the error-text criterion was previously impossible to satisfy through the UI; see the change above.
- **Not automated (human deliverable):** linking a Jira bug for any failure. No failures occurred, so nothing to link.
