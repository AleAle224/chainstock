import ProfileTypes "../types/profile";
import Common "../types/common";
import ProfileLib "../lib/profile";

mixin (profiles : ProfileLib.ProfileMap) {
  public shared ({ caller }) func saveProfile(profile : ProfileTypes.UserProfile) : async () {
    ProfileLib.save(profiles, caller, profile);
  };

  public shared query ({ caller }) func getMyProfile() : async ?ProfileTypes.UserProfile {
    ProfileLib.get(profiles, caller);
  };

  public shared query ({ caller }) func hasCompletedOnboarding() : async Bool {
    ProfileLib.hasOnboarded(profiles, caller);
  };
};
