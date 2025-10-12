"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, ArrowLeft, Eye, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvailabilityDialog } from "@/components/modules/pages/trainer/availability/availability-dialog";

// Import the form components we'll create
import { AppointmentFormInline } from "@/components/modules/pages/trainer/appointments/appointment-form-inline";
import SessionFormInline from "@/components/modules/pages/trainer/sessions/session-form-inline";

type EventType = null | "appointment" | "session";

export default function CreateEventPage() {
  const [selectedEventType, setSelectedEventType] = useState<EventType>(null);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    setSelectedEventType(null);
  };

  const handleSuccess = () => {
    // Return to selection view after successful creation
    setSelectedEventType(null);
  };

  const handleView = (type: "appointment" | "session") => {
    if (type === "appointment") {
      router.push("/trainer/appointments");
    } else {
      router.push("/trainer/sessions");
    }
  };

  const handleCreate = (type: "appointment" | "session") => {
    setSelectedEventType(type);
  };

  // Selection View - Show cards to choose event type
  if (selectedEventType === null) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
            <p className="text-gray-600">Choose the type of event you want to create</p>
          </div>

          {/* Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointment Card */}
            <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setIsAvailabilityDialogOpen(true)}
                  >
                    <Clock className="h-4 w-4" />
                    Set Availability
                  </Button>
                </div>
                <CardTitle className="text-xl">Manage Appointment</CardTitle>
                <CardDescription className="text-base mt-2">
                  Schedule a one-time appointment with a client
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    One-time scheduled event
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Select client and optional session
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Set specific date and time
                  </li>
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleView("appointment")}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                
                </div>
              </CardContent>
            </Card>

            {/* Session Card */}
            <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="relative">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Manage Session</CardTitle>
                <CardDescription className="text-base mt-2">
                  Create a session template for one-time or recurring events
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    One-time or recurring sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    One-to-one or group sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    Configure schedule and pricing
                  </li>
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleView("session")}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleCreate("session")}
                  >
                    <Plus className="h-4 w-4" />
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Availability Dialog */}
        <AvailabilityDialog 
          open={isAvailabilityDialogOpen} 
          onOpenChange={setIsAvailabilityDialogOpen} 
        />
      </div>
    );
  }

  // Appointment Form View
  if (selectedEventType === "appointment") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Appointment</h1>
              <p className="text-gray-600 text-sm">Schedule a new appointment with a client</p>
            </div>
          </div>

          {/* Appointment Form */}
          <AppointmentFormInline onSuccess={handleSuccess} onCancel={handleBack} />
        </div>
      </div>
    );
  }

  // Session Form View
  if (selectedEventType === "session") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Session</h1>
              <p className="text-gray-600 text-sm">Create a new session template</p>
            </div>
          </div>

          {/* Session Form */}
          <SessionFormInline onSuccess={handleSuccess} onCancel={handleBack} />
        </div>
      </div>
    );
  }

  return null;
}
