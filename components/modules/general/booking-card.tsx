import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";

interface BookingCardProps {
    title: string;
    description: string;
    price: string;
    image: string;
    onBook?: () => void;
    buttonText?: string;
    type: "session" | "package" | "membership";
}

const BookingCard = ({
    title,
    description,
    price,
    image,
    onBook,
    buttonText = "Book Now",
    type = "session",
}: BookingCardProps) => {
    return (
        <Card className="w-full max-w-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 pt-0">
            {/* Image Section */}
            <div className="w-full p-2 rounded-md">
                <div className="relative h-48 w-full overflow-hidden rounded-md ">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                    <Badge className={cn(
                        "absolute top-2 right-2",
                        type === "session" && "bg-green-600 text-white",
                        type === "package" && "bg-blue-500 text-white",
                        type === "membership" && "bg-purple-600 text-white"
                    )}>
                        {type}
                    </Badge>
                </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-6 space-y-3 pt-0 pb-0 mb-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {description}
                </p>
            </CardContent>

            {/* Footer with Price and Button */}
            <CardFooter className="px-6  flex items-center justify-between gap-4 pt-0 mt-0 h-full">
                <div className="text-xl font-bold text-primary">
                    {price}
                </div>
                <Button
                    onClick={onBook}
                    className="bg-primary hover:bg-primary/90 text-white px-6 hover:cursor-pointer"
                >
                    {buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default BookingCard;