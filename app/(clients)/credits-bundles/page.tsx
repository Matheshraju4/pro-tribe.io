"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookingCard from "@/components/modules/general/booking-card";
import { NormalLoader } from "@/components/modules/general/loader";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface Session {
    id: string;
    sessionName: string;
    sessionDescription: string | null;
    sessionPrice: string | null;
    sessionType: string;
    isActive: boolean;
}

interface Package {
    id: string;
    packageName: string;
    packageDescription: string | null;
    packagePrice: string | null;
    packageDiscount: string | null;
    validDays: string | null;
}

const CreditsAndBundles = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleBooking = (id: string, title: string, type: "session" | "package") => {

        router.push(`/credits-bundles/view/${id}`);
    };

    async function getPackagesAndSessions() {
        try {
            setLoading(true);
            const response = await fetch("/api/trainer/programs");
            const data = await response.json();

            if (data.success) {
                setSessions(data.sessions || []);
                setPackages(data.packages || []);
            } else {
                setError(data.error || "Failed to load programs");
            }
        } catch (error) {
            console.error("Error fetching packages and sessions:", error);
            setError("An error occurred while loading programs");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPackagesAndSessions();
    }, []);
    // Loading state
    if (loading) {
        return <NormalLoader />;
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <XCircle className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                        Error Loading Programs
                    </h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={getPackagesAndSessions}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black leading-tight tracking-tight mb-2">
                        Credits & Bundles
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Choose the perfect training package for your fitness journey
                    </p>
                </div>

                {/* No data state */}
                {sessions.length === 0 && packages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            No programs available at the moment.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Sessions Section */}
                        {sessions.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold mb-6">Training Sessions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sessions.map((session) => (
                                            <BookingCard
                                                key={session.id}
                                                title={session.sessionName}
                                                description={
                                                    session.sessionDescription ||
                                                    "Professional training session tailored to your needs."
                                                }
                                                price={
                                                    session.sessionPrice
                                                        ? `$${session.sessionPrice}/session`
                                                        : "Contact for pricing"
                                                }
                                                image="/images/card_image.jpg"
                                                type="session"
                                                onBook={() =>
                                                    handleBooking(
                                                        session.id,
                                                        session.sessionName,
                                                        "session"
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                            </div>
                            )}

                            {/* Packages Section */}
                            {packages.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6">Package Deals</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {packages.map((pkg) => (
                                            <BookingCard
                                                key={pkg.id}
                                                title={pkg.packageName}
                                                description={
                                                    pkg.packageDescription ||
                                                    "Save more with our exclusive package deals."
                                                }
                                                price={
                                                    pkg.packagePrice
                                                        ? `$${pkg.packagePrice}${pkg.validDays
                                                            ? ` (${pkg.validDays} days)`
                                                            : ""
                                                        }`
                                                        : "Contact for pricing"
                                                }
                                                image="/images/card_image.jpg"
                                                type="package"
                                                buttonText="Purchase"
                                                onBook={() =>
                                                    handleBooking(pkg.id, pkg.packageName, "package")
                                                }
                                            />
                                        ))}
                                    </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CreditsAndBundles;