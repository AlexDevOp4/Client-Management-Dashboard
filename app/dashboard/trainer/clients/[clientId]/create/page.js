"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import API from "../../../../../utils/api";

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
    setWeeks((prevWeeks) => [
      ...prevWeeks,
      { weekNumber: prevWeeks.length + 1, days: [] },
    ]);
  };

  const addDay = (weekIndex) => {
    setWeeks((prevWeeks) => {
      const updatedWeeks = [...prevWeeks];
      updatedWeeks[weekIndex].days.push({
        dayNumber: updatedWeeks[weekIndex].days.length + 1,
        exercises: [],
      });
      return updatedWeeks;
    });
  };

  const addExerciseToDay = (weekIndex, dayIndex, exercise) => {
    setWeeks((prevWeeks) => {
      return prevWeeks.map((week, wIndex) => {
        if (wIndex !== weekIndex) return week; // Keep other weeks unchanged

        return {
          ...week,
          days: week.days.map((day, dIndex) => {
            if (dIndex !== dayIndex) return day; // Keep other days unchanged

            return {
              ...day,
              exercises: [...day.exercises, { ...exercise }], // ✅ Append exercise properly
            };
          }),
        };
      });
    });

    console.log(
      `Exercise added to week ${weekIndex}, day ${dayIndex}:`,
      exercise
    );
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
      repeateWeek: 1, // Defaults to repeating week 1
      weeks: weeks.map((week) => ({
        weekNumber: week.weekNumber,
        days: week.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: `Day ${day.dayNumber}`,
          scheduledDate: new Date(), // Assigns today as default
          exercises: day.exercises.map((ex) => ({
            name: ex.name,
            category: ex.category,
            sets: ex.sets ? parseInt(ex.sets) : null,
            reps: Array.isArray(ex.reps)
              ? ex.reps.map((rep) => parseInt(rep))
              : [], // Ensure it's an array of numbers
            distance: ex.distance ? parseFloat(ex.distance) : null,
            calories: ex.calories ? parseFloat(ex.calories) : null,
          })),
        })),
      })),
    };

    try {
      console.log(requestBody);
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
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Create Workout Program
      </h2>
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-4"
        placeholder="Program Title"
        value={programTitle}
        onChange={(e) => setProgramTitle(e.target.value)}
      />
      <button onClick={addWeek} className="bg-blue-500 text-white p-2 rounded">
        Add Week
      </button>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="border p-4 mt-4">
          <h3 className="text-lg font-semibold">Week {week.weekNumber}</h3>
          <button
            onClick={() => addDay(weekIndex)}
            className="bg-green-500 text-white p-2 rounded mt-2"
          >
            Add Day
          </button>

          {week.days.map((day, dayIndex) => (
            <div key={dayIndex} className="border p-2 mt-2">
              <h4 className="text-md font-semibold">Day {day.dayNumber}</h4>
              <ExerciseForm
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                addExerciseToDay={addExerciseToDay}
                allExercises={allExercises}
              />

              <ul className="list-disc pl-5">
                {day.exercises.map((exercise, exIndex) => (
                  <li key={exIndex} className="text-gray-600">
                    {exercise.name} -{" "}
                    {exercise.sets
                      ? `${exercise.sets} sets x ${exercise.reps} reps`
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
        className="w-full bg-green-600 text-white py-2 rounded-md mt-4 hover:bg-green-700 transition"
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
    reps: "",
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
      // Convert the comma-separated input into an array of numbers
      setExercise((prev) => ({
        ...prev,
        reps: value.split(",").map((rep) => parseInt(rep.trim(), 10) || 0),
      }));
    } else {
      setExercise((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Refresh inputs after adding exercises
  const refreshInputs = () => {
    setExercise({
      name: "",
      category: "",
      sets: "",
      reps: "",
      distance: "",
      calories: "",
    });
  };

  return (
    <div className="mt-4">
      <input
        type="text"
        list="exercise-list"
        className="w-full p-2 border rounded-md mb-2"
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
        className="w-full p-2 border rounded-md mb-2"
        name="category"
        value={exercise.category}
        onChange={(e) => setExercise({ ...exercise, category: e.target.value })}
      >
        <option value="">-- Select Category --</option>
        <option value="Strength">Strength</option>
        <option value="Cardio">Cardio</option>
      </select>
      {exercise.category === "Strength" ? (
        <>
          <input
            type="number"
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Sets"
            name="sets"
            onChange={handleExerciseChange}
          />
          <input
            type="text" // Change to text to allow comma-separated values
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Reps (comma separated)"
            name="reps"
            value={exercise.reps.join(", ")} // Display as comma-separated
            onChange={handleExerciseChange}
          />
        </>
      ) : exercise.category === "Cardio" ? (
        <>
          <input
            type="number"
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Distance (m)"
            name="distance"
            onChange={handleExerciseChange}
          />
          <input
            type="number"
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Calories"
            name="calories"
            onChange={handleExerciseChange}
          />
        </>
      ) : null}
      <button
        onClick={() => {
          console.log("Adding exercise:", exercise); // Debug before adding
          addExerciseToDay(weekIndex, dayIndex, exercise);
          refreshInputs();
        }}
        className="bg-blue-600 text-white p-2 rounded"
      >
        Add Exercise
      </button>
    </div>
  );
};

export default CreateWorkoutProgram;
