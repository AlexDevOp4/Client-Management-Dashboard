"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import API from "../../../../../utils/api";

const ProgramEdit = () => {
  const { programId } = useParams();
  const router = useRouter();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allExercises, setAllExercises] = useState([]);
  const [completedReps, setCompletedReps] = useState({});

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
        exercise[field] = new Array(exercise.sets).fill("");
      }

      exercise[field][setIndex] = value;
      return updatedProgram;
    });
  };

  const toggleCompletion = (weekIndex, dayIndex, exIndex, setIndex) => {
    const key = `${weekIndex}-${dayIndex}-${exIndex}-${setIndex}`;
    setCompletedReps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const logWorkout = async (logs) => {
    try {
      const responses = await Promise.all(
        logs.map((log) => API.post("/workouts/log", log))
      );
      console.log("All logs posted successfully!", responses);
      return responses;
    } catch (error) {
      console.error("Error posting workout logs:", error);
    }
  };

  const saveChanges = async () => {
    try {
      alert("Program updated successfully!");
      const logData = program.weeks.flatMap((week) =>
        week.days.flatMap((day) =>
          day.workout.workoutExercises.map((exercise) => ({
            workoutId: exercise.workoutId,
            exerciseId: exercise.exerciseId,
            clientId: program.clientId,
            setsCompleted: exercise.sets,
            repsCompleted: exercise.reps,
            weightUsed: exercise.weight,
            notes: "",
            timeInSeconds: exercise.timeInSeconds || 0,
            distanceInMeters: exercise.distanceInMeters || 0,
            programId: programId,
            completed: exercise.sets === exercise.reps.length,
          }))
        )
      );
      console.log(program, "program");
      console.log(logData, "logData");
      // logWorkout(logData);
    } catch (error) {
      console.error("Error updating program", error);
      alert("Error updating program");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-400">Loading program...</p>;
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-6xl bg-gray-900 shadow-2xl rounded-2xl text-gray-100">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-2">
        {program.title}
      </h2>

      {program.weeks.map((week, weekIndex) => (
        <div
          key={week.id}
          className="border border-gray-700 p-4 mt-6 rounded-xl bg-gray-800"
        >
          <h3 className="text-xl font-semibold text-indigo-300 mb-2">
            Week {week.weekNumber}
          </h3>

          {week.days.map((day, dayIndex) => (
            <div
              key={day.id}
              className="border border-gray-700 p-4 mt-4 rounded-lg bg-gray-900"
            >
              <h4 className="text-lg font-semibold text-white mb-3">
                Day {day.dayNumber}
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm md:text-base text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 text-indigo-200 text-center">
                      <th className="p-2">Exercise</th>
                      <th className="p-2">Weight</th>
                      <th className="p-2">Target Reps</th>
                      <th className="p-2">Actual Reps</th>
                      <th className="p-2 text-center">Log</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {day.workout.workoutExercises.map((exercise, exIndex) => (
                      <React.Fragment
                        key={`exercise-${weekIndex}-${dayIndex}-${exIndex}`}
                      >
                        {[...Array(exercise.sets)].map((_, setIndex) => {
                          const key = `${weekIndex}-${dayIndex}-${exIndex}-${setIndex}`;
                          return (
                            <tr
                              key={key}
                              className="border-b border-gray-800 hover:bg-gray-800"
                            >
                              {setIndex === 0 && (
                                <td
                                  className="p-2 font-medium text-indigo-100"
                                  rowSpan={exercise.sets}
                                >
                                  {exercise.exercise.name}
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="number"
                                  className="w-16 sm:w-20 md:w-24 p-1 sm:p-2 rounded bg-gray-700 border border-gray-600 text-white text-center"
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
                                  placeholder="lbs"
                                />
                              </td>
                              <td className="p-2 text-center text-indigo-300 ">
                                {exercise.reps[setIndex]}
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  className="w-16 sm:w-20 md:w-24 p-1 sm:p-2 rounded bg-gray-700 border border-gray-600 text-white text-center"
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
                                  className={`w-6 h-6 rounded-full border-2  transition-all duration-200 ${
                                    completedReps[key]
                                      ? "bg-green-500 border-green-500"
                                      : "bg-gray-800 border-gray-600 hover:border-indigo-400"
                                  }`}
                                >
                                  {completedReps[key] && (
                                    <span className="text-white text-xs font-bold">
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
        className="w-full text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg mt-6 font-semibold transition"
      >
        Save Workout Log
      </button>
    </div>
  );
};

export default ProgramEdit;
