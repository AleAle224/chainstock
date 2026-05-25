import Types "../types/finnhub";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Text "mo:core/Text";
import Float "mo:core/Float";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";

module {
  // Find the byte-index of `needle` inside `haystack` using char iteration.
  // Returns null if not found.
  private func dropChars(t : Text, n : Nat) : Text {
    Text.fromIter(t.chars().drop(n))
  };
  private func takeChars(t : Text, n : Nat) : Text {
    Text.fromIter(t.chars().take(n))
  };
  private func trimLeading(t : Text) : Text {
    Text.fromIter(t.chars().dropWhile(func(c : Char) : Bool { c == ' ' or c == '\t' or c == '\n' or c == '\r' }))
  };

  func indexOf(haystack : Text, needle : Text) : ?Nat {
    if (needle.size() == 0) return ?0;
    let parts = haystack.split(#text needle);
    switch (parts.next()) {
      case null { null };
      case (?first) {
        switch (parts.next()) {
          case null { null };
          case (?_) { ?first.size() };
        };
      };
    };
  };

  func parseFloatField(json : Text, key : Text) : Float {
    switch (indexOf(json, key)) {
      case null { 0.0 };
      case (?idx) {
        let rest = dropChars(json, idx + key.size());
        let valStr = extractNumericToken(rest);
        parseFloat(valStr);
      };
    };
  };

  func parseTextField(json : Text, key : Text) : Text {
    switch (indexOf(json, key)) {
      case null { "" };
      case (?idx) {
        let rest = dropChars(json, idx + key.size());
        let trimmed = trimLeading(rest);
        switch (indexOf(trimmed, "\"")) {
          case null { "" };
          case (?qStart) {
            let afterQuote = dropChars(trimmed, qStart + 1);
            switch (indexOf(afterQuote, "\"")) {
              case null { afterQuote };
              case (?end_) { takeChars(afterQuote, end_) };
            };
          };
        };
      };
    };
  };

  func extractNumericToken(text : Text) : Text {
    var result = "";
    var started = false;
    label loop_ for (c in text.chars()) {
      let s = Text.fromChar(c);
      if (s == "-" or s == "." or (c >= '0' and c <= '9') or s == "e" or s == "E" or s == "+") {
        result #= s;
        started := true;
      } else if (started) {
        break loop_;
      };
    };
    result;
  };

  // Parse a float from text by splitting on '.' and combining integer parts.
  func parseFloat(s : Text) : Float {
    if (s.size() == 0) return 0.0;
    let neg = s.size() > 0 and s.chars().next() == ?'-';
    let abs_ = if (neg) dropChars(s, 1) else s;
    switch (indexOf(abs_, ".")) {
      case null {
        switch (Int.fromText(abs_)) {
          case (?i) { if (neg) Float.fromInt(-i) else Float.fromInt(i) };
          case null { 0.0 };
        };
      };
      case (?dot) {
        let intPart = takeChars(abs_, dot);
        let fracPart = dropChars(abs_, dot + 1);
        let intVal : Float = switch (Int.fromText(intPart)) {
          case (?i) { Float.fromInt(i) };
          case null { 0.0 };
        };
        let fracVal : Float = switch (Int.fromText(fracPart)) {
          case (?f) {
            var denom : Float = 1.0;
            var i = 0;
            while (i < fracPart.size()) { denom *= 10.0; i += 1 };
            Float.fromInt(f) / denom;
          };
          case null { 0.0 };
        };
        let result = intVal + fracVal;
        if (neg) -result else result;
      };
    };
  };

  func roundFloat(f : Float) : Float {
    ((f * 10000.0).toInt()).toFloat() / 10000.0;
  };

  func parseObjectArrayAsSearch(json : Text, maxItems : Nat) : [Types.SearchResult] {
    switch (indexOf(json, "[")) {
      case null { [] };
      case (?start) {
        let arr = dropChars(json, start + 1);
        var results = List.empty<Types.SearchResult>();
        var remaining = arr;
        var count = 0;
        label parseLoop while (count < maxItems) {
          switch (indexOf(remaining, "{")) {
            case null { break parseLoop };
            case (?objStart) {
              let objText = dropChars(remaining, objStart);
              let sym = parseTextField(objText, "symbol\":");
              let desc = parseTextField(objText, "description\":");
              let disp = parseTextField(objText, "displaySymbol\":");
              let typ = parseTextField(objText, "type\":");
              if (sym.size() > 0) {
                results.add({ symbol = sym; description = desc; displaySymbol = disp; type_ = typ });
                count += 1;
              };
              switch (indexOf(objText, "}")) {
                case null { break parseLoop };
                case (?objEnd) {
                  remaining := dropChars(objText, objEnd + 1);
                };
              };
            };
          };
        };
        results.toArray();
      };
    };
  };

  func parseSearchResults(json : Text) : [Types.SearchResult] {
    let resultKey = "result\":";
    switch (indexOf(json, resultKey)) {
      case null { parseObjectArrayAsSearch(json, 15) };
      case (?idx) {
        let afterKey = dropChars(json, idx + resultKey.size());
        parseObjectArrayAsSearch(afterKey, 15);
      };
    };
  };

  func parseNewsArray(json : Text) : [Types.NewsItem] {
    switch (indexOf(json, "[")) {
      case null { [] };
      case (?start) {
        let arr = dropChars(json, start + 1);
        var items = List.empty<Types.NewsItem>();
        var remaining = arr;
        label parseLoop while (true) {
          switch (indexOf(remaining, "{")) {
            case null { break parseLoop };
            case (?objStart) {
              let objText = dropChars(remaining, objStart);
              let category = parseTextField(objText, "category\":");
              let headline = parseTextField(objText, "headline\":");
              let image = parseTextField(objText, "image\":");
              let source = parseTextField(objText, "source\":");
              let summary = parseTextField(objText, "summary\":");
              let url = parseTextField(objText, "url\":");
              if (headline.size() > 0) {
                items.add({ category; headline; image; source; summary; url });
              };
              switch (indexOf(objText, "}")) {
                case null { break parseLoop };
                case (?objEnd) {
                  remaining := dropChars(objText, objEnd + 1);
                };
              };
            };
          };
        };
        items.toArray();
      };
    };
  };

  public func fetchQuote(
    apiKey : Text,
    symbol : Text,
    transform : OutCall.Transform,
  ) : async Types.QuoteResult {
    let url = "https://finnhub.io/api/v1/quote?symbol=" # symbol # "&token=" # apiKey;
    let responseText = await OutCall.httpGetRequest(url, [], transform);
    {
      price = roundFloat(parseFloatField(responseText, "\"c\":"));
      change = roundFloat(parseFloatField(responseText, "\"d\":"));
      changePercent = roundFloat(parseFloatField(responseText, "\"dp\":"));
    };
  };

  public func fetchCompanyProfile(
    apiKey : Text,
    symbol : Text,
    transform : OutCall.Transform,
  ) : async Types.CompanyProfileResult {
    let url = "https://finnhub.io/api/v1/stock/profile2?symbol=" # symbol # "&token=" # apiKey;
    let responseText = await OutCall.httpGetRequest(url, [], transform);
    {
      name = parseTextField(responseText, "\"name\":");
      logo = parseTextField(responseText, "\"logo\":");
      currency = parseTextField(responseText, "\"currency\":");
      marketCap = roundFloat(parseFloatField(responseText, "\"marketCapitalization\":"));
      exchange = parseTextField(responseText, "\"exchange\":");
    };
  };

  public func fetchSearch(
    apiKey : Text,
    searchQuery : Text,
    transform : OutCall.Transform,
  ) : async [Types.SearchResult] {
    let url = "https://finnhub.io/api/v1/search?q=" # searchQuery # "&token=" # apiKey;
    let responseText = await OutCall.httpGetRequest(url, [], transform);
    parseSearchResults(responseText);
  };

  public func fetchCompanyNews(
    apiKey : Text,
    symbol : Text,
    fromDate : Text,
    toDate : Text,
    transform : OutCall.Transform,
  ) : async [Types.NewsItem] {
    let url = "https://finnhub.io/api/v1/company-news?symbol=" # symbol # "&from=" # fromDate # "&to=" # toDate # "&token=" # apiKey;
    let responseText = await OutCall.httpGetRequest(url, [], transform);
    parseNewsArray(responseText);
  };
};
