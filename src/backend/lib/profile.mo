import Map "mo:core/Map";
import Types "../types/profile";
import Common "../types/common";

module {
  public type ProfileMap = Map.Map<Common.UserId, Types.UserProfile>;

  public func save(
    profiles : ProfileMap,
    caller : Common.UserId,
    profile : Types.UserProfile,
  ) : () {
    profiles.add(caller, profile);
  };

  public func get(
    profiles : ProfileMap,
    caller : Common.UserId,
  ) : ?Types.UserProfile {
    profiles.get(caller);
  };

  public func hasOnboarded(
    profiles : ProfileMap,
    caller : Common.UserId,
  ) : Bool {
    switch (profiles.get(caller)) {
      case (?profile) { profile.hasCompletedOnboarding };
      case null { false };
    };
  };
};
