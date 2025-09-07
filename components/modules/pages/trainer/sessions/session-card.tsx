import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Session } from "@/prisma/generated/prisma";
import { Calendar, Clock, Users, MapPin, DollarSign } from "lucide-react";

interface SessionCardProps {
  session: Session;
}

const SessionCard = ({ session }: SessionCardProps) => {
  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    // Use a consistent date format that works the same on server and client
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}/${day}/${year}`;
  };

  const formatTime = (time: string) => {
    if (!time) return "Not set";
    return time;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 max-w-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {session.sessionName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                session.sessionType === "OneToOne" ? "default" : "secondary"
              }
              className="ml-2"
            >
              {session.sessionType}
            </Badge>
            <Badge
              variant={session.isActive ? "default" : "destructive"}
              className="text-xs"
            >
              {session.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {session.sessionDescription}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Calendar className="h-4 w-4" />
          <span className="text-nowrap">
            {session.sessionFrequency === "OneTime"
              ? formatDate(session.sessionDate)
              : `${formatDate(session.sessionStartDate)} - ${formatDate(
                  session.sessionEndDate
                )}`}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{session.sessionLocation || "Not set"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{session.sessionDuration || "Not set"}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>${session.sessionPrice || "0"}</span>
          </div>
        </div>

        {session.sessionType === "Group" && session.sessionMaxCapacity && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Max {session.sessionMaxCapacity} participants</span>
          </div>
        )}

        {session.bufferTime && (
          <div className="text-sm text-gray-500">
            Buffer time: {session.bufferTime}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex h-full justify-between items-end pt-3">
        <div className="flex gap-2 justify-end w-full">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="default" size="sm">
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SessionCard;
