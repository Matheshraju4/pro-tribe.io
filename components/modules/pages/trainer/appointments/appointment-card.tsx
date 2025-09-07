import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Video,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: {
    id: string;
    appointmentName: string;
    appointmentDescription?: string | null;
    appointmentDate?: Date | null;
    appointmentPrice?: string | null;
    location?: string | null;
    meetingUrl?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    appointpaidStatus: "Paid" | "Unpaid";
    status: "Scheduled" | "Cancelled" | "Completed";
    appointmentLocation: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const AppointmentCard = ({
  appointment,
  onEdit,
  onDelete,
}: AppointmentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaidStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Unpaid":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {appointment.appointmentName}
            </CardTitle>
            {appointment.appointmentDescription && (
              <p className="text-sm text-gray-600 mt-1">
                {appointment.appointmentDescription}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "px-2.5 py-0.5 text-xs font-semibold",
                getStatusColor(appointment.status)
              )}
            >
              {appointment.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit?.(appointment.id)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(appointment.id)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date and Time */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {appointment.appointmentDate
                ? format(appointment.appointmentDate, "MMM dd, yyyy")
                : "Date not set"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
        </div>

        {/* Location and Meeting URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{appointment.appointmentLocation}</span>
          </div>
          {appointment.meetingUrl && (
            <div className="flex items-center gap-2 text-gray-600">
              <Video className="h-4 w-4" />
              <a
                href={appointment.meetingUrl}
                className="text-sm text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Meeting
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between items-center">
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">
            {appointment.appointmentPrice || "Free"}
          </span>
        </div>

        {/* Payment Status */}
        <Badge
          className={cn(
            "px-2.5 py-0.5 text-xs font-semibold",
            getPaidStatusColor(appointment.appointpaidStatus)
          )}
        >
          {appointment.appointpaidStatus}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default AppointmentCard;
