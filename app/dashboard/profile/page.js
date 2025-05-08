"use client";
import { useEffect, useState } from "react";
import API from "../../utils/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        const userDetails = await API.get(`/user/${res.data.user.id}`);
        setUser({
          name:
            userDetails.data.clientProfile?.name ||
            userDetails.data.trainerProfile?.name ||
            "Unknown",
          email: res.data.user.email,
          role: res.data.user.role,
        });
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <p className="text-center text-gray-400">Loading profile...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-900 shadow-xl rounded-2xl text-gray-100">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-2">
        User Profile
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-indigo-300 font-semibold mb-1">
            Name
          </label>
          <p className="text-white">{user.name}</p>
        </div>

        <div>
          <label className="block text-indigo-300 font-semibold mb-1">
            Email
          </label>
          <p className="text-white">{user.email}</p>
        </div>

        <div>
          <label className="block text-indigo-300 font-semibold mb-1">
            Role
          </label>
          <p className="text-white capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  );
}
