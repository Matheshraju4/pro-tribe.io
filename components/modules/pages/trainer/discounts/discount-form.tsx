"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, X, Calendar as CalendarIcon, Percent, DollarSign, Package, Users } from "lucide-react";

interface Package {
  id: string;
  packageName: string;
  packagePrice: string | null;
}

interface Session {
  id: string;
  sessionName: string;
  sessionPrice: string | null;
}

interface DiscountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DiscountForm({ onSuccess, onCancel }: DiscountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Percentage" | "Fixed">("Percentage");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [applyToAll, setApplyToAll] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesResponse, sessionsResponse] = await Promise.all([
        fetch("/api/auth/trainer/packages"),
        fetch("/api/auth/trainer/session"),
      ]);

      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData.packages || []);
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load packages and sessions");
    } finally {
      setLoadingData(false);
    }
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleApplyToAllChange = (checked: boolean) => {
    setApplyToAll(checked);
    if (checked) {
      setSelectedPackages([]);
      setSelectedSessions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!code.trim() || !name.trim()) {
      toast.error("Please enter discount code and name");
      return;
    }

    if (!value.trim()) {
      toast.error("Please enter discount value");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    if (!applyToAll && selectedPackages.length === 0 && selectedSessions.length === 0) {
      toast.error("Please select at least one package or session, or apply to all");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/trainer/discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          name,
          description,
          type,
          value,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          usageLimit: usageLimit || null,
          minAmount: minAmount || null,
          isActive,
          applyToAll,
          selectedPackages,
          selectedSessions,
        }),
      });

      if (response.ok) {
        toast.success("Discount created successfully!");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/trainer/discounts");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create discount");
      }
    } catch (error) {
      console.error("Error creating discount:", error);
      toast.error("Failed to create discount");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the discount details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Discount Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="SAVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomCode}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Discount Name *</Label>
              <Input
                id="name"
                placeholder="Summer Sale 20%"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this discount offer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discount Settings</CardTitle>
          <CardDescription>Configure the discount value and type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type *</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setType("Percentage")}
                  className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${
                    type === "Percentage"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Percent className="h-4 w-4" />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setType("Fixed")}
                  className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${
                    type === "Fixed"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                  Fixed Amount
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                Discount Value * {type === "Percentage" ? "(%)" : "($)"}
              </Label>
              <Input
                id="value"
                type="number"
                step={type === "Percentage" ? "0.01" : "0.01"}
                min="0"
                max={type === "Percentage" ? "100" : undefined}
                placeholder={type === "Percentage" ? "20" : "50"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minAmount">Minimum Purchase Amount (optional)</Label>
            <Input
              id="minAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="100.00"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Validity Period
          </CardTitle>
          <CardDescription>Set when this discount is active</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              placeholder="100 (leave empty for unlimited)"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Applicable Items
          </CardTitle>
          <CardDescription>Choose which packages and sessions this discount applies to</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="applyToAll"
              checked={applyToAll}
              onCheckedChange={handleApplyToAllChange}
            />
            <Label htmlFor="applyToAll" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Apply to all packages and sessions
            </Label>
          </div>

          {!applyToAll && (
            <>
              {/* Packages */}
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium">Packages</h4>
                    {packages.length === 0 ? (
                      <p className="text-sm text-gray-500">No packages available</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {packages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Checkbox
                              id={`package-${pkg.id}`}
                              checked={selectedPackages.includes(pkg.id)}
                              onCheckedChange={() => handlePackageToggle(pkg.id)}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`package-${pkg.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {pkg.packageName}
                              </Label>
                              {pkg.packagePrice && (
                                <p className="text-sm text-gray-600">
                                  ${pkg.packagePrice}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sessions */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Sessions</h4>
                    {sessions.length === 0 ? (
                      <p className="text-sm text-gray-500">No sessions available</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Checkbox
                              id={`session-${session.id}`}
                              checked={selectedSessions.includes(session.id)}
                              onCheckedChange={() => handleSessionToggle(session.id)}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`session-${session.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {session.sessionName}
                              </Label>
                              {session.sessionPrice && (
                                <p className="text-sm text-gray-600">
                                  ${session.sessionPrice}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Control the discount availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Active</Label>
              <p className="text-sm text-gray-600">
                Enable this discount for immediate use
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
          disabled={loading}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Discount
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
