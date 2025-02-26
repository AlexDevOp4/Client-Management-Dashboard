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

  /** Fetch Trainer's Clients **/
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/auth/me");
        setTrainerId(response.data.user.id);
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await API.get(`/trainer/clients`);
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };

    fetchUser();
    fetchClients();
  }, []);

  /** Fetch Available Exercises **/
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

  /** Add Exercise to Workout **/
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

    if (
      newExercise.category === "Cardio" &&
      (!newExercise.timeInSeconds || !newExercise.distanceInMeters)
    ) {
      alert("Time and distance are required for Cardio exercises.");
      return;
    }

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

  /** Submit Workout **/
  const submitWorkout = async () => {
    if (!selectedClient || !title || !scheduledDate || exercises.length === 0) {
      alert("Please fill in all fields before submitting.");
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
          <option key={client.id} value={client.userId}>
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
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    timeInSeconds: Number(e.target.value),
                  })
                }
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
        className="w-full bg-blue-600 text-white py-2 rounded-md mt-4"
      >
        Add Exercise
      </button>
    </div>
  );
};

export default CreateWorkout;
