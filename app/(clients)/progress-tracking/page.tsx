"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    Target,
    Activity,
    Weight,
    Heart,
    BarChart3,
    Plus,
    Calendar,
    CheckCircle
} from "lucide-react";

// Dummy data for assigned progress trackers
const assignedTrackers = [
    {
        id: 1,
        name: "Weight Tracking",
        description: "Daily weight measurements - Assigned by Sarah Johnson",
        type: "numeric",
        unit: "kg",
        minValue: 50,
        maxValue: 120,
        currentValue: 75.5,
        targetValue: 70,
        progress: 75,
        trend: "down", // down means losing weight (good)
        assignedBy: "Sarah Johnson",
        assignedDate: "2024-01-10",
        entries: [
            { date: "2024-01-15", value: 78.2, note: "Started program" },
            { date: "2024-01-20", value: 77.8, note: "Good week" },
            { date: "2024-01-25", value: 76.5, note: "Feeling stronger" },
            { date: "2024-01-30", value: 75.5, note: "Great progress!" }
        ]
    },
    {
        id: 2,
        name: "Workout Consistency",
        description: "Days worked out per week - Assigned by Mike Chen",
        type: "numeric",
        unit: "days",
        minValue: 0,
        maxValue: 7,
        currentValue: 5,
        targetValue: 6,
        progress: 83,
        trend: "up",
        assignedBy: "Mike Chen",
        assignedDate: "2024-01-08",
        entries: [
            { date: "2024-01-01", value: 3, note: "Getting started" },
            { date: "2024-01-08", value: 4, note: "Building habit" },
            { date: "2024-01-15", value: 5, note: "Consistent now" },
            { date: "2024-01-22", value: 5, note: "Maintaining momentum" }
        ]
    },
    {
        id: 3,
        name: "Sleep Quality",
        description: "Hours of quality sleep - Assigned by Dr. Lisa Park",
        type: "numeric",
        unit: "hours",
        minValue: 0,
        maxValue: 12,
        currentValue: 7.5,
        targetValue: 8,
        progress: 94,
        trend: "up",
        assignedBy: "Dr. Lisa Park",
        assignedDate: "2024-01-12",
        entries: [
            { date: "2024-01-15", value: 6.5, note: "Restless night" },
            { date: "2024-01-20", value: 7.0, note: "Better routine" },
            { date: "2024-01-25", value: 7.5, note: "Consistent sleep" },
            { date: "2024-01-30", value: 7.5, note: "Good sleep hygiene" }
        ]
    }
];

export default function ProgressTrackingPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading assigned trackers
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const getTrackerIcon = (type: string, name: string) => {
        if (name.toLowerCase().includes('weight')) return <Weight className="h-5 w-5" />;
        if (name.toLowerCase().includes('sleep')) return <Heart className="h-5 w-5" />;
        if (name.toLowerCase().includes('workout') || name.toLowerCase().includes('consistency')) return <Activity className="h-5 w-5" />;
        return <Target className="h-5 w-5" />;
    };

    const getTrendIcon = (trend: string) => {
        return trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your assigned trackers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
                        <p className="text-gray-600 mt-2">Track your progress with assigned goals from your trainer</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {assignedTrackers.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trackers Assigned</h3>
                            <p className="text-gray-600 mb-4">
                                Your trainer hasn't assigned any progress trackers yet.
                                Check back later or contact your trainer.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Assigned Trackers</p>
                                            <p className="text-2xl font-bold text-gray-900">{assignedTrackers.length}</p>
                                        </div>
                                        <Target className="h-8 w-8 text-primary" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Average Progress</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {Math.round(assignedTrackers.reduce((acc, tracker) => acc + tracker.progress, 0) / assignedTrackers.length)}%
                                            </p>
                                        </div>
                                        <BarChart3 className="h-8 w-8 text-primary" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Active Trackers</p>
                                            <p className="text-2xl font-bold text-gray-900">{assignedTrackers.length}</p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Assigned Trackers */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {assignedTrackers.map((tracker) => (
                                <Card key={tracker.id} className="hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getTrackerIcon(tracker.type, tracker.name)}
                                                <div>
                                                    <CardTitle className="text-lg">{tracker.name}</CardTitle>
                                                    <CardDescription>{tracker.description}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getTrendIcon(tracker.trend)}
                                                <Badge variant="outline">{tracker.type}</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-medium">{tracker.progress}%</span>
                                            </div>
                                            <Progress
                                                value={tracker.progress}
                                                className="h-2"
                                            />
                                        </div>

                                        {/* Current vs Target */}
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-gray-900">{tracker.currentValue}</p>
                                                <p className="text-sm text-gray-600">Current {tracker.unit}</p>
                                            </div>
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <p className="text-2xl font-bold text-primary">{tracker.targetValue}</p>
                                                <p className="text-sm text-gray-600">Target {tracker.unit}</p>
                                            </div>
                                        </div>

                                        {/* Assignment Info */}
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                                <Calendar className="h-4 w-4" />
                                                <span>Assigned by <strong>{tracker.assignedBy}</strong> on {new Date(tracker.assignedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Recent Entries */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Recent Entries</h4>
                                            <div className="space-y-2">
                                                {tracker.entries.slice(-3).map((entry, index) => (
                                                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                                        <div>
                                                            <span className="text-gray-600">{new Date(entry.date).toLocaleDateString()}</span>
                                                            {entry.note && <p className="text-xs text-gray-500 italic">{entry.note}</p>}
                                                        </div>
                                                        <span className="font-medium">{entry.value} {tracker.unit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Add Entry Button */}
                                        <Button className="w-full bg-primary hover:bg-primary/90">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Progress Entry
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}