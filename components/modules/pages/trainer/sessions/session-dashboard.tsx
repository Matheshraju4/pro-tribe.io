"use client";

import { Session, Tag } from "@/prisma/generated/prisma";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import SessionCard from "./session-card";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

const SessionDashboard = ({
  sessions,
  sessionTags,
}: {
  sessions: Session[];
  sessionTags: Tag[];
}) => {
  const [localSessions, setLocalSessions] = useState<Session[]>(sessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("all");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Add this useEffect to sync localSessions when sessions prop changes
  useEffect(() => {
    setLocalSessions(sessions);
  }, [sessions]);

  // Get all unique tags from sessions
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    sessionTags.forEach((tag) => {
      tagSet.add(tag.tag);
    });
    return Array.from(tagSet).sort();
  }, [sessionTags]);

  // Filter sessions based on all criteria
  const filteredSessions = useMemo(() => {
    return localSessions.filter((session) => {
      // Search by name
      const matchesSearch =
        !searchQuery.trim() ||
        session.sessionName.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by session type
      const matchesSessionType =
        selectedSessionType === "all" ||
        session.sessionType === selectedSessionType;

      // Filter by frequency
      const matchesFrequency =
        selectedFrequency === "all" ||
        session.sessionFrequency === selectedFrequency;

      // Filter by tag
      const matchesTag =
        selectedTag === "all" ||
        sessionTags.some((tag) => tag.tag === selectedTag);

      return (
        matchesSearch && matchesSessionType && matchesFrequency && matchesTag
      );
    });
  }, [
    localSessions,
    searchQuery,
    selectedSessionType,
    selectedFrequency,
    selectedTag,
  ]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedSessionType !== "all") count++;
    if (selectedFrequency !== "all") count++;
    if (selectedTag !== "all") count++;
    return count;
  }, [searchQuery, selectedSessionType, selectedFrequency, selectedTag]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedSessionType("all");
    setSelectedFrequency("all");
    setSelectedTag("all");
  };

async function freezeTheSession(sessionId: string){
  try {
    const response = await axios.put(`/api/auth/trainer/session`, {
      sessionId,
      isActive: false,
    });
    console.log("Session frozen successfully");

    if(response.status === 200){
      toast.success("Session frozen successfully");
    }else{
      toast.error("Failed to freeze session");
    }
  } catch (error) {
    console.error("Error freezing session:", error);
    toast.error("Failed to freeze session");
  }
  
}

  return (
    <>
      {/* Search Input Section */}
      <div className="max-w-7xl mx-auto px-3 mb-6">
        {/* Mobile: Vertical Layout */}
        <div className="flex flex-col gap-3 md:hidden">
          {/* Search Bar - Full Width on Mobile */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search sessions by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters - Grid on Mobile */}
          <div className="grid grid-cols-1 gap-2">
            <Select
              value={selectedSessionType}
              onValueChange={setSelectedSessionType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="OneToOne">One To One</SelectItem>
                <SelectItem value="Group">Group</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedFrequency}
              onValueChange={setSelectedFrequency}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="OneTime">One Time</SelectItem>
                <SelectItem value="Recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="all">All Tags</SelectItem>
                {sessionTags.map((tag) => (
                  <SelectItem key={tag.tag} value={tag.tag}>
                    {tag.tag}
                  </SelectItem>
                ))}
                {sessionTags.length === 0 && (
                  <SelectItem value="no-tags" disabled>
                    No tags available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Link href="/trainer/sessions/create" className="w-full">
              <Button className="w-full">Create Session</Button>
            </Link>
            {/* Clear All Button - Full Width on Mobile */}
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAllFilters}
                className="w-full text-gray-600 hover:text-gray-900"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden md:flex justify-between gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search sessions by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Select
              value={selectedSessionType}
              onValueChange={setSelectedSessionType}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="OneToOne">One To One</SelectItem>
                <SelectItem value="Group">Group</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedFrequency}
              onValueChange={setSelectedFrequency}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="OneTime">One Time</SelectItem>
                <SelectItem value="Recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
                {allTags.length === 0 && (
                  <SelectItem value="no-tags" disabled>
                    No tags available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <Link href="/trainer/sessions/create" className="w-full">
              <Button className="w-full">Create Session</Button>
            </Link>
            {activeFilterCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAllFilters}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto px-3">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} freezeTheSession={freezeTheSession} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-[400px] gap-3 px-4">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              {activeFilterCount > 0
                ? "No sessions found matching your filters"
                : "No sessions found"}
            </p>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your filters or clear them to see all sessions.
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAllFilters}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}
            <Link href="/trainer/sessions/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create Session</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionDashboard;
