# TODO: Implement Multer with Cloudinary for Image Upload in Admin Panel

## Steps to Complete

- [x] Create cloudinary utility file (app/utils/cloudinary.ts)
- [x] Update POST route for images (app/api/images/route.ts) to handle file upload with multer and cloudinary
- [x] Update PUT route for images (app/api/images/[id]/route.ts) to handle file upload with multer and cloudinary
- [x] Update AddImageForm component (app/components/admin/AddImageForm.tsx) to use file input instead of URL text input
- [x] Update EditImageForm component (app/components/admin/EditImageForm.tsx) to use file input instead of URL text input
- [ ] Set up Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
- [ ] Test the upload functionality
- [ ] Handle errors and validation for file types, sizes
- [x] Update maintable code (write maintable code as requested)
