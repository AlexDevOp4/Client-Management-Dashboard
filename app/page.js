"use client"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    console.log("Login Data:", data);
    // TODO: Send to backend API
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className="w-full p-2 mb-3 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="w-full p-2 mb-3 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Login
          </button>
        </form>
        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
