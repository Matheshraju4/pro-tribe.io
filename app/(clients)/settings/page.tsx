"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    CreditCard,
    Download,
    Trash2,
    Save,
    Edit,
    Camera,
    Mail,
    Phone,
    MapPin,
    Calendar
} from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    // Profile data
    const [profileData, setProfileData] = useState({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        dateOfBirth: "1990-05-15",
        gender: "Male",
        emergencyContact: "Jane Doe",
        emergencyPhone: "+1 (555) 987-6543"
    });

    // Notification preferences
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        appointmentReminders: true,
        progressUpdates: true,
        marketingEmails: false,
        weeklyReports: true
    });

    // Privacy settings
    const [privacy, setPrivacy] = useState({
        profileVisibility: "private",
        dataSharing: false,
        analyticsTracking: true,
        cookieConsent: true
    });

    // App preferences
    const [preferences, setPreferences] = useState({
        theme: "system",
        language: "en",
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h"
    });

    const handleSave = () => {
        // Handle save logic here
        console.log("Settings saved");
    };

    const handleProfileChange = (field: string, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNotificationChange = (field: string, value: boolean) => {
        setNotifications(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePrivacyChange = (field: string, value: string | boolean) => {
        setPrivacy(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePreferenceChange = (field: string, value: string) => {
        setPreferences(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
                        </div>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-8">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Privacy
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Preferences
                        </TabsTrigger>
                        <TabsTrigger value="account" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Account
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
                                {/* Profile Picture */}
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src="/api/placeholder/96/96" />
                                        <AvatarFallback className="text-lg">JD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Button variant="outline" size="sm">
                                            <Camera className="h-4 w-4 mr-2" />
                                            Change Photo
                                        </Button>
                                        <p className="text-sm text-gray-500 mt-2">
                                            JPG, PNG or GIF. Max size 2MB.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={profileData.firstName}
                                            onChange={(e) => handleProfileChange("firstName", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={profileData.lastName}
                                            onChange={(e) => handleProfileChange("lastName", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => handleProfileChange("email", e.target.value)}
                                            className="flex items-center gap-2"
                                        />
                                        <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={profileData.phone}
                                            onChange={(e) => handleProfileChange("phone", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={profileData.dateOfBirth}
                                            onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <select
                                            id="gender"
                                            value={profileData.gender}
                                            onChange={(e) => handleProfileChange("gender", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                <Separator />

                                {/* Address Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="address">Street Address</Label>
                                            <Input
                                                id="address"
                                                value={profileData.address}
                                                onChange={(e) => handleProfileChange("address", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={profileData.city}
                                                onChange={(e) => handleProfileChange("city", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                id="state"
                                                value={profileData.state}
                                                onChange={(e) => handleProfileChange("state", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zipCode">ZIP Code</Label>
                                            <Input
                                                id="zipCode"
                                                value={profileData.zipCode}
                                                onChange={(e) => handleProfileChange("zipCode", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <select
                                                id="country"
                                                value={profileData.country}
                                                onChange={(e) => handleProfileChange("country", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="United States">United States</option>
                                                <option value="Canada">Canada</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Australia">Australia</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Emergency Contact */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="emergencyContact">Contact Name</Label>
                                            <Input
                                                id="emergencyContact"
                                                value={profileData.emergencyContact}
                                                onChange={(e) => handleProfileChange("emergencyContact", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="emergencyPhone">Contact Phone</Label>
                                            <Input
                                                id="emergencyPhone"
                                                value={profileData.emergencyPhone}
                                                onChange={(e) => handleProfileChange("emergencyPhone", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Preferences
                                </CardTitle>
                                <CardDescription>
                                    Choose how you want to be notified about updates and reminders
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                                        </div>
                                        <Switch
                                            id="emailNotifications"
                                            checked={notifications.emailNotifications}
                                            onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="smsNotifications">SMS Notifications</Label>
                                            <p className="text-sm text-gray-500">Receive notifications via text message</p>
                                        </div>
                                        <Switch
                                            id="smsNotifications"
                                            checked={notifications.smsNotifications}
                                            onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="pushNotifications">Push Notifications</Label>
                                            <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                                        </div>
                                        <Switch
                                            id="pushNotifications"
                                            checked={notifications.pushNotifications}
                                            onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                                            <p className="text-sm text-gray-500">Get reminded about upcoming appointments</p>
                                        </div>
                                        <Switch
                                            id="appointmentReminders"
                                            checked={notifications.appointmentReminders}
                                            onCheckedChange={(checked) => handleNotificationChange("appointmentReminders", checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="progressUpdates">Progress Updates</Label>
                                            <p className="text-sm text-gray-500">Get notified about progress milestones</p>
                                        </div>
                                        <Switch
                                            id="progressUpdates"
                                            checked={notifications.progressUpdates}
                                            onCheckedChange={(checked) => handleNotificationChange("progressUpdates", checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="weeklyReports">Weekly Reports</Label>
                                            <p className="text-sm text-gray-500">Receive weekly progress summaries</p>
                                        </div>
                                        <Switch
                                            id="weeklyReports"
                                            checked={notifications.weeklyReports}
                                            onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="marketingEmails">Marketing Emails</Label>
                                            <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
                                        </div>
                                        <Switch
                                            id="marketingEmails"
                                            checked={notifications.marketingEmails}
                                            onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Privacy Tab */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Privacy & Security
                                </CardTitle>
                                <CardDescription>
                                    Control your privacy settings and data sharing preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="profileVisibility">Profile Visibility</Label>
                                        <p className="text-sm text-gray-500 mb-3">Control who can see your profile information</p>
                                        <select
                                            id="profileVisibility"
                                            value={privacy.profileVisibility}
                                            onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="public">Public - Anyone can see</option>
                                            <option value="trainer">Trainer Only - Only your trainer can see</option>
                                            <option value="private">Private - Only you can see</option>
                                        </select>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="dataSharing">Data Sharing</Label>
                                            <p className="text-sm text-gray-500">Allow sharing of anonymized data for research</p>
                                        </div>
                                        <Switch
                                            id="dataSharing"
                                            checked={privacy.dataSharing}
                                            onCheckedChange={(checked) => handlePrivacyChange("dataSharing", checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="analyticsTracking">Analytics Tracking</Label>
                                            <p className="text-sm text-gray-500">Allow tracking for app improvement</p>
                                        </div>
                                        <Switch
                                            id="analyticsTracking"
                                            checked={privacy.analyticsTracking}
                                            onCheckedChange={(checked) => handlePrivacyChange("analyticsTracking", checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="cookieConsent">Cookie Consent</Label>
                                            <p className="text-sm text-gray-500">Accept cookies for better experience</p>
                                        </div>
                                        <Switch
                                            id="cookieConsent"
                                            checked={privacy.cookieConsent}
                                            onCheckedChange={(checked) => handlePrivacyChange("cookieConsent", checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    App Preferences
                                </CardTitle>
                                <CardDescription>
                                    Customize your app experience and display preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="theme">Theme</Label>
                                        <select
                                            id="theme"
                                            value={preferences.theme}
                                            onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="system">System</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="language">Language</Label>
                                        <select
                                            id="language"
                                            value={preferences.language}
                                            onChange={(e) => handlePreferenceChange("language", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <select
                                            id="timezone"
                                            value={preferences.timezone}
                                            onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="America/New_York">Eastern Time</option>
                                            <option value="America/Chicago">Central Time</option>
                                            <option value="America/Denver">Mountain Time</option>
                                            <option value="America/Los_Angeles">Pacific Time</option>
                                            <option value="Europe/London">London</option>
                                            <option value="Europe/Paris">Paris</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateFormat">Date Format</Label>
                                        <select
                                            id="dateFormat"
                                            value={preferences.dateFormat}
                                            onChange={(e) => handlePreferenceChange("dateFormat", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timeFormat">Time Format</Label>
                                        <select
                                            id="timeFormat"
                                            value={preferences.timeFormat}
                                            onChange={(e) => handlePreferenceChange("timeFormat", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="12h">12 Hour (AM/PM)</option>
                                            <option value="24h">24 Hour</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Account Tab */}
                    <TabsContent value="account" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Account Management
                                </CardTitle>
                                <CardDescription>
                                    Manage your account settings and data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h3 className="font-semibold">Change Password</h3>
                                            <p className="text-sm text-gray-500">Update your account password</p>
                                        </div>
                                        <Button variant="outline">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Change
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h3 className="font-semibold">Download Data</h3>
                                            <p className="text-sm text-gray-500">Download a copy of your data</p>
                                        </div>
                                        <Button variant="outline">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h3 className="font-semibold">Payment Methods</h3>
                                            <p className="text-sm text-gray-500">Manage your payment information</p>
                                        </div>
                                        <Button variant="outline">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Manage
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                                        <div>
                                            <h3 className="font-semibold text-red-900">Delete Account</h3>
                                            <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                                        </div>
                                        <Button variant="destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
