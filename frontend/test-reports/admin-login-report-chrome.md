# Admin Login & Route Protection — chrome

Run date: 2026-11-08T23:32:02.048Z

**PASS** means every expected behavior in a test occurred. **FAIL** means at least one expectation was not met; the failure details identify which check failed.

Invalid-login tests PASS when access is denied, the user stays on `/admin/login`, and the alert reads `Invalid email or password.` Valid-login tests PASS when the user reaches `/admin`. Route-protection tests PASS when logged-out users are redirected to login and logged-in users visiting login are redirected to the dashboard.

Invalid input does not automatically mean a failed test: correctly rejecting it is the expected behavior. Product tests also check exact error-message text, so rejection can work while the complete test fails for a missing or different message. See the [product report PASS/FAIL criteria](../../docs/testing/SCRUM-174/report.md#how-to-read-pass-and-fail).

| Test | Status | Screenshot |
|---|---|---|
| valid-login-redirects-to-dashboard | PASS | [screenshot](screenshots/chrome-valid-login-redirects-to-dashboard.png) |
| invalid-login-wrong-password | PASS | [screenshot](screenshots/chrome-invalid-login-wrong-password.png) |
| invalid-login-wrong-email | PASS | [screenshot](screenshots/chrome-invalid-login-wrong-email.png) |
| invalid-login-blank-fields | PASS | [screenshot](screenshots/chrome-invalid-login-blank-fields.png) |
| logged-out-admin-redirect | PASS | [screenshot](screenshots/chrome-logged-out-admin-redirect.png) |
| logged-out-admin-products-redirect | PASS | [screenshot](screenshots/chrome-logged-out-admin-products-redirect.png) |
| logged-out-admin-events-redirect | PASS | [screenshot](screenshots/chrome-logged-out-admin-events-redirect.png) |
| logged-in-login-redirects-to-dashboard | PASS | [screenshot](screenshots/chrome-logged-in-login-redirects-to-dashboard.png) |
