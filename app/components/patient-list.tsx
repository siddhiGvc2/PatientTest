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
}

interface PatientListProps {
  userId: number;
  currentUser: any;
}

interface User {
  id: number;
  email: string;
  name: string;
  userType: string;
}

export default function PatientList({ userId, currentUser }: PatientListProps) {
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
      const url = currentUser.userType === 'SUPERADMIN'
        ? `/api/patients?currentUserId=${currentUser.id}`
        : `/api/patients?userId=${selectedUserId}&currentUserId=${currentUser.id}`;
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
    if (!confirm('Are you sure you want to delete this patient?')) return;
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
    return <div className="text-center">Loading patients...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Patient List</h2>
        <div className="flex items-center space-x-4">
         
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Patient
          </button>
        </div>
      </div>

      {showForm && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
          <form onSubmit={handleAddPatient}>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Father Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Mother Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Unique ID</label>
              <input
                type="text"
                value={formData.uniqueId}
                onChange={(e) => setFormData({ ...formData, uniqueId: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Score</label>
              <input
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                {editingPatient ? 'Update Patient' : 'Add Patient'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPatient(null);
                  setFormData({ name: '', age: '', city: '', fatherName: '', motherName: '', uniqueId: '', phoneNumber: '', score: 0 });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>

                <th className="py-2 px-4 border-b">Age</th>
                <th className="py-2 px-4 border-b">City</th>
                <th className="py-2 px-4 border-b">Father Name</th>
                <th className="py-2 px-4 border-b">Mother Name</th>
                <th className="py-2 px-4 border-b">Unique ID</th>
                <th className="py-2 px-4 border-b">Phone Number</th>
                <th className="py-2 px-4 border-b">Score</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient,i) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{i+1}</td>
                  <td className="py-2 px-4 border-b">{patient.name}</td>

                  <td className="py-2 px-4 border-b">{patient.age || '-'}</td>
                  <td className="py-2 px-4 border-b">{patient.city || '-'}</td>
                  <td className="py-2 px-4 border-b">{patient.fatherName || '-'}</td>
                  <td className="py-2 px-4 border-b">{patient.motherName || '-'}</td>
                  <td className="py-2 px-4 border-b">{patient.uniqueId || '-'}</td>
                  <td className="py-2 px-4 border-b">{patient.phoneNumber || '-'}</td>
                  <td className="py-2 px-4 border-b">{patient.score}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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
