import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Session } from "@/prisma/generated/prisma";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Edit,
  Eye,
  MoreVertical,
  Timer,
  Repeat,
  CalendarDays,
  Snowflake,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import ViewSession from "./view-session";

interface SessionCardProps {
  session: Session;
  freezeTheSession: (sessionId: string) => Promise<void>;
}

const SessionCard = ({ session, freezeTheSession }: SessionCardProps) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="group relative w-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 hover:border-primary/20 py-3">
      {/* Status Indicator Bar */}
      {/* <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          session.isActive
            ? "bg-gradient-to-r from-green-500 to-emerald-500"
            : "bg-gradient-to-r from-gray-400 to-gray-500"
        }`}
      /> */}

      <CardHeader className="pb-4 pt-5">
        {/* Title and Badges Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
              {session.sessionName}
            </CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {session.sessionDescription || "No description provided"}
            </p>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge
            variant={
              session.sessionType === "OneToOne" ? "default" : "secondary"
            }
            className="font-medium"
          >
            {session.sessionType === "OneToOne" ? "1-on-1" : "Group"}
          </Badge>
          <Badge
            variant={
              session.sessionFrequency === "OneTime" ? "outline" : "secondary"
            }
            className="font-medium"
          >
            {session.sessionFrequency === "OneTime" ? (
              <>
                <CalendarDays className="h-3 w-3 mr-1" />
                One Time
              </>
            ) : (
              <>
                <Repeat className="h-3 w-3 mr-1" />
                Recurring
              </>
            )}
          </Badge>
          <Badge
            variant={session.isActive ? "default" : "destructive"}
            className={`font-medium ${
              session.isActive
                ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                : ""
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                session.isActive ? "bg-green-600" : "bg-white"
              }`}
            />
            {session.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="">
        {/* Date Information */}
        <div className="bg-gray-50/80 rounded-lg p-3 mb-4 border border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-gray-900">
              {session.sessionFrequency === "OneTime"
                ? formatDate(session.sessionDate)
                : `${formatDate(session.sessionStartDate)} → ${formatDate(
                    session.sessionEndDate
                  )}`}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Location */}
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-0.5 shrink-0">
              <MapPin className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-500 font-medium mb-0.5">
                Location
              </span>
              <span className="text-sm text-gray-900 font-medium truncate">
                {session.sessionLocation || "Not set"}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-0.5 shrink-0">
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-500 font-medium mb-0.5">
                Duration
              </span>
              <span className="text-sm text-gray-900 font-medium">
                {session.sessionDuration || "Not set"}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-0.5 shrink-0">
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-500 font-medium mb-0.5">
                Price
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                ${session.sessionPrice || "0"}
              </span>
            </div>
          </div>

          {/* Capacity (for Group sessions) */}
          {session.sessionType === "Group" && (
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5 shrink-0">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500 font-medium mb-0.5">
                  Capacity
                </span>
                <span className="text-sm text-gray-900 font-medium">
                  {session.sessionMaxCapacity || "0"} people
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Buffer Time (if exists) */}
        {session.bufferTime && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-blue-50/50 rounded-md px-3 py-2 border border-blue-100">
            <Timer className="h-3.5 w-3.5 text-blue-600" />
            <span>
              <span className="font-medium">Buffer:</span> {session.bufferTime}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="">
        <div className="flex gap-2 w-full">
          {session.isActive && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 hover:bg-gray-50 transition-colors"
              onClick={async () => await freezeTheSession(session.id)}
            >
              <Snowflake className="h-3.5 w-3.5 mr-1.5" />
              Freeze
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 transition-colors"
            onClick={() => setViewDialogOpen(true)}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View
          </Button>
        </div>
      </CardFooter>

      {/* View Session Dialog */}
      <ViewSession
        session={session}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </Card>
  );
};

export default SessionCard;
