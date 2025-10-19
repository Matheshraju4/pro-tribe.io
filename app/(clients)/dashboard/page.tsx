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
    trainer: {
        id: string;
        name: string;
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

    // Create trainer name for display
    const trainerName = appointment.trainer.name;

    // Create title with session name and trainer
    const title = `${appointment.session.sessionName} with ${trainerName}`;

    return {
        id: appointment.id,
        title,
        description:
            appointment.appointmentDescription ||
            appointment.session.sessionDescription,
        start: startDate,
        end: endDate,
        allDay: false,
        color: getStatusColor(appointment.status, appointment.appointpaidStatus),
        location: appointment.appointmentLocation,
    };
};

export default function DashboardPage() {
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
            console.log("Fetching appointments...");

            const response = await fetch("/api/appointments/client");
            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`Failed to fetch appointments: ${response.status}`);
            }

            const data = await response.json();
            console.log("Response data:", data);

            if (data.success && data.appointments) {
                console.log("Found appointments:", data.appointments.length);
                // Transform appointments to calendar events
                const calendarEvents = data.appointments.map(
                    transformAppointmentToEvent
                );
                console.log("Transformed events:", calendarEvents);
                setEvents(calendarEvents);
            } else {
                console.log("No appointments found or error:", data.error);
                setEvents([]);
                if (data.error) {
                    setError(data.error);
                }
            }
        } catch (err) {
            console.error("Error fetching appointments:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
            setEvents([]); // Clear events on error
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
            <div className="flex flex-col items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error Loading Appointments
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={fetchAppointments}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Try Again
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