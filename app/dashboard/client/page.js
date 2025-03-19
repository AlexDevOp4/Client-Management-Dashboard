"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../utils/api";
import withAuth from "../../components/withAuth";
import { useCookies } from "react-cookie";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

const ClientDashboard = () => {
  const [programs, setPrograms] = useState([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [cookies, setCookie, removeToken] = useCookies(["token", "role"]);
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
      const response = await API.get("/auth/me", {
        withCredentials: true,
      });
      console.log(response.data);
      const user = await API.get(`/user/${response.data.user.id}`);
      setClientData(user.data);
    } catch (error) {
      console.error("Error fetching client profile", error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/auth/me", { withCredentials: true });
        console.log(response.data);
        const user = await API.get(`/user/${response.data.user.id}`);
        setClientData(user.data);
      } catch (error) {
        console.error("Error fetching client profile", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    fetchProfile();

    const fetchClientData = async () => {
      try {
        const response = await API.get("/auth/me", {
          withCredentials: true,
        });
        const clientId = response.data.user.id;
        const programsRes = await API.get(`/client/programs/${clientId}`);
        const workoutsRes = await API.get("/client/upcoming-workouts");
        const historyRes = await API.get(`/client/history/${clientId}`);
        const progressRes = await API.get("/client/progress");
        console.log(programsRes.data, "programs");

        setPrograms(programsRes.data);
        setUpcomingWorkouts(workoutsRes.data);
        setWorkoutHistory(historyRes.data);
        console.log(historyRes.data, "workoutHistory");
        setProgressData(progressRes.data);
      } catch (error) {
        console.log(
          "Error fetching client dashboard data",
          error.response.data.error
        );
        setError(error.response.data.error);
      }
    };

    fetchClientData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Client Dashboard
      </h2>

      {error ? (
        <p className="text-red-500 font-bold text-center text-2xl">{error}</p>
      ) : (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Your Workout Programs
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`p-4 rounded-lg cursor-pointer ${
                    program.status === "completed"
                      ? "bg-gray-200"
                      : "bg-blue-100"
                  }`}
                  onClick={() =>
                    router.push(`/client/programs/${program.id}/edit`)
                  }
                >
                  <h4 className="font-semibold">{program.title}</h4>
                  <p>Status: {program.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Workouts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Current Program</h3>
            {programs.length > 0 ? (
              <ul>
                {programs.map((workout) => (
                  <li
                    key={workout.id}
                    className="border p-2 rounded mb-2 flex justify-between"
                  >
                    {workout.title}{" "}
                    <button
                      onClick={() => navigateToProgram(workout.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                    >
                      Continue
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No upcoming workouts scheduled.</p>
            )}
          </div>

          {/* Workout History */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              {" "}
              <h3
                onClick={() => toggleCollapse()}
                className="text-lg font-semibold mb-2"
              >
                Program History
              </h3>
              <ChevronDoubleRightIcon
                className={`w-6 h-6 cursor-pointer ${isCollapsed ? "rotate-90" : ""}`}
                onClick={toggleCollapse}
              />
            </div>
            {programs.length > 0 ? (
              <ul className={`${isCollapsed ? "hidden" : ""}`}>
                {programs.map(
                  (workout) =>
                    workout.status === "completed" && (
                      <li key={workout.id} className="border p-2 rounded mb-2">
                        {workout.title} - Completed on {workout.completedDate}
                      </li>
                    )
                )}
              </ul>
            ) : (
              <p>No past workouts recorded.</p>
            )}

            {workoutHistory.length > 0 ? (
              <ul className={`${isCollapsed ? "hidden" : ""}`}>
                {workoutHistory.map((workout) => (
                  <li key={workout.id} className="border p-2 rounded mb-2">
                    {workout.title} - Completed on {workout.completedDate}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No past workouts recorded.</p>
            )}
          </div>

          {/* Progress Chart (Placeholder) */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p>Progress chart will be here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Workout Programs */}
    </div>
  );
};

export default ClientDashboard;
