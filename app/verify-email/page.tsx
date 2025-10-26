"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { NormalLoader } from "@/components/modules/general/loader";

type VerificationStatus = "loading" | "success" | "error" | "invalid";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<VerificationStatus>("loading");
    const [role, setRole] = useState<"Client" | "Trainer" | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus("invalid");
                setErrorMessage("Invalid verification link. No token provided.");
                return;
            }

            try {
                const response = await fetch(`/api/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus("success");
                    setRole(data.role);
                } else {
                    setStatus("error");
                    setErrorMessage(data.error || "Verification failed. Please try again.");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setErrorMessage("An error occurred during verification. Please try again.");
            }
        };

        verifyEmail();
    }, [token]);

    const handleNavigation = () => {
        if (role === "Client") {
            router.push("/dashboard");
        } else if (role === "Trainer") {
            router.push("/trainer");
        } else {
            router.push("/login");
        }
    };

    return (
        <div className="min-h-screen w-full bg-white relative flex items-center justify-center p-4">
            {/* Diagonal Cross Center Fade Grid Background */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
          `,
                    backgroundSize: "40px 40px",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
                    maskImage:
                        "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
                }}
            />

            {/* Verification Card */}
            <div className="relative z-10 w-full max-w-md">
                <Card className="w-full shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">
                            Email Verification
                        </CardTitle>
                        <CardDescription>
                            {status === "loading" && "Verifying your email address..."}
                            {status === "success" && "Your email has been verified!"}
                            {status === "error" && "Verification failed"}
                            {status === "invalid" && "Invalid verification link"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-6 py-6">
                        {/* Loading State */}
                        {status === "loading" && (
                            <div className="flex flex-col items-center space-y-4">
                                <NormalLoader text="Please wait while we verify your email address..." className="min-h-0" />
                            </div>
                        )}

                        {/* Success State */}
                        {status === "success" && (
                            <div className="flex flex-col items-center space-y-4 w-full">
                                <div className="bg-green-50 rounded-full p-4">
                                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Verification Successful!
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Your email has been successfully verified. You can now access your account.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleNavigation}
                                    className="w-full bg-primary text-white hover:bg-primary/90 h-11 mt-4"
                                >
                                    {role === "Client" ? "Go to Dashboard" : role === "Trainer" ? "Go to Trainer Dashboard" : "Go to Login"}
                                </Button>
                            </div>
                        )}

                        {/* Error State */}
                        {(status === "error" || status === "invalid") && (
                            <div className="flex flex-col items-center space-y-4 w-full">
                                <div className="bg-red-50 rounded-full p-4">
                                    <XCircle className="h-16 w-16 text-red-500" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Verification Failed
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {errorMessage || "We couldn't verify your email address. The link may have expired or is invalid."}
                                    </p>
                                </div>
                                <div className="w-full space-y-2">
                                    <Button
                                        onClick={() => router.push("/signup")}
                                        className="w-full bg-primary text-white hover:bg-primary/90 h-11"
                                    >
                                        Sign Up Again
                                    </Button>
                                    <Button
                                        onClick={() => router.push("/login")}
                                        variant="outline"
                                        className="w-full h-11"
                                    >
                                        Back to Login
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full bg-white relative flex items-center justify-center p-4">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
                        linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
                    `,
                    backgroundSize: "40px 40px",
                    WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
                    maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
                }} />
                <div className="relative z-10 w-full max-w-md">
                    <Card className="w-full shadow-lg">
                        <CardContent className="flex items-center justify-center py-12">
                            <NormalLoader text="Loading..." />
                        </CardContent>
                    </Card>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
