# SCRUM-174 — Admin Product Management System Test Report

Executed: **2026-11-08 21:29:52 PST**. Base commit: `1470414` with local test updates for the merged upload UI.

**Overall: FAIL — 6 passed, 14 failed, 0 skipped (20 test executions).**

Both browsers pass product creation, price/stock editing, deletion, image file upload and rendering, and the API invalid-input matrix. The fourteen failures are the seven exact UI error-message cases in each browser. Invalid submissions are blocked, but the required messages do not appear. These failures map to one [validation-message bug draft](bugs/validation-messages.md).

The prior run with 18 failures was blocked by outdated test automation calling `.fill()` on a file input. This run uses `setInputFiles()` and verifies the real upload. The public-list deletion check now verifies absence from the returned catalog and rendered cards rather than relying on outdated empty-list wording. No application code was changed.

**Jira linkage remains incomplete.** The available Atlassian integration was disabled by the administrator when checked. No Jira issue URL has been supplied or created. File the validation bug, link it to SCRUM-174, and add the real URL here before closing the story. The earlier [missing-upload finding](bugs/image-upload.md) no longer reproduces.

## Environment and procedure

- macOS, Node v23.9.0, Playwright 1.65.0; installed Google Chrome and Playwright-managed Firefox, headless, 1440 × 1000 viewport, one worker, no retries.
- Real Vue frontend at `127.0.0.1:5174` and Next backend at `127.0.0.1:3101`; temporary SQLite database and local image storage, test-only admin credentials, no API mocks. Existing development data is untouched.
- Valid data: unique SCRUM-174 name, description `System test comic book.`, Comics, Marvel, price 4.99, stock 10, and a real JPEG upload from `frontend/public/images/product/product-01.jpg`.
- Stored image bytes are compared with the selected file. Card and detail must use the returned upload URL and load the image successfully, including after editing and navigation.
- Edit changes price to 6.99 and stock to 3. Checks include reload persistence. Delete checks both lists and a detail HTTP 404. Detail shows availability; numeric stock is checked in admin and the public card. Live synchronization between already-open tabs is outside this run.
- Seven independent UI cases exercise blank name/description/brand, price -5/abc, and stock 2.5/-1. Native browser validation is preserved. POST and PUT separately reject all seven invalid inputs with HTTP 400 and the exact required errors, without changing persisted data.
- Targeted TypeScript checking and `git diff --check` passed. This rerun did not execute the separate backend regression suite.

## Browser results

| Browser | Version | Passed | Failed |
| --- | --- | --- | --- |
| Chrome | 156.0.8078.80 | 3 | 7 |
| Firefox | 159.0 | 3 | 7 |

## Acceptance criteria

### How to read PASS and FAIL

**PASS means the actual behavior matches every expectation in that test. FAIL means at least one expectation was not met.** An invalid input is test data; it does not automatically mean the test failed. Correctly rejecting invalid input is a successful validation check.

| Check | PASS requirement | FAIL condition |
| --- | --- | --- |
| Reject invalid UI input | Submission is blocked and no product is saved. | An invalid product is saved. |
| Show the exact UI error message | Invalid input is rejected, no product is saved, and the specified application message is visible. | Any expectation is unmet, including missing or different message text even when rejection works. |
| Reject invalid API input | Both POST and PUT return HTTP 400 with the expected error, and persisted data stays unchanged. | A response has the wrong status/message, or persisted data changes. |
| Accept valid product data | Add/edit succeeds and the expected values persist and appear in the checked views. | Valid data is rejected, saved incorrectly, or missing from a checked view. |

For example, stock `2.5` and `-1` must be rejected because stock must be a non-negative whole number. Price `-5` and `abc` must also be rejected, but a decimal price such as `4.99` is valid.

**In this recorded run, invalid-input rejection worked in both browsers.** The seven UI validation tests per browser still show FAILED because they also require exact application messages. For stock `2.5`, Chrome displayed “Please enter a valid value. The two nearest valid values are 2 and 3.” instead of “Stock must be a non-negative whole number.” The failure is for the message requirement; it does not mean the invalid stock was accepted.

The 6 passed / 14 failed totals count complete automated test executions. Rejection and message checks inside one test are not counted as separate executions. The recorded results below retain that meaning.

| Criterion | Chrome | Firefox | Failure reference |
| --- | --- | --- | --- |
| Add product through UI; appears in admin/public list | Pass | Pass | — |
| Edit price/stock; updates persist in admin/public views | Pass | Pass | — |
| Delete; absent from admin/public list and detail | Pass | Pass | — |
| Exact error messages for all seven invalid UI inputs | Fail | Fail | [Validation draft](bugs/validation-messages.md) |
| POST/PUT reject invalid inputs and preserve data | Pass | Pass | — |
| Upload image and render it on card/detail | Pass | Pass | — |
| Screenshots in report | Complete | Complete | See evidence below |
| Every failure linked to a Jira bug | Incomplete | Incomplete | Local draft only |

