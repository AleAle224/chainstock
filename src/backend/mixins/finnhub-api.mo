import FinnhubTypes "../types/finnhub";
import FinnhubLib "../lib/finnhub";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Map "mo:core/Map";
import Time "mo:core/Time";

mixin (
  finnhubState : { var key : Text },
  finnhubTransform : OutCall.Transform,
  profileCache : Map.Map<Text, (FinnhubTypes.CompanyProfileResult, Int)>,
  searchCache  : Map.Map<Text, ([FinnhubTypes.SearchResult], Int)>,
) {
  let PROFILE_TTL : Int = 86_400 * 1_000_000_000;  // 24 hours in nanoseconds
  let SEARCH_TTL  : Int = 1_800 * 1_000_000_000;   // 30 minutes in nanoseconds

  public shared ({ caller }) func setFinnhubKey(key : Text) : async () {
    // Only controllers may set the API key
    assert (caller.isController());
    finnhubState.key := key;
  };

  public shared func getQuote(symbol : Text) : async FinnhubTypes.QuoteResult {
    await FinnhubLib.fetchQuote(finnhubState.key, symbol, finnhubTransform);
  };

  public shared func getCompanyProfile(symbol : Text) : async FinnhubTypes.CompanyProfileResult {
    let now = Time.now();
    switch (profileCache.get(symbol)) {
      case (?(cached, ts)) {
        if (now - ts < PROFILE_TTL) { return cached };
      };
      case null {};
    };
    let result = await FinnhubLib.fetchCompanyProfile(finnhubState.key, symbol, finnhubTransform);
    profileCache.add(symbol, (result, Time.now()));
    result;
  };

  public shared func searchStocks(searchQuery : Text) : async [FinnhubTypes.SearchResult] {
    let now = Time.now();
    switch (searchCache.get(searchQuery)) {
      case (?(cached, ts)) {
        if (now - ts < SEARCH_TTL) { return cached };
      };
      case null {};
    };
    let results = await FinnhubLib.fetchSearch(finnhubState.key, searchQuery, finnhubTransform);
    searchCache.add(searchQuery, (results, Time.now()));
    results;
  };

  public shared func getCompanyNews(symbol : Text, fromDate : Text, toDate : Text) : async [FinnhubTypes.NewsItem] {
    await FinnhubLib.fetchCompanyNews(finnhubState.key, symbol, fromDate, toDate, finnhubTransform);
  };
};
