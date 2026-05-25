import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/watchlist";
import Common "../types/common";
import Time "mo:core/Time";

module {
  public type WatchlistMap = Map.Map<Common.UserId, List.List<Types.WatchlistEntry>>;

  public func add(
    watchlists : WatchlistMap,
    caller : Common.UserId,
    symbol : Text,
    company : Text,
  ) : () {
    let upper = symbol.toUpper();
    let existing = switch (watchlists.get(caller)) {
      case (?list) { list };
      case null {
        let fresh = List.empty<Types.WatchlistEntry>();
        watchlists.add(caller, fresh);
        fresh;
      };
    };
    let alreadyExists = existing.find(func(e : Types.WatchlistEntry) : Bool { e.symbol == upper });
    switch (alreadyExists) {
      case (?_) {}; // already in watchlist, skip
      case null {
        let entry : Types.WatchlistEntry = {
          symbol = upper;
          company = company;
          addedAt = Time.now();
        };
        existing.add(entry);
      };
    };
  };

  public func remove(
    watchlists : WatchlistMap,
    caller : Common.UserId,
    symbol : Text,
  ) : () {
    let upper = symbol.toUpper();
    switch (watchlists.get(caller)) {
      case (?list) {
        let kept = list.filter(func(e : Types.WatchlistEntry) : Bool { e.symbol != upper });
        list.clear();
        list.addAll(kept.values());
      };
      case null {};
    };
  };

  public func getAll(
    watchlists : WatchlistMap,
    caller : Common.UserId,
  ) : [Types.WatchlistEntry] {
    switch (watchlists.get(caller)) {
      case (?list) { list.toArray() };
      case null { [] };
    };
  };

  public func contains(
    watchlists : WatchlistMap,
    caller : Common.UserId,
    symbol : Text,
  ) : Bool {
    let upper = symbol.toUpper();
    switch (watchlists.get(caller)) {
      case (?list) {
        switch (list.find(func(e : Types.WatchlistEntry) : Bool { e.symbol == upper })) {
          case (?_) { true };
          case null { false };
        };
      };
      case null { false };
    };
  };
};
