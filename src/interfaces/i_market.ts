import { MarketFee } from "./i_market_fee";

export interface Market {
  id: string;
  code: number;
  name: string;
  base_unit: string;
  quote_unit: string;
  bid: MarketFee;
  ask: MarketFee;
  sort_order: number;
  market_type?: string;
  tab_category: string;
  price_group_fixed?: number;
  primary: boolean;
  visible: boolean;
}
