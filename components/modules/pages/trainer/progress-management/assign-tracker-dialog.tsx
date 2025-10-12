"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search, Users, UserPlus } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ProgressTracker {
  id: string;
  name: string;
  type: string;
  clientProgress: {
    id: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
}

interface AssignTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracker: ProgressTracker | null;
  onSuccess?: () => void;
}

export function AssignTrackerDialog({
  open,
  onOpenChange,
  tracker,
  onSuccess,
}: AssignTrackerDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  useEffect(() => {
    if (open && tracker) {
      fetchClients();
      // Pre-select already assigned clients
      const assignedClientIds = tracker.clientProgress.map((cp) => cp.client.id);
      setSelectedClients(assignedClientIds);
    }
  }, [open, tracker]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        toast.error("Failed to load clients");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    `${client.firstName} ${client.lastName} ${client.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleClientToggle = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleAssign = async () => {
    if (!tracker) return;

    setAssigning(true);
    try {
      const response = await fetch("/api/progress-trackers/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackerId: tracker.id,
          clientIds: selectedClients,
        }),
      });

      if (response.ok) {
        toast.success("Tracker assignments updated successfully!");
        onSuccess?.();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update assignments");
      }
    } catch (error) {
      console.error("Error assigning tracker:", error);
      toast.error("Failed to update assignments");
    } finally {
      setAssigning(false);
    }
  };

  const getAssignmentStatus = (clientId: string) => {
    const isAssigned = tracker?.clientProgress.some(
      (cp) => cp.client.id === clientId
    );
    return isAssigned ? "assigned" : "unassigned";
  };

  if (!tracker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Tracker to Clients
          </DialogTitle>
          <DialogDescription>
            Select which clients should have access to the "{tracker.name}" progress tracker.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tracker Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{tracker.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {tracker.type.charAt(0).toUpperCase() + tracker.type.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Currently assigned to {tracker.clientProgress.length} client(s)
            </p>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Clients</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No clients found</p>
                {searchTerm && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              filteredClients.map((client) => {
                const status = getAssignmentStatus(client.id);
                const isSelected = selectedClients.includes(client.id);
                
                return (
                  <div
                    key={client.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                      isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <Checkbox
                      id={client.id}
                      checked={isSelected}
                      onCheckedChange={() => handleClientToggle(client.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={client.id}
                          className="font-medium cursor-pointer truncate"
                        >
                          {client.firstName} {client.lastName}
                        </Label>
                        <Badge
                          variant={status === "assigned" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {status === "assigned" ? "Assigned" : "Not Assigned"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {client.email}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Summary */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                {selectedClients.length} client(s) selected
              </span>
              <span className="text-blue-600 font-medium">
                {selectedClients.length - tracker.clientProgress.length > 0
                  ? `+${selectedClients.length - tracker.clientProgress.length} new`
                  : selectedClients.length - tracker.clientProgress.length < 0
                  ? `${selectedClients.length - tracker.clientProgress.length} removed`
                  : "No changes"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assigning}>
              {assigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Update Assignments
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
