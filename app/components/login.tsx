"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
// import { jwt_decode } from "jwt-decode";
import { useState } from "react";

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);

  const handleSuccess = (response: CredentialResponse) => {
    // if (response.credential) {
    //   const decoded = jwt_decode<any>(response.credential);
    //   setUser(decoded);
    //   console.log(decoded); // name, email, picture
    // }
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {!user ? (
        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-6">
          <h1 className="text-2xl font-bold">Login with Google</h1>
          <GoogleLogin onSuccess={handleSuccess} onError={handleError}/>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-4">
          <h2>Welcome, {user.name}</h2>
          <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full" />
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
}
