"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../utils/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/auth/me"); // ✅ Fetch user data
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("token"); // Clear token if unauthorized
        router.push("/"); // Redirect to login
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.email}!</h1>
      <p>Your role: {user?.role}</p>
      <button
        className="bg-red-500 text-white p-2 rounded mt-4"
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}

