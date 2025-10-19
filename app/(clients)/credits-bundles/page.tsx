"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Search,
    Clock,
    Users,
    Star,
    Check,
    ShoppingCart,
    Filter,
    Heart,
    MapPin
} from "lucide-react";

// Dummy data for sessions
const sessionsData = [
    {
        id: 1,
        name: "Personal Training Session",
        description: "One-on-one personalized training session with our certified trainers. Perfect for beginners and advanced athletes.",
        price: 100,
        originalPrice: 120,
        duration: "60 minutes",
        type: "One-on-One",
        category: "Fitness",
        rating: 4.9,
        reviews: 156,
        image: "/api/placeholder/300/200",
        features: ["Personalized workout", "Nutrition guidance", "Progress tracking", "Flexible scheduling"],
        trainer: "Sarah Johnson",
        location: "Downtown Gym",
        availableSlots: ["9:00 AM", "2:00 PM", "6:00 PM"],
        discount: 17
    },
    {
        id: 2,
        name: "Group HIIT Class",
        description: "High-intensity interval training in a fun group setting. Burn calories and build strength with like-minded people.",
        price: 25,
        originalPrice: 35,
        duration: "45 minutes",
        type: "Group",
        category: "Cardio",
        rating: 4.8,
        reviews: 89,
        image: "/api/placeholder/300/200",
        features: ["High energy workout", "Group motivation", "All fitness levels", "Music and fun"],
        trainer: "Mike Chen",
        location: "Studio A",
        availableSlots: ["7:00 AM", "12:00 PM", "7:00 PM"],
        discount: 29
    },
    {
        id: 3,
        name: "Yoga & Meditation",
        description: "Relaxing yoga session combined with meditation techniques. Perfect for stress relief and flexibility.",
        price: 40,
        originalPrice: 50,
        duration: "75 minutes",
        type: "Group",
        category: "Wellness",
        rating: 4.9,
        reviews: 203,
        image: "/api/placeholder/300/200",
        features: ["Stress relief", "Flexibility training", "Mindfulness", "All levels welcome"],
        trainer: "Emma Davis",
        location: "Zen Studio",
        availableSlots: ["8:00 AM", "5:30 PM", "8:00 PM"],
        discount: 20
    },
    {
        id: 4,
        name: "Nutrition Consultation",
        description: "Professional nutrition advice and meal planning. Get personalized diet recommendations from our certified nutritionist.",
        price: 75,
        originalPrice: 90,
        duration: "45 minutes",
        type: "One-on-One",
        category: "Nutrition",
        rating: 4.7,
        reviews: 67,
        image: "/api/placeholder/300/200",
        features: ["Meal planning", "Diet analysis", "Supplement advice", "Follow-up support"],
        trainer: "Dr. Lisa Park",
        location: "Consultation Room",
        availableSlots: ["10:00 AM", "3:00 PM", "5:00 PM"],
        discount: 17
    }
];

// Dummy data for packages
const packagesData = [
    {
        id: 1,
        name: "Starter Package",
        description: "Perfect for beginners starting their fitness journey. Includes personal training and group classes.",
        price: 299,
        originalPrice: 399,
        duration: "1 month",
        sessions: 8,
        type: "Mixed",
        category: "Beginner",
        rating: 4.8,
        reviews: 45,
        image: "/api/placeholder/300/200",
        features: [
            "4 Personal Training Sessions",
            "4 Group Classes",
            "Nutrition Consultation",
            "Progress Tracking",
            "Gym Access"
        ],
        popular: true,
        discount: 25
    },
    {
        id: 2,
        name: "Premium Fitness",
        description: "Comprehensive fitness package for serious athletes. Includes unlimited classes and premium services.",
        price: 599,
        originalPrice: 799,
        duration: "1 month",
        sessions: "Unlimited",
        type: "Premium",
        category: "Advanced",
        rating: 4.9,
        reviews: 78,
        image: "/api/placeholder/300/200",
        features: [
            "Unlimited Group Classes",
            "2 Personal Training Sessions",
            "Nutrition Consultation",
            "Body Composition Analysis",
            "Recovery Sessions",
            "24/7 Gym Access"
        ],
        popular: false,
        discount: 25
    },
    {
        id: 3,
        name: "Wellness Bundle",
        description: "Focus on mental and physical wellness with yoga, meditation, and nutrition guidance.",
        price: 199,
        originalPrice: 249,
        duration: "1 month",
        sessions: 6,
        type: "Wellness",
        category: "Mindfulness",
        rating: 4.7,
        reviews: 32,
        image: "/api/placeholder/300/200",
        features: [
            "4 Yoga Classes",
            "2 Meditation Sessions",
            "Nutrition Consultation",
            "Wellness Assessment",
            "Mindfulness App Access"
        ],
        popular: false,
        discount: 20
    }
];

