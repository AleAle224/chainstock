import { AlertCondition } from "@/backend";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import type { Alert } from "@/types";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useTriggeredAlertToasts() {
  const { backend } = useBackend();
  const { isAuthenticated } = useAuth();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!backend || !isAuthenticated || checkedRef.current) return;
    checkedRef.current = true;

    backend
      .getMyTriggeredAlerts()
      .then((alerts: Alert[]) => {
        const unseen = alerts.filter((a) => !a.seen);
        for (const alert of unseen) {
          const dir =
            alert.condition === AlertCondition.Above ? "above" : "below";
          const msg = `${alert.symbol} crossed ${dir} $${alert.targetPrice.toFixed(2)}`;
          toast(msg, {
            description: "Price alert triggered",
            duration: 6000,
            action: {
              label: "Dismiss",
              onClick: () => backend.markAlertSeen(alert.id),
            },
          });
          backend.markAlertSeen(alert.id).catch(() => {});
        }
      })
      .catch(() => {});
  }, [backend, isAuthenticated]);
}
