export interface CommodityPrice {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  unit: string;
}

export interface CommoditiesData {
  items: CommodityPrice[];
  lastUpdated: string;
}
