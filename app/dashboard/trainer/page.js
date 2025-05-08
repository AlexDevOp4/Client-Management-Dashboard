"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import withAuth from "@/components/withAuth";

const TrainerDashboard = () => {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalWorkouts: 0,
    recentLogs: [],
  });

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
    if (!isoString) return "No Workouts Yet";
    return new Date(isoString).toISOString().split("T")[0];
  };

  const fetchDashboardStats = async (trainerId) => {
    try {
      const response = await API.get(`/trainer/${trainerId}/dashboard-stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats", error);
    }
  };

  const goToClientProfile = (clientId) => {
    router.push(`/dashboard/trainer/clients/${clientId}`);
  };

  const assignWorkout = (clientId) => {
    router.push(`/dashboard/trainer/clients/${clientId}/create`);
  };

  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-10">Loading dashboard...</p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-900 shadow-2xl rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">
          Trainer Dashboard
        </h1>

        {/* Quick Action */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => router.push("/clients/create")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            + Add New Client
          </button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            label="Total Clients"
            value={stats.totalClients}
            color="blue"
          />
          <MetricCard
            label="Workouts Assigned"
            value={stats.totalWorkouts}
            color="green"
          />
          <MetricCard
            label="Recent Logs"
            value={stats.recentLogs.length}
            color="yellow"
          />
        </div>

        {/* Recent Logs */}
        <h2 className="text-xl font-semibold text-indigo-300 mb-3">
          Recent Client Activity
        </h2>
        {stats.recentLogs.length > 0 ? (
          <ul className="bg-gray-800 p-4 rounded-lg shadow mb-8 space-y-2">
            {stats.recentLogs.slice(0, 5).map((log, index) => (
              <li key={index} className="text-sm text-gray-300">
                <span className="text-indigo-400 font-medium">
                  {log.clientName}
                </span>{" "}
                logged progress on{" "}
                <span className="text-white font-medium">
                  {log.exerciseName}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity.</p>
        )}

        {/* Client List */}
        <h2 className="text-xl font-semibold text-indigo-300 mb-3">
          My Clients
        </h2>
        {clients.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-gray-700">
            <table className="w-full text-left text-sm bg-gray-800 text-white rounded-md">
              <thead>
                <tr className="bg-gray-700 text-indigo-300">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Last Workout</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.userId}
                    className="border-t border-gray-700 hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">{client.name}</td>
                    <td className="px-4 py-3">
                      {formatDate(client.lastWorkoutDate)}
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => goToClientProfile(client.userId)}
                        className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => assignWorkout(client.userId)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 mt-4">No clients yet.</p>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-700",
    green: "from-green-500 to-green-700",
    yellow: "from-yellow-500 to-yellow-700",
  };

  return (
    <div
      className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
};

export default withAuth(TrainerDashboard, ["trainer"]);
