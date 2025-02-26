"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../utils/api";
import withAuth from "../../components/withAuth";
import Link from "next/link";

const TrainerDashboard = () => {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalWorkouts: 0,
    recentLogs: [],
  });

  /** Fetch Trainer's Clients & Stats **/
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/auth/me");
        const trainerId = response.data.user.id;
        const user = await API.get(`/user/${trainerId}`);

        if (user.data.role !== "trainer") {
          router.push("/");
        } else {
          setClients(user.data.clients);
          await fetchDashboardStats(trainerId);
        }
      } catch (error) {
        console.error("Error fetching clients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatDate = (isoString) => {
    return new Date(isoString).toISOString().split("T")[0];
  };

  /** Fetch Dashboard Statistics **/
  const fetchDashboardStats = async (trainerId) => {
    try {
      const response = await API.get(`/trainer/${trainerId}/dashboard-stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats", error);
    }
  };

  /** Navigate to Client Profile **/
  const goToClientProfile = (clientId) => {
    router.push(`/dashboard/trainer/clients/${clientId}`);
  };

  /** Navigate to Assign Workout **/
  const assignWorkout = (clientId) => {
    router.push(`/dashboard/trainer/clients/${clientId}/create`);
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10">Loading dashboard...</p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Trainer Dashboard
      </h1>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => router.push("/clients/create")}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          + Add New Client
        </button>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-100 border-l-4 border-blue-500 rounded">
          <p className="text-lg font-semibold">{stats.totalClients}</p>
          <p className="text-gray-600">Total Clients</p>
        </div>
        <div className="p-4 bg-green-100 border-l-4 border-green-500 rounded">
          <p className="text-lg font-semibold">{stats.totalWorkouts}</p>
          <p className="text-gray-600">Total Workouts Assigned</p>
        </div>
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
          <p className="text-lg font-semibold">{stats.recentLogs.length}</p>
          <p className="text-gray-600">Recent Logs</p>
        </div>
      </div>

      {/* Recent Activity */}
      <h2 className="text-xl font-semibold text-gray-700 mb-3">
        Recent Client Activity
      </h2>
      {stats.recentLogs.length > 0 ? (
        <ul className="bg-gray-50 p-4 rounded-md shadow">
          {stats.recentLogs.slice(0, 5).map((log, index) => (
            <li
              key={index}
              className="border-b py-2 last:border-b-0 text-gray-700"
            >
              <strong>{log.clientName}</strong> logged progress on{" "}
              <em>{log.exerciseName}</em>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No recent activity.</p>
      )}

      {/* Client List */}
      <h2 className="text-xl font-semibold text-gray-700 mt-6">My Clients</h2>
      {clients.length > 0 ? (
        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">
                  Last Workout
                </th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.userId}
                  className="text-center hover:bg-gray-50"
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {client.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(client.lastWorkoutDate) || "No Workouts Yet"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => goToClientProfile(client.userId)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                    >
                      View Progress
                    </button>
                    <button
                      onClick={() => assignWorkout(client.userId)}
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
      ) : (
        <p className="text-gray-500 mt-4">No clients found.</p>
      )}
    </div>
  );
};

export default withAuth(TrainerDashboard, ["trainer"]);
