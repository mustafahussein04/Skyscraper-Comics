# SCRUM-174 — Admin Product Management System Test Report

Executed: **2026-11-08 14:43:28 PST**. Base commit: `dd06953` with the new test suite.

**Overall: FAIL — 4 passed, 16 failed, 0 skipped (20 test executions).**

Both browsers passed the CRUD lifecycle with an existing image URL and the API invalid-input matrix. Both failed all seven user-visible validation-message checks and the image-upload check. These 16 failed executions map to two bug drafts.

**Jira linkage remains incomplete.** The Atlassian plugin search returned `DISABLED_BY_ADMIN` / `NOT_AVAILABLE`. No Jira tickets were created and no Jira links are claimed. Each failure below links to a local bug draft; file those bugs and link them to SCRUM-174 before closing the story.

## Environment and procedure

- macOS 26.5.1, Node v23.9.0, Playwright 1.65.0; headless browsers, 1440 × 1000 viewport, one worker, no retries.
- Real Vue frontend at `127.0.0.1:5174` and Next backend at `127.0.0.1:3101`, with a fresh temporary SQLite database and test-only admin login. No API mocks; existing development data was untouched.
- Google Chrome uses the installed Chrome channel. Firefox uses the Playwright-managed Firefox build.
- Valid data: unique SCRUM-174 name, description `System test comic book.`, type Comics, brand Marvel, price 4.99, stock 10. Existing-image fixture: `/images/product/product-01.jpg` (a repository sample image).
- Edit changes price to 6.99 and stock to 3. Check admin/public card/detail after navigation and reload; delete and confirm absence from both lists plus detail HTTP 404.
- Numeric stock is displayed in admin and the public card. Detail displays availability only. No live synchronization between already-open tabs was tested.
- File upload is tested separately and fails before selecting a file because no upload control exists. Uploaded-file persistence/rendering could not be exercised.
- Backend regression tests: 3 passed. Targeted TypeScript check of the Playwright config and test file passed. `git diff --check` passed.

## Browser results

| Browser | Version | Passed | Failed |
| --- | --- | --- | --- |
| Google Chrome | 156.0.8078.80 | 2 | 8 |
| Firefox (Playwright build) | 159.0 | 2 | 8 |

## Acceptance criteria

| Criterion | Chrome | Firefox | Failure reference |
| --- | --- | --- | --- |
| Add valid product; appears in admin and public list (image URL) | Pass | Pass | — |
| Edit price/stock; persists in admin/public views | Pass | Pass | — |
| Delete; absent from admin/public list and detail | Pass | Pass | — |
| Exact error messages for all seven invalid inputs | Fail | Fail | [Validation bug draft](bugs/validation-messages.md) |
| POST/PUT reject invalid inputs with exact errors and preserve data | Pass | Pass | — |
| Existing image URL loads on card and detail | Pass | Pass | — |
| Upload a file and render it on card/detail | Fail at upload control; rendering blocked | Fail at upload control; rendering blocked | [Upload bug draft](bugs/image-upload.md) |
| Screenshots attached to report | Complete | Complete | See evidence below |
| Every failure linked to a Jira bug | Incomplete | Incomplete | Integration disabled; local drafts only |

## Detailed results and screenshots

Browser-native tooltips are not always captured in page screenshots. Their actual `validationMessage` text is recorded alongside each case and in [results-summary.json](results-summary.json). Screenshot links open the original full-size evidence.

### Chrome

