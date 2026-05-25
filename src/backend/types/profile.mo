import Time "mo:core/Time";

module {
  public type UserProfile = {
    country : Text;
    investmentGoals : Text;
    riskTolerance : Text;
    preferredIndustry : Text;
    createdAt : Time.Time;
    hasCompletedOnboarding : Bool;
  };
};
