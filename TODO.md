# TODO: Implement user hierarchy and management system

- [x] Define UserType enum with SUPERADMIN, ADMIN, USER in schema.prisma
- [x] Add userType UserType @default(USER) @map("user_type") to PatientTestUser model in schema.prisma
- [x] Add type, createdBy, and hierarchy relations to AuthorizedUser model
- [x] Run `npx prisma db push` to apply schema changes to database
- [x] Create seed script for superusers (me@vinaychaddha.in, vinay.gvc@gmail.com, sd@gvc.in)
- [x] Run seed script to create superusers
- [x] Update /api/user POST endpoint with permission checks and hierarchy logic
- [x] Create /api/user/[id] DELETE endpoint with permission checks
- [x] Update login component to pass userType
- [x] Create UserManagement component for admins/superadmins
- [x] Update main page with tabs for patients and user management
- [x] Update GET /api/user to return full user details
- [x] Test application to ensure user hierarchy works correctly
