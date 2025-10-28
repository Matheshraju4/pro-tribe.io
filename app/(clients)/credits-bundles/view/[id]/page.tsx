"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { CalendarIcon, Trash, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";


const ViewSingleBundle = () => {

    const { id } = useParams();
    const [selectedDatesAndTime, setSelectedDatesAndTime] = useState<{ date: Date, time: string }[]>([]);


    async function fetchDetails() {
        try {
            const response = await axios.get(`/api/trainer/singleprogram?id=${id}`);

            console.log("Response", JSON.stringify(response.data, null, 2));
            if (response.status === 200) {
                console.log("Fetched details successfully", JSON.stringify(response.data.data));
            }
        } catch (error) {
            console.log("Error fetching details", error);
        }
    }

    useEffect(() => {
        fetchDetails();
    }, []);

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
        },]

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
                                    alt="Bundle Image"
                                    fill
                                    className="rounded-2xl object-cover shadow-xl"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <SelectedDates selectedDatesAndTime={selectedDatesAndTime} setSelectedDatesAndTime={setSelectedDatesAndTime} />
                        </div>
                        <div className="mt-3">
                            <BookNowSection selectedDatesAndTime={selectedDatesAndTime} perPrice="75" />

                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="w-full max-w-lg space-y-6">
                        <Card className="shadow-lg border-0 gap-0">
                            <CardHeader className="space-y-3 pb-4">
                                <CardTitle className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                                    Personal Training Session
                                </CardTitle>
                                <CardDescription className="text-lg font-semibold flex items-center gap-2">
                                    <span className="text-primary text-2xl">$75</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-600">60 minutes</span>
                                </CardDescription>
                            </CardHeader>

                            <Separator className="mb-6" />

                            <CardContent className="space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Session</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        AI, or artificial intelligence, is the ability of computers to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making. It works by using large amounts of data to recognize patterns, make predictions, and learn from mistakes, enabling systems to perform tasks like speech recognition, language translation, and autonomous decision-making.
                                    </p>
                                </div>

                                {/* Calendar Section */}
                                <div className="w-full flex flex-col gap-2 justify-center items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 w-full text-left">Select a Date</h3>
                                    <div className="flex  bg-white p-4 rounded-lg border border-gray-200  w-[400px] justify-center items-center">
                                        <div className="w-full flex justify-center items-center ">
                                            <Calendar
                                                className="rounded-md w-full h-full"
                                                mode="multiple"
                                                classNames={{
                                                    day: "m-2"
                                                }}
                                                selected={selectedDatesAndTime.map(item => item.date)}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    console.log("Date", date);
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
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-col gap-2 justify-center items-center py-3">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 w-full text-left">Available Times</h3>
                                        <div className="grid grid-cols-3 gap-2 w-full">
                                            {availableTimes.map((time) => (
                                                <Button
                                                    key={time.time}
                                                    variant="outline"
                                                    className="w-full h-12"
                                                    onClick={() => {
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
                                                    }}
                                                >
                                                    {time.time}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
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


function BookNowSection({ selectedDatesAndTime, perPrice }: { selectedDatesAndTime: { date: Date, time: string }[], perPrice: string }) {
    const pricePerAppointment = parseFloat(perPrice) || 75;
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
                        onClick={() => {
                            toast.info("Redirecting to Stripe payment...");
                        }}
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
                        onClick={() => {
                            toast.info("Cash payment selected");
                        }}
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