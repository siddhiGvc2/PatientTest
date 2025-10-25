"use client";

import { useState } from "react";
import LoginPage from "./components/login";
import PatientList from "./components/patient-list";

export default function Home() {
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const handleLogin = (user: any) => {
    setLoggedInUser(user);
  };

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
                <p className="text-gray-600">{loggedInUser.email}</p>
              </div>
            </div>
            <button
              onClick={() => setLoggedInUser(null)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          <PatientList userId={loggedInUser.id} />
        </div>
      )}
    </div>
  );
}
