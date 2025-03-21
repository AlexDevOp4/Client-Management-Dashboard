"use client";
import { useState, useEffect } from "react";
import API from "../../../../utils/api";

const CreateWorkout = () => {
  const [clients, setClients] = useState([]);
  const [trainerId, setTrainerId] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
    sets: 0,
    reps: 0,
    timeInSeconds: 0,
    distanceInMeters: 0,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const res = await API.get("/auth/me");
      setTrainerId(res.data.user.id);
    };
    const fetchClients = async () => {
      const res = await API.get(`/trainer/clients`);
      setClients(res.data);
    };

    fetchUser();
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      const res = await API.get(`workouts/exercises`);
      setAllExercises(res.data);
    };
    fetchExercises();
  }, []);

  const addExercise = () => {
    const { name, category, sets, reps, timeInSeconds, distanceInMeters } =
      newExercise;

    if (!name || !category) return alert("Name and category required.");

    if (category === "Strength" && (!sets || !reps))
      return alert("Sets and reps required for strength.");

    if (category === "Cardio" && (!timeInSeconds || !distanceInMeters))
      return alert("Time and distance required for cardio.");

    setExercises([...exercises, newExercise]);
    setNewExercise({
      name: "",
      category: "",
      sets: 0,
      reps: 0,
      timeInSeconds: 0,
      distanceInMeters: 0,
    });
  };

  const submitWorkout = async () => {
    if (!selectedClient || !title || !scheduledDate || exercises.length === 0) {
      alert("Fill all fields before submitting.");
      return;
    }

    try {
      await API.post("/workouts/create", {
        trainerId,
        clientId: selectedClient,
        title,
        scheduledDate,
        exercises,
      });

      alert("Workout created!");
      setTitle("");
      setScheduledDate("");
      setExercises([]);
      setSelectedClient("");
    } catch (err) {
      console.error("Error creating workout", err);
      alert("Error creating workout");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-2">
        Create Workout
      </h2>

      {/* Select Client */}
      <label className="block text-sm text-gray-300 mb-1">Client</label>
      <select
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-4"
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
      >
        <option value="">-- Select Client --</option>
        {clients.map((client) => (
          <option key={client.id} value={client.userId}>
            {client.name}
          </option>
        ))}
      </select>

      {/* Title */}
      <label className="block text-sm text-gray-300 mb-1">Workout Title</label>
      <input
        type="text"
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Date */}
      <label className="block text-sm text-gray-300 mb-1">Scheduled Date</label>
      <input
        type="date"
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-6"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
      />

      {/* Add Exercise */}
      <h3 className="text-lg font-semibold text-indigo-300 mb-4">
        Add Exercise
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Name</label>
          <input
            type="text"
            className="w-full p-2 bg-gray-800 border border-gray-600 text-white rounded"
            value={newExercise.name}
            onChange={(e) =>
              setNewExercise({ ...newExercise, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Category</label>
          <select
            className="w-full p-2 bg-gray-800 border border-gray-600 text-white rounded"
            value={newExercise.category}
            onChange={(e) =>
              setNewExercise({
                ...newExercise,
                category: e.target.value,
                sets: 0,
                reps: 0,
                timeInSeconds: 0,
                distanceInMeters: 0,
              })
            }
          >
            <option value="">-- Select Category --</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
          </select>
        </div>

        {newExercise.category === "Strength" && (
          <>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Sets</label>
              <input
                type="number"
                className="w-full p-2 bg-gray-800 border border-gray-600 text-white rounded"
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
              <label className="block text-sm text-gray-300 mb-1">Reps</label>
              <input
                type="number"
                className="w-full p-2 bg-gray-800 border border-gray-600 text-white rounded"
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
              <label className="block text-sm text-gray-300 mb-1">
                Time (seconds)
              </label>
              <input
                type="number"
                className="w-full p-2 bg-gray-800 border border-gray-600 text-white rounded"
                value={newExercise.timeInSeconds}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    timeInSeconds: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Distance (meters)
              </label>
              <input
                type="number"
                className="w-full p-2 bg-gray-800 border border-gray-600 text-white rounded"
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
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
      >
        + Add Exercise
      </button>

      {/* Submit */}
      <button
        onClick={submitWorkout}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold tracking-wide transition"
      >
        Create Workout
      </button>
    </div>
  );
};

export default CreateWorkout;
