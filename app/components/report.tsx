"use client";

interface Patient {
  id: number;
  name: string;
  age: number | null;
  city: string | null;
  fatherName: string | null;
  motherName: string | null;
  uniqueId: string | null;
  phoneNumber: string | null;
  score: number;
  user: {
    email: string;
    name: string;
    userType: string;
  };
}

interface ReportProps {
  selectedPatient: Patient | null;
  onBack: () => void;
}

export default function Report({ selectedPatient, onBack }: ReportProps) {
  if (!selectedPatient) {
    return <div className="text-center">No patient selected for report.</div>;
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Patient Report</h2>
        <button
          onClick={onBack}
          className="bg-[var(--secondary-bg)] text-[var(--foreground)] px-4 py-2 rounded hover:bg-[var(--border-color)]"
        >
          Back to Patients
        </button>
      </div>
      <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
        <h3 className="text-lg font-semibold mb-4">Patient Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--foreground)] font-medium">Name</label>
            <p className="text-[var(--foreground)]">{selectedPatient.name}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Age</label>
            <p className="text-[var(--foreground)]">{selectedPatient.age || '-'}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">City</label>
            <p className="text-[var(--foreground)]">{selectedPatient.city || '-'}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Father Name</label>
            <p className="text-[var(--foreground)]">{selectedPatient.fatherName || '-'}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Mother Name</label>
            <p className="text-[var(--foreground)]">{selectedPatient.motherName || '-'}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Unique ID</label>
            <p className="text-[var(--foreground)]">{selectedPatient.uniqueId || '-'}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Phone Number</label>
            <p className="text-[var(--foreground)]">{selectedPatient.phoneNumber || '-'}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Score</label>
            <p className="text-[var(--foreground)]">{selectedPatient.score}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Created By</label>
            <p className="text-[var(--foreground)]">{selectedPatient.user.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
