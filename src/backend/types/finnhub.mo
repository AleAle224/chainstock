module {
  public type QuoteResult = {
    price : Float;
    change : Float;
    changePercent : Float;
  };

  public type CompanyProfileResult = {
    name : Text;
    logo : Text;
    currency : Text;
    marketCap : Float;
    exchange : Text;
  };

  public type SearchResult = {
    symbol : Text;
    description : Text;
    displaySymbol : Text;
    type_ : Text;
  };

  public type NewsItem = {
    category : Text;
    headline : Text;
    image : Text;
    source : Text;
    summary : Text;
    url : Text;
  };
};
