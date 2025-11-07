# TODO for Test-Level UI Modification

- [x] Modify app/components/test-level.tsx to skip screens without questions and move to the next screen
  - [x] Add a function to advance to the next valid screen (one with questions)
  - [x] Update useEffect and button logic to use this function
  - [x] Ensure test ends if no valid screens remain
- [x] Test the navigation to ensure it skips empty screens
- [x] Run the app and verify behavior
