"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Session, SessionDateAndTime, Tag } from "@/prisma/generated/prisma";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Timer,
  Repeat,
  CalendarDays,
  Tag as TagIcon,
  AlertCircle,
  Edit,
  X,
} from "lucide-react";

interface ViewSessionProps {
  session: Session & {
    sessionTag?: Tag[];
    sessionDateAndTime?: SessionDateAndTime[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewSession = ({ session, open, onOpenChange }: ViewSessionProps) => {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const sortDaysInOrder = (days: SessionDateAndTime[]) => {
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days.sort(
      (a, b) =>
        dayOrder.indexOf(a.selectedDay) - dayOrder.indexOf(b.selectedDay)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* Header */}
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    {session.sessionName}
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600">
                    {session.sessionDescription ||
                      "No description provided for this session"}
                  </DialogDescription>
                </div>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button> */}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    session.sessionType === "OneToOne" ? "default" : "secondary"
                  }
                  className="font-medium px-3 py-1"
                >
                  {session.sessionType === "OneToOne" ? "1-on-1" : "Group"}
                </Badge>
                <Badge
                  variant={
                    session.sessionFrequency === "OneTime"
                      ? "outline"
                      : "secondary"
                  }
                  className="font-medium px-3 py-1"
                >
                  {session.sessionFrequency === "OneTime" ? (
                    <>
                      <CalendarDays className="h-3 w-3 mr-1.5" />
                      One Time
                    </>
                  ) : (
                    <>
                      <Repeat className="h-3 w-3 mr-1.5" />
                      Recurring
                    </>
                  )}
                </Badge>
                <Badge
                  variant={session.isActive ? "default" : "destructive"}
                  className={`font-medium px-3 py-1 ${
                    session.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                      : ""
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      session.isActive ? "bg-green-600" : "bg-red-600"
                    }`}
                  />
                  {session.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </DialogHeader>

            <Separator className="my-6" />

            {/* Session Details */}
            <div className="space-y-6">
              {/* Date Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Schedule
                </h3>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                  {session.sessionFrequency === "OneTime" ? (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 font-medium">
                        Session Date
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(session.sessionDate)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            Start Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatShortDate(session.sessionStartDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            End Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatShortDate(session.sessionEndDate)}
                          </p>
                        </div>
                      </div>

                      {/* Weekly Schedule */}
                      {session.sessionDateAndTime &&
                        session.sessionDateAndTime.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-gray-600 font-medium mb-2">
                              Weekly Schedule
                            </p>
                            <div className="space-y-2">
                              {sortDaysInOrder(session.sessionDateAndTime).map(
                                (timeSlot) => (
                                  <div
                                    key={timeSlot.id}
                                    className="bg-white rounded-md p-3 border border-gray-200 flex items-center justify-between"
                                  >
                                    <span className="font-medium text-gray-900 text-sm">
                                      {timeSlot.selectedDay}
                                    </span>
                                    <span className="text-sm text-gray-600 font-mono">
                                      {timeSlot.startTime} - {timeSlot.endTime}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Key Details Grid */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                  Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-white rounded-md">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          Location
                        </p>
                        <p className="text-sm text-gray-900 font-semibold break-words">
                          {session.sessionLocation || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-white rounded-md">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          Duration
                        </p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {session.sessionDuration || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-white rounded-md">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          Price
                        </p>
                        <p className="text-lg text-gray-900 font-bold">
                          ${session.sessionPrice || "0"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity (for Group sessions) */}
                  {session.sessionType === "Group" && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 bg-white rounded-md">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            Max Capacity
                          </p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {session.sessionMaxCapacity || "0"} participants
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buffer Time */}
                  {session.bufferTime && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 bg-white rounded-md">
                          <Timer className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-600 font-medium mb-1">
                            Buffer Time
                          </p>
                          <p className="text-sm text-blue-900 font-semibold">
                            {session.bufferTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Validity */}
                  {session.sessionValidity && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 bg-white rounded-md">
                          <CalendarDays className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            Valid Until
                          </p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {formatShortDate(session.sessionValidity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {session.sessionTag && session.sessionTag.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <TagIcon className="h-4 w-4 mr-2 text-primary" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {session.sessionTag.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="px-3 py-1 text-sm font-medium bg-primary/5 border-primary/20 text-primary"
                      >
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {formatShortDate(session.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {formatShortDate(session.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit Session
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSession;
