import type { Alert } from "@/backend";
import { AlertCondition } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBackend } from "@/hooks/useBackend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Trash2 } from "lucide-react";

function formatExpiry(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AlertRow({
  alert,
  onToggle,
  onDelete,
}: {
  alert: Alert;
  onToggle: (id: bigint, active: boolean) => void;
  onDelete: (id: bigint) => void;
}) {
  const condText =
    alert.condition === AlertCondition.Above
      ? `above $${alert.targetPrice.toFixed(2)}`
      : `below $${alert.targetPrice.toFixed(2)}`;

  const isExpired = Number(alert.expiresAt / BigInt(1_000_000)) < Date.now();
  const isMuted = isExpired || (!alert.active && !alert.triggered);

  return (
    <div
      data-ocid="alerts.item"
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border ${
        isMuted ? "border-border/40 opacity-60" : "border-border"
      } bg-card hover:bg-muted/20 transition-colors`}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-sm text-foreground">
            {alert.symbol}
          </span>
          <span className="text-muted-foreground text-xs">{condText}</span>
          {alert.triggered && (
            <Badge
              data-ocid="alerts.triggered_badge"
              className="bg-primary/20 text-primary border-primary/40 text-xs flex items-center gap-1 py-0 px-1.5"
            >
              <Bell size={10} />
              Triggered
            </Badge>
          )}
          {isExpired && !alert.triggered && (
            <Badge
              variant="outline"
              className="text-xs py-0 px-1.5 text-muted-foreground"
            >
              Expired
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          Expires {formatExpiry(alert.expiresAt)}
        </span>
      </div>

      {!alert.triggered && !isExpired && (
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            data-ocid="alerts.toggle"
            checked={alert.active}
            onCheckedChange={(checked) => onToggle(alert.id, checked)}
            aria-label={`Toggle alert for ${alert.symbol}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-ocid="alerts.delete_button"
            onClick={() => onDelete(alert.id)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label={`Delete alert for ${alert.symbol}`}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}

export function AlertsPanel() {
  const { backend } = useBackend();
  const qc = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (!backend) return [];
      return backend.getMyAlerts();
    },
    enabled: !!backend,
    refetchInterval: 30_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: bigint; active: boolean }) => {
      if (!backend) return;
      await backend.toggleAlert(id, active);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!backend) return;
      await backend.deleteAlert(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const activeAlerts = alerts.filter((a) => a.active && !a.triggered);
  const allAlerts = alerts;

  const renderList = (list: Alert[]) => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div
          data-ocid="alerts.empty_state"
          className="flex flex-col items-center gap-2 py-10 text-muted-foreground"
        >
          <Bell size={32} strokeWidth={1.5} />
          <p className="text-sm">No alerts here yet.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {list.map((alert) => (
          <AlertRow
            key={String(alert.id)}
            alert={alert}
            onToggle={(id, active) => toggleMutation.mutate({ id, active })}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>
    );
  };

  return (
    <section data-ocid="alerts.section" className="mt-8">
      <h2 className="font-display font-semibold text-xl text-foreground mb-4">
        My Alerts
      </h2>
      <Tabs defaultValue="active" data-ocid="alerts.tab">
        <TabsList className="mb-4">
          <TabsTrigger value="active" data-ocid="alerts.active_tab">
            Active
            {activeAlerts.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {activeAlerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" data-ocid="alerts.all_tab">
            All Alerts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">{renderList(activeAlerts)}</TabsContent>
        <TabsContent value="all">{renderList(allAlerts)}</TabsContent>
      </Tabs>
    </section>
  );
}
