"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../utils/api";

const TrainerDashboard = () => {
  const router = useRouter();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await API.get("/auth/me");
        const user = await API.get(`/user/${response.data.user.id}`);
        setClients(user.data.clients);
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
      <button
        className="bg-blue-500 text-white p-2 rounded mt-4"
        onClick={() => router.push("/clients/create")}
      >
        Add New Client
      </button>

      <h2 className="text-xl font-semibold mt-6">My Clients</h2>
      <ul>
        {clients.length > 0 ? (
          clients.map((client) => (
            <li key={client.userId} className="border p-2 mt-2">
              {client.name}
            </li>
          ))
        ) : (
          <p>No clients found.</p>
        )}
      </ul>
    </div>
  );
};

export default TrainerDashboard;
