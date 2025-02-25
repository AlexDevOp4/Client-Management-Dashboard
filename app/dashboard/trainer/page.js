"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../utils/api";
import withAuth from "../../components/withAuth";
import Link from "next/link";

const TrainerDashboard = () => {
  const router = useRouter();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await API.get("/auth/me");
        console.log(response.data);
        const trainerId = response.data.user.id;
        const user = await API.get(`/user/${trainerId}`);
        console.log(user.data.clients);
        if (user.data.role !== "trainer") {
          router.push("/");
        } else {
          setClients(user.data.clients);
        }
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };

    const getProgress = async () => {
      const data = await fetchClientProgress(1, 1, 1);
    };

    fetchClients();
  }, [router]);

  const fetchClientProgress = async (trainerId, clientId, exerciseId) => {
    try {
      const response = await API.get(
        `trainer/${trainerId}/clients/${clientId}/exercises/${exerciseId}/progress`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching client progress", error);
    }
  };

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
              <Link
 
                href={`/dashboard/trainer/client/${client.userId}`}
              >
                {client.name}
              </Link>
            </li>
          ))
        ) : (
          <p>No clients found.</p>
        )}
      </ul>
    </div>
  );
};

export default withAuth(TrainerDashboard, ["trainer"]);
