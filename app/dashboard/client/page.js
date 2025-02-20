"use client";
import { useEffect, useState } from "react";
import API from "../../utils/api";

const ClientDashboard = () => {
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/auth/me");
        const user = await API.get(`/user/${response.data.user.id}`);
        setClientData(user.data);
      } catch (error) {
        console.error("Error fetching client profile", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Client Dashboard</h1>

      {clientData ? (
        <div className="border p-4 mt-4">
          <p>
            <strong>Name:</strong> {clientData.clientProfile.name}
          </p>
          <p>
            <strong>Email:</strong> {clientData.email}
          </p>
          <p>
            <strong>Age:</strong> {clientData.clientProfile.age}
          </p>
          <p>
            <strong>Weight:</strong> {clientData.clientProfile.weight} lbs
          </p>
          <p>
            <strong>Body Fat:</strong> {clientData.clientProfile.bodyFat}%
          </p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default ClientDashboard;
