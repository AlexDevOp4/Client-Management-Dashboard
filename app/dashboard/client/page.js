"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../utils/api";
import { useCookies } from "react-cookie";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

const ClientDashboard = () => {
  const [programs, setPrograms] = useState([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);
  const [currentProgram, setCurrentProgram] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [cookies] = useCookies(["token", "role"]);
  const [usersData, setUsersData] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    fetchProfile();
  };

  const navigateToProgram = (programId) => {
    router.push(`/dashboard/client/programs/edit/${programId}`);
  };

  const fetchProfile = async () => {
    try {
      const response = await API.get("/auth/me", { withCredentials: true });
      const user = await API.get(`/user/${response.data.user.id}`);
      setClientData(user.data);
    } catch (error) {
      console.error("Error fetching client profile", error);
    }
  };

  useEffect(() => {
    fetchProfile();

    const fetchClientData = async () => {
      try {
        const response = await API.get("/auth/me", { withCredentials: true });
        const clientId = response.data.user.id;
        const user = await API.get(`/user/${response.data.user.id}`);
        setUsersData(user.data.clientProfile);
        const [programsRes, historyRes, progressRes] =
          await Promise.all([
            API.get(`/client/programs/${clientId}`),
            API.get(`/client/history/${clientId}`),
            API.get("/client/progress"),
          ]);

        const currentProgramData = programsRes.data.filter(
          (program) => program.status === "in-progress"
        );
        setCurrentProgram(currentProgramData);
        setPrograms(programsRes.data);
        setWorkoutHistory(historyRes.data);
        setProgressData(progressRes.data);
      } catch (error) {
        console.log(error)
        setError(error.response?.data?.error || "Unknown error");
      }
    };

    fetchClientData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-b from-gray-900 to-black text-gray-200 shadow-xl rounded-lg mt-8 font-mono">
      <h2 className="text-3xl font-bold mb-6 text-center tracking-widest text-indigo-400 border-b border-gray-700 pb-2">
        {usersData.name}&apos;s Dashboard
      </h2>

      {error ? (
        <p className="text-red-500 font-bold text-center text-2xl">{error}</p>
      ) : (
        <div>
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-indigo-300 border-b border-gray-800 pb-1">
              Active Programs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`p-4 rounded-lg border hover:scale-105 transition transform duration-300 cursor-pointer shadow-md ${
                    program.status === "completed"
                      ? "bg-gray-800 text-gray-400 border-gray-700"
                      : "bg-gradient-to-r from-indigo-800 to-indigo-600 border-indigo-400 text-white"
                  }`}
                  onClick={() =>
                    router.push(`/client/programs/${program.id}/edit`)
                  }
                >
                  <h4 className="text-lg font-bold">{program.title}</h4>
                  <p className="text-sm uppercase tracking-widest mt-2">
                    Status:{" "}
                    <span className="font-semibold">{program.status}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Program */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-indigo-300 border-b border-gray-800 pb-1 mb-4">
              Current Program
            </h3>
            {currentProgram.length > 0 ? (
              <ul className="space-y-3">
                {currentProgram.map((workout) => (
                  <li
                    key={workout.id}
                    className="bg-gray-900 border border-indigo-500 rounded-md p-4 flex items-center justify-between shadow-lg"
                  >
                    <span className="text-lg font-medium">{workout.title}</span>
                    <button
                      onClick={() => navigateToProgram(workout.id)}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-500 transition"
                    >
                      Continue
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">
                No current programs available.
              </p>
            )}
          </div>

          {/* Workout History */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-semibold text-indigo-300 border-b border-gray-800 pb-1">
                Completed Programs
              </h3>
              <ChevronDoubleRightIcon
                className={`w-6 h-6 cursor-pointer text-gray-300 transition-transform ${
                  isCollapsed ? "rotate-90" : ""
                }`}
                onClick={toggleCollapse}
              />
            </div>

            {workoutHistory.length > 0 ? (
              <ul className={`${isCollapsed ? "hidden" : "space-y-3"}`}>
                {workoutHistory.map((workout) => (
                  <li
                    key={workout.id}
                    className="bg-gray-800 border border-gray-700 p-3 rounded-md flex justify-between items-center"
                  >
                    <span>{workout.title}</span>
                    <button
                      onClick={() => navigateToProgram(workout.id)}
                      className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-400 transition"
                    >
                      Review
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">No past workouts recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
