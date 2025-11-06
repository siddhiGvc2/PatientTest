"use client";

import { useEffect, useState } from "react";

const patientTerm = process.env.NEXT_PUBLIC_PATIENT || 'Patient';

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

interface PatientListProps {
  userId: number;
  currentUser: any;
  onStartTest?: (patient: Patient) => void;
}

interface User {
  id: number;
  email: string;
  name: string;
  userType: string;
}

export default function PatientList({ userId, currentUser, onStartTest }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({ name: '', age: '', city: '', fatherName: '', motherName: '', uniqueId: '', phoneNumber: '', score: 0 });
  const [selectedUserId, setSelectedUserId] = useState<number>(userId);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/user?currentUserId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.authorizedUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      let url = `/api/patients?currentUserId=${currentUser.id}`;
      if (currentUser.userType !== 'SUPERADMIN') {
        url += `&userId=${selectedUserId}`;
      }
      const res = await fetch(url);
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

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchPatients();
    }
  }, [currentUser, selectedUserId]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingPatient ? 'PUT' : 'POST';
      const url = editingPatient ? `/api/patients/${editingPatient.id}` : '/api/patients';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          currentUserId: currentUser.id,
          ...formData,
        }),
      });

        if (res.ok) {
          setFormData({ name: '', age: '', city: '', fatherName: '', motherName: '', uniqueId: '', phoneNumber: '', score: 0 });
          setShowForm(false);
          setEditingPatient(null);
          fetchPatients(); // Refresh the list
        } else {
          setError(editingPatient ? 'Failed to update patient' : 'Failed to add patient');
        }
    } catch (err) {
      setError(editingPatient ? 'Error updating patient' : 'Error adding patient');
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age?.toString() || '',
      city: patient.city || '',
      fatherName: patient.fatherName || '',
      motherName: patient.motherName || '',
      uniqueId: patient.uniqueId || '',
      phoneNumber: patient.phoneNumber || '',
      score: patient.score,
    });
    setShowForm(true);
  };

  const handleDeletePatient = async (patientId: number) => {
    if (!confirm(`Are you sure you want to delete this ${patientTerm.toLowerCase()}?`)) return;
    try {
      const res = await fetch(`/api/patients/${patientId}?userId=${selectedUserId}&currentUserId=${currentUser.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPatients(); // Refresh the list
      } else {
        setError('Failed to delete patient');
      }
    } catch (err) {
      setError('Error deleting patient');
    }
  };

  if (loading) {
    return <div className="text-center">Loading {patientTerm.toLowerCase()}s...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{patientTerm}s List</h2>
        <div className="flex items-center space-x-4">
          
            <button
              onClick={() => setShowForm(true)}
              className="bg-[var(--button-bg)] text-white px-4 py-2 rounded hover:bg-[var(--button-hover)]"
            >
              Add {patientTerm}
            </button>
        
        </div>
      </div>

      {showForm && (
        <div className="max-w-4xl mx-auto bg-[var(--card-bg)] p-6 rounded-lg shadow-md mb-6 border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-4">{editingPatient ? `Edit ${patientTerm}` : `Add New ${patientTerm}`}</h3>
          <form onSubmit={handleAddPatient}>
            <div className="mb-4">
              <label className="block text-[var(--foreground)]">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-[var(--foreground)]">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--foreground)]">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--foreground)]">Father Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--foreground)]">Mother Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--foreground)]">Unique ID</label>
              <input
                type="text"
                value={formData.uniqueId}
                onChange={(e) => setFormData({ ...formData, uniqueId: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--foreground)]">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-[var(--success-bg)] text-white px-4 py-2 rounded hover:bg-[var(--success-hover)]">
                {editingPatient ? `Update ${patientTerm}` : `Add ${patientTerm}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPatient(null);
                  setFormData({ name: '', age: '', city: '', fatherName: '', motherName: '', uniqueId: '', phoneNumber: '', score: 0 });
                }}
                className="bg-[var(--secondary-bg)] text-[var(--foreground)] px-4 py-2 rounded hover:bg-[var(--border-color)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {patients.length === 0 ? (
        <p>No {patientTerm.toLowerCase()}s found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[var(--card-bg)] border border-[var(--border-color)]">
            <thead>
              <tr className="bg-[var(--secondary-bg)]">
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">ID</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Name</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Created By</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Age</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">City</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Father Name</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Mother Name</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Unique ID</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Phone Number</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Score</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient,i) => (
                <tr key={patient.id} className="hover:bg-[var(--secondary-bg)]">
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">{i+1}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] ">{patient.name}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{patient.user.name}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] ">{patient.age || '-'}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{patient.city || '-'}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{patient.fatherName || '-'}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{patient.motherName || '-'}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{patient.uniqueId || '-'}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{patient.phoneNumber || '-'}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">{patient.score}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center justify-center align-center">
                    <button
                      onClick={() => onStartTest && onStartTest(patient)}
                      className="bg-[var(--success-bg)] text-white px-2 py-1 rounded mr-2 hover:bg-[var(--success-hover)]"
                    >
                      Start Test
                    </button>
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="bg-[var(--button-bg)] text-white px-2 py-1 rounded mr-2 hover:bg-[var(--button-hover)]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      className="bg-[var(--danger-bg)] text-white px-2 py-1 rounded hover:bg-[var(--danger-hover)]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
