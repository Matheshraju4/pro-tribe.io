"use client";

import { AppointmentForm } from "@/components/modules/pages/trainer/appointments/appointment-form";
import AppointmentCard from "@/components/modules/pages/trainer/appointments/appointment-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

// Dummy Data
const dummyAppointments = [
  {
    id: "1",
    appointmentName: "Fitness Consultation",
    appointmentDescription: "Initial fitness assessment and goal setting",
    appointmentDate: new Date("2024-03-20"),
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    appointmentPrice: "50.00",
    appointmentLocation: "Main Gym",
    meetingUrl: "https://zoom.us/j/123456789",
    status: "Scheduled",
    appointpaidStatus: "Paid",
  },
  {
    id: "2",
    appointmentName: "Personal Training Session",
    appointmentDescription: "One-on-one strength training session",
    appointmentDate: new Date("2024-03-21"),
    startTime: "2:00 PM",
    endTime: "3:00 PM",
    appointmentPrice: "75.00",
    appointmentLocation: "Training Room 2",
    status: "Completed",
    appointpaidStatus: "Paid",
  },
  {
    id: "3",
    appointmentName: "Nutrition Consultation",
    appointmentDescription: "Diet planning and nutritional guidance",
    appointmentDate: new Date("2024-03-22"),
    startTime: "11:30 AM",
    endTime: "12:30 PM",
    appointmentPrice: "60.00",
    appointmentLocation: "Online",
    meetingUrl: "https://zoom.us/j/987654321",
    status: "Scheduled",
    appointpaidStatus: "Unpaid",
  },
  {
    id: "4",
    appointmentName: "Group Training Session",
    appointmentDescription: "High-intensity interval training",
    appointmentDate: new Date("2024-03-19"),
    startTime: "9:00 AM",
    endTime: "10:00 AM",
    appointmentPrice: "30.00",
    appointmentLocation: "Group Exercise Room",
    status: "Cancelled",
    appointpaidStatus: "Unpaid",
  },
] as const;

const AppointmentsPage = () => {
  const [open, setOpen] = useState(false);

  const handleEdit = (id: string) => {
    console.log("Edit appointment:", id);
    // Handle edit logic
  };

  const handleDelete = (id: string) => {
    console.log("Delete appointment:", id);
    // Handle delete logic
  };

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

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* @ts-ignore */}

      {dummyAppointments?.length === 0 && (
        <div className="text-center py-12">
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
      <AppointmentForm open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default AppointmentsPage;
