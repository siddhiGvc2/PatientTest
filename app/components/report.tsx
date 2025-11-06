"use client";

import { useEffect, useState } from "react";

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

interface ScoreReport {
  id: number;
  patientId: number;
  score: number;
  dateTime: string;
}

interface ReportProps {
  selectedPatient: Patient | null;
  currentUserId: number;
  onBack: () => void;
}

export default function Report({ selectedPatient, currentUserId, onBack }: ReportProps) {
  const [scoreReports, setScoreReports] = useState<ScoreReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPatient) {
      fetchScoreReports();
    }
  }, [selectedPatient, currentUserId]);

  const fetchScoreReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/score-reports?patientId=${selectedPatient!.id}&currentUserId=${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setScoreReports(data.scoreReports);
      } else {
        setError('Failed to fetch score reports');
      }
    } catch (err) {
      setError('Error fetching score reports');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)] mb-6">
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
      <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
        <h3 className="text-lg font-semibold mb-4">Score Reports</h3>
        {loading && <div className="text-center">Loading score reports...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && scoreReports.length === 0 && <div className="text-center">No score reports found for this patient.</div>}
        {!loading && !error && scoreReports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[var(--card-bg)] border border-[var(--border-color)]">
              <thead>
                <tr className="bg-[var(--secondary-bg)]">
                  <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">ID</th>
                  <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Score</th>
                  <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {scoreReports.map((report, i) => (
                  <tr key={report.id} className="hover:bg-[var(--secondary-bg)]">
                    <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">{i + 1}</td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">{report.score}</td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">{new Date(report.dateTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
