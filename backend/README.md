
# Product image uploads

Product images are submitted as `multipart/form-data`. In local development,
images are stored in `backend/data/uploads/products` and served through the API.
For deployment, set the AWS variables from `.env.example` so images are stored
in S3. The database stores the resulting image URL in `products.image`; image
binary data is not stored in SQLite.

The accepted formats are JPG, PNG, and WEBP, with a maximum size of 5 MB.
