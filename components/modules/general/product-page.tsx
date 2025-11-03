"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { CalendarIcon, Trash, Trash2, X, Package as PackageIcon, Clock, Crown } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// TypeScript interfaces
interface SessionData {
    id: string;
    sessionName: string;
    sessionDescription?: string;
    sessionDuration?: string;
    sessionLocation?: string;
    sessionPrice?: string;
    sessionMaxCapacity?: number;
    isActive: boolean;
    trainerId: string;
}

interface PackageData {
    id: string;
    packageName: string;
    packageDescription?: string;
    packagePrice?: string;
    packageDiscount?: string;
    validDays?: string;
    acceptedPaymentMethod: string[];
    trainerId: string;
}

interface MembershipData {
    id: string;
    membershipName: string;
    membershipDescription?: string;
    billingPeriod: 'Weekly' | 'Monthly' | 'Yearly';
    weeklyPrice?: string;
    monthlyPrice?: string;
    yearlyPrice?: string;
    autoRenewal: boolean;
    visibility: 'Public' | 'Private';
    isActive: boolean;
    trainerId: string;
}

type ProductType = 'session' | 'package' | 'membership';

interface ProductData {
    type: ProductType;
    data: SessionData | PackageData | MembershipData;
}

const ViewSingleBundle = () => {

    const { id } = useParams();
    const [selectedDatesAndTime, setSelectedDatesAndTime] = useState<{ date: Date, time: string }[]>([]);
    const [productData, setProductData] = useState<ProductData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog state for appointment creation
    const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'stripe'>('cash');
    const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(undefined);
    const [appointmentTime, setAppointmentTime] = useState<string>('');

    async function fetchDetails() {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/trainer/singleprogram?id=${id}`);

            if (response.status === 200 && response.data.success) {
                setProductData({
                    type: response.data.type,
                    data: response.data.data
                });
            }
        } catch (error) {
            console.log("Error fetching details", error);
            toast.error("Failed to load product details");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const availableTimes = [
        {
            time: "10:00 AM",
            isAvailable: true,
        },
        {
            time: "11:00 AM",
            isAvailable: true,
        },
        {
            time: "12:00 PM",
            isAvailable: true,
        },
        {
            time: "1:00 PM",
            isAvailable: true,
        },
        {
            time: "2:00 PM",
            isAvailable: true,
        },
        {
            time: "3:00 PM",
            isAvailable: true,
        },];

    // Helper functions
    const isSession = productData?.type === 'session';
    const isPackage = productData?.type === 'package';
    const isMembership = productData?.type === 'membership';

    const getProductName = () => {
        if (!productData) return '';
        if (isSession) return (productData.data as SessionData).sessionName;
        if (isPackage) return (productData.data as PackageData).packageName;
        if (isMembership) return (productData.data as MembershipData).membershipName;
        return '';
    };

    const getProductDescription = () => {
        if (!productData) return '';
        if (isSession) return (productData.data as SessionData).sessionDescription;
        if (isPackage) return (productData.data as PackageData).packageDescription;
        if (isMembership) return (productData.data as MembershipData).membershipDescription;
        return '';
    };

    const getProductPrice = () => {
        if (!productData) return '0';
        if (isSession) return (productData.data as SessionData).sessionPrice || '0';
        if (isPackage) return (productData.data as PackageData).packagePrice || '0';
        if (isMembership) {
            const membership = productData.data as MembershipData;
            // Return price based on billing period
            if (membership.billingPeriod === 'Weekly') return membership.weeklyPrice || '0';
            if (membership.billingPeriod === 'Monthly') return membership.monthlyPrice || '0';
            if (membership.billingPeriod === 'Yearly') return membership.yearlyPrice || '0';
        }
        return '0';
    };

    const getProductDiscount = () => {
        if (!productData || !isPackage) return null;
        return (productData.data as PackageData).packageDiscount;
    };

    const calculateDiscountedPrice = (price: string, discount: string | undefined) => {
        if (!discount) return parseFloat(price);
        const priceNum = parseFloat(price);
        const discountNum = parseFloat(discount);
        return priceNum - (priceNum * discountNum / 100);
    };

    // Handler to open appointment dialog
    const handlePaymentClick = (method: 'cash' | 'stripe') => {
        setSelectedPaymentMethod(method);
        setIsAppointmentDialogOpen(true);
    };

    // Handler to create appointment
    const handleCreateAppointment = async () => {
        // For sessions, use the selectedDatesAndTime from the page
        if (isSession) {
            const appointmentsWithTime = selectedDatesAndTime.filter(item => item.time);

            if (appointmentsWithTime.length === 0) {
                toast.error("Please select at least one date and time slot on the page");
                return;
            }

            try {
                toast.loading(`Creating ${appointmentsWithTime.length} appointment${appointmentsWithTime.length > 1 ? 's' : ''}...`);

                // Create multiple appointments for each selected date/time
                const appointmentPromises = appointmentsWithTime.map(({ date, time }) => {
                    const appointmentData = {
                        appointmentName: getProductName(),
                        appointmentDescription: getProductDescription() || `Appointment for ${getProductName()}`,
                        appointmentDate: date.toISOString(),
                        startTime: time,
                        appointmentLocation: (productData?.data as SessionData).sessionLocation || "Online",
                        appointmentPrice: getProductPrice(),
                        sessionId: (productData?.data as SessionData).id,
                        paymentMethod: selectedPaymentMethod,
                    };
                    return axios.post('/api/appointments/book', appointmentData);
                });

                const results = await Promise.all(appointmentPromises);

                const successCount = results.filter(r => r.data.success).length;

                toast.dismiss();
                if (successCount === appointmentsWithTime.length) {
                    toast.success(`${successCount} appointment${successCount > 1 ? 's' : ''} booked successfully!`);
                } else {
                    toast.warning(`${successCount} of ${appointmentsWithTime.length} appointments created`);
                }

                if (selectedPaymentMethod === 'cash') {
                    toast.info("Payment will be collected in person");
                } else {
                    toast.info("Payment processed via Stripe");
                }

                // Close dialog and clear selections
                setIsAppointmentDialogOpen(false);
                setSelectedDatesAndTime([]);
            } catch (error: any) {
                toast.dismiss();
                console.error("Error creating appointments:", error);

                if (error.response?.status === 401) {
                    toast.error("Please login to book an appointment");
                } else if (error.response?.data?.error) {
                    toast.error(error.response.data.error);
                } else {
                    toast.error("Failed to create appointments. Please try again.");
                }
            }
        } else {
            // For packages/memberships, use the dialog date/time picker
            if (!appointmentDate || !appointmentTime) {
                toast.error("Please select both date and time for your appointment");
                return;
            }

            try {
                toast.loading("Creating appointment...");

                const appointmentData = {
                    appointmentName: getProductName(),
                    appointmentDescription: getProductDescription() || `Appointment for ${getProductName()}`,
                    appointmentDate: appointmentDate.toISOString(),
                    startTime: appointmentTime,
                    appointmentLocation: "Online",
                    appointmentPrice: getProductPrice(),
                    sessionId: undefined,
                    paymentMethod: selectedPaymentMethod,
                };

                const response = await axios.post('/api/appointments/book', appointmentData);

                if (response.data.success) {
                    toast.dismiss();
                    toast.success(`Appointment booked successfully for ${appointmentDate.toLocaleDateString()} at ${appointmentTime}!`);

                    if (selectedPaymentMethod === 'cash') {
                        toast.info("Payment will be collected in person");
                    } else {
                        toast.info("Payment processed via Stripe");
                    }

                    // Close dialog and reset
                    setIsAppointmentDialogOpen(false);
                    setAppointmentDate(undefined);
                    setAppointmentTime('');
                } else {
                    toast.dismiss();
                    toast.error(response.data.error || "Failed to create appointment");
                }
            } catch (error: any) {
                toast.dismiss();
                console.error("Error creating appointment:", error);

                if (error.response?.status === 401) {
                    toast.error("Please login to book an appointment");
                } else if (error.response?.data?.error) {
                    toast.error(error.response.data.error);
                } else {
                    toast.error("Failed to create appointment. Please try again.");
                }
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Product not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left Column - Image */}
                    <div className="w-full flex-col gap-6">
                        <div className=" top-8">
                            <div className="relative aspect-square w-full max-w-[500px] mx-auto">
                                <Image
                                    src="/images/card_image.jpg"
                                    alt={getProductName()}
                                    fill
                                    className="rounded-2xl object-cover shadow-xl"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Only show date selection for sessions */}
                        {isSession && (
                            <>
                                <div className="mt-3">
                                    <SelectedDates
                                        selectedDatesAndTime={selectedDatesAndTime}
                                        setSelectedDatesAndTime={setSelectedDatesAndTime}
                                    />
                                </div>
                                <div className="mt-3">
                                    <BookNowSection
                                        selectedDatesAndTime={selectedDatesAndTime}
                                        perPrice={getProductPrice()}
                                        discount={getProductDiscount()}
                                        handlePaymentClick={handlePaymentClick}
                                    />
                                </div>
                            </>
                        )}

                        {/* For packages, show booking section */}
                        {isPackage && (
                            <div className="mt-3">
                                <PackageBookingSection
                                    price={getProductPrice()}
                                    discount={getProductDiscount()}
                                    validDays={(productData.data as PackageData).validDays}
                                    handlePaymentClick={handlePaymentClick}
                                    appointmentDate={appointmentDate}
                                    appointmentTime={appointmentTime}
                                />
                            </div>
                        )}

                        {/* For memberships, show booking section */}
                        {isMembership && (
                            <div className="mt-3">
                                <MembershipBookingSection
                                    membershipData={productData.data as MembershipData}
                                    handlePaymentClick={handlePaymentClick}
                                    appointmentDate={appointmentDate}
                                    appointmentTime={appointmentTime}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="w-full max-w-lg space-y-6">
                        <Card className="shadow-lg border-0 gap-0">
                            <CardHeader className="space-y-3 pb-4">
                                <div className="flex items-center gap-2">
                                    {isSession && <Clock className="w-6 h-6 text-primary" />}
                                    {isPackage && <PackageIcon className="w-6 h-6 text-primary" />}
                                    {isMembership && <Crown className="w-6 h-6 text-primary" />}
                                    <span className="text-sm font-medium text-primary uppercase tracking-wide">
                                        {isSession && 'Session'}
                                        {isPackage && 'Package'}
                                        {isMembership && 'Membership'}
                                    </span>
                                </div>
                                <CardTitle className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                                    {getProductName()}
                                </CardTitle>
                                <CardDescription className="text-lg font-semibold flex items-center gap-2 flex-wrap">
                                    {getProductDiscount() ? (
                                        <>
                                            <span className="text-gray-400 line-through text-lg">${getProductPrice()}</span>
                                            <span className="text-primary text-2xl">
                                                ${calculateDiscountedPrice(getProductPrice(), getProductDiscount() ?? undefined).toFixed(2)}
                                            </span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                {getProductDiscount()}% OFF
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-primary text-2xl">${getProductPrice()}</span>
                                    )}
                                    {isSession && (productData.data as SessionData).sessionDuration && (
                                        <>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-gray-600">{(productData.data as SessionData).sessionDuration}</span>
                                        </>
                                    )}
                                    {isPackage && (productData.data as PackageData).validDays && (
                                        <>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-gray-600">Valid for {(productData.data as PackageData).validDays} days</span>
                                        </>
                                    )}
                                    {isMembership && (productData.data as MembershipData).billingPeriod && (
                                        <>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-gray-600">/{(productData.data as MembershipData).billingPeriod}</span>
                                        </>
                                    )}
                                </CardDescription>
                            </CardHeader>

                            <Separator className="mb-6" />

                            <CardContent className="space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {isSession && 'About This Session'}
                                        {isPackage && 'About This Package'}
                                        {isMembership && 'About This Membership'}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {getProductDescription() || 'No description available'}
                                    </p>
                                </div>

                                {/* Session-specific info */}
                                {isSession && (
                                    <>
                                        {(productData.data as SessionData).sessionLocation && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-semibold">Location:</span>
                                                <span>{(productData.data as SessionData).sessionLocation}</span>
                                            </div>
                                        )}
                                        {(productData.data as SessionData).sessionMaxCapacity && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-semibold">Max Capacity:</span>
                                                <span>{(productData.data as SessionData).sessionMaxCapacity} participants</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Membership-specific info */}
                                {isMembership && (
                                    <div className="bg-primary/5 p-4 rounded-lg space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-900">Membership Benefits</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-semibold">Billing:</span>
                                                <span>{(productData.data as MembershipData).billingPeriod}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-semibold">Auto-Renewal:</span>
                                                <span>{(productData.data as MembershipData).autoRenewal ? 'Yes' : 'No'}</span>
                                            </div>
                                            {(productData.data as MembershipData).weeklyPrice && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-semibold">Weekly:</span>
                                                    <span>${(productData.data as MembershipData).weeklyPrice}</span>
                                                </div>
                                            )}
                                            {(productData.data as MembershipData).monthlyPrice && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-semibold">Monthly:</span>
                                                    <span>${(productData.data as MembershipData).monthlyPrice}</span>
                                                </div>
                                            )}
                                            {(productData.data as MembershipData).yearlyPrice && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-semibold">Yearly:</span>
                                                    <span>${(productData.data as MembershipData).yearlyPrice}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Calendar Section - Only for Sessions */}
                                {/* Date and Time Selection for all product types */}
                                <div className="w-full flex flex-col gap-2 justify-center items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 w-full text-left">
                                        {isSession && 'Select a Date'}
                                        {isPackage && 'Select Appointment Date'}
                                        {isMembership && 'Select Membership Start Date'}
                                    </h3>
                                    <div className="flex bg-white p-4 rounded-lg border border-gray-200 w-[400px] justify-center items-center">
                                        <div className="w-full flex justify-center items-center">
                                            {isSession ? (
                                                <Calendar
                                                    className="rounded-md w-full h-full"
                                                    mode="multiple"
                                                    classNames={{
                                                        day: "m-2"
                                                    }}
                                                    selected={selectedDatesAndTime.map(item => item.date)}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const datesArray = Array.isArray(date) ? date : [date];

                                                        // Preserve existing times for dates that already exist
                                                        setSelectedDatesAndTime(prev => {
                                                            return datesArray.map(d => {
                                                                const existing = prev.find(p =>
                                                                    p.date.getTime() === d.getTime()
                                                                );
                                                                return existing ? existing : { date: d, time: "" };
                                                            });
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                <Calendar
                                                    className="rounded-md w-full h-full"
                                                    mode="single"
                                                    classNames={{
                                                        day: "m-2"
                                                    }}
                                                    selected={appointmentDate}
                                                    onSelect={setAppointmentDate}
                                                    disabled={(date) => date < new Date()}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-col gap-2 justify-center items-center py-3">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 w-full text-left">Available Times</h3>
                                        <div className="grid grid-cols-3 gap-2 w-full">
                                            {availableTimes.map((time) => (
                                                <Button
                                                    key={time.time}
                                                    variant={isSession ? "outline" : (appointmentTime === time.time ? "default" : "outline")}
                                                    className="w-full h-12"
                                                    onClick={() => {
                                                        if (isSession) {
                                                            // Find the first date without a time
                                                            const dateWithoutTime = selectedDatesAndTime.find(item => !item.time);

                                                            if (!dateWithoutTime) {
                                                                toast.error("Please select a date first");
                                                                return;
                                                            }

                                                            // Update the date with the selected time
                                                            setSelectedDatesAndTime(prev =>
                                                                prev.map(item =>
                                                                    item.date.getTime() === dateWithoutTime.date.getTime()
                                                                        ? { ...item, time: time.time }
                                                                        : item
                                                                )
                                                            );

                                                            toast.success(`Time ${time.time} assigned`);
                                                        } else {
                                                            // For packages and memberships
                                                            if (!appointmentDate) {
                                                                toast.error("Please select a date first");
                                                                return;
                                                            }
                                                            setAppointmentTime(time.time);
                                                        }
                                                    }}
                                                    disabled={!time.isAvailable}
                                                >
                                                    {time.time}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selected Info for Packages/Memberships */}
                                    {!isSession && appointmentDate && appointmentTime && (
                                        <div className="w-full bg-primary/10 border border-primary/20 p-3 rounded-lg">
                                            <p className="text-xs font-medium text-gray-900 mb-1">
                                                {isPackage && 'Selected Appointment'}
                                                {isMembership && 'Membership Starts'}
                                            </p>
                                            <p className="text-xs text-gray-700">
                                                📅 {appointmentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-gray-700">
                                                🕐 {appointmentTime}
                                            </p>
                                        </div>
                                    )}
                                </div>



                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Appointment Creation Dialog */}
            <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Confirm {isSession ? 'Appointments' : 'Appointment'}</DialogTitle>
                        <DialogDescription>
                            Review your selected {isSession ? 'appointments' : 'appointment'} and confirm booking. Payment will be processed via {selectedPaymentMethod === 'cash' ? 'Cash' : 'Stripe'}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Product Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900">{getProductName()}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Price per session: <span className="font-semibold text-primary">${getProductPrice()}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Payment: <span className="font-semibold">{selectedPaymentMethod === 'cash' ? 'Cash' : 'Stripe'}</span>
                            </p>
                        </div>

                        {/* For Sessions: Show selected dates/times from page */}
                        {isSession ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Selected Appointments ({selectedDatesAndTime.filter(item => item.time).length})
                                </label>
                                {selectedDatesAndTime.filter(item => item.time).length > 0 ? (
                                    <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-2">
                                        {selectedDatesAndTime.filter(item => item.time).map((item, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border">
                                                <div className="flex items-center gap-3">
                                                    <CalendarIcon className="w-4 h-4 text-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </p>
                                                        <p className="text-xs text-gray-600">{item.time}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-primary">${getProductPrice()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border rounded-lg p-8 text-center">
                                        <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">No appointments selected</p>
                                        <p className="text-xs text-gray-400 mt-1">Please select dates and times from the page above</p>
                                    </div>
                                )}

                                {/* Total for sessions */}
                                {selectedDatesAndTime.filter(item => item.time).length > 0 && (
                                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">Total Amount</span>
                                            <span className="text-lg font-bold text-primary">
                                                ${(parseFloat(getProductPrice()) * selectedDatesAndTime.filter(item => item.time).length).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {selectedDatesAndTime.filter(item => item.time).length} session{selectedDatesAndTime.filter(item => item.time).length > 1 ? 's' : ''} × ${getProductPrice()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* For Packages/Memberships: Show selected date/time summary */
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Selected Appointment
                                </label>
                                {appointmentDate && appointmentTime ? (
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon className="w-4 h-4 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {appointmentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-gray-600">{appointmentTime}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-primary">${getProductPrice()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border rounded-lg p-8 text-center">
                                        <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">No date/time selected</p>
                                        <p className="text-xs text-gray-400 mt-1">Please select a date and time from the page above</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAppointmentDialogOpen(false);
                                setAppointmentDate(undefined);
                                setAppointmentTime('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateAppointment}
                            disabled={isSession
                                ? selectedDatesAndTime.filter(item => item.time).length === 0
                                : !appointmentDate || !appointmentTime
                            }
                            className="bg-primary hover:bg-primary/90"
                        >
                            Confirm {isSession && selectedDatesAndTime.filter(item => item.time).length > 1 ? 'Appointments' : 'Appointment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ViewSingleBundle



function SelectedDates({ selectedDatesAndTime, setSelectedDatesAndTime }: { selectedDatesAndTime: { date: Date, time: string }[], setSelectedDatesAndTime: (dates: { date: Date, time: string }[]) => void }) {

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateShort = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="shadow-md border-2 border-primary/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-900">
                    Selected Dates
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                    {selectedDatesAndTime.length} appointment{selectedDatesAndTime.length !== 1 ? 's' : ''} scheduled
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    {selectedDatesAndTime.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 rounded-lg border border-primary/20 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-4 h-4 text-primary" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatDateShort(item.date)}
                                    </span>
                                    {item.time && (
                                        <span className="text-xs text-gray-600">
                                            {item.time}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedDatesAndTime(selectedDatesAndTime.filter((_, i) => i !== index));
                                }}
                                className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors group"
                                aria-label="Delete appointment"
                            >
                                <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                            </button>
                        </div>
                    ))}

                </div>
                {selectedDatesAndTime.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No appointments scheduled
                    </p>
                )}
            </CardContent>
        </Card>
    );
}


function BookNowSection({ selectedDatesAndTime, perPrice, discount, handlePaymentClick }: { selectedDatesAndTime: { date: Date, time: string }[], perPrice: string, discount?: string | null, handlePaymentClick: (method: 'cash' | 'stripe') => void }) {
    const pricePerAppointment = discount
        ? parseFloat(perPrice) - (parseFloat(perPrice) * parseFloat(discount) / 100)
        : parseFloat(perPrice) || 75;
    const appointmentsWithTime = selectedDatesAndTime.filter(item => item.time);
    const appointmentCount = appointmentsWithTime.length;
    const subTotal = appointmentCount * pricePerAppointment;
    const tax = subTotal * 0.1; // 10% tax
    const totalPrice = subTotal + tax;

    if (appointmentCount === 0) {
        return null; // Don't show the section if no appointments with time
    }

    return (
        <Card className="shadow-md border-2 border-primary/20">
            <CardContent className="pt-4 pb-4 space-y-4">
                {/* Total Cost Display */}
                <div className="text-center space-y-1 pb-3 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Total Cost
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-extrabold text-primary">
                            ${totalPrice.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">
                        {appointmentCount} appointment{appointmentCount !== 1 ? 's' : ''} × ${pricePerAppointment.toFixed(2)} + tax
                    </p>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700 text-center">
                        Choose Payment Method
                    </p>

                    {/* Stripe Button */}
                    <Button
                        className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-all"
                        onClick={() => handlePaymentClick('stripe')}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                            </svg>
                            <span>Pay with Stripe</span>
                        </div>
                    </Button>

                    {/* Cash Button */}
                    <Button
                        variant="outline"
                        className="w-full h-11 text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                        onClick={() => handlePaymentClick('cash')}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <span>Pay with Cash</span>
                        </div>
                    </Button>
                </div>

                {/* Info Text */}
                <p className="text-xs text-center text-gray-500">
                    Your booking will be confirmed after payment
                </p>
            </CardContent>
        </Card>
    );
}

// Membership Booking Section - Simplified without date/time selection
function MembershipBookingSection({ membershipData, handlePaymentClick, appointmentDate, appointmentTime }: {
    membershipData: MembershipData,
    handlePaymentClick: (method: 'cash' | 'stripe') => void,
    appointmentDate: Date | undefined,
    appointmentTime: string
}) {
    const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'Weekly' | 'Monthly' | 'Yearly'>(
        membershipData.billingPeriod
    );

    const getPrice = (period: 'Weekly' | 'Monthly' | 'Yearly') => {
        if (period === 'Weekly') return parseFloat(membershipData.weeklyPrice || '0');
        if (period === 'Monthly') return parseFloat(membershipData.monthlyPrice || '0');
        if (period === 'Yearly') return parseFloat(membershipData.yearlyPrice || '0');
        return 0;
    };

    const selectedPrice = getPrice(selectedBillingPeriod);
    const tax = selectedPrice * 0.1; // 10% tax
    const totalPrice = selectedPrice + tax;

    const availablePeriods: Array<'Weekly' | 'Monthly' | 'Yearly'> = [];
    if (membershipData.weeklyPrice) availablePeriods.push('Weekly');
    if (membershipData.monthlyPrice) availablePeriods.push('Monthly');
    if (membershipData.yearlyPrice) availablePeriods.push('Yearly');

    return (
        <Card className="shadow-md border-2 border-primary/20">
            <CardContent className="pt-4 pb-4 space-y-4">
                {/* Billing Period Selection */}
                {availablePeriods.length > 1 && (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-700 text-center">
                            Select Billing Period
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {availablePeriods.map((period) => (
                                <Button
                                    key={period}
                                    variant={selectedBillingPeriod === period ? "default" : "outline"}
                                    className="w-full"
                                    onClick={() => setSelectedBillingPeriod(period)}
                                >
                                    {period}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Total Cost Display */}
                <div className="text-center space-y-1 pb-3 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Membership Price
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-extrabold text-primary">
                            ${totalPrice.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">
                        ${selectedPrice.toFixed(2)} + tax / {selectedBillingPeriod}
                    </p>
                    {membershipData.autoRenewal && (
                        <p className="text-xs text-primary font-medium mt-2">
                            Auto-renews {selectedBillingPeriod.toLowerCase()}
                        </p>
                    )}
                </div>

                {/* Payment Buttons */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700 text-center">
                        Choose Payment Method
                    </p>

                    {/* Stripe Button */}
                    <Button
                        className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-all"
                        onClick={() => handlePaymentClick('stripe')}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                            </svg>
                            <span>Pay with Stripe</span>
                        </div>
                    </Button>

                    {/* Cash Button */}
                    <Button
                        variant="outline"
                        className="w-full h-11 text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                        onClick={() => handlePaymentClick('cash')}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <span>Pay with Cash</span>
                        </div>
                    </Button>
                </div>

                {/* Info Text */}
                <p className="text-xs text-center text-gray-500">
                    Your membership will be activated after payment
                </p>
            </CardContent>
        </Card>
    );
}

// Package Booking Section - Simplified without date/time selection
function PackageBookingSection({ price, discount, validDays, handlePaymentClick, appointmentDate, appointmentTime }: {
    price: string,
    discount?: string | null,
    validDays?: string,
    handlePaymentClick: (method: 'cash' | 'stripe') => void,
    appointmentDate: Date | undefined,
    appointmentTime: string
}) {
    const priceNum = parseFloat(price) || 0;
    const discountNum = discount ? parseFloat(discount) : 0;
    const discountedPrice = discountNum > 0 ? priceNum - (priceNum * discountNum / 100) : priceNum;
    const tax = discountedPrice * 0.1; // 10% tax
    const totalPrice = discountedPrice + tax;

    return (
        <Card className="shadow-md border-2 border-primary/20">
            <CardContent className="pt-4 pb-4 space-y-4">
                {/* Total Cost Display */}
                <div className="text-center space-y-1 pb-3 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Package Price
                    </p>
                    {discountNum > 0 && (
                        <div className="text-sm text-gray-400 line-through">
                            ${priceNum.toFixed(2)}
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-extrabold text-primary">
                            ${totalPrice.toFixed(2)}
                        </span>
                    </div>
                    {discountNum > 0 ? (
                        <p className="text-xs text-gray-500">
                            ${discountedPrice.toFixed(2)} + tax ({discountNum}% discount applied)
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500">
                            ${discountedPrice.toFixed(2)} + tax
                        </p>
                    )}
                    {validDays && (
                        <p className="text-xs text-primary font-medium mt-2">
                            Valid for {validDays} days after purchase
                        </p>
                    )}
                </div>

                {/* Payment Buttons */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700 text-center">
                        Choose Payment Method
                    </p>

                    {/* Stripe Button */}
                    <Button
                        className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-all"
                        onClick={() => handlePaymentClick('stripe')}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                            </svg>
                            <span>Pay with Stripe</span>
                        </div>
                    </Button>

                    {/* Cash Button */}
                    <Button
                        variant="outline"
                        className="w-full h-11 text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                        onClick={() => handlePaymentClick('cash')}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <span>Pay with Cash</span>
                        </div>
                    </Button>
                </div>

                {/* Info Text */}
                <p className="text-xs text-center text-gray-500">
                    Your package will be activated after payment
                </p>
            </CardContent>
        </Card>
    );
}

function BookAppointments({ selectedDatesAndTime, perPrice }: { selectedDatesAndTime: { date: Date, time: string }[], perPrice: string }) {
    const pricePerAppointment = parseFloat(perPrice) || 75;
    const appointmentCount = selectedDatesAndTime.filter(item => item.time).length;
    const subTotal = appointmentCount * pricePerAppointment;
    const tax = subTotal * 0.1; // 10% tax
    const totalPrice = subTotal + tax;
    const appointmentsWithTime = selectedDatesAndTime.filter(item => item.time);

    const formatDateShort = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader className="pb-4 border-b border-gray-200">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    Booking Summary
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-2">
                    Review your appointments before booking
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                {/* Appointments List */}
                {appointmentsWithTime.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Appointments ({appointmentsWithTime.length})
                        </h4>
                        <div className="space-y-2">
                            {appointmentsWithTime.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDateShort(item.date)}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {item.time}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        ${pricePerAppointment.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {appointmentsWithTime.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No appointments selected</p>
                    </div>
                )}

                {/* Price Breakdown */}
                {appointmentsWithTime.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">
                                    ${subTotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Tax (10%)</span>
                                <span className="font-medium text-gray-900">
                                    ${tax.toFixed(2)}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span className="text-gray-900">Total</span>
                                <span className="text-primary text-2xl">
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Booking Button */}
                        <Button
                            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 mt-4"
                            size="lg"
                        >
                            Book {appointmentCount} Appointment{appointmentCount !== 1 ? 's' : ''}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}