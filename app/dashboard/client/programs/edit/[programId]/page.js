"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import API from "@/utils/api";

const ProgramEdit = () => {
  const { programId } = useParams();
  const router = useRouter();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedReps, setCompletedReps] = useState({});
  const [workoutLogs, setWorkoutLogs] = useState({}); // Key: `${workoutId}-${exerciseId}`

  useEffect(() => {
    if (!programId) return;

    const fetchProgramDetails = async () => {
      try {
        const programRes = await API.get(`/workouts/program/${programId}`);
        setProgram(programRes.data);

        const exercises = programRes.data.weeks.flatMap((week) =>
          week.days.flatMap((day) =>
            day.workout.workoutExercises.map((ex) => ({
              workoutId: ex.workoutId,
              exerciseId: ex.exerciseId,
            }))
          )
        );

        const workoutIds = [...new Set(exercises.map((e) => e.workoutId))];
        const logMap = {};

        await Promise.all(
          workoutIds.map(async (wid) => {
            const res = await API.get(`/workouts/log/${wid}`);
            res.data.forEach((log) => {
              const key = `${log.workoutId}-${log.exerciseId}`;
              const isValid =
                Array.isArray(log.actualReps) && log.actualReps.length;

              if (!isValid) return;

              if (
                !logMap[key] ||
                new Date(log.logDate) > new Date(logMap[key].logDate)
              ) {
                logMap[key] = log;
              }
            });
          })
        );

        setWorkoutLogs(logMap);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching program or logs", err);
        setLoading(false);
      }
    };

    fetchProgramDetails();
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
      const updated = { ...prev };
      const exercise =
        updated.weeks[weekIndex].days[dayIndex].workout.workoutExercises[
          exIndex
        ];
      if (!exercise[field]) exercise[field] = [];
      exercise[field][setIndex] = value;

      const isComplete =
        (exercise.weight?.[setIndex] > 0 &&
          exercise.actualReps?.[setIndex] > 0) ||
        (exercise.calories?.[setIndex] > 0 &&
          exercise.duration?.[setIndex] > 0);

      const key = `${weekIndex}-${dayIndex}-${exIndex}-${setIndex}`;
      setCompletedReps((prev) => ({ ...prev, [key]: isComplete }));

      return updated;
    });
  };

  const updateWorkoutProgram = async (status) => {
    try {
      await API.put(`/workouts/program/status/${programId}`, {
        status,
        completedDate: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating program status", err);
    }
  };

  const logWorkout = async (logs) => {
    try {
      await Promise.all(logs.map((log) => API.post("/workouts/log", log)));
    } catch (err) {
      console.error("Error posting workout logs", err);
    }
  };

  const saveChanges = async () => {
    try {
      const logs = program.weeks.flatMap((week) =>
        week.days.flatMap((day) =>
          day.workout.workoutExercises.map((ex) => ({
            workoutId: ex.workoutId,
            exerciseId: ex.exerciseId,
            clientId: program.clientId,
            setsCompleted: ex.sets,
            repsCompleted: ex.reps,
            weightUsed: ex.weight,
            actualReps: ex.actualReps,
            notes: "",
            timeInSeconds: ex.timeInSeconds || 0,
            distanceInMeters: ex.distanceInMeters || 0,
            programId,
            completed:
              Array.isArray(ex.actualReps) &&
              Array.isArray(ex.weight) &&
              ex.actualReps.length === ex.sets &&
              ex.weight.length === ex.sets,
          }))
        )
      );

      const allComplete = logs.every((log) => log.completed);
      if (allComplete) await updateWorkoutProgram("completed");

      await logWorkout(logs);

      // Refetch latest logs
      const refreshedLogMap = {};
      const workoutIds = [...new Set(logs.map((log) => log.workoutId))];

      await Promise.all(
        workoutIds.map(async (wid) => {
          const res = await API.get(`/workouts/log/${wid}`);
          res.data.forEach((log) => {
            const key = `${log.workoutId}-${log.exerciseId}`;
            if (log.completed && Array.isArray(log.actualReps)) {
              refreshedLogMap[key] = log;
            }
          });
        })
      );

      setWorkoutLogs(refreshedLogMap);
      alert("Workout log saved!");
    } catch (err) {
      console.error("Error saving changes", err);
      alert("Error saving workout.");
    }
  };

  if (loading)
    return <p className="text-center text-gray-400">Loading program...</p>;

  return (
    <div className="mx-auto px-4 py-6 max-w-6xl bg-gray-900 rounded-2xl text-gray-100">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-2">
        {program.title}
      </h2>

      {program.weeks.map((week, weekIdx) => (
        <div
          key={week.id}
          className="bg-gray-800 border border-gray-700 p-4 mt-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-indigo-300 mb-2">
            Week {week.weekNumber}
          </h3>

          {week.days.map((day, dayIdx) => (
            <div
              key={day.id}
              className="bg-gray-900 border border-gray-700 p-4 mt-4 rounded-lg"
            >
              <h4 className="text-lg font-semibold text-white mb-3">
                Day {day.dayNumber}
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-center border-collapse">
                  <thead>
                    <tr className="text-indigo-200 border-b border-gray-700">
                      <th className="p-2">Exercise</th>
                      <th className="p-2">Weight</th>
                      <th className="p-2">Target Reps</th>
                      <th className="p-2">Actual Reps</th>
                      <th className="p-2">Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.workout.workoutExercises.map((exercise, exIdx) => {
                      const keyBase = `${exercise.workoutId}-${exercise.exerciseId}`;
                      const prevLog = workoutLogs[keyBase];

                      return [...Array(exercise.sets)].map((_, setIdx) => {
                        const rowKey = `${weekIdx}-${dayIdx}-${exIdx}-${setIdx}`;
                        return (
                          <tr key={rowKey} className="border-b border-gray-800">
                            {setIdx === 0 && (
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
                                value={exercise.weight?.[setIdx] || ""}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    weekIdx,
                                    dayIdx,
                                    exIdx,
                                    setIdx,
                                    "weight",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder={
                                  prevLog?.weightUsed?.[setIdx] ?? "lbs"
                                }
                                className="w-20 p-2 rounded bg-gray-700 border border-gray-600 text-white text-center"
                              />
                            </td>
                            <td className="p-2 text-indigo-300">
                              {exercise.reps[setIdx]}
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={exercise.actualReps?.[setIdx] || ""}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    weekIdx,
                                    dayIdx,
                                    exIdx,
                                    setIdx,
                                    "actualReps",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder={
                                  prevLog?.actualReps?.[setIdx] ?? "Reps"
                                }
                                className="w-20 p-2 rounded bg-gray-700 border border-gray-600 text-white text-center"
                              />
                            </td>
                            <td className="p-2">
                              <div
                                className={`w-6 h-6 rounded-full border-2 mx-auto ${
                                  completedReps[rowKey]
                                    ? "bg-green-500 border-green-500"
                                    : "bg-gray-800 border-gray-600"
                                }`}
                              >
                                {completedReps[rowKey] && (
                                  <span className="text-white text-xs font-bold">
                                    ✔
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={saveChanges}
        className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
      >
        Save Workout Log
      </button>
    </div>
  );
};

export default ProgramEdit;
