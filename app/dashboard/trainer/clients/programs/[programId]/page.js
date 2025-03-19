"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import API from "../../../../../utils/api";

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
      const updatedProgram = { ...prev };
      updatedProgram.weeks[weekIndex].days[dayIndex].workout.workoutExercises[
        exIndex
      ][field] = value;
      return updatedProgram;
    });
  };

  const saveChanges = async () => {
    try {
      await API.put(`/workouts/program/${programId}`, program);
      alert("Program updated successfully!");
      router.push(`/dashboard/trainer/clients/${program.clientId}`); // Redirect back to the client profile
    } catch (error) {
      console.error("Error updating program", error);
      alert("Error updating program");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading program...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Edit Workout Program
      </h2>
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-4"
        value={program.title}
        onChange={handleProgramTitleChange}
      />

      {program.weeks.map((week, weekIndex) => (
        <div key={week.id} className="border p-4 mt-4">
          <h3 className="text-lg font-semibold">Week {week.weekNumber}</h3>

          {week.days.map((day, dayIndex) => (
            <div key={day.id} className="border p-2 mt-2">
              <h4 className="text-md font-semibold">Day {day.dayNumber}</h4>

              {day.workout.workoutExercises.map((exercise, exIndex) => (
                <div key={exercise.id} className="mt-2 p-2 bg-gray-100 rounded">
                  <h5 className="font-medium">{exercise.exercise.name}</h5>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="p-2 border rounded-md w-20"
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
                      placeholder="Sets"
                    />
                    <input
                      type="number"
                      className="p-2 border rounded-md w-20"
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
                      placeholder="Reps"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={saveChanges}
        className="w-full bg-blue-600 text-white py-2 rounded-md mt-4 hover:bg-blue-700 transition"
      >
        Save Changes
      </button>
    </div>
  );
};

export default ProgramEdit;
