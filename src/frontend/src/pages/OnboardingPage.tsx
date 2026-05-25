import type { UserProfile } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBackend } from "@/hooks/useBackend";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Globe,
  HeartPulse,
  Lightbulb,
  MoreHorizontal,
  ShieldCheck,
  ShoppingBag,
  SkipForward,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
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

const RISK_OPTIONS = [
  {
    value: "Conservative",
    label: "Conservative",
    description:
      "Lower risk, stable returns. Prefer bonds and blue-chip stocks.",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    activeBg: "bg-emerald-500/20 border-emerald-500",
  },
  {
    value: "Moderate",
    label: "Moderate",
    description: "Balanced approach. Mix of growth and income investments.",
    icon: BarChart3,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    activeBg: "bg-primary/20 border-primary",
  },
  {
    value: "Aggressive",
    label: "Aggressive",
    description: "High risk, high potential reward. Focus on growth stocks.",
    icon: TrendingUp,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    activeBg: "bg-amber-500/20 border-amber-500",
  },
];

const INDUSTRY_OPTIONS = [
  {
    value: "Technology",
    icon: Cpu,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    activeBg: "bg-blue-500/20 border-blue-500",
  },
  {
    value: "Finance",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    activeBg: "bg-primary/20 border-primary",
  },
  {
    value: "Healthcare",
    icon: HeartPulse,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    activeBg: "bg-rose-500/20 border-rose-500",
  },
  {
    value: "Energy",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    activeBg: "bg-amber-500/20 border-amber-500",
  },
  {
    value: "Consumer",
    icon: ShoppingBag,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/30",
    activeBg: "bg-violet-500/20 border-violet-500",
  },
  {
    value: "Other",
    icon: MoreHorizontal,
    color: "text-muted-foreground",
    bg: "bg-muted/40 border-border",
    activeBg: "bg-muted border-foreground/30",
  },
];

const STEP_ICONS = [Globe, Lightbulb, ShieldCheck, BarChart3];
const STEP_TITLES = [
  "Where are you from?",
  "What are your goals?",
  "Risk tolerance",
  "Preferred industry",
];
const STEP_SUBTITLES = [
  "Help us tailor your experience",
  "Tell us what you're investing for",
  "Choose your comfort level with risk",
  "Which sector interests you most?",
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { backend } = useBackend();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    country: "",
    investmentGoals: "",
    riskTolerance: "",
    preferredIndustry: "",
  });

  // Redirect if already completed
  useEffect(() => {
    if (!backend) return;
    backend.hasCompletedOnboarding().then((done) => {
      if (done) navigate({ to: "/dashboard" });
    });
  }, [backend, navigate]);

  const handleSkip = () => navigate({ to: "/dashboard" });

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleComplete = async () => {
    if (!backend) {
      toast.error("Not connected to backend");
      return;
    }
    setIsSaving(true);
    try {
      const profile: UserProfile = {
        country: form.country,
        investmentGoals: form.investmentGoals,
        riskTolerance: form.riskTolerance,
        preferredIndustry: form.preferredIndustry,
        hasCompletedOnboarding: true,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      };
      await backend.saveProfile(profile);
      toast.success("Welcome to ChainStock!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const StepIcon = STEP_ICONS[step];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[600px] space-y-6">
        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Step {step + 1} of 4
            </span>
            <Button
              data-ocid="onboarding.skip_button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip for now
            </Button>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                data-ocid={`onboarding.step_dot.${i + 1}`}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <Card className="bg-card border-border shadow-lg">
          <CardContent className="p-8 space-y-6">
            {/* Step Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <StepIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  {STEP_TITLES[step]}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {STEP_SUBTITLES[step]}
                </p>
              </div>
            </div>

            {/* Step Content */}
            {step === 0 && (
              <div className="space-y-3">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-foreground"
                >
                  Country
                </Label>
                <Select
                  value={form.country}
                  onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}
                >
                  <SelectTrigger
                    id="country"
                    data-ocid="onboarding.country.select"
                    className="bg-input border-border h-11"
                  >
                    <SelectValue placeholder="Select your country…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <Label
                  htmlFor="goals"
                  className="text-sm font-medium text-foreground"
                >
                  Investment Goals
                </Label>
                <Textarea
                  id="goals"
                  data-ocid="onboarding.goals.textarea"
                  value={form.investmentGoals}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, investmentGoals: e.target.value }))
                  }
                  placeholder="e.g., long-term growth, retirement planning, building an emergency fund"
                  className="bg-input border-border resize-none min-h-[120px]"
                />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-3">
                {RISK_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.riskTolerance === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      data-ocid={`onboarding.risk.${opt.value.toLowerCase()}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, riskTolerance: opt.value }))
                      }
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                        active
                          ? opt.activeBg
                          : `${opt.bg} hover:border-current/60`
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          active ? "bg-current/20" : "bg-current/10"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${opt.color}`} />
                      </div>
                      <div>
                        <p
                          className={`font-semibold text-sm ${active ? "text-foreground" : "text-foreground/80"}`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {opt.description}
                        </p>
                      </div>
                      <div
                        className={`ml-auto mt-1 w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                          active ? "border-primary bg-primary" : "border-border"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {INDUSTRY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.preferredIndustry === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      data-ocid={`onboarding.industry.${opt.value.toLowerCase()}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, preferredIndustry: opt.value }))
                      }
                      className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 ${
                        active
                          ? opt.activeBg
                          : `${opt.bg} hover:border-current/50`
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          active ? "bg-current/20" : "bg-current/10"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${opt.color}`} />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          active ? "text-foreground" : "text-foreground/80"
                        }`}
                      >
                        {opt.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {step > 0 && (
                  <Button
                    data-ocid="onboarding.back_button"
                    variant="ghost"
                    onClick={handleBack}
                    className="gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
              </div>
              <div>
                {step < 3 ? (
                  <Button
                    data-ocid="onboarding.next_button"
                    onClick={handleNext}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    data-ocid="onboarding.complete_button"
                    onClick={handleComplete}
                    disabled={isSaving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  >
                    {isSaving ? "Saving..." : "Complete"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tagline */}
        <p className="text-center text-xs text-muted-foreground">
          ChainStock · Open-source market tracking, running fully onchain
        </p>
      </div>
    </div>
  );
}