export default function CreditsBundlesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [wishlist, setWishlist] = useState<number[]>([]);

    const categories = ["all", "Fitness", "Cardio", "Wellness", "Nutrition", "Beginner", "Advanced", "Mindfulness"];

    const toggleWishlist = (id: number) => {
        setWishlist(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const filteredSessions = sessionsData.filter(session => {
        const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || session.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredPackages = packagesData.filter(pkg => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || pkg.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Book Sessions & Packages</h1>
                            <p className="text-gray-600 mt-2">Choose from our wide range of fitness sessions and packages</p>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search sessions or packages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full sm:w-64"
                                />
                            </div>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === "all" ? "All Categories" : category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="sessions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="sessions" className="text-lg">Sessions</TabsTrigger>
                        <TabsTrigger value="packages" className="text-lg">Packages</TabsTrigger>
                    </TabsList>

                    {/* Sessions Tab */}
                    <TabsContent value="sessions" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSessions.map((session) => (
                                <Card key={session.id} className="group hover:shadow-lg transition-shadow duration-300 relative">
                                    {/* Discount Badge */}
                                    {session.discount > 0 && (
                                        <Badge className="absolute top-3 left-3 bg-green-500 text-white z-10">
                                            -{session.discount}%
                                        </Badge>
                                    )}

                                    {/* Wishlist Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-3 right-3 z-10 p-2 h-8 w-8"
                                        onClick={() => toggleWishlist(session.id)}
                                    >
                                        <Heart
                                            className={`h-4 w-4 ${wishlist.includes(session.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                                                }`}
                                        />
                                    </Button>

                                    {/* Session Image */}
                                    <div className="relative overflow-hidden rounded-t-lg">
                                        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                            <span className="text-white text-lg font-semibold">{session.name}</span>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="text-xs">
                                                {session.category}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span>{session.rating}</span>
                                                <span>({session.reviews})</span>
                                            </div>
                                        </div>

                                        <CardTitle className="text-lg line-clamp-2">{session.name}</CardTitle>
                                        <CardDescription className="text-sm line-clamp-2">
                                            {session.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Features */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm text-gray-900">What's Included:</h4>
                                            <ul className="space-y-1">
                                                {session.features.slice(0, 3).map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Session Details */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="h-4 w-4" />
                                                <span>{session.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="h-4 w-4" />
                                                <span>{session.type}</span>
                                            </div>
                                        </div>

                                        {/* Trainer & Location */}
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Trainer:</span>
                                                <span>{session.trainer}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{session.location}</span>
                                            </div>
                                        </div>

                                        {/* Available Times */}
                                        <div>
                                            <h4 className="font-medium text-sm text-gray-900 mb-2">Available Times:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {session.availableSlots.map((slot, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {slot}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price and Book Button */}
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900">${session.price}</span>
                                                {session.originalPrice && session.originalPrice > session.price && (
                                                    <span className="text-sm text-gray-500 line-through">${session.originalPrice}</span>
                                                )}
                                            </div>
                                            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                                                <ShoppingCart className="h-4 w-4" />
                                                Book Now
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredSessions.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No sessions found matching your criteria.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Packages Tab */}
                    <TabsContent value="packages" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPackages.map((pkg) => (
                                <Card key={pkg.id} className="group hover:shadow-lg transition-shadow duration-300 relative">
                                    {/* Popular Badge */}
                                    {pkg.popular && (
                                        <Badge className="absolute top-3 left-3 bg-blue-500 text-white z-10">
                                            Most Popular
                                        </Badge>
                                    )}

                                    {/* Discount Badge */}
                                    {pkg.discount > 0 && (
                                        <Badge className="absolute top-3 right-3 bg-green-500 text-white z-10">
                                            -{pkg.discount}%
                                        </Badge>
                                    )}

                                    {/* Package Image */}
                                    <div className="relative overflow-hidden rounded-t-lg">
                                        <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                            <span className="text-white text-lg font-semibold">{pkg.name}</span>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="text-xs">
                                                {pkg.category}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span>{pkg.rating}</span>
                                                <span>({pkg.reviews})</span>
                                            </div>
                                        </div>

                                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {pkg.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Package Details */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="h-4 w-4" />
                                                <span>{pkg.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="h-4 w-4" />
                                                <span>{pkg.sessions} sessions</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm text-gray-900">What's Included:</h4>
                                            <ul className="space-y-1">
                                                {pkg.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Price and Book Button */}
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900">${pkg.price}</span>
                                                <span className="text-sm text-gray-500 line-through">${pkg.originalPrice}</span>
                                            </div>
                                            <Button className="flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4" />
                                                Purchase
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredPackages.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No packages found matching your criteria.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
