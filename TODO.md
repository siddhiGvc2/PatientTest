# TODO for Schema Update

- [x] Remove redundant 'isCorrect' field from Option model in prisma/schema.prisma
- [x] Run `npx prisma generate` to regenerate Prisma client
- [x] Run `npx prisma db push` to apply schema changes to the database
- [x] Verify the schema supports: TestLevel -> 4 Images, Image -> 1+ Questions, Question -> 1+ Options with one correct answer via answerId
