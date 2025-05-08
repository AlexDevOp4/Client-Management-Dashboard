"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProgressChart from "@/components/ProgressChart";
import API from "@/utils/api";

const ClientProfile = () => {
  const { clientId } = useParams();
  const router = useRouter();

  const [workoutPrograms, setWorkoutPrograms] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [exerciseId, setExerciseId] = useState(null);
  const [userData, setUserData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/auth/me");
        console.log(response.data.user);
        setUserData(response.data.user);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!clientId) return;

    const fetchClientsWorkouts = async () => {
      try {
        const response = await API.get(`client/programs/${clientId}`);
        setWorkoutPrograms(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching client workouts", error);
        setLoading(false);
      }
    };

    fetchClientsWorkouts();
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;

    const fetchClientsHistory = async () => {
      try {
        const response = await API.get(`client/history/${clientId}`);
        const workoutExercises = response.data[0]?.workoutExercises || [];
        setExercises(workoutExercises.map((workout) => workout.exercise));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching client workout history", error);
        setLoading(false);
      }
    };

    fetchClientsHistory();
  }, [clientId]);

  useEffect(() => {
    const fetchClientProgress = async () => {
      console.log(userData)
      if (!userData || !clientId || !exerciseId) return;

      try {
        console.log(userData);
        const response = await API.get(
          `trainer/${userData.id}/clients/${clientId}/exercises/${exerciseId}/progress`
        );
        const formattedData = response.data.progress.map((log) => ({
          date: log.logDate,
          weight: log.weightUsed,
          reps: log.repsCompleted,
        }));
        setProgressData(formattedData);
      } catch (error) {
        console.error("Error fetching client progress", error);
      }
    };

    fetchClientProgress();
  }, [userData, clientId, exerciseId]);

  const goToClientsProgram = (programId) => {
    router.push(`/dashboard/trainer/program/${programId}`);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6">
        Client Profile
      </h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading data...</p>
      ) : (
        <>
          {/* Workout Programs */}
          <div>
            <h3 className="text-2xl font-semibold text-indigo-300 mb-4">
              Workout Programs
            </h3>
            {workoutPrograms.length > 0 ? (
              <ul className="space-y-4">
                {workoutPrograms.map((program) => (
                  <li
                    key={program.id}
                    className={`p-4 rounded-lg shadow-md transition duration-200 cursor-pointer hover:shadow-xl flex justify-between items-center ${
                      program.status === "completed"
                        ? "bg-gray-800 border border-green-500"
                        : "bg-gray-800 border border-indigo-500"
                    }`}
                    onClick={() => goToClientsProgram(program.id)}
                  >
                    <span className="text-lg font-medium">{program.title}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        program.status === "completed"
                          ? "bg-green-600 text-white"
                          : "bg-yellow-600 text-white"
                      }`}
                    >
                      {program.status === "completed"
                        ? "Completed"
                        : "In Progress"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No workout programs found.</p>
            )}
          </div>

          {/* Client Progress */}
          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-indigo-300 mb-2">
              Client Progress
            </h3>
            <label className="block text-sm text-gray-300 mb-1">
              Select Exercise
            </label>
            <select
              onChange={(e) => setExerciseId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md mb-6"
            >
              <option value="">-- Select Exercise --</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>

            {exerciseId && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold text-indigo-200 mb-2">
                    Weight Over Time
                  </h4>
                  <div className="bg-gray-800 rounded-lg p-4 shadow-inner">
                    <ProgressChart
                      progressData={progressData}
                      metric="weight"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-indigo-200 mb-2">
                    Reps Over Time
                  </h4>
                  <div className="bg-gray-800 rounded-lg p-4 shadow-inner">
                    <ProgressChart progressData={progressData} metric="reps" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientProfile;