| Case | Result | Evidence | Bug |
| --- | --- | --- | --- |
| 1. add, edit price/stock, and delete across admin, public list, and detail (image URL) | PASSED | [01-added-admin](screenshots/chrome/01-01-added-admin.png); [02-added-public-card](screenshots/chrome/01-02-added-public-card.png); [02-added-public-detail](screenshots/chrome/01-02-added-public-detail.png); [03-edited-admin](screenshots/chrome/01-03-edited-admin.png); [04-edited-public-card](screenshots/chrome/01-04-edited-public-card.png); [04-edited-public-detail](screenshots/chrome/01-04-edited-public-detail.png); [05-deleted-admin](screenshots/chrome/01-05-deleted-admin.png); [06-deleted-public](screenshots/chrome/01-06-deleted-public.png); [07-deleted-detail](screenshots/chrome/01-07-deleted-detail.png) | — |
| 2. add rejects name="" with exact message | FAILED | [validation](screenshots/chrome/02-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 3. add rejects description="" with exact message | FAILED | [validation](screenshots/chrome/03-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 4. add rejects brand="" with exact message | FAILED | [validation](screenshots/chrome/04-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 5. add rejects price="-5" with exact message | FAILED | [validation](screenshots/chrome/05-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 6. add rejects price="abc" with exact message | FAILED | [validation](screenshots/chrome/06-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 7. add rejects stock="2.5" with exact message | FAILED | [validation](screenshots/chrome/07-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 8. add rejects stock="-1" with exact message | FAILED | [validation](screenshots/chrome/08-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 9. POST and PUT reject every specified invalid input without changing persisted data | PASSED | HTTP assertions; see results summary | — |
| 10. uploaded image renders on product card and detail | FAILED | [image-upload-form](screenshots/chrome/10-image-upload-form.png) | [Upload draft](bugs/image-upload.md) |

| Invalid input | Actual browser validation text |
| --- | --- |
| name="" | Please fill out this field. |
| description="" | Please fill out this field. |
| brand="" | Please fill out this field. |
| price="-5" | Value must be greater than or equal to 0. |
| price="abc" | Please fill out this field. |
| stock="2.5" | Please enter a valid value. The two nearest valid values are 2 and 3. |
| stock="-1" | Value must be greater than or equal to 0. |

### Firefox

| Case | Result | Evidence | Bug |
| --- | --- | --- | --- |
| 1. add, edit price/stock, and delete across admin, public list, and detail (image URL) | PASSED | [01-added-admin](screenshots/firefox/01-01-added-admin.png); [02-added-public-card](screenshots/firefox/01-02-added-public-card.png); [02-added-public-detail](screenshots/firefox/01-02-added-public-detail.png); [03-edited-admin](screenshots/firefox/01-03-edited-admin.png); [04-edited-public-card](screenshots/firefox/01-04-edited-public-card.png); [04-edited-public-detail](screenshots/firefox/01-04-edited-public-detail.png); [05-deleted-admin](screenshots/firefox/01-05-deleted-admin.png); [06-deleted-public](screenshots/firefox/01-06-deleted-public.png); [07-deleted-detail](screenshots/firefox/01-07-deleted-detail.png) | — |
| 2. add rejects name="" with exact message | FAILED | [validation](screenshots/firefox/02-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 3. add rejects description="" with exact message | FAILED | [validation](screenshots/firefox/03-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 4. add rejects brand="" with exact message | FAILED | [validation](screenshots/firefox/04-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 5. add rejects price="-5" with exact message | FAILED | [validation](screenshots/firefox/05-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 6. add rejects price="abc" with exact message | FAILED | [validation](screenshots/firefox/06-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 7. add rejects stock="2.5" with exact message | FAILED | [validation](screenshots/firefox/07-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 8. add rejects stock="-1" with exact message | FAILED | [validation](screenshots/firefox/08-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 9. POST and PUT reject every specified invalid input without changing persisted data | PASSED | HTTP assertions; see results summary | — |
| 10. uploaded image renders on product card and detail | FAILED | [image-upload-form](screenshots/firefox/10-image-upload-form.png) | [Upload draft](bugs/image-upload.md) |

| Invalid input | Actual browser validation text |
| --- | --- |
| name="" | Please fill out this field. |
| description="" | Please fill out this field. |
| brand="" | Please fill out this field. |
| price="-5" | Please select a value that is no less than 0. |
| price="abc" | Please enter a number. |
| stock="2.5" | Please select a valid value. The two nearest valid values are 2 and 3. |
| stock="-1" | Please select a value that is no less than 0. |

## Reproduce and retest

See [test setup](../../../frontend/tests/system/README.md). From `frontend/`, run `npm run test:system`; open the interactive report with `npm run test:system:report`. The command currently exits 1 because acceptance checks fail. The generated HTML report, full JSON, native-validation attachments, and failure traces remain in ignored local output directories. This report preserves curated screenshots and a portable result summary in Git.

No application behavior was changed as part of this system-test task. After the two bugs are fixed, rerun both projects and refresh this report and Jira links.
