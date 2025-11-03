"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
    TrendingUp,
    User,
    Phone,
} from "lucide-react";
import { NormalLoader } from "@/components/modules/general/loader";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import axios from "axios";

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

interface ProgressTracker {
    id: string;
    trackerId: string;
    name: string;
    description: string | null;
    type: string;
    unit: string | null;
    minValue: number | null;
    maxValue: number | null;
    trueLabel: string | null;
    falseLabel: string | null;
    ratingScale: number | null;
    currentValue: any;
    targetValue: any;
    progress: number;
    trend: string;
    assignedBy: string;
    assignedDate: string;
    entries: Array<{
        id: string;
        date: string;
        value: any;
        note: string | null;
    }>;
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
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [progressTrackers, setProgressTrackers] = useState<ProgressTracker[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingTrackers, setLoadingTrackers] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
        fetchProgressTrackers();
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

    const fetchProgressTrackers = async () => {
        try {
            setLoadingTrackers(true);
            const response = await axios.get("/api/progress-trackers/client");

            if (response.data.success) {
                setProgressTrackers(response.data.trackers || []);
            }
        } catch (err) {
            console.error("Failed to fetch progress trackers:", err);
        } finally {
            setLoadingTrackers(false);
        }
    };

    // Loading state
    if (loading) {
        return <NormalLoader text="Loading dashboard data..." className="h-screen" />;
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

                    {/* Trainer Details & Quick Actions Widget */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl">Your Trainer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Trainer Info */}
                            {dashboardData.trainer ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src="/api/placeholder/64/64" />
                                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                                {dashboardData.trainer.name
                                                    .split(' ')
                                                    .map(n => n[0])
                                                    .join('')
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">
                                                {dashboardData.trainer.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Personal Trainer
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`mailto:${dashboardData.trainer.email}`}
                                                className="text-primary hover:underline"
                                            >
                                                {dashboardData.trainer.email}
                                            </a>
                                        </div>
                                        {dashboardData.trainer.mobileNumber && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <a
                                                    href={`tel:${dashboardData.trainer.mobileNumber}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {dashboardData.trainer.mobileNumber}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No trainer assigned</p>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="space-y-3">
                                <Button
                                    className="w-full gap-2"
                                    size="lg"
                                    onClick={() => router.push('/credits-bundles')}
                                >
                                    <Plus className="h-5 w-5" />
                                    Book New Appointment
                                </Button>
                                <Button
                                    className="w-full gap-2"
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => {
                                        if (dashboardData.trainer?.email) {
                                            window.location.href = `mailto:${dashboardData.trainer.email}`;
                                        }
                                    }}
                                    disabled={!dashboardData.trainer}
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    Contact Trainer
                                </Button>
                            </div>
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
                            <CardTitle className="text-xl flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Progress Tracker
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingTrackers ? (
                                <div className="h-64 flex items-center justify-center">
                                    <NormalLoader text="Loading trackers..." />
                                </div>
                            ) : progressTrackers.length === 0 ? (
                                <div className="h-64 bg-muted rounded-lg flex flex-col items-center justify-center">
                                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                                    <span className="text-muted-foreground">
                                            No progress trackers assigned yet
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {progressTrackers.slice(0, 2).map((tracker) => (
                                            <div key={tracker.id} className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-base">{tracker.name}</h3>
                                                        {tracker.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {tracker.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {tracker.type === "numeric" && tracker.currentValue !== null && (
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-primary">
                                                                {typeof tracker.currentValue === 'number'
                                                                    ? tracker.currentValue.toFixed(1)
                                                                    : tracker.currentValue}
                                                                {tracker.unit && (
                                                                    <span className="text-sm text-muted-foreground ml-1">
                                                                        {tracker.unit}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            {tracker.trend !== "stable" && (
                                                                <p className={`text-xs ${tracker.trend === "up"
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                                    }`}>
                                                                    {tracker.trend === "up" ? "↑" : "↓"} Trending {tracker.trend}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Render chart based on tracker type */}
                                                {tracker.entries.length > 0 && (
                                                    <div className="h-48">
                                                        {tracker.type === "numeric" && (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <AreaChart
                                                                    data={tracker.entries
                                                                        .slice()
                                                                        .reverse()
                                                                        .map(entry => ({
                                                                            date: new Date(entry.date).toLocaleDateString('en-US', {
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            }),
                                                                            value: Number(entry.value),
                                                                            target: tracker.targetValue || tracker.maxValue,
                                                                        }))}
                                                                >
                                                                    <defs>
                                                                        <linearGradient id={`gradient-${tracker.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                                                                        </linearGradient>
                                                                    </defs>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                                    <XAxis
                                                                        dataKey="date"
                                                                        tick={{ fontSize: 12 }}
                                                                        stroke="#888"
                                                                    />
                                                                    <YAxis
                                                                        tick={{ fontSize: 12 }}
                                                                        stroke="#888"
                                                                    />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            backgroundColor: 'white',
                                                                            border: '1px solid #ccc',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                    />
                                                                    <Area
                                                                        type="monotone"
                                                                        dataKey="value"
                                                                        stroke="#8884d8"
                                                                        strokeWidth={2}
                                                                        fill={`url(#gradient-${tracker.id})`}
                                                                        name={tracker.unit || "Value"}
                                                                    />
                                                                    {tracker.targetValue && (
                                                                        <Line
                                                                            type="monotone"
                                                                            dataKey="target"
                                                                            stroke="#82ca9d"
                                                                            strokeWidth={2}
                                                                            strokeDasharray="5 5"
                                                                            dot={false}
                                                                            name="Target"
                                                                        />
                                                                    )}
                                                                </AreaChart>
                                                            </ResponsiveContainer>
                                                        )}

                                                        {tracker.type === "boolean" && (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart
                                                                    data={tracker.entries
                                                                        .slice()
                                                                        .reverse()
                                                                        .map(entry => ({
                                                                            date: new Date(entry.date).toLocaleDateString('en-US', {
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            }),
                                                                            value: entry.value ? 1 : 0,
                                                                            label: entry.value ? (tracker.trueLabel || "Yes") : (tracker.falseLabel || "No"),
                                                                        }))}
                                                                >
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                                    <XAxis
                                                                        dataKey="date"
                                                                        tick={{ fontSize: 12 }}
                                                                        stroke="#888"
                                                                    />
                                                                    <YAxis
                                                                        tick={{ fontSize: 12 }}
                                                                        stroke="#888"
                                                                        domain={[0, 1]}
                                                                        ticks={[0, 1]}
                                                                    />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            backgroundColor: 'white',
                                                                            border: '1px solid #ccc',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                        formatter={(value: any, name: string, props: any) => [
                                                                            props.payload.label,
                                                                            "Status"
                                                                        ]}
                                                                    />
                                                                    <Bar
                                                                        dataKey="value"
                                                                        fill="#8884d8"
                                                                        radius={[8, 8, 0, 0]}
                                                                    />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        )}

                                                        {tracker.type === "rating" && (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart
                                                                    data={tracker.entries
                                                                        .slice()
                                                                        .reverse()
                                                                        .map(entry => ({
                                                                            date: new Date(entry.date).toLocaleDateString('en-US', {
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            }),
                                                                            rating: Number(entry.value),
                                                                        }))}
                                                                >
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                                    <XAxis
                                                                        dataKey="date"
                                                                        tick={{ fontSize: 12 }}
                                                                        stroke="#888"
                                                                    />
                                                                    <YAxis
                                                                        tick={{ fontSize: 12 }}
                                                                        stroke="#888"
                                                                        domain={[0, tracker.ratingScale || 5]}
                                                                    />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            backgroundColor: 'white',
                                                                            border: '1px solid #ccc',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                    />
                                                                    <Bar
                                                                        dataKey="rating"
                                                                        fill="#fbbf24"
                                                                        radius={[8, 8, 0, 0]}
                                                                        name="Rating"
                                                                    />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                            {progressTrackers.length > 2 && (
                                                <div className="text-center pt-2">
                                                    <Button variant="link" className="text-sm">
                                                        View all {progressTrackers.length} trackers →
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                            )}
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