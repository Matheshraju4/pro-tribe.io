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
  Percent,
  DollarSign,
  Calendar,
  Users,
  Package,
  Eye,
  Edit,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { NormalLoader } from "@/components/modules/general/loader";
import { DiscountForm } from "@/components/modules/pages/trainer/discounts/discount-form";

interface Discount {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "Percentage" | "Fixed";
  value: string;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  currentUsage: number;
  minAmount?: string;
  isActive: boolean;
  createdAt: string;
  discountPackageConnection: {
    package: {
      id: string;
      packageName: string;
      packagePrice?: string;
    };
  }[];
  discountSessionConnection: {
    session: {
      id: string;
      sessionName: string;
      sessionPrice?: string;
    };
  }[];
}

type ViewType = null | "create-form";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentView, setCurrentView] = useState<ViewType>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/trainer/discount");
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data.discounts);
      } else {
        toast.error("Failed to load discounts");
      }
    } catch (error) {
      console.error("Failed to fetch discounts:", error);
      toast.error("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || discount.type === filterType.toLowerCase();
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && discount.isActive) ||
      (filterStatus === "inactive" && !discount.isActive) ||
      (filterStatus === "expired" && new Date(discount.endDate) < new Date());

    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedDiscounts = [...filteredDiscounts].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "code":
        return a.code.localeCompare(b.code);
      case "usage":
        return b.currentUsage - a.currentUsage;
      case "expiry":
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      default:
        return 0;
    }
  });

  const getDiscountIcon = (type: string) => {
    return type === "Percentage" ? (
      <Percent className="h-5 w-5" />
    ) : (
      <DollarSign className="h-5 w-5" />
    );
  };

  const getDiscountColor = (type: string) => {
    return type === "Percentage"
      ? "bg-green-100 text-green-600"
      : "bg-blue-100 text-blue-600";
  };

  const getStatusBadge = (discount: Discount) => {
    const now = new Date();
    const endDate = new Date(discount.endDate);

    if (!discount.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (endDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (discount.usageLimit && discount.currentUsage >= discount.usageLimit) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Discount code copied to clipboard!");
  };

  const toggleDiscountStatus = async (discountId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/auth/trainer/discount", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discountId,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Discount ${!currentStatus ? "activated" : "deactivated"}`);
        fetchDiscounts();
      } else {
        toast.error("Failed to update discount status");
      }
    } catch (error) {
      console.error("Error toggling discount:", error);
      toast.error("Failed to update discount status");
    }
  };

  const deleteDiscount = async (discountId: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;

    try {
      const response = await fetch(`/api/auth/trainer/discount?id=${discountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Discount deleted successfully");
        fetchDiscounts();
      } else {
        toast.error("Failed to delete discount");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount");
    }
  };

  const handleCreate = () => {
    setCurrentView("create-form");
  };

  const handleBack = () => {
    setCurrentView(null);
  };

  const handleSuccess = () => {
    setCurrentView(null);
    fetchDiscounts();
  };

  // Show create form view
  if (currentView === "create-form") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Discount</h1>
              <p className="text-gray-600 text-sm">Create a new discount code for your packages and sessions</p>
            </div>
          </div>

          {/* Discount Form */}
          <DiscountForm onSuccess={handleSuccess} onCancel={handleBack} />
        </div>
      </div>
    );
  }

  // Show discounts list view
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
              <p className="text-gray-600 mt-2">
                Create and manage discount codes for your packages and sessions
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Discount
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search discounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="expiry">Expiry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Discounts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <NormalLoader />
          </div>
        ) : sortedDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Percent className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discounts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first discount to get started"}
            </p>
            {!searchTerm && filterType === "all" && filterStatus === "all" && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Discount
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDiscounts.map((discount) => (
              <Card key={discount.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getDiscountColor(discount.type)}`}>
                        {getDiscountIcon(discount.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{discount.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {discount.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyDiscountCode(discount.code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleDiscountStatus(discount.id, discount.isActive)}
                        >
                          {discount.isActive ? (
                            <ToggleLeft className="h-4 w-4 mr-2" />
                          ) : (
                            <ToggleRight className="h-4 w-4 mr-2" />
                          )}
                          {discount.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteDiscount(discount.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Discount Value */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="font-semibold text-lg">
                      {discount.type === "Percentage" ? `${discount.value}%` : `$${discount.value}`}
                    </span>
                  </div>

                  {/* Status and Usage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(discount)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {discount.currentUsage}
                      {discount.usageLimit ? `/${discount.usageLimit}` : ""} uses
                    </span>
                  </div>

                  {/* Validity Period */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(discount.startDate).toLocaleDateString()} -{" "}
                        {new Date(discount.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Applicable Items */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      <span>
                        {discount.discountPackageConnection.length === 0 &&
                        discount.discountSessionConnection.length === 0
                          ? "All packages & sessions"
                          : `${discount.discountPackageConnection.length} packages, ${discount.discountSessionConnection.length} sessions`}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {discount.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {discount.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
