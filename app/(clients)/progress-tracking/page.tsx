"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    TrendingUp,
    Target,
    Activity,
    Weight,
    Heart,
    BarChart3,
    Plus,
    Calendar,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { NormalLoader } from "@/components/modules/general/loader";

// Type definitions
interface ProgressTracker {
    id: string;
    trackerId: string;
    name: string;
    description?: string;
    type: "numeric" | "boolean" | "rating";
    unit?: string;
    minValue?: number | null;
    maxValue?: number | null;
    trueLabel?: string;
    falseLabel?: string;
    ratingScale?: number;
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
        note?: string;
    }>;
}

export default function ProgressTrackingPage() {
    const [trackers, setTrackers] = useState<ProgressTracker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTracker, setSelectedTracker] = useState<ProgressTracker | null>(null);
    const [entryValue, setEntryValue] = useState<string>("");
    const [entryNote, setEntryNote] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTrackers();
    }, []);

    const fetchTrackers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get("/api/progress-trackers/client");

            if (response.data.success) {
                setTrackers(response.data.trackers);
            } else {
                setError(response.data.error || "Failed to load trackers");
            }
        } catch (err: any) {
            console.error("Failed to fetch trackers:", err);
            if (err.response?.status === 401) {
                setError("Please login to view your progress trackers");
            } else {
                setError("Failed to load progress trackers");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = async () => {
        if (!selectedTracker) return;

        // Validate entry
        if (selectedTracker.type === "numeric") {
            const numValue = parseFloat(entryValue);
            if (isNaN(numValue)) {
                toast.error("Please enter a valid number");
                return;
            }
            if (selectedTracker.minValue !== null && selectedTracker.minValue !== undefined && numValue < selectedTracker.minValue) {
                toast.error(`Value must be at least ${selectedTracker.minValue}`);
                return;
            }
            if (selectedTracker.maxValue !== null && selectedTracker.maxValue !== undefined && numValue > selectedTracker.maxValue) {
                toast.error(`Value must be at most ${selectedTracker.maxValue}`);
                return;
            }
        }

        try {
            setSubmitting(true);

            let value: any = entryValue;
            if (selectedTracker.type === "numeric") {
                value = parseFloat(entryValue);
            } else if (selectedTracker.type === "boolean") {
                value = entryValue === "true";
            } else if (selectedTracker.type === "rating") {
                value = parseInt(entryValue);
            }

            const response = await axios.post("/api/progress-trackers/entry", {
                clientProgressId: selectedTracker.id,
                value: value,
                note: entryNote || undefined,
            });

            if (response.data.success) {
                toast.success("Progress entry added successfully!");
                setIsDialogOpen(false);
                setEntryValue("");
                setEntryNote("");
                setSelectedTracker(null);
                // Refresh trackers
                fetchTrackers();
            } else {
                toast.error(response.data.error || "Failed to add entry");
            }
        } catch (err: any) {
            console.error("Failed to add entry:", err);
            toast.error(err.response?.data?.error || "Failed to add progress entry");
        } finally {
            setSubmitting(false);
        }
    };

    const openAddEntryDialog = (tracker: ProgressTracker) => {
        setSelectedTracker(tracker);
        setEntryValue("");
        setEntryNote("");
        setIsDialogOpen(true);
    };

    const getTrackerIcon = (type: string, name: string) => {
        if (name.toLowerCase().includes('weight')) return <Weight className="h-5 w-5" />;
        if (name.toLowerCase().includes('sleep')) return <Heart className="h-5 w-5" />;
        if (name.toLowerCase().includes('workout') || name.toLowerCase().includes('consistency')) return <Activity className="h-5 w-5" />;
        return <Target className="h-5 w-5" />;
    };

    const getTrendIcon = (trend: string) => {
        return trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
        ) : trend === "down" ? (
            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
            ) : (
                <div className="h-4 w-4" />
        );
    };

    if (loading) {
        return <NormalLoader text="Loading your assigned trackers..." className="h-screen" />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error Loading Trackers</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={fetchTrackers}>Try Again</Button>
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
                {trackers.length === 0 ? (
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
                                                <p className="text-2xl font-bold text-gray-900">{trackers.length}</p>
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
                                                    {trackers.length > 0
                                                        ? Math.round(trackers.reduce((acc, tracker) => acc + tracker.progress, 0) / trackers.length)
                                                        : 0}%
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
                                                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {trackers.reduce((acc, tracker) => acc + tracker.entries.length, 0)}
                                                </p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Assigned Trackers */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {trackers.map((tracker) => (
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
                                            {/* Progress Bar (only for numeric) */}
                                            {tracker.type === "numeric" && (
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
                                            )}

                                        {/* Current vs Target */}
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {tracker.currentValue !== null ? String(tracker.currentValue) : "-"}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Current {tracker.unit || "value"}
                                                    </p>
                                            </div>
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                    <p className="text-2xl font-bold text-primary">
                                                        {tracker.targetValue !== null ? String(tracker.targetValue) : "-"}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Target {tracker.unit || "value"}
                                                    </p>
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
                                            {tracker.entries.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-3">Recent Entries</h4>
                                                    <div className="space-y-2">
                                                        {tracker.entries.slice(0, 3).map((entry) => (
                                                            <div key={entry.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                                                <div>
                                                                    <span className="text-gray-600">{new Date(entry.date).toLocaleDateString()}</span>
                                                                    {entry.note && <p className="text-xs text-gray-500 italic">{entry.note}</p>}
                                                                </div>
                                                            <span className="font-medium">{String(entry.value)} {tracker.unit || ""}</span>
                                                        </div>
                                                    ))}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Add Entry Button */}
                                            <Button
                                                className="w-full bg-primary hover:bg-primary/90"
                                                onClick={() => openAddEntryDialog(tracker)}
                                            >
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

            {/* Add Entry Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Progress Entry</DialogTitle>
                        <DialogDescription>
                            Record your progress for {selectedTracker?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedTracker && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="value">
                                        {selectedTracker.type === "numeric" && `Value (${selectedTracker.unit || ""})`}
                                        {selectedTracker.type === "boolean" && "Value"}
                                        {selectedTracker.type === "rating" && `Rating (1-${selectedTracker.ratingScale})`}
                                    </Label>

                                    {selectedTracker.type === "numeric" && (
                                        <Input
                                            id="value"
                                            type="number"
                                            placeholder={`Enter value${selectedTracker.unit ? ` in ${selectedTracker.unit}` : ""}`}
                                            value={entryValue}
                                            onChange={(e) => setEntryValue(e.target.value)}
                                            min={selectedTracker.minValue || undefined}
                                            max={selectedTracker.maxValue || undefined}
                                            step="0.1"
                                        />
                                    )}

                                    {selectedTracker.type === "boolean" && (
                                        <div className="flex gap-4">
                                            <Button
                                                type="button"
                                                variant={entryValue === "true" ? "default" : "outline"}
                                                onClick={() => setEntryValue("true")}
                                                className="flex-1"
                                            >
                                                {selectedTracker.trueLabel || "Yes"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={entryValue === "false" ? "default" : "outline"}
                                                onClick={() => setEntryValue("false")}
                                                className="flex-1"
                                            >
                                                {selectedTracker.falseLabel || "No"}
                                            </Button>
                                        </div>
                                    )}

                                    {selectedTracker.type === "rating" && (
                                        <div className="flex gap-2">
                                            {Array.from({ length: selectedTracker.ratingScale || 5 }, (_, i) => i + 1).map((rating) => (
                                                <Button
                                                    key={rating}
                                                    type="button"
                                                    variant={entryValue === String(rating) ? "default" : "outline"}
                                                    onClick={() => setEntryValue(String(rating))}
                                                    className="flex-1"
                                                >
                                                    {rating}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="note">Note (optional)</Label>
                                    <Textarea
                                        id="note"
                                        placeholder="Add a note about this entry..."
                                        value={entryNote}
                                        onChange={(e) => setEntryNote(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddEntry}
                            disabled={submitting || !entryValue}
                        >
                            {submitting ? "Adding..." : "Add Entry"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
