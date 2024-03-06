export interface Currency {
    id: number;
    key: string;
    code: string;
    symbol: string;
    coin: boolean;
    blockchain?: string;
    precision?: number;
    visible: boolean;
    disable?: boolean;
    marketing_category?: string;
    self_transfer?: boolean;
  }
  