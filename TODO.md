# TODO for Test-Level UI Modification

- [x] Modify app/components/test-level.tsx to skip screens without questions and move to the next screen
  - [x] Add a function to advance to the next valid screen (one with questions)
  - [x] Update useEffect and button logic to use this function
  - [x] Ensure test ends if no valid screens remain
- [x] If no screens in Test Level, move to next level until all test levels end
  - [x] Check if level has valid screens on fetch, skip to next level if not
- [x] Test the navigation to ensure it skips empty screens and levels
- [x] Run the app and verify behavior
