"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProgressChart from "../../../../components/ProgressChart";
import API from "../../../../utils/api";

const ClientProfile = () => {
  const { clientId } = useParams();

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

  useEffect(() => {
    if (!clientId) return;

    const fetchClientsWorkouts = async () => {
      try {
        const response = await API.get(`client/history/${clientId}`);
        const workoutExercises = response.data[0].workoutExercises;
        setExercises(workoutExercises.map((workout) => workout.exercise));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching client workouts", error);
        setLoading(false);
      }
    };

    fetchClientsWorkouts();
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

  return (
    <div className="max-w-5xl md:max-w-full md:p-4 mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Client Progress
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading workouts...</p>
      ) : (
        <>
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
