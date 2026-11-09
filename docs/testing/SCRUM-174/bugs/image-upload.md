# Bug draft: Admin product form has no image file upload

Jira status: **Not filed**. Atlassian integration is disabled by the workspace
administrator. Create a Jira Bug, link it to SCRUM-174, and replace this notice
with its real issue URL before accepting the story. This document is a local
draft, not a Jira issue.

Suggested priority: Medium. Blocks the uploaded-image acceptance criterion.

## Reproduction

1. Sign in as admin and open `/admin/products`.
2. Select **Add New Product** and fill the valid product fields.
3. Attempt to select an image file from the computer.

Expected: select/upload an image, save the product, and see that same image on its
public product card and detail page after reload.

Actual: the form only offers **Image URL**. There is no file input or upload
control, so the upload workflow cannot begin. Existing image URLs do render
successfully on both public views; that does not exercise an uploaded file.

Relevant implementation: `frontend/src/views/admin/AdminProductsPage.vue`.
Evidence: [test report](../report.md).

Retest: select a real local image, create the product, reload both public views,
and verify the uploaded image has loaded successfully in Chrome and Firefox.