## Detailed results and screenshots

Browser-native tooltips may not appear in page screenshots. Their actual validation text is recorded below and in [results-summary.json](results-summary.json).

### Chrome

| Case | Result | Evidence | Bug |
| --- | --- | --- | --- |
| 1. add, edit price/stock, and delete across admin, public list, and detail (uploaded image) | PASSED | [01-added-admin](screenshots/chrome/01-01-added-admin.png); [02-added-public-card](screenshots/chrome/01-02-added-public-card.png); [02-added-public-detail](screenshots/chrome/01-02-added-public-detail.png); [03-edited-admin](screenshots/chrome/01-03-edited-admin.png); [04-edited-public-card](screenshots/chrome/01-04-edited-public-card.png); [04-edited-public-detail](screenshots/chrome/01-04-edited-public-detail.png); [05-deleted-admin](screenshots/chrome/01-05-deleted-admin.png); [06-deleted-public](screenshots/chrome/01-06-deleted-public.png); [07-deleted-detail](screenshots/chrome/01-07-deleted-detail.png) | — |
| 2. add rejects name="" with exact message | FAILED | [validation](screenshots/chrome/02-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 3. add rejects description="" with exact message | FAILED | [validation](screenshots/chrome/03-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 4. add rejects brand="" with exact message | FAILED | [validation](screenshots/chrome/04-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 5. add rejects price="-5" with exact message | FAILED | [validation](screenshots/chrome/05-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 6. add rejects price="abc" with exact message | FAILED | [validation](screenshots/chrome/06-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 7. add rejects stock="2.5" with exact message | FAILED | [validation](screenshots/chrome/07-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 8. add rejects stock="-1" with exact message | FAILED | [validation](screenshots/chrome/08-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 9. POST and PUT reject every specified invalid input without changing persisted data | PASSED | HTTP assertions; see results summary | — |
| 10. uploaded image renders on product card and detail | PASSED | [image-upload-form](screenshots/chrome/10-image-upload-form.png); [uploaded-card](screenshots/chrome/10-uploaded-card.png); [uploaded-detail](screenshots/chrome/10-uploaded-detail.png) | — |

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
| 1. add, edit price/stock, and delete across admin, public list, and detail (uploaded image) | PASSED | [01-added-admin](screenshots/firefox/01-01-added-admin.png); [02-added-public-card](screenshots/firefox/01-02-added-public-card.png); [02-added-public-detail](screenshots/firefox/01-02-added-public-detail.png); [03-edited-admin](screenshots/firefox/01-03-edited-admin.png); [04-edited-public-card](screenshots/firefox/01-04-edited-public-card.png); [04-edited-public-detail](screenshots/firefox/01-04-edited-public-detail.png); [05-deleted-admin](screenshots/firefox/01-05-deleted-admin.png); [06-deleted-public](screenshots/firefox/01-06-deleted-public.png); [07-deleted-detail](screenshots/firefox/01-07-deleted-detail.png) | — |
| 2. add rejects name="" with exact message | FAILED | [validation](screenshots/firefox/02-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 3. add rejects description="" with exact message | FAILED | [validation](screenshots/firefox/03-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 4. add rejects brand="" with exact message | FAILED | [validation](screenshots/firefox/04-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 5. add rejects price="-5" with exact message | FAILED | [validation](screenshots/firefox/05-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 6. add rejects price="abc" with exact message | FAILED | [validation](screenshots/firefox/06-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 7. add rejects stock="2.5" with exact message | FAILED | [validation](screenshots/firefox/07-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 8. add rejects stock="-1" with exact message | FAILED | [validation](screenshots/firefox/08-validation.png) | [Validation draft](bugs/validation-messages.md) |
| 9. POST and PUT reject every specified invalid input without changing persisted data | PASSED | HTTP assertions; see results summary | — |
| 10. uploaded image renders on product card and detail | PASSED | [image-upload-form](screenshots/firefox/10-image-upload-form.png); [uploaded-card](screenshots/firefox/10-uploaded-card.png); [uploaded-detail](screenshots/firefox/10-uploaded-detail.png) | — |

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

See [test setup](../../../frontend/tests/system/README.md). From `frontend/`, run `npm run test:system`; open the interactive report with `npm run test:system:report`. Exit code 1 currently reflects the fourteen message failures. Full JSON, HTML output, and failure traces are generated in ignored local directories; this report preserves the current screenshots and portable summary.

After the validation messages are fixed, rerun both browsers and refresh the report and Jira reference.
