"use client";

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
} from "lucide-react";

// Static data for demo
const staticData = {
    userName: "Olivia",
    upcomingAppointments: [
        {
            id: "1",
            title: "Personal Training",
            trainer: "John Doe",
            date: "Tomorrow, 10:00 AM",
            icon: Calendar,
        },
        {
            id: "2",
            title: "Nutrition Consultation",
            trainer: "Jane Smith",
            date: "Friday, 2:00 PM",
            icon: Utensils,
        },
    ],
    services: [
        {
            id: "1",
            name: "10-Session Pack",
            description: "7 sessions remaining",
            progress: 70,
        },
        {
            id: "2",
            name: "Monthly Nutrition Plan",
            description: "Active until Oct 31",
            progress: 85,
        },
    ],
    activities: [
        {
            id: "1",
            type: "completed",
            message: "Completed: Personal Training on Sep 25, 2023",
            time: "2 days ago",
            icon: CheckCircle2,
            color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
        },
        {
            id: "2",
            type: "purchase",
            message: "Purchased: 10-Session Pack on Sep 20, 2023",
            time: "1 week ago",
            icon: ShoppingCart,
            color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
        },
        {
            id: "3",
            type: "message",
            message: "Message sent to John Doe on Sep 18, 2023",
            time: "1.5 weeks ago",
            icon: Mail,
            color: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
        },
        {
            id: "4",
            type: "completed",
            message: "Completed: Nutrition Consultation on Sep 15, 2023",
            time: "2 weeks ago",
            icon: CheckCircle2,
            color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
        },
    ],
};

export default function DashboardPage() {
    return (
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="flex flex-wrap justify-between gap-4 mb-8">
                    <div className="flex min-w-72 flex-col gap-3">
                        <h1 className="text-4xl font-black leading-tight tracking-tight">
                            Welcome back, {staticData.userName}!
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
                            {staticData.upcomingAppointments.map((appointment) => {
                                const Icon = appointment.icon;
                                return (
                                    <div
                                        key={appointment.id}
                                        className="flex items-center gap-4 bg-muted/50 px-4 py-3 rounded-lg justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0 size-12">
                                                <Icon className="h-6 w-6" />
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
                                );
                            })}
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
                            {staticData.services.map((service) => (
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
                            ))}
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
                                {staticData.activities.map((activity) => {
                                    const Icon = activity.icon;
                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-center gap-4"
                                        >
                                            <div
                                                className={`flex items-center justify-center shrink-0 size-10 rounded-full ${activity.color}`}
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
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}