"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import API from "@/utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ClientProgress = () => {
  const { clientId } = useParams();
  const [progressData, setProgressData] = useState([]);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const fetchProgress = async () => {
      try {
        const response = await API.get(`/clients/${clientId}/progress`);
        setWorkoutsCompleted(response.data.completedWorkouts);
        setExercises(response.data.exercises);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching progress", error);
        setLoading(false);
      }
    };

    fetchProgress();
  }, [clientId]);

  useEffect(() => {
    if (!selectedExercise) return;

    const fetchExerciseProgress = async () => {
      try {
        const response = await API.get(
          `/clients/${clientId}/exercises/${selectedExercise}/progress`
        );
        setProgressData(response.data);
      } catch (error) {
        console.error("Error fetching exercise progress", error);
      }
    };

    fetchExerciseProgress();
  }, [clientId, selectedExercise]);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        Progress Overview
      </h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading progress...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            {/* Completed Workouts */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-300">
                Workouts Completed
              </h3>
              <p className="text-4xl font-bold text-blue-400 mt-2">
                {workoutsCompleted}
              </p>
            </div>

            {/* Exercise Selection */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-300">
                Track Exercise Progress
              </h3>
              <select
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="mt-3 w-full p-2 bg-gray-700 text-white rounded-md focus:ring focus:ring-blue-500"
              >
                <option value="">-- Select Exercise --</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Strength Progress Graph */}
          {selectedExercise && (
            <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-300">
                Strength Gains:{" "}
                {exercises.find((ex) => ex.id === selectedExercise)?.name}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#bbb" />
                  <YAxis stroke="#bbb" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#34D399"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientProgress;
