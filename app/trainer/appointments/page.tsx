"use client";

import { AppointmentForm } from "@/components/modules/pages/trainer/appointments/appointment-form";
import AppointmentCard from "@/components/modules/pages/trainer/appointments/appointment-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Appointment } from "@/prisma/generated/prisma";
import axios from "axios";
import { NormalLoader } from "@/components/modules/general/loader";
const AppointmentsPage = () => {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    console.log("Edit appointment:", id);
    // Handle edit logic
  };

  const handleDelete = (id: string) => {
    console.log("Delete appointment:", id);
    // Handle delete logic
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get("/api/appointments");

      if (response.data.success) {
        setAppointments(response.data.appointments);
        console.log("Fetched appointments:", response.data.appointments);
      } else {
        setError("Failed to fetch appointments");
      }
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      setError(error.response?.data?.error || "Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage your appointments</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Appointment
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <NormalLoader/>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
            <p className="text-red-700 mt-2">{error}</p>
            <Button
              onClick={fetchAppointments}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Appointments Grid */}
      {!isLoading && !error && appointments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && appointments.length === 0 && (
        <div className="text-center py-12 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No appointments found
          </h3>
          <p className="text-gray-500 mt-1">
            Create your first appointment to get started
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="mt-4 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Appointment
          </Button>
        </div>
      )}

      {/* Create Appointment Form Dialog */}
      <AppointmentForm
        open={open}
        onOpenChange={setOpen}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default AppointmentsPage;
