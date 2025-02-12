"use client"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    console.log("Register Data:", data);
    // TODO: Send to backend API
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Name"
            {...register("name")}
            className="w-full p-2 mb-3 border rounded"
          />
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
          <select
            {...register("role")}
            className="w-full p-2 mb-3 border rounded"
          >
            <option value="client">Client</option>
            <option value="trainer">Trainer</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
