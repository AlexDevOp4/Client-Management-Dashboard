"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import API from "@/utils/api";

const ClientPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clientId } = useParams();

  useEffect(() => {
    if (!clientId) return;

    const fetchPrograms = async () => {
      try {
        const response = await API.get(`/client/programs/${clientId}`);
        console.log(response.data, "response data");
        setPrograms(response.data);
      } catch (error) {
        console.error("Error fetching programs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [clientId]);

  const navigateToProgram = (programId) => {
    window.location.href = `dashboard/client/programs/edit/${programId}`;
  };

  if (loading) return <p className="text-center">Loading programs...</p>;

  const inProgressPrograms = programs.filter((p) => p.status === "active");
  const completedPrograms = programs.filter((p) => p.status !== "active");

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        My Workout Programs
      </h2>

      {/* In Progress Section */}
      {inProgressPrograms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            In Progress
          </h3>
          <div className="space-y-4">
            {inProgressPrograms.map((program) => (
              <div
                key={program.id}
                className="p-4 bg-blue-100 hover:bg-blue-200 cursor-pointer rounded-lg"
                onClick={() => navigateToProgram(program.id)}
              >
                <h4 className="text-lg font-semibold">{program.title}</h4>
                <p className="text-gray-600">
                  Duration: {program.durationWeeks} weeks
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completedPrograms.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Completed
          </h3>
          <div className="space-y-4">
            {completedPrograms.map((program) => (
              <div
                key={program.id}
                className="p-4 bg-gray-200 text-gray-500 rounded-lg opacity-70"
              >
                <h4 className="text-lg font-semibold">{program.title}</h4>
                <p>
                  Completed: {new Date(program.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPrograms;
