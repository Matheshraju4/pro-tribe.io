"use client";

import { useState, useEffect } from "react";
import { PanelRightClose, PanelRightOpen, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AppointmentData {
    id: string;
    appointmentName: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    appointpaidStatus: string;
    client: {
        firstName: string;
        lastName: string;
        email: string;
    } | null;
}

export function TrainerRightSidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/appointments");
            if (response.ok) {
                const data = await response.json();
                setAppointments(data.appointments || []);
            }
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Get dates that have appointments
    const getBookedDates = () => {
        return appointments
            .filter((apt) => apt.appointmentDate)
            .map((apt) => {
                const date = new Date(apt.appointmentDate);
                return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            });
    };

    const bookedDates = getBookedDates();

    // Get appointments for selected date
    const getAppointmentsForDate = () => {
        if (!selectedDate) return [];
        const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
        return appointments.filter((apt) => {
            if (!apt.appointmentDate) return false;
            const aptDate = new Date(apt.appointmentDate);
            const aptDateStr = format(aptDate, "yyyy-MM-dd");
            return aptDateStr === selectedDateStr;
        });
    };

    const selectedDateAppointments = getAppointmentsForDate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-700 border-green-200";
            case "Cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            case "Scheduled":
                return "bg-blue-100 text-blue-700 border-blue-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "Paid":
                return "bg-green-50 text-green-700 border-green-200";
            case "Unpaid":
                return "bg-amber-50 text-amber-700 border-amber-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <>
            {/* Custom styles for booked dates */}
            <style>{`
                /* Target booked dates with multiple selector patterns */
                .booked-date button,
                .booked-date > button,
                [class*="booked-date"] button,
                .rdp-day_booked button,
                .rdp-day_booked > button,
                [class*="rdp-day"][class*="booked"] button,
                [class*="rdp-day"][class*="booked"] > button {
                    background-color: hsl(var(--primary)) !important;
                    background: hsl(var(--primary)) !important;
                    color: hsl(var(--primary-foreground)) !important;
                    font-weight: 600 !important;
                    border-radius: 0.375rem !important;
                }
                .booked-date button:hover,
                .booked-date > button:hover,
                [class*="booked-date"] button:hover,
                .rdp-day_booked button:hover,
                .rdp-day_booked > button:hover,
                [class*="rdp-day"][class*="booked"] button:hover,
                [class*="rdp-day"][class*="booked"] > button:hover {
                    background-color: hsl(var(--primary)) !important;
                    background: hsl(var(--primary)) !important;
                    color: hsl(var(--primary-foreground)) !important;
                }
            `}</style>
            {/* Spacer to push content */}
            <div
                className={cn(
                    "hidden md:block transition-all duration-200 ease-linear",
                    isOpen ? "w-80" : "w-0"
                )}
            />

            {/* Right Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex fixed right-0 top-0 h-full bg-white border-l border-gray-200 transition-transform duration-200 ease-linear z-40",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                style={{ width: "20rem" }}
            >
                <div className="flex flex-col w-full h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Quick Info</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? (
                                <PanelRightClose className="h-4 w-4" />
                            ) : (
                                <PanelRightOpen className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Calendar Section */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-sm">Appointments Calendar</h3>
                            </div>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                className="rounded-md border [&_.booked-date_button]:!bg-primary [&_.booked-date_button]:!text-primary-foreground [&_.rdp-day_booked_button]:!bg-primary [&_.rdp-day_booked_button]:!text-primary-foreground"
                                modifiers={{
                                    booked: (date) => {
                                        const dateTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                                        return bookedDates.includes(dateTimestamp);
                                    }
                                }}
                                modifiersClassNames={{
                                    booked: "booked-date"
                                }}
                                classNames={{
                                    day: "aspect-square"
                                }}
                                disabled={(date) => date < new Date()}
                            />
                            <p className="text-xs text-muted-foreground mt-3 text-center">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>
                                Dates with bookings
                            </p>
                        </div>

                        {/* Appointments List */}
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-sm">
                                    {format(selectedDate, "MMM dd, yyyy")}
                                </h3>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                            ) : selectedDateAppointments.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedDateAppointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="p-3 rounded-lg border border-gray-200 hover:border-primary transition-colors bg-white"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{apt.appointmentName}</p>
                                                    {apt.client && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {apt.client.firstName} {apt.client.lastName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-xs", getStatusColor(apt.status))}
                                                >
                                                    {apt.status}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-xs", getPaymentStatusColor(apt.appointpaidStatus))}
                                                >
                                                    {apt.appointpaidStatus}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {apt.startTime} - {apt.endTime}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No appointments for this date</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Toggle Button (visible when sidebar is closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                >
                    <PanelRightOpen className="h-5 w-5" />
                </button>
            )}
        </>
    );
}
