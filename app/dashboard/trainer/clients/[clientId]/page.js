"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProgressChart from "../../../../components/ProgressChart";
import API from "../../../../utils/api";

const ClientProfile = () => {
  const { clientId } = useParams();
  const router = useRouter();

  const [workoutPrograms, setWorkoutPrograms] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [exerciseId, setExerciseId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/auth/me");
        setUserData(response.data.user);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch Client's Workout Programs
  useEffect(() => {
    if (!clientId) return;

    const fetchClientsWorkouts = async () => {
      try {
        const response = await API.get(`client/programs/${clientId}`);
        setWorkoutPrograms(response.data); // ✅ Store workout programs
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
    if (!userData || !clientId || !exerciseId) return;

    const fetchClientProgress = async () => {
      try {
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

  const goToCleintsProgram = (programId) => {
    router.push(`/dashboard/trainer/program/${programId}`);
  };

  return (
    <div className="max-w-5xl md:max-w-full md:p-4 mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Client Profile
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading data...</p>
      ) : (
        <>
          {/* ✅ Section: Workout Programs */}
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Workout Programs
          </h3>
          {workoutPrograms.length > 0 ? (
            <ul className="space-y-4">
              {workoutPrograms.map((program) => (
                <li
                  key={program.id}
                  className="p-4 bg-gray-100 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-200"
                  onClick={() => goToCleintsProgram(program.id)} // ✅ Navigate to program edit page
                >
                  <span className="font-medium">{program.title}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      program.status === "completed"
                        ? "bg-green-500 text-white"
                        : "bg-yellow-500 text-white"
                    }`}
                  >
                    {program.status === "completed"
                      ? "Complete"
                      : "In Progress"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No workout programs found.</p>
          )}

          {/* ✅ Section: Exercise Progress */}
          <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-4">
            Client Progress
          </h3>
          <label className="block text-gray-700 font-medium mb-2">
            Select Exercise:
          </label>
          <select
            onChange={(e) => setExerciseId(e.target.value)}
            className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring focus:border-blue-400"
          >
            <option value="">-- Select Exercise --</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>

          {exerciseId && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Weight Over Time
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <ProgressChart progressData={progressData} metric="weight" />
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">
                Reps Over Time
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <ProgressChart progressData={progressData} metric="reps" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientProfile;
