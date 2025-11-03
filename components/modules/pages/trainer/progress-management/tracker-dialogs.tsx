"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import axios from "axios";
import {
  Loader2,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  BarChart3,
  CheckSquare,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProgressTracker {
  id: string;
  name: string;
  description?: string;
  type: "numeric" | "boolean" | "rating";
  unit?: string;
  minValue?: number;
  maxValue?: number;
  trueLabel?: string;
  falseLabel?: string;
  ratingScale?: number;
  isActive: boolean;
  clientProgress?: any[];
  _count?: { clientProgress: number };
}

// ============= VIEW DETAILS DIALOG =============
interface ViewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackerId: string | null;
}

export function ViewDetailsDialog({
  open,
  onOpenChange,
  trackerId,
}: ViewDetailsDialogProps) {
  const [tracker, setTracker] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && trackerId) {
      fetchTrackerDetails();
    }
  }, [open, trackerId]);

  const fetchTrackerDetails = async () => {
    if (!trackerId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/progress-trackers/${trackerId}`);
      setTracker(response.data.tracker);
    } catch (error) {
      console.error("Failed to fetch tracker details:", error);
      toast.error("Failed to load tracker details");
    } finally {
      setLoading(false);
    }
  };

  const getTrackerIcon = (type: string) => {
    switch (type) {
      case "numeric":
        return <BarChart3 className="h-5 w-5" />;
      case "boolean":
        return <CheckSquare className="h-5 w-5" />;
      case "rating":
        return <Star className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Tracker Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tracker ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                {getTrackerIcon(tracker.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{tracker.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {tracker.type.charAt(0).toUpperCase() + tracker.type.slice(1)}
                  </Badge>
                  <Badge variant={tracker.isActive ? "default" : "destructive"}>
                    {tracker.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {tracker.description && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{tracker.description}</p>
              </div>
            )}

            <Separator />

            {/* Configuration */}
            <div>
              <h4 className="font-semibold mb-3">Configuration</h4>
              <div className="grid grid-cols-2 gap-4">
                {tracker.type === "numeric" && (
                  <>
                    {tracker.unit && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Unit</Label>
                        <p className="font-medium">{tracker.unit}</p>
                      </div>
                    )}
                    {tracker.minValue !== null && tracker.minValue !== undefined && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Min Value</Label>
                        <p className="font-medium">{tracker.minValue}</p>
                      </div>
                    )}
                    {tracker.maxValue !== null && tracker.maxValue !== undefined && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Max Value</Label>
                        <p className="font-medium">{tracker.maxValue}</p>
                      </div>
                    )}
                  </>
                )}
                {tracker.type === "boolean" && (
                  <>
                    <div>
                      <Label className="text-sm text-muted-foreground">True Label</Label>
                      <p className="font-medium">{tracker.trueLabel || "Yes"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">False Label</Label>
                      <p className="font-medium">{tracker.falseLabel || "No"}</p>
                    </div>
                  </>
                )}
                {tracker.type === "rating" && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Rating Scale</Label>
                    <p className="font-medium">1-{tracker.ratingScale || 5}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Statistics */}
            <div>
              <h4 className="font-semibold mb-3">Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{tracker._count.clientProgress}</div>
                  <div className="text-xs text-muted-foreground">Active Clients</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {tracker.clientProgress.reduce(
                      (sum: number, cp: any) => sum + cp._count.entries,
                      0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Entries</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <BarChart3 className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {tracker.clientProgress.length > 0
                      ? Math.round(
                          tracker.clientProgress.reduce(
                            (sum: number, cp: any) => sum + cp._count.entries,
                            0
                          ) / tracker.clientProgress.length
                        )
                      : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Entries/Client</div>
                </div>
              </div>
            </div>

            {/* Assigned Clients */}
            {tracker.clientProgress && tracker.clientProgress.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Assigned Clients</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tracker.clientProgress.map((cp: any) => (
                      <div
                        key={cp.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {cp.client.firstName} {cp.client.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{cp.client.email}</p>
                        </div>
                        <Badge variant="secondary">{cp._count.entries} entries</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Tracker not found</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= EDIT TRACKER DIALOG =============
interface EditTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracker: ProgressTracker | null;
  onSuccess?: () => void;
}

export function EditTrackerDialog({
  open,
  onOpenChange,
  tracker,
  onSuccess,
}: EditTrackerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "",
    minValue: 0,
    maxValue: 100,
    trueLabel: "Yes",
    falseLabel: "No",
    ratingScale: 5,
  });

  useEffect(() => {
    if (open && tracker) {
      setFormData({
        name: tracker.name || "",
        description: tracker.description || "",
        unit: tracker.unit || "",
        minValue: tracker.minValue || 0,
        maxValue: tracker.maxValue || 100,
        trueLabel: tracker.trueLabel || "Yes",
        falseLabel: tracker.falseLabel || "No",
        ratingScale: tracker.ratingScale || 5,
      });
    }
  }, [open, tracker]);

  const handleSubmit = async () => {
    if (!tracker) return;

    setLoading(true);
    try {
      await axios.put(`/api/progress-trackers/${tracker.id}`, formData);
      toast.success("Tracker updated successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update tracker:", error);
      toast.error(error.response?.data?.error || "Failed to update tracker");
    } finally {
      setLoading(false);
    }
  };

  if (!tracker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Tracker
          </DialogTitle>
          <DialogDescription>
            Update the configuration for "{tracker.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter tracker name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter tracker description"
              rows={3}
            />
          </div>

          {/* Type-specific fields */}
          {tracker.type === "numeric" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., kg, lbs, reps"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minValue">Min Value</Label>
                  <Input
                    id="minValue"
                    type="number"
                    value={formData.minValue}
                    onChange={(e) =>
                      setFormData({ ...formData, minValue: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue">Max Value</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    value={formData.maxValue}
                    onChange={(e) =>
                      setFormData({ ...formData, maxValue: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {tracker.type === "boolean" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trueLabel">True Label</Label>
                <Input
                  id="trueLabel"
                  value={formData.trueLabel}
                  onChange={(e) => setFormData({ ...formData, trueLabel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="falseLabel">False Label</Label>
                <Input
                  id="falseLabel"
                  value={formData.falseLabel}
                  onChange={(e) => setFormData({ ...formData, falseLabel: e.target.value })}
                />
              </div>
            </div>
          )}

          {tracker.type === "rating" && (
            <div className="space-y-2">
              <Label htmlFor="ratingScale">Rating Scale</Label>
              <Select
                value={formData.ratingScale.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, ratingScale: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">1-5</SelectItem>
                  <SelectItem value="10">1-10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= DELETE CONFIRMATION DIALOG =============
interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracker: ProgressTracker | null;
  onSuccess?: () => void;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  tracker,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!tracker) return;

    setLoading(true);
    try {
      await axios.delete(`/api/progress-trackers/${tracker.id}`);
      toast.success("Tracker deleted successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to delete tracker:", error);
      toast.error(error.response?.data?.error || "Failed to delete tracker");
    } finally {
      setLoading(false);
    }
  };

  if (!tracker) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the tracker "{tracker.name}" and all its associated data for{" "}
            {tracker._count?.clientProgress || 0} client(s). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tracker
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============= ADD PROGRESS ENTRY DIALOG (FOR TRAINER) =============
interface AddProgressEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracker: ProgressTracker | null;
  onSuccess?: () => void;
}

export function AddProgressEntryDialog({
  open,
  onOpenChange,
  tracker,
  onSuccess,
}: AddProgressEntryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [value, setValue] = useState<any>("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && tracker) {
      fetchTrackerClients();
      // Reset form
      setSelectedClient("");
      setValue("");
      setNote("");
      setEntryDate(new Date());
    }
  }, [open, tracker]);

  const fetchTrackerClients = async () => {
    if (!tracker) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/progress-trackers/${tracker.id}`);
      setClients(response.data.tracker.clientProgress || []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to load assigned clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClient || value === "") {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Find the client progress ID
      const clientProgress = clients.find((c) => c.id === selectedClient);
      if (!clientProgress) {
        toast.error("Client not found");
        return;
      }

      // Convert value based on tracker type
      let processedValue = value;
      if (tracker?.type === "numeric") {
        processedValue = parseFloat(value);
      } else if (tracker?.type === "boolean") {
        processedValue = value === "true";
      } else if (tracker?.type === "rating") {
        processedValue = parseInt(value);
      }

      await axios.post("/api/progress-trackers/trainer-entry", {
        clientProgressId: clientProgress.id,
        value: processedValue,
        note,
        entryDate: entryDate.toISOString(),
      });

      toast.success("Progress entry added successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to add progress entry:", error);
      toast.error(error.response?.data?.error || "Failed to add progress entry");
    } finally {
      setLoading(false);
    }
  };

  if (!tracker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Progress Entry
          </DialogTitle>
          <DialogDescription>
            Add a new progress entry for "{tracker.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((cp) => (
                  <SelectItem key={cp.id} value={cp.id}>
                    {cp.client.firstName} {cp.client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Entry Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !entryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {entryDate ? format(entryDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={entryDate}
                  onSelect={(date) => date && setEntryDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Value input based on tracker type */}
          <div className="space-y-2">
            <Label htmlFor="value">Value *</Label>
            {tracker.type === "numeric" && (
              <Input
                id="value"
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter value${tracker.unit ? ` (${tracker.unit})` : ""}`}
              />
            )}
            {tracker.type === "boolean" && (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{tracker.trueLabel || "Yes"}</SelectItem>
                  <SelectItem value="false">{tracker.falseLabel || "No"}</SelectItem>
                </SelectContent>
              </Select>
            )}
            {tracker.type === "rating" && (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: tracker.ratingScale || 5 }, (_, i) => i + 1).map(
                    (rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} / {tracker.ratingScale || 5}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedClient || value === ""}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

