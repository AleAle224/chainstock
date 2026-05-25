import Map "mo:core/Map";
import List "mo:core/List";
import Timer "mo:core/Timer";
import Common "types/common";
import WatchlistTypes "types/watchlist";
import AlertTypes "types/alerts";
import ProfileTypes "types/profile";
import WatchlistLib "lib/watchlist";
import AlertLib "lib/alerts";
import ProfileLib "lib/profile";
import WatchlistMixin "mixins/watchlist-api";
import AlertsMixin "mixins/alerts-api";
import ProfileMixin "mixins/profile-api";
import FinnhubMixin "mixins/finnhub-api";
import Principal "mo:core/Principal";
import FinnhubLib "lib/finnhub";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import FinnhubTypes "types/finnhub";

actor {
  // Stable state
  let watchlists : WatchlistLib.WatchlistMap = Map.empty<Common.UserId, List.List<WatchlistTypes.WatchlistEntry>>();
  let alertMap : AlertLib.AlertMap = Map.empty<Common.UserId, List.List<AlertTypes.Alert>>();
  let profiles : ProfileLib.ProfileMap = Map.empty<Common.UserId, ProfileTypes.UserProfile>();
  let alertState : AlertLib.State = { var nextAlertId = 0 };
  let finnhubState = { var key = "" };
  let profileCache : Map.Map<Text, (FinnhubTypes.CompanyProfileResult, Int)> = Map.empty();
  let searchCache  : Map.Map<Text, ([FinnhubTypes.SearchResult], Int)>        = Map.empty();

  // Transform for Finnhub HTTP outcalls — strips non-deterministic fields
  // so all replicas reach consensus. Must live in the actor (not a module).
  public query func finnhubTransform(args : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(args);
  };
  // Mixin composition
  include WatchlistMixin(watchlists);
  include AlertsMixin(alertMap, alertState);
  include ProfileMixin(profiles);
  include FinnhubMixin(finnhubState, finnhubTransform, profileCache, searchCache);

  // Internal: alert checker called by recurring timer
  func checkAlerts() : async () {
    await AlertLib.checkAll(
      alertMap,
      func(sym : Text) : async Float {
        let result = await FinnhubLib.fetchQuote(finnhubState.key, sym, finnhubTransform);
        result.price;
      },
    );
  };

  // Start the 5-minute recurring timer on canister init
  ignore Timer.recurringTimer<system>(#seconds(300), func() : async () {
    await checkAlerts();
  });
};

