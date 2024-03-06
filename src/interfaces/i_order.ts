export interface Order {
  id: number;
  bid: number;
  ask: number;
  // currency: number,
  price: number;
  // volume: number,
  origin_volume: number;
  // state: number,
  // done_at: Date,
  type: string;
  member_id: number;
  created_at: Date;
  updated_at: Date;
  // sn?: string,
  // source: string,
  // ord_type: string,
  // locked: number,
  // origin_locked: number,
  // funds_received: number,
  // trades_count: number,
}
