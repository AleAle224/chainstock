import WatchlistTypes "../types/watchlist";
import Common "../types/common";
import WatchlistLib "../lib/watchlist";

mixin (watchlists : WatchlistLib.WatchlistMap) {
  public shared ({ caller }) func addToWatchlist(symbol : Text, company : Text) : async () {
    WatchlistLib.add(watchlists, caller, symbol, company);
  };

  public shared ({ caller }) func removeFromWatchlist(symbol : Text) : async () {
    WatchlistLib.remove(watchlists, caller, symbol);
  };

  public shared query ({ caller }) func getMyWatchlist() : async [WatchlistTypes.WatchlistEntry] {
    WatchlistLib.getAll(watchlists, caller);
  };

  public shared query ({ caller }) func isInWatchlist(symbol : Text) : async Bool {
    WatchlistLib.contains(watchlists, caller, symbol);
  };
};
