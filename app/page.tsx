"use client";

import { useState } from "react";
import LoginPage from "./components/login";
import PatientList from "./components/patient-list";
import UserManagement from "./components/user-management";
import TestLevel from "./components/test-level";

export default function Home() {
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'users' | 'test'>('patients');

  const handleLogin = (user: any) => {
    setLoggedInUser(user);
  };

  const canManageUsers = loggedInUser && (loggedInUser.userType === 'SUPERADMIN' || loggedInUser.userType === 'ADMIN');

  return (
    <div>
      {!loggedInUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div>
          <div className="bg-white p-4 shadow-md flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={loggedInUser.picture} alt={loggedInUser.name} className="w-10 h-10 rounded-full" />
              <div>
                <h2 className="text-lg font-semibold">{loggedInUser.name}</h2>
                <p className="text-gray-600">{loggedInUser.email} ({loggedInUser.userType})</p>
              </div>
            </div>
            <button
              onClick={() => setLoggedInUser(null)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {canManageUsers && (
            <div className="bg-gray-100 p-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('patients')}
                  className={`px-4 py-2 rounded ${activeTab === 'patients' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                >
                  Patients
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                >
                  User Management
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className={`px-4 py-2 rounded ${activeTab === 'test' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                >
                  Test Level
                </button>
              </div>
            </div>
          )}

          {activeTab === 'patients' && <PatientList userId={loggedInUser.id} currentUser={loggedInUser} />}
          {activeTab === 'users' && canManageUsers && <UserManagement currentUser={loggedInUser} />}
          {activeTab === 'test' && <TestLevel />}
        </div>
      )}
    </div>
  );
}
