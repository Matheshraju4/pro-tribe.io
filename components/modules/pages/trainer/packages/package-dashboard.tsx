"use client";

import { Package } from "@/prisma/generated/prisma";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Plus } from "lucide-react";
import PackageCard from "./package-card";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";

const PackageDashboard = ({ packages }: { packages: Package[] }) => {
  const [localPackages, setLocalPackages] = useState<Package[]>(packages);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [selectedValidityRange, setSelectedValidityRange] =
    useState<string>("all");
  const [selectedDiscountFilter, setSelectedDiscountFilter] =
    useState<string>("all");

  // Filter packages based on all criteria
  const filteredPackages = useMemo(() => {
    return localPackages.filter((packageData) => {
      // Search by name
      const matchesSearch =
        !searchQuery.trim() ||
        packageData.packageName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Filter by price range
      const packagePrice = parseFloat(packageData.packagePrice || "0");
      let matchesPriceRange = true;
      if (selectedPriceRange !== "all") {
        switch (selectedPriceRange) {
          case "under-50":
            matchesPriceRange = packagePrice < 50;
            break;
          case "50-100":
            matchesPriceRange = packagePrice >= 50 && packagePrice <= 100;
            break;
          case "100-200":
            matchesPriceRange = packagePrice >= 100 && packagePrice <= 200;
            break;
          case "over-200":
            matchesPriceRange = packagePrice > 200;
            break;
        }
      }

      // Filter by validity range
      const validDays = parseInt(packageData.validDays || "0");
      let matchesValidityRange = true;
      if (selectedValidityRange !== "all") {
        switch (selectedValidityRange) {
          case "under-30":
            matchesValidityRange = validDays < 30;
            break;
          case "30-90":
            matchesValidityRange = validDays >= 30 && validDays <= 90;
            break;
          case "90-180":
            matchesValidityRange = validDays >= 90 && validDays <= 180;
            break;
          case "over-180":
            matchesValidityRange = validDays > 180;
            break;
        }
      }

      // Filter by discount
      const hasDiscount = Boolean(
        packageData.packageDiscount &&
          parseFloat(packageData.packageDiscount) > 0
      );
      let matchesDiscountFilter = true;
      if (selectedDiscountFilter !== "all") {
        matchesDiscountFilter =
          selectedDiscountFilter === "with-discount"
            ? hasDiscount
            : !hasDiscount;
      }

      return (
        matchesSearch &&
        matchesPriceRange &&
        matchesValidityRange &&
        matchesDiscountFilter
      );
    });
  }, [
    localPackages,
    searchQuery,
    selectedPriceRange,
    selectedValidityRange,
    selectedDiscountFilter,
  ]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedPriceRange !== "all") count++;
    if (selectedValidityRange !== "all") count++;
    if (selectedDiscountFilter !== "all") count++;
    return count;
  }, [
    searchQuery,
    selectedPriceRange,
    selectedValidityRange,
    selectedDiscountFilter,
  ]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedPriceRange("all");
    setSelectedValidityRange("all");
    setSelectedDiscountFilter("all");
  };

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
              placeholder="Search packages by name..."
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
              value={selectedPriceRange}
              onValueChange={setSelectedPriceRange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-50">Under $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="100-200">$100 - $200</SelectItem>
                <SelectItem value="over-200">Over $200</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedValidityRange}
              onValueChange={setSelectedValidityRange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Validity Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="under-30">Under 30 days</SelectItem>
                <SelectItem value="30-90">30 - 90 days</SelectItem>
                <SelectItem value="90-180">90 - 180 days</SelectItem>
                <SelectItem value="over-180">Over 180 days</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedDiscountFilter}
              onValueChange={setSelectedDiscountFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Discount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="with-discount">With Discount</SelectItem>
                <SelectItem value="without-discount">
                  Without Discount
                </SelectItem>
              </SelectContent>
            </Select>

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
              placeholder="Search packages by name..."
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
              value={selectedPriceRange}
              onValueChange={setSelectedPriceRange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-50">Under $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="100-200">$100 - $200</SelectItem>
                <SelectItem value="over-200">Over $200</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedValidityRange}
              onValueChange={setSelectedValidityRange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Validity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="under-30">Under 30 days</SelectItem>
                <SelectItem value="30-90">30 - 90 days</SelectItem>
                <SelectItem value="90-180">90 - 180 days</SelectItem>
                <SelectItem value="over-180">Over 180 days</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedDiscountFilter}
              onValueChange={setSelectedDiscountFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Discount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="with-discount">With Discount</SelectItem>
                <SelectItem value="without-discount">
                  Without Discount
                </SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear All
              </Button>
            )}

            <Link href="/trainer/packages/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Package
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {filteredPackages?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto px-3">
          {filteredPackages.map((packageData) => (
            <PackageCard key={packageData.id} package={packageData} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-[400px] gap-3 px-4">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              {activeFilterCount > 0
                ? "No packages found matching your filters"
                : "No packages found"}
            </p>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your filters or clear them to see all packages.
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
            <Link href="/trainer/packages/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Package
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default PackageDashboard;
