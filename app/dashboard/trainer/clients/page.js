"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../../utils/api";

const TrainerClients = () => {
  const [clients, setClients] = useState([]);
  const [trainerId, setTrainerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "" });

  const router = useRouter();

  /** Fetch Trainer ID and Clients **/
  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await API.get("/auth/me");
        setTrainerId(response.data.user.id);
      } catch (error) {
        console.error("Error fetching trainer", error);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await API.get(`/trainer/clients`);
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
    fetchClients();
  }, []);

  /** Handle Navigation **/
  const goToClientProfile = (clientId) => {
    router.push(`/dashboard/trainer/clients/${clientId}`);
  };

  const createWorkoutForClient = (clientId) => {
    router.push(`/dashboard/trainer/workouts/create`);
  };

  /** Handle Adding New Client **/
  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await API.post("/trainer/clients/add", {
        trainerId,
        name: newClient.name,
        email: newClient.email,
      });

      setClients([...clients, response.data]); // Add new client to list
      setShowModal(false);
      setNewClient({ name: "", email: "" });
    } catch (error) {
      console.error("Error adding client", error);
      alert("Error adding client");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10">Loading clients...</p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Your Clients
      </h2>

      <button
        onClick={() => router.push("/clients/create")}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
      >
        + Add New Client
      </button>

      {clients.length === 0 ? (
        <p className="text-gray-500">No clients assigned yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="text-center hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {client.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {client.email}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => goToClientProfile(client.userId)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                    >
                      View Progress
                    </button>
                    <button
                      onClick={() => createWorkoutForClient(client.userId)}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                    >
                      Assign Workout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FOR ADDING CLIENT */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Add New Client</h3>

            <label className="block text-gray-700 font-medium mb-2">
              Name:
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md mb-4"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
            />

            <label className="block text-gray-700 font-medium mb-2">
              Email:
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded-md mb-4"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerClients;
