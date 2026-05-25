import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/alerts";
import Common "../types/common";
import Time "mo:core/Time";

module {
  public type AlertMap = Map.Map<Common.UserId, List.List<Types.Alert>>;
  public type State = { var nextAlertId : Nat };

  public func create(
    alertMap : AlertMap,
    state : State,
    caller : Common.UserId,
    symbol : Text,
    targetPrice : Float,
    condition : Types.AlertCondition,
  ) : Types.Alert {
    let id = state.nextAlertId;
    state.nextAlertId += 1;
    let now = Time.now();
    let ninetyDays : Int = 90 * 24 * 60 * 60 * 1_000_000_000;
    let alert : Types.Alert = {
      id = id;
      symbol = symbol.toUpper();
      targetPrice = targetPrice;
      condition = condition;
      active = true;
      triggered = false;
      seen = false;
      createdAt = now;
      expiresAt = now + ninetyDays;
    };
    let userAlerts = switch (alertMap.get(caller)) {
      case (?list) { list };
      case null {
        let fresh = List.empty<Types.Alert>();
        alertMap.add(caller, fresh);
        fresh;
      };
    };
    userAlerts.add(alert);
    alert;
  };

  public func delete(
    alertMap : AlertMap,
    caller : Common.UserId,
    alertId : Nat,
  ) : () {
    switch (alertMap.get(caller)) {
      case (?list) {
        let kept = list.filter(func(a : Types.Alert) : Bool { a.id != alertId });
        list.clear();
        list.addAll(kept.values());
      };
      case null {};
    };
  };

  public func toggle(
    alertMap : AlertMap,
    caller : Common.UserId,
    alertId : Nat,
    active : Bool,
  ) : () {
    switch (alertMap.get(caller)) {
      case (?list) {
        list.mapInPlace(
          func(a : Types.Alert) : Types.Alert {
            if (a.id == alertId) { { a with active = active } } else { a };
          }
        );
      };
      case null {};
    };
  };

  public func getAll(
    alertMap : AlertMap,
    caller : Common.UserId,
  ) : [Types.Alert] {
    switch (alertMap.get(caller)) {
      case (?list) { list.toArray() };
      case null { [] };
    };
  };

  public func markSeen(
    alertMap : AlertMap,
    caller : Common.UserId,
    alertId : Nat,
  ) : () {
    switch (alertMap.get(caller)) {
      case (?list) {
        list.mapInPlace(
          func(a : Types.Alert) : Types.Alert {
            if (a.id == alertId) { { a with seen = true } } else { a };
          }
        );
      };
      case null {};
    };
  };

  public func getTriggered(
    alertMap : AlertMap,
    caller : Common.UserId,
  ) : [Types.Alert] {
    switch (alertMap.get(caller)) {
      case (?list) {
        list.filter(func(a : Types.Alert) : Bool { a.triggered and not a.seen }).toArray();
      };
      case null { [] };
    };
  };

  public func checkAll(
    alertMap : AlertMap,
    fetchQuote : (Text) -> async Float,
  ) : async () {
    let now = Time.now();
    // Collect unique symbols from active, non-triggered, non-expired alerts
    let symbols = List.empty<Text>();
    for ((_, userAlerts) in alertMap.entries()) {
      for (alert in userAlerts.values()) {
        if (alert.active and not alert.triggered and alert.expiresAt > now) {
          let alreadyAdded = symbols.find(func(s : Text) : Bool { s == alert.symbol });
          switch (alreadyAdded) {
            case null { symbols.add(alert.symbol) };
            case (?_) {};
          };
        };
      };
    };
    // Fetch quotes sequentially (Array.mapAsync not available)
    let quoteMap = Map.empty<Text, Float>();
    for (sym in symbols.values()) {
      let price = await fetchQuote(sym);
      quoteMap.add(sym, price);
    };
    // Evaluate each alert
    for ((_, userAlerts) in alertMap.entries()) {
      userAlerts.mapInPlace(
        func(alert : Types.Alert) : Types.Alert {
          if (alert.expiresAt <= now and alert.active) {
            { alert with active = false };
          } else if (alert.active and not alert.triggered) {
            switch (quoteMap.get(alert.symbol)) {
              case (?currentPrice) {
                let conditionMet = switch (alert.condition) {
                  case (#Above) { currentPrice > alert.targetPrice };
                  case (#Below) { currentPrice < alert.targetPrice };
                };
                if (conditionMet) {
                  { alert with triggered = true; active = false };
                } else { alert };
              };
              case null { alert };
            };
          } else { alert };
        }
      );
    };
  };
};
