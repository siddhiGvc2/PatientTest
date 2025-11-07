# TODO

## Completed Tasks
- [x] Create DELETE API endpoint for screens at `/api/screens/[id]/route.ts`
- [x] Add `handleDeleteScreen` function in `admin-panel.tsx`
- [x] Add "Delete Screen" button in the Selected Screen Details section

## Summary
Added a Delete Screen option in the Admin Panel's Select Screen tab. The feature includes:
- A new DELETE API endpoint that handles screen deletion with cascading deletes for associated questions and images.
- A delete button in the UI with confirmation dialog.
- Proper error handling and success messages.
- Refreshing the data and clearing the selected screen after deletion.
