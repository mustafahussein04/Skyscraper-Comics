# Bug draft: Admin add-product validation does not show required messages

Jira status: **Not filed**. Atlassian integration is disabled by the workspace
administrator. Create a Jira Bug, link it to SCRUM-174, and replace this notice
with its real issue URL before accepting the story. This document is a local
draft, not a Jira issue.

Suggested priority: Medium. Affects the seven invalid-input acceptance cases.

## Reproduction

1. Sign in as admin and open `/admin/products`.
2. Select **Add New Product**.
3. Enter a unique name, description, Comics, Marvel, price 4.99, stock 10, and a valid image URL.
4. Replace exactly one field with a value below and select **Add Product**.

| Input | Expected message |
| --- | --- |
| Blank name | Product name is required. |
| Blank description | Description is required. |
| Blank brand | Brand is required. |
| Price -5 | Price must be a valid non-negative number. |
| Price abc | Price must be a valid non-negative number. |
| Stock 2.5 | Stock must be a non-negative whole number. |
| Stock -1 | Stock must be a non-negative whole number. |

Actual: browser-native constraint validation prevents submission and the exact
application message does not appear. A number input also filters or marks `abc`
invalid. Invalid products are not created in the tested cases. The API correctly
rejects these values with the required text, so API validation passing does not
satisfy the user-visible message criteria.

The add form uses `required`, numeric `min` and `step` without custom validity
messages. If native checks are bypassed, blank strings also receive the generic
`Please complete all required fields.` from the submit handler. See
`frontend/src/views/admin/AdminProductsPage.vue`.

Evidence and browser-specific native validation text: [test report](../report.md).

Retest: all seven UI cases must pass in Chrome and Firefox with the exact
messages above; POST/PUT rejection and unchanged database contents must still pass.
