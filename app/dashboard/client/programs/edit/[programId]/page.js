"use client";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useState, useEffect } from "react";
import API from "../../../../../utils/api";
//http://localhost:3000/dashboard/client/programs/edit/807083a0-3278-43ba-9d26-75d7aa0737fb
//1262a74c-b7ba-4c80-8f75-9fae78641be0
const ProgramEdit = () => {
  const { programId } = useParams();
  const router = useRouter();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allExercises, setAllExercises] = useState([]);
  const [completedReps, setCompletedReps] = useState({});

  useEffect(() => {
    console.log(window.location.href.split("/").pop());
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

  const handleExerciseChange = (
    weekIndex,
    dayIndex,
    exIndex,
    setIndex,
    field,
    value
  ) => {
    setProgram((prev) => {
      const updatedProgram = { ...prev };
      const exercise =
        updatedProgram.weeks[weekIndex].days[dayIndex].workout.workoutExercises[
          exIndex
        ];

      if (!exercise[field]) {
        exercise[field] = new Array(exercise.sets).fill(""); // Initialize array if empty
      }

      exercise[field][setIndex] = value; // Update only the specific set value

      return updatedProgram;
    });
  };

  const toggleCompletion = (weekIndex, dayIndex, exIndex, setIndex) => {
    const key = `${weekIndex}-${dayIndex}-${exIndex}-${setIndex}`;
    setCompletedReps((prev) => {
      const updated = { ...prev };
      updated[key] = !updated[key];
      return updated;
    });
  };

  const logWorkout = async (logs) => {
    try {
      // Map each log to an API request
      const requests = logs.map(
        (log) => API.post("/workouts/log", log) // Adjust API endpoint as needed
      );

      // Execute all requests concurrently
      const responses = await Promise.all(requests);

      console.log("All logs posted successfully!", responses);
      return responses;
    } catch (error) {
      console.error("Error posting workout logs:", error);
    }
  };

  const saveChanges = async () => {
    try {
      // await API.put(`/workouts/program/${programId}`, program);
      alert("Program updated successfully!");
      // router.push(`/dashboard/trainer/clients/${program.clientId}`);

      const logData = program.weeks.flatMap((week) =>
        week.days.flatMap((day) =>
          day.workout.workoutExercises.flatMap((exercise) => ({
            workoutId: exercise.workoutId,
            exerciseId: exercise.exerciseId,
            clientId: program.clientId,
            setsCompleted: exercise.sets,
            repsCompleted: exercise.reps,
            weightUsed: exercise.weight,
            notes: "",
            timeInSeconds: exercise.timeInSeconds || 0,
            distanceInMeters: exercise.distanceInMeters || 0,
            programId: window.location.href.split("/").pop(),
            completed: exercise.sets === exercise.reps.length,
          }))
        )
      );

      logWorkout(logData);
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
        {program.title}
      </h2>

      {program.weeks.map((week, weekIndex) => (
        <div key={week.id} className="border p-4 mt-4 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700">
            Week {week.weekNumber}
          </h3>

          {week.days.map((day, dayIndex) => (
            <div
              key={day.id}
              className="border p-2 mt-2 rounded-lg bg-white shadow-sm"
            >
              <h4 className="text-md font-semibold text-gray-800">
                Day {day.dayNumber}
              </h4>
              <div className="mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Exercise</th>
                      <th className="p-2">Weight</th>
                      <th className="p-2">Target Reps</th>
                      <th className="p-2">Actual Reps</th>
                      <th className="p-2">Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.workout.workoutExercises.map((exercise, exIndex) => (
                      <React.Fragment
                        key={`exercise-${weekIndex}-${dayIndex}-${exIndex}`}
                      >
                        {[...Array(exercise.sets)].map((_, setIndex) => {
                          const key = `${weekIndex}-${dayIndex}-${exIndex}-${setIndex}`;
                          return (
                            <tr key={key} className="border-b">
                              {setIndex === 0 && (
                                <td
                                  className="p-2 font-semibold"
                                  rowSpan={exercise.sets}
                                >
                                  {exercise.exercise.name}
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="number"
                                  className="w-16 p-1 border rounded-md"
                                  value={exercise.weight?.[setIndex] || ""}
                                  onChange={(e) =>
                                    handleExerciseChange(
                                      weekIndex,
                                      dayIndex,
                                      exIndex,
                                      setIndex,
                                      "weight",
                                      Number(e.target.value)
                                    )
                                  }
                                  placeholder="Weight"
                                />
                              </td>
                              <td className="p-2">{exercise.reps[setIndex]}</td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  className="w-16 p-1 border rounded-md"
                                  value={exercise.actualReps?.[setIndex] || ""}
                                  onChange={(e) =>
                                    handleExerciseChange(
                                      weekIndex,
                                      dayIndex,
                                      exIndex,
                                      setIndex,
                                      "actualReps",
                                      Number(e.target.value)
                                    )
                                  }
                                  placeholder="Reps"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() =>
                                    toggleCompletion(
                                      weekIndex,
                                      dayIndex,
                                      exIndex,
                                      setIndex
                                    )
                                  }
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    completedReps[key]
                                      ? "bg-green-500 border-green-500"
                                      : "bg-white border-gray-300"
                                  }`}
                                >
                                  {completedReps[key] && (
                                    <span className="text-white font-bold">
                                      ✔
                                    </span>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
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
