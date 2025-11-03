"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  BarChart3,
  CheckSquare,
  Star,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { toast } from "sonner";
import { NormalLoader } from "@/components/modules/general/loader";
import { AssignTrackerDialog } from "@/components/modules/pages/trainer/progress-management/assign-tracker-dialog";
import {
  ViewDetailsDialog,
  EditTrackerDialog,
  DeleteConfirmationDialog,
  AddProgressEntryDialog,
} from "@/components/modules/pages/trainer/progress-management/tracker-dialogs";

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
  configuration?: any;
  isActive: boolean;
  createdAt: string;
  clientProgress: {
    id: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    entries: any[];
    _count: { entries: number };
  }[];
  _count: { clientProgress: number };
}

export default function ProgressManagement() {
  const [trackers, setTrackers] = useState<ProgressTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [addEntryDialogOpen, setAddEntryDialogOpen] = useState(false);
  
  const [selectedTracker, setSelectedTracker] = useState<ProgressTracker | null>(null);
  const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchTrackers();
  }, []);

  const fetchTrackers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/progress-trackers");
      setTrackers(response.data.trackers);
    } catch (error) {
      console.error("Failed to fetch trackers:", error);
      toast.error("Failed to load progress trackers");
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleViewDetails = (trackerId: string) => {
    setSelectedTrackerId(trackerId);
    setViewDialogOpen(true);
  };

  const handleEditTracker = (tracker: ProgressTracker) => {
    setSelectedTracker(tracker);
    setEditDialogOpen(true);
  };

  const handleDeleteTracker = (tracker: ProgressTracker) => {
    setSelectedTracker(tracker);
    setDeleteDialogOpen(true);
  };

  const handleAssignTracker = (tracker: ProgressTracker) => {
    setSelectedTracker(tracker);
    setAssignDialogOpen(true);
  };

  const handleAddEntry = (tracker: ProgressTracker) => {
    setSelectedTracker(tracker);
    setAddEntryDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchTrackers(); // Refresh the trackers list
  };

  const filteredTrackers = trackers.filter((tracker) => {
    const matchesSearch =
      tracker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tracker.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tracker.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedTrackers = [...filteredTrackers].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "clients":
        return b._count.clientProgress - a._count.clientProgress;
      case "entries":
        return (
          b.clientProgress.reduce((sum, cp) => sum + cp._count.entries, 0) -
          a.clientProgress.reduce((sum, cp) => sum + cp._count.entries, 0)
        );
      default:
        return 0;
    }
  });

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

  const getTrackerColor = (type: string) => {
    switch (type) {
      case "numeric":
        return "text-primary bg-primary/10 border-primary/20";
      case "boolean":
        return "text-green-600 bg-green-50 border-green-200";
      case "rating":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getTotalEntries = (tracker: ProgressTracker) => {
    return tracker.clientProgress.reduce(
      (sum, cp) => sum + cp._count.entries,
      0
    );
  };

  const getAverageProgress = (tracker: ProgressTracker) => {
    if (tracker.type === "numeric" && tracker.minValue && tracker.maxValue) {
      // Calculate average progress for numeric trackers
      const totalEntries = getTotalEntries(tracker);
      if (totalEntries === 0) return 0;

      // This is a simplified calculation - in real app, you'd calculate from actual values
      return Math.floor(Math.random() * 40) + 30; // Mock data for demo
    }
    return 0;
  };

  if (loading) {
    return (
     <NormalLoader/>
    );
  }

  return (
    <div className="space-y-6 p-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Progress Trackers
          </h1>
          <p className="text-muted-foreground">
            Monitor and track client progress across all your custom metrics
          </p>
        </div>
        <Button
          onClick={() => router.push("/trainer/progress-management/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Tracker
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{trackers.length}</div>
              <div className="text-sm text-muted-foreground">
                Total Trackers
              </div>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {trackers.reduce((sum, t) => sum + t._count.clientProgress, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Clients
              </div>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {trackers.reduce((sum, t) => sum + getTotalEntries(t), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {
                  trackers.filter(
                    (t) =>
                      new Date(t.createdAt) >=
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1
                      )
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search trackers by name or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="w-full sm:w-48">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="numeric">Numeric</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="w-full sm:w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="clients">Most Clients</SelectItem>
              <SelectItem value="entries">Most Entries</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTrackers.length} of {trackers.length} trackers
          {searchTerm && (
            <span className="ml-2">
              matching "<span className="font-medium">{searchTerm}</span>"
            </span>
          )}
          {searchTerm && filterType !== "all" && " and "}
          {filterType !== "all" && (
            <span className="ml-2">
              type: "<span className="font-medium">{filterType}</span>"
            </span>
          )}
        </p>
      </div>

      {/* Trackers Grid */}
      {sortedTrackers.length === 0 ? (
        <div className="rounded-md border">
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {searchTerm || filterType !== "all"
                    ? "No trackers found"
                    : "No progress trackers yet"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Create your first progress tracker to start monitoring client achievements and growth."}
                </p>
              </div>
              <Button
                onClick={() =>
                  router.push("/trainer/progress-management/create")
                }
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Tracker
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrackers.map((tracker) => (
            <div
              key={tracker.id}
              className="group rounded-lg border bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${getTrackerColor(
                        tracker.type
                      )}`}
                    >
                      {getTrackerIcon(tracker.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {tracker.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {tracker.type.charAt(0).toUpperCase() +
                          tracker.type.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(tracker.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTracker(tracker)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Tracker
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddEntry(tracker)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Progress Entry
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssignTracker(tracker)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Clients
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteTracker(tracker)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {tracker.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tracker.description}
                  </p>
                )}

                {/* Progress Visualization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Overall Progress
                    </span>
                    <span className="font-medium">
                      {getAverageProgress(tracker)}%
                    </span>
                  </div>
                  <Progress
                    value={getAverageProgress(tracker)}
                    className="h-2"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">
                      {tracker._count.clientProgress}
                    </div>
                    <div className="text-xs text-muted-foreground">Clients</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">
                      {getTotalEntries(tracker)}
                    </div>
                    <div className="text-xs text-muted-foreground">Entries</div>
                  </div>
                </div>

                {/* Recent Clients */}
                {tracker.clientProgress.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Recent Clients
                    </div>
                    <div className="flex -space-x-2">
                      {tracker.clientProgress.slice(0, 3).map((cp) => (
                        <div
                          key={cp.id}
                          className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium border-2 border-background"
                          title={`${cp.client.firstName} ${cp.client.lastName}`}
                        >
                          {cp.client.firstName[0]}
                          {cp.client.lastName[0]}
                        </div>
                      ))}
                      {tracker.clientProgress.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium border-2 border-background">
                          +{tracker.clientProgress.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleViewDetails(tracker.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleAddEntry(tracker)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        trackerId={selectedTrackerId}
      />

      <EditTrackerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tracker={selectedTracker}
        onSuccess={handleDialogSuccess}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tracker={selectedTracker}
        onSuccess={handleDialogSuccess}
      />

      <AssignTrackerDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        tracker={selectedTracker}
        onSuccess={handleDialogSuccess}
      />

      <AddProgressEntryDialog
        open={addEntryDialogOpen}
        onOpenChange={setAddEntryDialogOpen}
        tracker={selectedTracker}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
