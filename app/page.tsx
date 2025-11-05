"use client";

import { useState } from "react";
import LoginPage from "./components/login";
import PatientList from "./components/patient-list";
import UserManagement from "./components/user-management";
import TestLevel from "./components/test-level";
import { useAuth } from "./contexts/AuthContext";

const userTerm = process.env.NEXT_PUBLIC_USER || 'User';
const adminTerm = process.env.NEXT_PUBLIC_ADMIN || 'Admin';

export default function Home() {
  const { loggedInUser, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'patients' | 'users' | 'test'>('patients');
  const [testEnded, setTestEnded] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const showHeader = activeTab !== 'test' || testEnded;

  const handleTestEnd = () => {
    setTestEnded(true);
  };

  const handleExitTest = () => {
    setTestEnded(true);
    setActiveTab('patients');
  };

  const handleRetakeTest = () => {
    setTestEnded(false);
  };

  const handleLogin = (user: any) => {
    login(user);
  };

  const handleLogout = () => {
    logout();
  };

  const canManageUsers = loggedInUser && (loggedInUser.userType === 'SUPERADMIN' || loggedInUser.userType === 'ADMIN');

  return (
    <div>
      {!loggedInUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div>
          {showHeader && (
            <>
              <div className="bg-[var(--card-bg)] p-4 shadow-md flex items-center justify-between border-b border-[var(--border-color)]">
                <div className="flex items-center space-x-4">
                  <img src={loggedInUser.picture} alt={loggedInUser.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h2 className="text-lg font-semibold">{loggedInUser.name}</h2>
                    <p className="text-[var(--secondary-text)]">{loggedInUser.email} ({loggedInUser.userType === 'USER' ? userTerm : loggedInUser.userType === 'ADMIN' ? adminTerm : loggedInUser.userType})</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-[var(--danger-bg)] text-white px-4 py-2 rounded hover:bg-[var(--danger-hover)]"
                >
                  Logout
                </button>
              </div>

              <div className="bg-[var(--secondary-bg)] p-4 border-b border-[var(--border-color)]">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('patients')}
                    className={`px-4 py-2 rounded ${activeTab === 'patients' ? 'bg-[var(--button-bg)] text-white hover:bg-[var(--button-hover)]' : 'bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)]'}`}
                  >
                    {process.env.NEXT_PUBLIC_PATIENT || 'Patient'}s
                  </button>
                  {canManageUsers && (
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-[var(--button-bg)] text-white hover:bg-[var(--button-hover)]' : 'bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)]'}`}
                    >
                      {process.env.NEXT_PUBLIC_USER || 'User'} Management
                    </button>
                  )}
                  {/* <button
                    onClick={() => {setActiveTab('test');setTestEnded(false)}}
                    className={`px-4 py-2 rounded ${activeTab === 'test' ? 'bg-[var(--button-bg)] text-white hover:bg-[var(--button-hover)]' : 'bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)]'}`}
                  >
                    Test Level
                  </button> */}
                  {canManageUsers && (
                    <a
                      href="/admin"
                      className="px-4 py-2 rounded bg-[var(--success-bg)] text-white hover:bg-[var(--success-hover)]"
                    >
                      Admin Panel
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'patients' && <PatientList userId={loggedInUser.id} currentUser={loggedInUser} onStartTest={(patient) => {setSelectedPatient(patient); setActiveTab('test');setTestEnded(false)}} />}
          {activeTab === 'users' && canManageUsers && <UserManagement currentUser={loggedInUser} />}
          {activeTab === 'test' && (
            <div className="min-h-screen bg-[var(--background)]">
              <TestLevel onTestEnd={handleTestEnd} onExit={handleExitTest} onRetake={handleRetakeTest} selectedPatient={selectedPatient} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
