import type { UserProfile } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  Edit2,
  LogOut,
  Save,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Netherlands",
  "Switzerland",
  "Singapore",
  "South Korea",
  "Mexico",
  "Spain",
  "Italy",
  "Sweden",
  "Norway",
  "Denmark",
  "Other",
];

export default function ProfilePage() {
  const { logout, principal } = useAuth();
  const { backend } = useBackend();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Omit<UserProfile, "createdAt">>({
    country: "",
    investmentGoals: "",
    riskTolerance: "",
    preferredIndustry: "",
    hasCompletedOnboarding: false,
  });

  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!backend) return null;
      return backend.getMyProfile();
    },
    enabled: !!backend,
  });

  const { data: completed } = useQuery<boolean>({
    queryKey: ["hasCompletedOnboarding"],
    queryFn: async () => {
      if (!backend) return false;
      return backend.hasCompletedOnboarding();
    },
    enabled: !!backend,
  });

  const saveMutation = useMutation({
    mutationFn: async (updated: Omit<UserProfile, "createdAt">) => {
      if (!backend) throw new Error("No backend");
      const now = profile?.createdAt ?? BigInt(Date.now()) * BigInt(1_000_000);
      await backend.saveProfile({ ...updated, createdAt: now });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["hasCompletedOnboarding"] });
      setEditMode(false);
      toast.success("Profile saved successfully");
    },
    onError: () => toast.error("Failed to save profile"),
  });

  const handleEdit = () => {
    setForm({
      country: profile?.country ?? "",
      investmentGoals: profile?.investmentGoals ?? "",
      riskTolerance: profile?.riskTolerance ?? "",
      preferredIndustry: profile?.preferredIndustry ?? "",
      hasCompletedOnboarding: profile?.hasCompletedOnboarding ?? false,
    });
    setEditMode(true);
  };

  const handleCancel = () => setEditMode(false);

  const handleSave = () => saveMutation.mutate(form);

  const truncatePrincipal = (p: string) =>
    p.length > 24 ? `${p.slice(0, 12)}...${p.slice(-8)}` : p;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Your Profile
            </h1>
          </div>
          {principal && (
            <p className="mt-1 text-xs font-mono text-muted-foreground ml-13 pl-[52px]">
              {truncatePrincipal(principal.toText())}
            </p>
          )}
        </div>
        {completed !== undefined && (
          <Badge
            variant={completed ? "default" : "secondary"}
            className={`mt-1 gap-1.5 ${
              completed
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
          >
            {completed ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {completed ? "Profile complete" : "Profile incomplete"}
          </Badge>
        )}
      </div>

      {/* Profile Card */}
      {!profile && !editMode ? (
        <Card className="border-dashed border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <User className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium">
                No profile set up yet
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Tell us about your investment preferences
              </p>
            </div>
            <Button
              data-ocid="profile.edit_button"
              onClick={handleEdit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Set up your profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Investment Preferences
            </CardTitle>
            {!editMode ? (
              <Button
                data-ocid="profile.edit_button"
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  data-ocid="profile.cancel_button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saveMutation.isPending}
                  className="gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>
                <Button
                  data-ocid="profile.save_button"
                  size="sm"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Country */}
            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="text-sm font-medium text-foreground"
              >
                Country
              </Label>
              {editMode ? (
                <Select
                  value={form.country}
                  onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}
                >
                  <SelectTrigger
                    id="country"
                    data-ocid="profile.country.select"
                    className="bg-input border-border"
                  >
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground">
                  {profile?.country || (
                    <span className="text-muted-foreground italic">
                      Not set
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Investment Goals */}
            <div className="space-y-2">
              <Label
                htmlFor="goals"
                className="text-sm font-medium text-foreground"
              >
                Investment Goals
              </Label>
              {editMode ? (
                <Textarea
                  id="goals"
                  data-ocid="profile.goals.textarea"
                  value={form.investmentGoals}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, investmentGoals: e.target.value }))
                  }
                  placeholder="e.g., long-term growth, retirement planning"
                  className="bg-input border-border resize-none min-h-[80px]"
                />
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {profile?.investmentGoals || (
                    <span className="text-muted-foreground italic">
                      Not set
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-2">
              <Label
                htmlFor="risk"
                className="text-sm font-medium text-foreground"
              >
                Risk Tolerance
              </Label>
              {editMode ? (
                <Select
                  value={form.riskTolerance}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, riskTolerance: v }))
                  }
                >
                  <SelectTrigger
                    id="risk"
                    data-ocid="profile.risk.select"
                    className="bg-input border-border"
                  >
                    <SelectValue placeholder="Select risk tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conservative">Conservative</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground">
                  {profile?.riskTolerance || (
                    <span className="text-muted-foreground italic">
                      Not set
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Preferred Industry */}
            <div className="space-y-2">
              <Label
                htmlFor="industry"
                className="text-sm font-medium text-foreground"
              >
                Preferred Industry
              </Label>
              {editMode ? (
                <Select
                  value={form.preferredIndustry}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, preferredIndustry: v }))
                  }
                >
                  <SelectTrigger
                    id="industry"
                    data-ocid="profile.industry.select"
                    className="bg-input border-border"
                  >
                    <SelectValue placeholder="Select preferred industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Consumer">Consumer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground">
                  {profile?.preferredIndustry || (
                    <span className="text-muted-foreground italic">
                      Not set
                    </span>
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <div className="pt-2">
        <Button
          data-ocid="profile.logout_button"
          variant="outline"
          onClick={logout}
          className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
