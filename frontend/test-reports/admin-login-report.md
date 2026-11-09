# Admin Login & Route Protection

Last updated: 2026-11-08T23:32:30.273Z

Each browser has a separate report so one run never overwrites another.

**PASS** means every expected behavior in a test occurred. **FAIL** means at least one expectation was not met; the failure details identify which check failed.

Invalid-login tests PASS when access is denied, the user stays on `/admin/login`, and the alert reads `Invalid email or password.` Valid-login tests PASS when the user reaches `/admin`. Route-protection tests PASS when logged-out users are redirected to login and logged-in users visiting login are redirected to the dashboard.

Invalid input does not automatically mean a failed test: correctly rejecting it is the expected behavior. Product tests also check exact error-message text, so rejection can work while the complete test fails for a missing or different message. See the [product report PASS/FAIL criteria](../../docs/testing/SCRUM-174/report.md#how-to-read-pass-and-fail).

A browser summary is PASS only when all recorded cases pass. FAILURES PRESENT means at least one case failed; NOT RUN means no report is available for that browser.

| Browser | Status | Evidence |
|---|---|---|
| chrome | PASS | [report](admin-login-report-chrome.md) |
| firefox | PASS | [report](admin-login-report-firefox.md) |
