# TODO: Create ImageLibrary Schema and Components

## Steps to Complete:
- [x] Add new model "ImageLibrary" in prisma/schema.prisma with id, url (removed name & description)
- [x] Update app/components/admin/types.ts to include ImageLibrary interface
- [x] Create app/api/image-library/route.ts for CRUD operations
- [x] Create app/api/image-library/[id]/route.ts for individual item operations
- [x] Create app/components/admin/AddImageLibraryForm.tsx
- [x] Create app/components/admin/EditImageLibraryForm.tsx
- [x] Create app/components/admin/ImageLibraryTable.tsx
- [x] Push database changes
- [x] Generate Prisma client
- [ ] Test the new schema and API
