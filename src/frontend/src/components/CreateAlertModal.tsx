import { AlertCondition } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBackend } from "@/hooks/useBackend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CreateAlertModalProps {
  open: boolean;
  onClose: () => void;
  symbols: string[];
  defaultSymbol?: string;
}

export function CreateAlertModal({
  open,
  onClose,
  symbols,
  defaultSymbol,
}: CreateAlertModalProps) {
  const { backend } = useBackend();
  const qc = useQueryClient();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [symbol, setSymbol] = useState(defaultSymbol ?? symbols[0] ?? "");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<AlertCondition>(
    AlertCondition.Above,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      setSymbol(defaultSymbol ?? symbols[0] ?? "");
      setTargetPrice("");
      setCondition(AlertCondition.Above);
      setError("");
    } else {
      dialogRef.current?.close();
    }
  }, [open, defaultSymbol, symbols]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!backend) throw new Error("Not connected");
      const price = Number.parseFloat(targetPrice);
      if (Number.isNaN(price) || price <= 0)
        throw new Error("Enter a valid price");
      if (!symbol) throw new Error("Select a symbol");
      await backend.createAlert(symbol, price, condition);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setError("");
    mutation.mutate();
  };

  return (
    <dialog
      ref={dialogRef}
      data-ocid="create-alert.dialog"
      className="bg-card text-foreground rounded-xl border border-border shadow-2xl p-0 w-full max-w-md backdrop:bg-black/60"
      onClose={onClose}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-display font-semibold text-lg">
          Create Price Alert
        </h2>
        <button
          type="button"
          data-ocid="create-alert.close_button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alert-symbol">Symbol</Label>
          <select
            id="alert-symbol"
            data-ocid="create-alert.select"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alert-price">Target Price (USD)</Label>
          <Input
            id="alert-price"
            data-ocid="create-alert.input"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 180.00"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Condition</Label>
          <div className="flex gap-4">
            {(
              [AlertCondition.Above, AlertCondition.Below] as AlertCondition[]
            ).map((c) => (
              <label
                key={c}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  data-ocid={`create-alert.radio.${c.toLowerCase()}`}
                  name="condition"
                  value={c}
                  checked={condition === c}
                  onChange={() => setCondition(c)}
                  className="accent-primary"
                />
                <span
                  className={
                    condition === c
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  Price{" "}
                  {c === AlertCondition.Above
                    ? "crosses above"
                    : "crosses below"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p
            data-ocid="create-alert.error_state"
            className="text-destructive text-sm"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            data-ocid="create-alert.cancel_button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            data-ocid="create-alert.submit_button"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create Alert"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
