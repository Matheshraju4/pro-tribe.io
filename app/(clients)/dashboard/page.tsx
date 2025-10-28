"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Calendar,
    Utensils,
    Plus,
    MessageSquare,
    CheckCircle2,
    ShoppingCart,
    Mail,
    LayoutDashboard,
    XCircle,
    Clock,
} from "lucide-react";
import { NormalLoader } from "@/components/modules/general/loader";

// Type definitions
interface DashboardData {
    client: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
    };
    trainer: {
        id: string;
        name: string;
        email: string;
        mobileNumber: string | null;
    } | null;
    upcomingAppointments: Array<{
        id: string;
        title: string;
        trainer: string;
        date: string;
        status: string;
        paidStatus: string;
        location: string;
    }>;
    services: Array<{
        id: string;
        name: string;
        description: string;
        progress: number;
        totalSessions?: number;
        completedSessions?: number;
    }>;
    activities: Array<{
        id: string;
        type: string;
        message: string;
        time: string;
        date: string;
    }>;
    stats: {
        totalAppointments: number;
        completedAppointments: number;
        upcomingAppointments: number;
        cancelledAppointments: number;
    };
}

// Helper function to get icon for activity type
const getActivityIcon = (type: string) => {
    switch (type) {
        case "completed":
            return CheckCircle2;
        case "cancelled":
            return XCircle;
        case "scheduled":
            return Clock;
        default:
            return Calendar;
    }
};

// Helper function to get color for activity type
const getActivityColor = (type: string) => {
    switch (type) {
        case "completed":
            return "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400";
        case "cancelled":
            return "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400";
        case "scheduled":
            return "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400";
        default:
            return "bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400";
    }
};

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/clients/dashboard/client");
            const data = await response.json();

            if (response.ok && data.success) {
                setDashboardData(data.data);
            } else {
                setError(data.error || "Failed to load dashboard data");
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("An error occurred while loading dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return <NormalLoader />;
    }

    // Error state
    if (error || !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <XCircle className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                        Error Loading Dashboard
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {error || "Failed to load dashboard data"}
                    </p>
                    <Button onClick={fetchDashboardData}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="flex flex-wrap justify-between gap-4 mb-8">
                    <div className="flex min-w-72 flex-col gap-3">
                        <h1 className="text-4xl font-black leading-tight tracking-tight">
                            Welcome back, {dashboardData.client.name.split(' ')[0]}!
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Here's a look at your progress and upcoming appointments.
                        </p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming Appointments Widget */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Upcoming Appointments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {dashboardData.upcomingAppointments.length > 0 ? (
                                dashboardData.upcomingAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="flex items-center gap-4 bg-muted/50 px-4 py-3 rounded-lg justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0 size-12">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <p className="font-medium line-clamp-1">
                                                    {appointment.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    with {appointment.trainer}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <p className="text-sm text-muted-foreground">
                                                {appointment.date}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No upcoming appointments</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions Widget */}
                    <Card className="flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-xl">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="w-full gap-2" size="lg">
                                <Plus className="h-5 w-5" />
                                Book New Appointment
                            </Button>
                            <Button
                                className="w-full gap-2"
                                variant="secondary"
                                size="lg"
                            >
                                <MessageSquare className="h-5 w-5" />
                                Contact Trainer
                            </Button>
                        </CardContent>
                    </Card>

                    {/* My Services Widget */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">My Services</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {dashboardData.services.length > 0 ? (
                                dashboardData.services.map((service) => (
                                    <div key={service.id} className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">
                                                    {service.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {service.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Progress value={service.progress} className="h-2" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    <p>No services purchased yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress Tracker Widget */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl">Progress Tracker</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                                <span className="text-muted-foreground">
                                    Chart or graph visualization here
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity History Widget */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-xl">Activity History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-80 overflow-y-auto pr-4 space-y-4">
                                {dashboardData.activities.length > 0 ? (
                                    dashboardData.activities.map((activity) => {
                                        const Icon = getActivityIcon(activity.type);
                                        const color = getActivityColor(activity.type);
                                        return (
                                            <div
                                                key={activity.id}
                                                className="flex items-center gap-4"
                                            >
                                                <div
                                                    className={`flex items-center justify-center shrink-0 size-10 rounded-full ${color}`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <p className="text-sm flex-1">
                                                    {activity.message}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {activity.time}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No activity history yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}