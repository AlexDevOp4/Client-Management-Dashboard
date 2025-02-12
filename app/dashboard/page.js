"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    router.push("/");
  };

  useEffect(() => {
    // TODO: Fetch user from backend
    setUser({ name: "John Doe", role: "Trainer" });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
      <p>Your role: {user?.role}</p>
      <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded mt-4">Logout</button>
    </div>
  );
}
