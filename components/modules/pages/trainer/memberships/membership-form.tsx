"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import { NormalLoader } from "@/components/modules/general/loader";

interface Session {
  id: string;
  sessionName: string;
  sessionDescription: string | null;
  sessionPrice: string | null;
}

interface MembershipFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MembershipForm({ onSuccess, onCancel }: MembershipFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Form state
  const [membershipName, setMembershipName] = useState("");
  const [membershipDescription, setMembershipDescription] = useState("");
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<"Weekly" | "Monthly" | "Yearly">("Monthly");
  const [weeklyPrice, setWeeklyPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [yearlyPrice, setYearlyPrice] = useState("");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [visibility, setVisibility] = useState<"Public" | "Private">("Private");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/trainer/session");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!membershipName.trim()) {
      toast.error("Please enter membership name");
      return;
    }

    if (selectedSessions.length === 0) {
      toast.error("Please select at least one session");
      return;
    }

    // Validate pricing based on billing period
    if (billingPeriod === "Weekly" && !weeklyPrice) {
      toast.error("Please enter weekly price");
      return;
    }
    if (billingPeriod === "Monthly" && !monthlyPrice) {
      toast.error("Please enter monthly price");
      return;
    }
    if (billingPeriod === "Yearly" && !yearlyPrice) {
      toast.error("Please enter yearly price");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/trainer/membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipName,
          membershipDescription,
          selectedSessions,
          billingPeriod,
          weeklyPrice: weeklyPrice || null,
          monthlyPrice: monthlyPrice || null,
          yearlyPrice: yearlyPrice || null,
          autoRenewal,
          visibility,
        }),
      });

      if (response.ok) {
        toast.success("Membership created successfully!");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/trainer/packages-memberships");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create membership");
      }
    } catch (error) {
      console.error("Error creating membership:", error);
      toast.error("Failed to create membership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the membership details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="membershipName">Membership Name *</Label>
            <Input
              id="membershipName"
              placeholder="e.g., Premium Monthly Plan"
              value={membershipName}
              onChange={(e) => setMembershipName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="membershipDescription">Description</Label>
            <Textarea
              id="membershipDescription"
              placeholder="Describe what's included in this membership..."
              value={membershipDescription}
              onChange={(e) => setMembershipDescription(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Sessions</CardTitle>
          <CardDescription>Choose which sessions are included in this membership</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <NormalLoader/>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No sessions available</p>
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/trainer/sessions/create")}
                className="mt-2"
              >
                Create a session first
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={session.id}
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={() => handleSessionToggle(session.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={session.id}
                      className="font-medium cursor-pointer"
                    >
                      {session.sessionName}
                    </Label>
                    {session.sessionDescription && (
                      <p className="text-sm text-gray-600">
                        {session.sessionDescription}
                      </p>
                    )}
                    {session.sessionPrice && (
                      <p className="text-sm text-green-600 font-medium">
                        ${session.sessionPrice}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Period</CardTitle>
          <CardDescription>Choose how often members will be billed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setBillingPeriod("Weekly")}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                billingPeriod === "Weekly"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">Weekly</div>
              <div className="text-sm text-gray-600">Billed every week</div>
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("Monthly")}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                billingPeriod === "Monthly"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">Monthly</div>
              <div className="text-sm text-gray-600">Billed every month</div>
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("Yearly")}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                billingPeriod === "Yearly"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">Yearly</div>
              <div className="text-sm text-gray-600">Billed every year</div>
            </button>
          </div>

          <div className="pt-4">
            {billingPeriod === "Weekly" && (
              <div className="space-y-2">
                <Label htmlFor="weeklyPrice">Weekly Price *</Label>
                <Input
                  id="weeklyPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={weeklyPrice}
                  onChange={(e) => setWeeklyPrice(e.target.value)}
                  required
                />
              </div>
            )}

            {billingPeriod === "Monthly" && (
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price *</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  required
                />
              </div>
            )}

            {billingPeriod === "Yearly" && (
              <div className="space-y-2">
                <Label htmlFor="yearlyPrice">Yearly Price *</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={yearlyPrice}
                  onChange={(e) => setYearlyPrice(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure membership options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto Renewal</Label>
              <p className="text-sm text-gray-600">
                Automatically renew membership when it expires
              </p>
            </div>
            <Switch checked={autoRenewal} onCheckedChange={setAutoRenewal} />
          </div>

          <div className="space-y-3">
            <Label>Visibility</Label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setVisibility("Public")}
                className={`flex-1 p-4 border-2 rounded-lg text-left transition-all ${
                  visibility === "Public"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">Public</div>
                <div className="text-sm text-gray-600">
                  Visible on your public page
                </div>
              </button>
              <button
                type="button"
                onClick={() => setVisibility("Private")}
                className={`flex-1 p-4 border-2 rounded-lg text-left transition-all ${
                  visibility === "Private"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">Private</div>
                <div className="text-sm text-gray-600">
                  Only visible to specific clients
                </div>
              </button>
            </div>
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
              Create Membership
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

