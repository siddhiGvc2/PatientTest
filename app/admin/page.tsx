"use client"
import AdminPanel from "../components/admin-panel";
import { useAuth } from "../contexts/AuthContext";

export default function AdminPage() {
  const { loggedInUser } = useAuth();

  // if (!loggedInUser || (loggedInUser.userType !== 'SUPERADMIN' && loggedInUser.userType !== 'ADMIN')) {
  //   return <div className="flex items-center justify-center h-screen">Access Denied</div>;
  // }

  return <AdminPanel />;
}
