"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestSetupPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const createDummyData = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/dummy/client-setup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || "Failed to create dummy data");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const fetchDummyData = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/dummy/client-setup", {
                method: "GET",
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || "Failed to fetch dummy data");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Dummy Data Setup for Client Dashboard</CardTitle>
                    <CardDescription>
                        Create fake client and appointments to test the client dashboard calendar view
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-4">
                        <Button
                            onClick={createDummyData}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            Create Dummy Data
                        </Button>

                        <Button
                            onClick={fetchDummyData}
                            disabled={loading}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            Check Existing Data
                        </Button>
                    </div>

                    {error && (
                        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700">
                                <XCircle className="h-4 w-4" />
                                <span className="font-medium">Error:</span>
                            </div>
                            <p className="text-red-600 mt-1">{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">Success!</span>
                                </div>
                                <p className="text-green-600 mt-1">{result.message}</p>
                            </div>

                            {result.data && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Demo Client</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p><strong>Name:</strong> {result.data.client.name}</p>
                                            <p><strong>Email:</strong> {result.data.client.email}</p>
                                            <p><strong>ID:</strong> {result.data.client.id}</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Demo Trainer</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p><strong>Name:</strong> {result.data.trainer.name}</p>
                                            <p><strong>Email:</strong> {result.data.trainer.email}</p>
                                            <p><strong>ID:</strong> {result.data.trainer.id}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {result.data?.appointments && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Created Appointments</CardTitle>
                                        <CardDescription>
                                            {result.data.appointments.length} appointments created
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {result.data.appointments.map((apt: any, index: number) => (
                                                <div key={apt.id} className="p-3 border rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">{apt.sessionName}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(apt.date).toLocaleDateString()} at {apt.startTime} - {apt.endTime}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-2 py-1 rounded text-xs ${apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                                    apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                                        'bg-red-100 text-red-800'
                                                                }`}>
                                                                {apt.status}
                                                            </span>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {apt.paidStatus}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {result.client && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Existing Client Data</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p><strong>Client:</strong> {result.client.name} ({result.client.email})</p>
                                        <p><strong>Trainer:</strong> {result.client.trainer.firstName} {result.client.trainer.lastName}</p>
                                        <p><strong>Appointments:</strong> {result.appointments?.length || 0} found</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">How to Test:</h3>
                        <ol className="list-decimal list-inside space-y-1 text-blue-800">
                            <li>Click "Create Dummy Data" to set up fake client and appointments</li>
                            <li>Go to the client dashboard at <code className="bg-blue-100 px-1 rounded">/dashboard</code></li>
                            <li>You should see the calendar view with the created appointments</li>
                            <li>Use the demo client credentials: <code className="bg-blue-100 px-1 rounded">demo-client@example.com</code></li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

