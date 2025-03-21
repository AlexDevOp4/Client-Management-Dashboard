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

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const res = await API.get("/auth/me");
        setTrainerId(res.data.user.id);
      } catch (err) {
        console.error("Error fetching trainer", err);
      }
    };

    const fetchClients = async () => {
      try {
        const res = await API.get(`/trainer/clients`);
        setClients(res.data);
      } catch (err) {
        console.error("Error fetching clients", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
    fetchClients();
  }, []);

  const goToClientProfile = (clientId) => {
    router.push(`/dashboard/trainer/clients/${clientId}`);
  };

  const createWorkoutForClient = (clientId) => {
    router.push(`/dashboard/trainer/clients/${clientId}/create`);
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await API.post("/trainer/clients/add", {
        trainerId,
        name: newClient.name,
        email: newClient.email,
      });

      setClients([...clients, res.data]);
      setShowModal(false);
      setNewClient({ name: "", email: "" });
    } catch (err) {
      console.error("Error adding client", err);
      alert("Error adding client");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-10">Loading clients...</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-400">Your Clients</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          + Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-400">No clients assigned yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-700 rounded-lg">
          <table className="w-full text-sm text-left bg-gray-800 rounded-lg">
            <thead>
              <tr className="text-indigo-300 bg-gray-700">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-700 transition">
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">{client.user.email}</td>
                  <td className="px-4 py-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => goToClientProfile(client.userId)}
                      className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md"
                    >
                      View
                    </button>
                    <button
                      onClick={() => createWorkoutForClient(client.userId)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-indigo-300">
              Add New Client
            </h3>

            <label className="block text-sm text-gray-300 mb-1">Name:</label>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
            />

            <label className="block text-sm text-gray-300 mb-1">Email:</label>
            <input
              type="email"
              className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
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
