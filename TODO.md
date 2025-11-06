# TODO: Add Search Functionality to Patient List Table

## Steps to Complete:
- [x] Add searchTerm state variable to manage the search input
- [x] Add a search input field above the patient table for user input
- [x] Implement filtering logic to filter patients by name, unique ID, city, or created by user name (case insensitive)
- [x] Update the table rendering to display only filtered patients
- [ ] Test the search functionality to ensure it works correctly

## Notes:
- Search will be case insensitive and filter across multiple fields: name, uniqueId, city, user.name
- The search input should be placed above the table for easy access
- Ensure the filtering does not affect the original patients array, only the displayed list
