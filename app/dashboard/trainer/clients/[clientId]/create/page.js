"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/solid";
import API from "@/utils/api";

const CreateWorkoutProgram = () => {
  const [programTitle, setProgramTitle] = useState("");
  const [weeks, setWeeks] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [trainerId, setTrainerId] = useState(null);
  const { clientId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/auth/me");
        setTrainerId(response.data.user.id);
      } catch (error) {
        console.error("Error fetching trainer ID", error);
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

    fetchUser();
    fetchExercises();
  }, []);

  const addWeek = () => {
    setWeeks((prev) => [...prev, { weekNumber: prev.length + 1, days: [] }]);
  };

  const addDay = (weekIndex) => {
    setWeeks((prev) => {
      const updated = [...prev];
      updated[weekIndex].days.push({
        dayNumber: updated[weekIndex].days.length + 1,
        exercises: [],
      });
      return updated;
    });
  };

  const deleteWeek = (index) => {
    const confirmDelete = confirm("Are you sure you want to delete this week?");
    if (!confirmDelete) return;

    setWeeks((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteDay = (weekIndex, dayIndex) => {
    const confirmDelete = confirm("Delete this day?");
    if (!confirmDelete) return;

    setWeeks((prev) => {
      const updated = [...prev];
      updated[weekIndex].days = updated[weekIndex].days.filter(
        (_, i) => i !== dayIndex
      );
      return updated;
    });
  };

  const addExerciseToDay = (weekIndex, dayIndex, exercise) => {
    setWeeks((prev) => {
      return prev.map((week, wIndex) => {
        if (wIndex !== weekIndex) return week;
        return {
          ...week,
          days: week.days.map((day, dIndex) => {
            if (dIndex !== dayIndex) return day;
            return {
              ...day,
              exercises: [...day.exercises, { ...exercise }],
            };
          }),
        };
      });
    });
  };

  const submitWorkoutProgram = async () => {
    if (!trainerId || !clientId || !programTitle || weeks.length === 0) {
      alert("Please enter a program title and add at least one week.");
      return;
    }

    const requestBody = {
      trainerId,
      clientId,
      title: programTitle,
      durationWeeks: weeks.length,
      repeateWeek: 1,
      weeks: weeks.map((week) => ({
        weekNumber: week.weekNumber,
        days: week.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: `Day ${day.dayNumber}`,
          scheduledDate: new Date(),
          exercises: day.exercises.map((ex) => ({
            name: ex.name,
            category: ex.category,
            sets: ex.sets ? parseInt(ex.sets) : null,
            reps: Array.isArray(ex.reps)
              ? ex.reps.map((rep) => parseInt(rep))
              : [],
            distance: ex.distance ? parseFloat(ex.distance) : null,
            calories: ex.calories ? parseFloat(ex.calories) : null,
          })),
        })),
      })),
    };

    try {
      await API.post("/workouts/program", requestBody);
      alert("Workout Program Created Successfully!");
      setProgramTitle("");
      setWeeks([]);
    } catch (error) {
      console.error("Error creating workout program", error);
      alert("Error creating workout program");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 shadow-lg rounded-xl text-white">
      <h2 className="text-3xl font-bold text-indigo-400 mb-4">
        Create Workout Program
      </h2>
      <input
        type="text"
        className="w-full p-3 border rounded-md mb-4 bg-gray-800 border-gray-600 text-white"
        placeholder="Program Title"
        value={programTitle}
        onChange={(e) => setProgramTitle(e.target.value)}
      />
      <button
        onClick={addWeek}
        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded mb-6"
      >
        + Add Week
      </button>

      {weeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className="border border-gray-700 p-4 mt-4 rounded-xl bg-gray-800"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-indigo-300">
              Week {week.weekNumber}
            </h3>
            <button
              onClick={() => deleteWeek(weekIndex)}
              className="text-sm text-red-500 hover:underline"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => addDay(weekIndex)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mt-2"
          >
            + Add Day
          </button>

          {week.days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="mt-4 border border-gray-600 rounded p-4 bg-gray-900"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-indigo-200">
                  Day {day.dayNumber}
                </h4>
                <button
                  onClick={() => deleteDay(weekIndex, dayIndex)}
                  className="text-sm text-red-500 hover:underline"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <ExerciseForm
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                addExerciseToDay={addExerciseToDay}
                allExercises={allExercises}
              />

              <ul className="list-disc pl-5 mt-2 text-gray-300">
                {day.exercises.map((exercise, exIndex) => (
                  <li key={exIndex}>
                    {exercise.name} —{" "}
                    {exercise.sets
                      ? `${exercise.sets} sets x ${exercise.reps.join(", ")} reps`
                      : `${exercise.distance}m, ${exercise.calories} cal`}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={submitWorkoutProgram}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mt-6"
      >
        Save Program
      </button>
    </div>
  );
};

const ExerciseForm = ({
  weekIndex,
  dayIndex,
  addExerciseToDay,
  allExercises,
}) => {
  const [exercise, setExercise] = useState({
    name: "",
    category: "",
    sets: "",
    reps: [],
    distance: "",
    calories: "",
  });

  const handleExerciseChange = (e) => {
    const { name, value } = e.target;
    const foundExercise = allExercises.find((ex) => ex.name === value);

    if (name === "name" && foundExercise) {
      setExercise({
        ...foundExercise,
        sets: "",
        reps: [],
        distance: "",
        calories: "",
      });
    } else if (name === "reps") {
      setExercise((prev) => ({
        ...prev,
        reps: value.split(",").map((rep) => parseInt(rep.trim(), 10) || 0),
      }));
    } else {
      setExercise((prev) => ({ ...prev, [name]: value }));
    }
  };

  const refreshInputs = () => {
    setExercise({
      name: "",
      category: "",
      sets: "",
      reps: [],
      distance: "",
      calories: "",
    });
  };

  return (
    <div className="mt-4">
      <input
        type="text"
        list="exercise-list"
        className="w-full p-2 border rounded-md mb-2 bg-gray-800 border-gray-600 text-white"
        placeholder="Exercise Name"
        name="name"
        value={exercise.name}
        onChange={handleExerciseChange}
      />
      <datalist id="exercise-list">
        {allExercises.map((ex) => (
          <option key={ex.id} value={ex.name} />
        ))}
      </datalist>

      <select
        className="w-full p-2 border rounded-md mb-2 bg-gray-800 border-gray-600 text-white"
        name="category"
        value={exercise.category}
        onChange={(e) => setExercise({ ...exercise, category: e.target.value })}
      >
        <option value="">-- Select Category --</option>
        <option value="Strength">Strength</option>
        <option value="Cardio">Cardio</option>
      </select>

      {exercise.category === "Strength" && (
        <>
          <input
            type="number"
            name="sets"
            className="w-full p-2 border rounded-md mb-2 bg-gray-800 border-gray-600 text-white"
            placeholder="Sets"
            onChange={handleExerciseChange}
          />
          <input
            type="text"
            name="reps"
            className="w-full p-2 border rounded-md mb-2 bg-gray-800 border-gray-600 text-white"
            placeholder="Reps (comma separated)"
            value={exercise.reps.join(", ")}
            onChange={handleExerciseChange}
          />
        </>
      )}

      {exercise.category === "Cardio" && (
        <>
          <input
            type="number"
            name="distance"
            className="w-full p-2 border rounded-md mb-2 bg-gray-800 border-gray-600 text-white"
            placeholder="Distance (m)"
            onChange={handleExerciseChange}
          />
          <input
            type="number"
            name="calories"
            className="w-full p-2 border rounded-md mb-2 bg-gray-800 border-gray-600 text-white"
            placeholder="Calories"
            onChange={handleExerciseChange}
          />
        </>
      )}

      <button
        onClick={() => {
          addExerciseToDay(weekIndex, dayIndex, exercise);
          refreshInputs();
        }}
        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Add Exercise
      </button>
    </div>
  );
};

export default CreateWorkoutProgram;
