# TODO: Modify upload-split-image API to save questions as text

- [x] Modify app/api/upload-split-image/route.ts to save extracted question texts as Question records in the database, associated with the screenId.
- [x] Ensure only questions (type: 'question') are saved as text, not images.
- [x] Save the 4 images accurately to the database.
- [ ] Test the endpoint to verify questions are saved correctly and no errors occur.
