"use client";
import { useState, useEffect } from "react";
import API from "../../../utils/api";

const CreateWorkout = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
    sets: "",
    reps: "",
  });

  /** ✅ Fetch Trainer's Clients **/
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await API.get(`/trainer/clients`);
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };
    fetchClients();
  }, []);

  /** ✅ Fetch Available Exercises **/
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await API.get(`/exercises`);
        setAllExercises(response.data);
      } catch (error) {
        console.error("Error fetching exercises", error);
      }
    };
    fetchExercises();
  }, []);

  /** ✅ Add Exercise to Workout **/
  const addExercise = () => {
    if (
      !newExercise.name ||
      !newExercise.category ||
      !newExercise.sets ||
      !newExercise.reps
    ) {
      alert("All fields are required.");
      return;
    }
    setExercises([...exercises, newExercise]);
    setNewExercise({ name: "", category: "", sets: "", reps: "" });
  };

  /** ✅ Submit Workout **/
  const submitWorkout = async () => {
    if (!selectedClient || !title || !scheduledDate || exercises.length === 0) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    try {
      await API.post("/workouts", {
        trainerId: "YOUR_TRAINER_ID_HERE", // Replace with actual trainer ID
        clientId: selectedClient,
        title,
        scheduledDate,
        exercises,
      });
      alert("Workout Created Successfully!");
      setTitle("");
      setScheduledDate("");
      setExercises([]);
      setSelectedClient("");
    } catch (error) {
      console.error("Error creating workout", error);
      alert("Error creating workout");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Create Workout
      </h2>

      {/* Select Client */}
      <label className="block text-gray-700 font-medium mb-2">
        Select Client:
      </label>
      <select
        className="w-full p-2 border rounded-md mb-4"
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
      >
        <option value="">-- Select Client --</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

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
            className="w-full p-2 border rounded-md mb-2"
            value={newExercise.name}
            onChange={(e) =>
              setNewExercise({ ...newExercise, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Category:</label>
          <select
            className="w-full p-2 border rounded-md mb-2"
            value={newExercise.category}
            onChange={(e) =>
              setNewExercise({ ...newExercise, category: e.target.value })
            }
          >
            <option value="">-- Select Category --</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Sets:</label>
          <input
            type="number"
            className="w-full p-2 border rounded-md mb-2"
            value={newExercise.sets}
            onChange={(e) =>
              setNewExercise({ ...newExercise, sets: e.target.value })
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
              setNewExercise({ ...newExercise, reps: e.target.value })
            }
          />
        </div>
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
            {exercise.name} - {exercise.sets} x {exercise.reps} (
            {exercise.category})
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
