"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Clock, Save } from "lucide-react";
import { NormalLoader } from "@/components/modules/general/loader";

interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface AvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS_OF_WEEK = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export function AvailabilityDialog({ open, onOpenChange }: AvailabilityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      startTime: "09:00",
      endTime: "17:00",
      enabled: false,
    }))
  );

  useEffect(() => {
    if (open) {
      fetchAvailability();
    }
  }, [open]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/trainer/availability");
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.availability && data.availability.length > 0) {
          // Create a map of existing availability
          const availabilityMap = new Map(
            data.availability.map((slot: any) => [slot.dayOfWeek, slot])
          );

          // Update the state with fetched data
          setAvailability(
            DAYS_OF_WEEK.map((day) => {
              const existingSlot = availabilityMap.get(day.value) as { startTime: string; endTime: string } | undefined;
              return existingSlot
                ? {
                    dayOfWeek: day.value,
                    startTime: existingSlot.startTime,
                    endTime: existingSlot.endTime,
                    enabled: true,
                  }
                : {
                    dayOfWeek: day.value,
                    startTime: "09:00",
                    endTime: "17:00",
                    enabled: false,
                  };
            })
          );
        }
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayOfWeek: string, enabled: boolean) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, enabled } : slot
      )
    );
  };

  const handleTimeChange = (
    dayOfWeek: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filter only enabled days
      const enabledSlots = availability.filter((slot) => slot.enabled);

      if (enabledSlots.length === 0) {
        toast.error("Please enable at least one day");
        return;
      }

      // Validate time ranges
      for (const slot of enabledSlots) {
        if (slot.startTime >= slot.endTime) {
          toast.error(`Invalid time range for ${slot.dayOfWeek}`);
          return;
        }
      }

      const response = await fetch("/api/auth/trainer/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availability: enabledSlots.map(({ dayOfWeek, startTime, endTime }) => ({
            dayOfWeek,
            startTime,
            endTime,
          })),
        }),
      });

      if (response.ok) {
        toast.success("Availability saved successfully");
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save availability");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const handleSetAllDays = () => {
    const firstEnabled = availability.find((slot) => slot.enabled);
    if (!firstEnabled) {
      toast.error("Please configure at least one day first");
      return;
    }

    setAvailability((prev) =>
      prev.map((slot) => ({
        ...slot,
        startTime: firstEnabled.startTime,
        endTime: firstEnabled.endTime,
        enabled: true,
      }))
    );
    toast.success("Applied to all days");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Set Your Availability
          </DialogTitle>
          <DialogDescription>
            Configure your available hours for each day of the week. Clients will only be able to
            book appointments during these times.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <NormalLoader />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetAllDays}
                disabled={saving}
              >
                Apply First Day to All
              </Button>
            </div>

            {availability.map((slot) => (
              <div
                key={slot.dayOfWeek}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 w-32">
                  <Switch
                    checked={slot.enabled}
                    onCheckedChange={(checked) =>
                      handleToggleDay(slot.dayOfWeek, checked)
                    }
                    disabled={saving}
                  />
                  <Label className="font-medium text-sm">{slot.dayOfWeek}</Label>
                </div>

                {slot.enabled ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Start Time</Label>
                      <select
                        value={slot.startTime}
                        onChange={(e) =>
                          handleTimeChange(slot.dayOfWeek, "startTime", e.target.value)
                        }
                        disabled={saving}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {TIME_SLOTS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-gray-400 mt-6">to</div>

                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">End Time</Label>
                      <select
                        value={slot.endTime}
                        onChange={(e) =>
                          handleTimeChange(slot.dayOfWeek, "endTime", e.target.value)
                        }
                        disabled={saving}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {TIME_SLOTS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-gray-400">Unavailable</div>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Availability
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

