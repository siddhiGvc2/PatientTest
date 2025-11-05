# TODO: Replace hardcoded "Patient" and "Patients" with NEXT_PUBLIC_PATIENT env var

- [x] Add patientTerm constant to app/components/patient-list.tsx
- [x] Replace UI strings in app/components/patient-list.tsx
- [x] Add patientTerm constant to app/page.tsx
- [x] Replace "Patients" in app/page.tsx

# TODO: Replace hardcoded "User" and "Users" with NEXT_PUBLIC_USER env var

- [x] Add userTerm constant to app/components/user-management.tsx
- [x] Replace UI strings in app/components/user-management.tsx (including all "User" words)
- [x] Replace "User Management" in app/page.tsx
- [x] Replace "User" in toggle button options in app/components/user-management.tsx
- [x] Replace "Admin" with NEXT_PUBLIC_ADMIN env var in app/components/user-management.tsx
- [x] Replace USER/ADMIN in Type column display with env variables in app/components/user-management.tsx
- [x] Replace user type in navbar display in app/page.tsx

# TODO: Add Start Test button for each patient in Patient List

- [x] Add onStartTest prop to PatientListProps in app/components/patient-list.tsx
- [x] Add Start Test button in Actions column for each patient
- [x] Update app/page.tsx to handle start test action

# TODO: Display patient name at top when starting test

- [x] Add selectedPatient state in app/page.tsx
- [x] Update onStartTest to set selectedPatient
- [x] Pass selectedPatient to TestLevel component
- [x] Update TestLevel to display patient name at top
