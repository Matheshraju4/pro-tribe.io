"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    User,
    Lock,
    Save,
    Mail,
    Phone,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { NormalLoader } from "@/components/modules/general/loader";

interface ClientSettings {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState<ClientSettings>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/clients/settings");

            console.log("Fetched client data:", response.data);

            if (response.data.success && response.data.client) {
                const clientData = response.data.client;

                // Prepopulate form with client data from database
                setSettings({
                    firstName: clientData.firstName || "",
                    lastName: clientData.lastName || "",
                    email: clientData.email || "",
                    phone: clientData.phone || "",
                });

                console.log("Settings prepopulated successfully");
            } else {
                toast.error("Failed to load client data");
            }
        } catch (err: any) {
            console.error("Failed to fetch settings:", err);
            toast.error(err.response?.data?.error || "Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!settings.firstName.trim() || !settings.lastName.trim()) {
            toast.error("First name and last name are required");
            return;
        }

        if (!settings.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            setSaving(true);
            const response = await axios.put("/api/clients/settings", settings);

            if (response.data.success) {
                toast.success("Settings saved successfully!");
            } else {
                toast.error(response.data.error || "Failed to save settings");
            }
        } catch (err: any) {
            console.error("Failed to save settings:", err);
            toast.error(err.response?.data?.error || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword) {
            toast.error("Please enter your current password");
            return;
        }

        if (!passwordData.newPassword) {
            toast.error("Please enter a new password");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        try {
            const response = await axios.post("/api/clients/settings/password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            if (response.data.success) {
                toast.success("Password changed successfully!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                toast.error(response.data.error || "Failed to change password");
            }
        } catch (err: any) {
            console.error("Failed to change password:", err);
            toast.error(err.response?.data?.error || "Failed to change password");
        }
    };

    const handleChange = (field: keyof ClientSettings, value: string) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return <NormalLoader text="Loading settings..." className="h-screen" />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-600 mt-2">Manage your account settings</p>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>
                                    Update your personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            value={settings.firstName}
                                            onChange={(e) => handleChange("firstName", e.target.value)}
                                            placeholder="Enter your first name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            value={settings.lastName}
                                            onChange={(e) => handleChange("lastName", e.target.value)}
                                            placeholder="Enter your last name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <div className="relative">
                                            <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={settings.email}
                                                onChange={(e) => handleChange("email", e.target.value)}
                                                placeholder="your.email@example.com"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <Input
                                                id="phone"
                                                value={settings.phone}
                                                onChange={(e) => handleChange("phone", e.target.value)}
                                                placeholder="+1 (555) 000-0000"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password *</Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password *</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            placeholder="Enter new password (min. 6 characters)"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <Separator />
                                    <Button
                                        onClick={handlePasswordChange}
                                        className="w-full sm:w-auto"
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Update Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
