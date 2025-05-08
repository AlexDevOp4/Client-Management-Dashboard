"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import API from "@/utils/api";

const ProgramEdit = () => {
  const { programId } = useParams();
  const router = useRouter();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allExercises, setAllExercises] = useState([]);

  useEffect(() => {
    if (!programId) return;

    const fetchProgramDetails = async () => {
      try {
        const response = await API.get(`/workouts/program/${programId}`);
        setProgram(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching workout program", error);
        setLoading(false);
      }
    };

    const fetchExercises = async () => {
      try {
        const response = await API.get(`/workouts/exercises`);
        setAllExercises(response.data);
      } catch (error) {
        console.error("Error fetching exercises", error);
      }
    };

    fetchProgramDetails();
    fetchExercises();
  }, [programId]);

  const handleProgramTitleChange = (e) => {
    setProgram((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleExerciseChange = (weekIndex, dayIndex, exIndex, field, value) => {
    setProgram((prev) => {
      const updated = { ...prev };
      updated.weeks[weekIndex].days[dayIndex].workout.workoutExercises[exIndex][
        field
      ] = value;
      return updated;
    });
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      await API.delete(`/workouts/exercise/${exerciseId}`);
      setProgram((prev) => {
        const updated = { ...prev };
        updated.weeks = updated.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) => ({
            ...day,
            workout: {
              ...day.workout,
              workoutExercises: day.workout.workoutExercises.filter(
                (ex) => ex.id !== exerciseId
              ),
            },
          })),
        }));
        return updated;
      });
    } catch (err) {
      console.error("Failed to delete exercise", err);
      alert("Error deleting exercise");
    }
  };

  const saveChanges = async () => {
    try {
      await API.put(`/workouts/program/${programId}`, program);
      alert("Program updated successfully!");
      router.push(`/dashboard/trainer/clients/${program.clientId}`);
    } catch (error) {
      console.error("Error updating program", error);
      alert("Error updating program");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-indigo-300 text-lg mt-10">Loading...</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-2xl text-white">
      <h2 className="text-3xl font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-2">
        Edit Workout Program
      </h2>

      <input
        type="text"
        className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400"
        value={program.title}
        onChange={handleProgramTitleChange}
        placeholder="Program Title"
      />

      {program.weeks.map((week, weekIndex) => (
        <div
          key={week.id}
          className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-indigo-300 mb-2">
            Week {week.weekNumber}
          </h3>

          {week.days.map((day, dayIndex) => (
            <div key={day.id} className="bg-gray-900 p-4 mb-4 rounded-md">
              <h4 className="text-lg font-semibold text-indigo-100 mb-2">
                Day {day.dayNumber}
              </h4>

              {day.workout.workoutExercises.map((exercise, exIndex) => (
                <div
                  key={exercise.id}
                  className="relative bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3"
                >
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded"
                  >
                    Delete
                  </button>
                  <h5 className="text-indigo-300 font-semibold mb-2">
                    {exercise.exercise.name}
                  </h5>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">
                        Sets
                      </label>
                      <input
                        type="number"
                        className="w-20 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={exercise.sets}
                        onChange={(e) =>
                          handleExerciseChange(
                            weekIndex,
                            dayIndex,
                            exIndex,
                            "sets",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">
                        Reps
                      </label>
                      <input
                        type="number"
                        className="w-20 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        value={exercise.reps}
                        onChange={(e) =>
                          handleExerciseChange(
                            weekIndex,
                            dayIndex,
                            exIndex,
                            "reps",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={saveChanges}
        className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-semibold text-white transition"
      >
        Save Changes
      </button>
    </div>
  );
};

export default ProgramEdit;
