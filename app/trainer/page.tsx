"use client";

import { useState, useEffect } from "react";
import { setHours, setMinutes } from "date-fns";

import { EventCalendar, type CalendarEvent } from "@/components/event-calendar";
import { NormalLoader } from "@/components/modules/general/loader";

// Define the appointment data structure from the API response
interface AppointmentData {
  id: string;
  appointmentName: string;
  appointmentDescription?: string;
  appointmentDate: string;
  appointmentPrice?: string;
  location?: string;
  meetingUrl?: string;
  startTime: string;
  endTime: string;
  appointpaidStatus: "Paid" | "Unpaid";
  status: "Scheduled" | "Cancelled" | "Completed";
  appointmentLocation: string;
  trainerId: string;
  clientId: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  session: {
    id: string;
    sessionName: string;
    sessionDescription?: string;
  };
}

// Function to convert 12-hour time format to 24-hour format
const convertTo24Hour = (
  time12h: string
): { hours: number; minutes: number } => {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  } else if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

// Function to transform appointment data to calendar events
const transformAppointmentToEvent = (
  appointment: AppointmentData
): CalendarEvent => {
  // Parse the appointment date
  const appointmentDate = new Date(appointment.appointmentDate);

  // Convert start and end times to 24-hour format
  const startTime = convertTo24Hour(appointment.startTime);
  const endTime = convertTo24Hour(appointment.endTime);

  // Create start and end dates with proper times
  const startDate = setMinutes(
    setHours(appointmentDate, startTime.hours),
    startTime.minutes
  );
  const endDate = setMinutes(
    setHours(appointmentDate, endTime.hours),
    endTime.minutes
  );

  // Determine color based on status
  const getStatusColor = (
    status: string,
    paidStatus: string
  ): CalendarEvent["color"] => {
    if (status === "Cancelled") return "rose";
    if (status === "Completed") return "emerald";
    if (paidStatus === "Paid") return "sky";
    return "amber";
  };

  // Create client name for display
  const clientName = `${appointment.client.firstName} ${appointment.client.lastName}`;

  // Create title with session name and client
  const title = `${appointment.session.sessionName} - ${clientName}`;

  return {
    id: appointment.id,
    title,
    description:
      appointment.appointmentDescription ||
      appointment.session.sessionDescription,
    start: startDate,
    end: endDate,
    allDay: false, // Always show specific times since we have start/end times
    color: getStatusColor(appointment.status, appointment.appointpaidStatus),
    location: appointment.appointmentLocation,
  };
};

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments from the API
  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event]);
    // Refresh the appointments list to get the latest data
    fetchAppointments();
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    // Refresh the appointments list to get the latest data
    fetchAppointments();
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
    // Refresh the appointments list to get the latest data
    fetchAppointments();
  };

  // Function to refresh appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments");

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();

      if (data.success && data.appointments) {
        // Transform appointments to calendar events
        const calendarEvents = data.appointments.map(
          transformAppointmentToEvent
        );
        setEvents(calendarEvents);
      } else {
        throw new Error(data.error || "Failed to load appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      // Keep existing events on error
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return <NormalLoader />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-1 sm:p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Error Loading Appointments
              </h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-1 sm:p-4 md:p-8">
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Appointments Found
            </h3>
            <p className="text-gray-500">
              You don't have any appointments scheduled yet.
            </p>
          </div>
        </div>
      ) : (
        <EventCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      )}
    </div>
  );
}
