"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Mail,
  Phone,
  Building,
  MapPin,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Sample data for demonstration
const sampleClients = [
  {
    id: "1",
    firstName: "Matheshraju",
    lastName: "Mainer",
    email: "matheshrajudev@gmail.com",
    phone: "+918825785898",
    company: "Chennai",
    city: "Thanjavur",
    country: "India",
    tags: ["Mathesh", "Premium"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "+44 123 456 7890",
    company: "Tech Solutions Ltd",
    city: "London",
    country: "UK",
    tags: ["VIP", "Corporate"],
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@gmail.com",
    phone: "+1 555 123 4567",
    company: "Fitness First",
    city: "New York",
    country: "USA",
    tags: ["Regular"],
    createdAt: "2024-01-08",
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@company.com",
    phone: null,
    company: null,
    city: "Manchester",
    country: "UK",
    tags: ["New", "Prospect"],
    createdAt: "2024-01-05",
  },
  {
    id: "5",
    firstName: "Emma",
    lastName: "Brown",
    email: "emma.brown@email.com",
    phone: "+1 555 987 6543",
    company: "Health Corp",
    city: "Toronto",
    country: "Canada",
    tags: ["Premium", "VIP"],
    createdAt: "2024-01-12",
  },
];

export default function ClientsDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const handleCreateClient = () => {
    router.push("/trainer/clients/create");
  };

  // Get all unique tags from clients
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    sampleClients.forEach((client) => {
      client.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter clients based on search term and selected tag
  const filteredClients = useMemo(() => {
    return sampleClients.filter((client) => {
      // Search filter - check if search term matches first name or last name
      const matchesSearch =
        searchTerm === "" ||
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchTerm.toLowerCase());

      // Tag filter - check if client has the selected tag
      const matchesTag =
        selectedTag === "all" || client.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("all");
  };

  const hasActiveFilters = searchTerm !== "" || selectedTag !== "all";

  return (
    <div className="space-y-6 p-10">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information
          </p>
        </div>
        <Button
          onClick={handleCreateClient}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search clients by name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tag Filter */}
        <div className="w-full sm:w-48">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="destructive"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredClients.length} of {sampleClients.length} clients
          {hasActiveFilters && (
            <span className="ml-2">
              (filtered by {searchTerm && `"${searchTerm}"`}
              {searchTerm && selectedTag !== "all" && " and "}
              {selectedTag !== "all" && `tag: "${selectedTag}"`})
            </span>
          )}
        </p>
      </div>

      {/* Clients Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-muted-foreground">
                      {hasActiveFilters
                        ? "No clients match your filters"
                        : "No clients found"}
                    </div>
                    {hasActiveFilters ? (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        size="sm"
                      >
                        Clear filters
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCreateClient}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first client
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {client.firstName[0]}
                          {client.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div>
                          {client.firstName} {client.lastName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.phone ? (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.company ? (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{client.company}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.city || client.country ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {[client.city, client.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={
                            selectedTag === tag ? "default" : "secondary"
                          }
                          className="text-xs cursor-pointer"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          Manage
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
