"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

export default function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [user, setUser] = useState<any>(null);

  const handleSuccess = async (response: CredentialResponse) => {
    if (response.credential) {
      const decoded = jwtDecode<any>(response.credential);
      console.log(decoded); // name, email, picture

      // Check if user is authorized
      try {
        const authRes = await fetch('/api/user');
        if (authRes.ok) {
          const authData = await authRes.json();
          const authorizedEmails = authData.authorizedUsers.map((user: any) => user.email);
          if (!authorizedEmails.includes(decoded.email)) {
            alert('You are not authorized to log in.');
            return;
          }
        } else {
          console.error('Failed to fetch authorized users');
          alert('Unable to verify authorization. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        alert('Error verifying authorization. Please try again.');
        return;
      }

      setUser(decoded);

      // Save user to database (without changing type)
      try {
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: decoded.name,
            email: decoded.email,
            // Do not pass type to avoid changing existing user type
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log('User saved:', data);
          onLogin({ ...decoded, id: data.authorizedUser.id, userType: data.user.userType }); // Pass user with authorizedUser id and userType to parent
        } else {
          console.error('Failed to save user');
        }
      } catch (error) {
        console.error('Error saving user:', error);
      }
    }
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
