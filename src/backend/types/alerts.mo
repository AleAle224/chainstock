import Time "mo:core/Time";

module {
  public type AlertCondition = { #Above; #Below };

  public type Alert = {
    id : Nat;
    symbol : Text;
    targetPrice : Float;
    condition : AlertCondition;
    active : Bool;
    triggered : Bool;
    seen : Bool;
    createdAt : Time.Time;
    expiresAt : Time.Time;
  };
};
