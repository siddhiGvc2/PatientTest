"use client";

import { useEffect, useState } from "react";

interface Patient {
  id: number;
  name: string;
  email: string | null;
  score: number;
}

interface PatientListProps {
  userId: number;
}

export default function PatientList({ userId }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`/api/patients?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPatients(data.patients);
        } else {
          setError('Failed to fetch patients');
        }
      } catch (err) {
        setError('Error fetching patients');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPatients();
    }
  }, [userId]);

  if (loading) {
    return <div className="text-center">Loading patients...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Patient List</h2>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{patient.name}</h3>
              <p className="text-gray-600">{patient.email}</p>
              <p className="text-sm text-gray-500">Score: {patient.score}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
