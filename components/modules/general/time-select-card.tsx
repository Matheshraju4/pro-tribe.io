import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface TimeSelectCardProps {
  day: string;
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

const TimeSelectCard = ({
  day,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeSelectCardProps) => {
  // Generate time options from 6 AM to 10 PM
  const timeOptions = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6; // Start from 6 AM
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="flex justify-between  bg-gray-50 rounded-lg ">
      {/* Day Label - aligned with select fields */}
      <div className="flex gap-4 p-3 max-w-md">
        <div className="flex items-end min-w-[80px]">
          <span className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-md border h-10 flex items-center">
            {day}
          </span>
        </div>

        {/* Start Time */}
        <div className="flex-1">
          <Label className="text-xs text-gray-600 mb-1 block">Start Time</Label>
          <Select value={startTime} onValueChange={onStartTimeChange}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-primary focus:ring-primary">
              <SelectValue placeholder="Select Start Time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* End Time */}
        <div className="flex-1">
          <Label className="text-xs text-gray-600 mb-1 block">End Time</Label>
          <Select value={endTime} onValueChange={onEndTimeChange}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-primary focus:ring-primary">
              <SelectValue placeholder="Select End Time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time Duration Display */}
      <div className="flex items-center">
        {startTime && endTime && (
          <Badge className="text-md">
            {startTime} - {endTime}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TimeSelectCard;
