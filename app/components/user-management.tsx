"use client";

import { useEffect, useState } from "react";

interface AuthorizedUser {
  id: number;
  email: string;
  type: string;
  createdBy?: number;
}

interface UserManagementProps {
  currentUser: any;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', type: 'USER' });

  const fetchAuthorizedUsers = async () => {
    try {
      const res = await fetch(`/api/user?currentUserId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setAuthorizedUsers(data.authorizedUsers);
      } else {
        setError('Failed to fetch authorized users');
      }
    } catch (err) {
      setError('Error fetching authorized users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorizedUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.email.split('@')[0], // Simple name from email
          email: formData.email,
          type: formData.type,
          createdBy: currentUser.id,
        }),
      });

      if (res.ok) {
        setFormData({ email: '', type: 'USER' });
        setShowForm(false);
        fetchAuthorizedUsers(); // Refresh the list
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to add user');
      }
    } catch (err) {
      setError('Error adding user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUserId: currentUser.id,
        }),
      });

      if (res.ok) {
        fetchAuthorizedUsers(); // Refresh the list
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user');
    }
  };

  const handleTypeChange = async (userId: number, email: string, newType: string) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          email,
          type: newType,
          currentUserId: currentUser.id,
        }),
      });

      if (res.ok) {
        fetchAuthorizedUsers(); // Refresh the list
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to update user type');
      }
    } catch (err) {
      setError('Error updating user type');
    }
  };

  if (loading) {
    return <div className="text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  // Check if current user can manage users
  const canManageUsers = currentUser.userType === 'SUPERADMIN' || currentUser.userType === 'ADMIN';

  if (!canManageUsers) {
    return <div className="text-center">You do not have permission to manage users.</div>;
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[var(--button-bg)] text-white px-4 py-2 rounded hover:bg-[var(--button-hover)]"
        >
          Add User
        </button>
      </div>

      {showForm && (
        <div className="max-w-md mx-auto bg-[var(--card-bg)] p-6 rounded-lg shadow-md mb-6 border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="mb-4">
              <label className="block text-[var(--foreground)]">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--foreground)]">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
              >
                <option value="USER">User</option>
                {currentUser.userType === 'SUPERADMIN' && <option value="ADMIN">Admin</option>}
                {currentUser.userType === 'SUPERADMIN' && <option value="SUPERADMIN">Superadmin</option>}
              </select>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-[var(--success-bg)] text-white px-4 py-2 rounded hover:bg-[var(--success-hover)]">
                Add User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ email: '', type: 'USER' });
                }}
                className="bg-[var(--secondary-bg)] text-[var(--foreground)] px-4 py-2 rounded hover:bg-[var(--border-color)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {authorizedUsers.length === 0 ? (
        <p>No authorized users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[var(--card-bg)] border border-[var(--border-color)]">
            <thead>
              <tr className="bg-[var(--secondary-bg)]">
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">ID</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Email</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Type</th>
                <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {authorizedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--secondary-bg)]">
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{user.id}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{user.email}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">{user.type}</td>
                  <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">
                    <div className="flex space-x-2">
                      {/* Toggle type if not SUPERADMIN */}
                      {user.type !== 'SUPERADMIN' && (
                        <select
                          value={user.type}
                          onChange={(e) => handleTypeChange(user.id, user.email, e.target.value)}
                          className="p-1 border border-[var(--border-color)] rounded text-sm bg-[var(--card-bg)] text-[var(--foreground)]"
                        >
                          <option value="USER">User</option>
                          {currentUser.userType === 'SUPERADMIN' && <option value="ADMIN">Admin</option>}
                        </select>
                      )}
                      {/* Only allow deletion if user is not a superadmin or if current user is superadmin */}
                      {(currentUser.userType === 'SUPERADMIN' || user.type !== 'SUPERADMIN') && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-[var(--danger-bg)] text-white px-2 py-1 rounded hover:bg-[var(--danger-hover)] text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
