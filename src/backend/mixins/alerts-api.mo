import AlertTypes "../types/alerts";
import Common "../types/common";
import AlertLib "../lib/alerts";

mixin (alertMap : AlertLib.AlertMap, state : AlertLib.State) {
  public shared ({ caller }) func createAlert(
    symbol : Text,
    targetPrice : Float,
    condition : AlertTypes.AlertCondition,
  ) : async AlertTypes.Alert {
    AlertLib.create(alertMap, state, caller, symbol, targetPrice, condition);
  };

  public shared ({ caller }) func deleteAlert(alertId : Nat) : async () {
    AlertLib.delete(alertMap, caller, alertId);
  };

  public shared ({ caller }) func toggleAlert(alertId : Nat, active : Bool) : async () {
    AlertLib.toggle(alertMap, caller, alertId, active);
  };

  public shared query ({ caller }) func getMyAlerts() : async [AlertTypes.Alert] {
    AlertLib.getAll(alertMap, caller);
  };

  public shared ({ caller }) func markAlertSeen(alertId : Nat) : async () {
    AlertLib.markSeen(alertMap, caller, alertId);
  };

  public shared query ({ caller }) func getMyTriggeredAlerts() : async [AlertTypes.Alert] {
    AlertLib.getTriggered(alertMap, caller);
  };
};
