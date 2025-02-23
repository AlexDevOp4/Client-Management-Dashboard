"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../utils/api";

const CreateClientPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    age: 0,
    weight: 0,
    bodyFat: 0,
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/auth/me");
        setUserData(response.data.user);
      } catch (error) {
        console.error("Error fetching client profile", error);
      }
    };

    fetchProfile();
  }, []);
  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formDataToSend = {
      email: formData.email,
      name: formData.name,
      age: Number(formData.age),
      weight: Number(formData.weight),
      bodyFat: Number(formData.bodyFat),
    };

    // Basic validation
    const { email, name, age, weight, bodyFat } = formDataToSend;
    if (!email || !name || !age || !weight || !bodyFat) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (age <= 0 || weight <= 0 || bodyFat < 0) {
      setError("Age, weight, and body fat must be positive numbers.");
      setLoading(false);
      return;
    }

    console.log(formDataToSend);

    try {
      const response = await API.post(`/client/${userData.id}`, formDataToSend);
      setSuccess("Client created successfully!");
      setFormData({
        email: "",
        name: "",
        age: "",
        weight: "",
        bodyFat: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create New Client
        </h2>

        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        {success && (
          <div className="mb-4 text-green-500 text-center">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Weight (lbs)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Body Fat (%)
            </label>
            <input
              type="number"
              name="bodyFat"
              value={formData.bodyFat}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Client"}
          </button>
        </form>

        <button
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
          onClick={() => router.push(`/dashboard/${userData.role}`)}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CreateClientPage;
