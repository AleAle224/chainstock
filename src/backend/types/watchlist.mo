import Time "mo:core/Time";

module {
  public type WatchlistEntry = {
    symbol : Text;
    company : Text;
    addedAt : Time.Time;
  };
};
