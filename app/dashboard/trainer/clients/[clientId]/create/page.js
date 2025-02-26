"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import API from "../../../../../utils/api";

const CreateWorkout = () => {
  const [clients, setClients] = useState([]);
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [userData, setUserData] = useState(null);
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
    sets: "",
    reps: "",
    timeInSeconds: "",
    distanceInMeters: "",
  });

  const { clientId } = useParams();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const foundExercise = allExercises.find((ex) => ex.name === value);
      if (foundExercise) {
        setNewExercise({
          ...newExercise,
          name: value,
          category: foundExercise.category, // Auto-fill category
        });
      } else {
        setNewExercise({
          ...newExercise,
          name: value,
          category: "", // Reset if not found
        });
      }
    } else {
      setNewExercise((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/auth/me");
        setUserData(response.data.user.id);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchUser();
  }, []);

  /** ✅ Fetch Trainer's Clients **/
  useEffect(() => {
    if (!clientId) return; // Prevents running with undefined clientId

    const fetchClients = async () => {
      try {
        const response = await API.get(`/trainer/clients`);
        const filteredClients = response.data.filter(
          (client) => client.userId === clientId
        );
        setClients(filteredClients);
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };
    fetchClients();
  }, [clientId]);

  /** ✅ Fetch Available Exercises **/
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await API.get(`workouts/exercises`);
        setAllExercises(response.data);
      } catch (error) {
        console.error("Error fetching exercises", error);
      }
    };
    fetchExercises();
  }, []);

  /** ✅ Add Exercise to Workout **/
  const addExercise = () => {
    if (!newExercise.name || !newExercise.category) {
      alert("Exercise name and category are required.");
      return;
    }

    if (
      newExercise.category === "Strength" &&
      (!newExercise.sets || !newExercise.reps)
    ) {
      alert("Sets and reps are required for Strength exercises.");
      return;
    }

    setExercises([...exercises, newExercise]);
    setNewExercise({
      name: "",
      category: "",
      sets: "",
      reps: "",
      timeInSeconds: "",
      distanceInMeters: "",
    });
  };

  /** ✅ Submit Workout **/
  const submitWorkout = async () => {
    if (!title || !scheduledDate || exercises.length === 0) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    try {
      await API.post("/workouts/create", {
        trainerId: userData, // Replace with actual trainer ID
        clientId,
        title,
        scheduledDate,
        exercises,
      });

      alert("Workout Created Successfully!");
      setTitle("");
      setScheduledDate("");
      setExercises([]);
    } catch (error) {
      console.error("Error creating workout", error);
      alert("Error creating workout");
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }


  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Create Workout
      </h2>

      {/* Select Client */}
      <label className="block text-gray-700 font-medium mb-2">
        Selected Client: {clients[0]?.name || "Loading..."}
      </label>

      {/* Workout Details */}
      <label className="block text-gray-700 font-medium mb-2">
        Workout Title:
      </label>
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="block text-gray-700 font-medium mb-2">
        Scheduled Date:
      </label>
      <input
        type="date"
        className="w-full p-2 border rounded-md mb-4"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
      />

      {/* Select Exercise */}
      <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">
        Add Exercises:
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium">Name:</label>
          <input
            type="text"
            list="exercise-list"
            className="w-full p-2 border rounded-md mb-2"
            value={newExercise.name}
            onChange={(e) =>
              setNewExercise({ ...newExercise, name: e.target.value })
            }
          />
          <datalist id="exercise-list">
            {allExercises.map((exercise) => (
              <option key={exercise.id} value={exercise.name} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Category:</label>
          <select
            className="w-full p-2 border rounded-md mb-2"
            value={newExercise.category}
            onChange={(e) =>
              setNewExercise({
                ...newExercise,
                category: e.target.value,
              })
            }
          >
            <option value="">-- Select Category --</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
          </select>
        </div>

        {/* Conditionally Render Inputs */}
        {newExercise.category === "Strength" && (
          <>
            <div>
              <label className="block text-gray-700 font-medium">Sets:</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md mb-2"
                value={newExercise.sets}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    sets: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Reps:</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md mb-2"
                value={newExercise.reps}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    reps: Number(e.target.value),
                  })
                }
              />
            </div>
          </>
        )}

        {newExercise.category === "Cardio" && (
          <>
            <div>
              <label className="block text-gray-700 font-medium">
                Time (seconds):
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md mb-2"
                value={newExercise.timeInSeconds}
                onChange={(e) => {
                  setNewExercise({
                    ...newExercise,
                    timeInSeconds: Number(e.target.value),
                  });
                }}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Distance (meters):
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md mb-2"
                value={newExercise.distanceInMeters}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    distanceInMeters: Number(e.target.value),
                  })
                }
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={addExercise}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Add Exercise
      </button>

      {/* Display Added Exercises */}
      <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">
        Workout Exercises:
      </h3>
      <ul className="list-disc pl-5">
        {exercises.map((exercise, index) => (
          <li key={index} className="text-gray-600">
            {exercise.category === "Strength"
              ? `${exercise.name} - ${exercise.sets} sets x ${exercise.reps} reps`
              : `${exercise.name}${
                  exercise.timeInSeconds
                    ? ` - ${exercise.timeInSeconds} seconds`
                    : ""
                }${exercise.distanceInMeters ? ` - ${exercise.distanceInMeters} meters` : ""}`}
          </li>
        ))}
      </ul>

      <button
        onClick={submitWorkout}
        className="w-full bg-green-600 text-white py-2 rounded-md mt-4 hover:bg-green-700 transition"
      >
        Create Workout
      </button>
    </div>
  );
};

export default CreateWorkout;
