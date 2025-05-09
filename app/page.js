"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import axios from "axios";
import Link from "next/link";
import API from "@/utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cookie, setCookie] = useCookies(["token", "role"]);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post(
        "https://client-management-dashboard-backend-production.up.railway.app/api/auth/login",
        { email, password },
        { withCredentials: true } // 👈 Send cookie!
      );

      router.push(`/dashboard/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl text-white">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400 tracking-wide">
          Welcome Back
        </h2>
        {error && (
          <p className="text-red-500 text-center font-medium mb-4">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 transition rounded-md font-semibold text-white shadow-sm"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-400 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
