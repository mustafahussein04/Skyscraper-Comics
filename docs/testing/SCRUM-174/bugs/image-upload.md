# Bug draft: Admin product form has no image file upload

Current status: **No longer reproduced in the latest run.** The merged product
form now supports a real file upload. Corrected tests use `setInputFiles`, verify
the stored file bytes, and check the saved image on both public views. These
checks pass in Chrome and Firefox. See the [current report](../report.md).

This unfiled draft is retained as a historical finding from the earlier version.
It is not a current failed acceptance check or a Jira issue. The reproduction
and expected/actual behavior below describe that earlier version.

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
