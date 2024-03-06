export const REASON = {
  STRIKE_FEE: 100,
  STRIKE_ADD: 110,
  STRIKE_SUB: 120,
  STRIKE_UNLOCK: 130,
  ORDER_SUBMIT: 600,
  ORDER_CANCEL: 610,
  ORDER_FULLFILLED: 620,
  DEPOSIT: 1000,
  WITHDRAW_LOCK: 800,
  WITHDRAW_UNLOCK: 810,
  WITHDRAW_FEE_LOCK: 820,
  WITHDRAW_FEE_UNLOCK: 830,
  WITHDRAW: 2000,
  WITHDRAW_FEE: 2001,
};
export const TYPE = {
  ORDER_ASK: "OrderAsk",
  ORDER_BID: "OrderBid",
};
export const EVENT_TYPE = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  WITHDRAW_LOCK: "WITHDRAW_LOCK",
  WITHDRAW_UNLOCK: "WITHDRAW_UNLOCK",
  SPOT_TRADE: "SPOT_TRADE",
  SPOT_TRADE_CANCEL: "SPOT_TRADE_CANCEL",
  SPOT_TRADE_FULLFILL: "SPOT_TRADE_FULLFILL",
  SPOT_TRADE_MATCH: "SPOT_TRADE_MATCH",
  OPEN_POSITION: "OPEN_POSITION",
  CLOSE_POSITION: "CLOSE_POSITION",
  SWAP: "SWAP",
  REFERRAL_COMMISSION: "REFERRAL_COMMISSION",
};
export const EVENT_CODE = {
  UNDEFINED: "E99999999",
  DEPOSIT: {
    USDT: "E00010001",
    ETH: "E00010002",
    BTC: "E00010003",
    USD: "E00010007",
  },
  WITHDRAW: {
    USDT: "E00010004",
    ETH: "E00001005",
    BTC: "E00010006",
    USD: "E00010008",
  },
  WITHDRAW_LOCK: {
    USDT: "E00010009",
    ETH: "E000010010",
    BTC: "E000100011",
    USD: "E000100012",
  },
  WITHDRAW_UNLOCK: {
    USDT: "E00010013",
    ETH: "E00001014",
    BTC: "E00010015",
    USD: "E00010016",
  },
  SPOT_TRADE: {
    BTC_USDT: "E00020001",
    BTC_ETH: "E00020002",
    BTC_USD: "E00020003",
    ETH_USDT: "E00020004",
    ETH_BTC: "E00020005",
    ETH_USD: "E00020006",
    USDT_BTC: "E00020007",
    USDT_ETH: "E00020008",
    USDT_USD: "E00020009",
    USD_ETH: "E00020010",
    USD_BTC: "E00020011",
    USD_USDT: "E00020012",
  },
  SPOT_TRADE_CANCEL: {
    BTC_USDT: "E00020013",
    BTC_ETH: "E00020014",
    BTC_USD: "E00020015",
    ETH_USDT: "E00020016",
    ETH_BTC: "E00020017",
    ETH_USD: "E00020018",
    USDT_BTC: "E00020019",
    USDT_ETH: "E00020020",
    USDT_USD: "E00020021",
    USD_ETH: "E00020022",
    USD_BTC: "E00020023",
    USD_USDT: "E00020024",
  },
  // TODO: add on BAIFA Accounting
  SPOT_TRADE_FULLFILL: {
    BTC_USDT: "E00020025", // TODO: change to E00020025 after BAIFA Accounting added (20240201 - tzuhan)
    BTC_ETH: "E00020026",
    BTC_USD: "E00020027",
    ETH_USDT: "E00020028",
    ETH_BTC: "E00020029",
    ETH_USD: "E00020030",
    USDT_BTC: "E00020031",
    USDT_ETH: "E00020032",
    USDT_USD: "E00020033",
    USD_ETH: "E00020034",
    USD_BTC: "E00020035",
    USD_USDT: "E00020036",
  },
  SPOT_TRADE_MATCH: {
    BTC_USDT: "E00050001",
    BTC_USD: "E00050002",
    BTC_ETH: "E00050003",
    ETH_USDT: "E00050004",
    ETH_USD: "E00050005",
    USDT_USD: "E00050006",
  },
  OPEN_POSITION: {
    USDT_BTC: "E00030001",
    BTC_USDT: "E00030002",
    USDT_ETH: "E00030003",
    ETH_USDT: "E00030004",
  },
  CLOSE_POSITION: {
    BTC_USDT: "E00030005",
    USDT_BTC: "E00030006",
    ETH_USDT: "E00030007",
    USDT_ETH: "E00030008",
  },
  SWAP: {
    BTC_USDT: "E00040001",
    BTC_ETH: "E00040002",
    ETH_USDT: "E00040003",
    ETH_BTC: "E00040004",
    USDT_BTC: "E00040005",
    USDT_ETH: "E00040006",
  },
  REFERRAL_COMMISSION: {
    BTC_USDT: "E00050007",
    BTC_USD: "E00050008",
    BTC_ETH: "E00050009",
    ETH_USDT: "E00050010",
    ETH_USD: "E00050011",
    USDT_USD: "E00050012",
  },
};
export const DEPOSIT = {
  AMOUNT: "EP001",
  INNER_FEE: "EP002",
  OUTER_FEE: "EP003",
  TIME: "EP004",
  EXCHANGE_RATE: "EP005",
};
export const WITHDRAW = {
  AMOUNT: "EP001",
  INNER_FEE: "EP002",
  OUTER_FEE: "EP003",
  BLOCKCHAIN_FEE: "EP004",
  TIME: "EP005",
  EXCHANGE_RATE_USDT: "EP006",
  EXCHANGE_RATE_ETH: "EP007",
};
export const WITHDRAW_LOCK = {
  AMOUNT: "EP001",
  INNER_FEE: "EP002",
  OUTER_FEE: "EP003",
  BLOCKCHAIN_FEE: "EP004",
  TIME: "EP005",
  EXCHANGE_RATE_USDT: "EP006",
  EXCHANGE_RATE_ETH: "EP007",
};
export const WITHDRAW_UNLOCK = {
  AMOUNT: "EP001",
  INNER_FEE: "EP002",
  OUTER_FEE: "EP003",
  BLOCKCHAIN_FEE: "EP004",
  TIME: "EP005",
  EXCHANGE_RATE_USDT: "EP006",
  EXCHANGE_RATE_ETH: "EP007",
};
export const SPOT_TRADE = {
  TRADE1: "EP001",
  TRADE2: "EP002",
  TIME: "EP003",
  ORDER: "EP004",
};
export const SPOT_TRADE_CANCEL = {
  TRADE1: "EP001",
  TRADE2: "EP002",
  TIME: "EP003",
  ORDER: "EP004",
};
export const SPOT_TRADE_MATCH = {
  MAKER_TRADE: "EP001",
  MAKER_TRADE2: "EP002",
  TAKER_TRADE: "EP003",
  TAKER_TRADE2: "EP004",
  EXCHANGE_RATE_BTC: "EP005",
  EXCHANGE_RATE_ETH: "EP006",
  INNER_FEE_TAKER: "EP007",
  OUTER_FEE_TAKER: "EP008",
  INNER_FEE_MAKER: "EP009",
  OUTER_FEE_MAKER: "EP010",
  TIME: "EP011",
};
export const SPOT_TRADE_FULLFILL = {
  UNLOCK_FUNDS: "EP001",
  TIME: "EP002",
};
export const REFERRAL_COMMISSION = {
  REFUND: "EP001",
  EXCHANGE_RATE: "EP002",
  TIME: "EP003",
};
export const OPEN_POSITION = {
  TRADE_AMOUNT: "EP001",
  INNER_FEE: "EP002",
  OUTER_FEE: "EP003",
  BLOCKCHAIN_FEE: "EP004",
  TIME: "EP005",
  EXCHANGE_RATE: "EP006",
  MARGIN: "EP007",
  STOP_LOSS_FEE: "EP008",
  TYPE: "EP009",
};
export const CLOSE_POSITION = {
  TRADE_AMOUNT: "EP001",
  INNER_FEE: "EP002",
  OUTER_FEE: "EP003",
  TIME: "EP004",
  EXCHANGE_RATE: "EP005",
  OPEN_PRICE: "EP006",
  FORCED_CLOSE_FEE: "EP007",
  MARGIN: "EP008",
  PnL: "EP009",
};
export const SWAP = {
  TRADE_AMOUNT1: "EP001",
  TRADE_AMOUNT2: "EP002",
  INNER_FEE: "EP003",
  OUTER_FEE: "EP004",
  TIME: "EP005",
  EXCHANGE_RATE1: "EP006",
  EXCHANGE_RATE2: "EP007",
  DESCRIPTION: "EP008",
};

export const account_versions_keys = [
  "id",
  "member_id",
  "account_id",
  "reason",
  "balance",
  "locked",
  "fee",
  "amount",
  "modifiable_id",
  "modifiable_type",
  "created_at",
  "updated_at",
  "currency",
  "fun",
];
export const account_versions_keys_str = account_versions_keys.join(", ");

export const events_keys = [
  "id",
  "event_code",
  "type",
  "details",
  "occurred_at",
  "created_at",
  "account_version_ids",
];
export const events_keys_str = events_keys.join(", ");

export const referral_commissions_keys = [
  "id",
  "referred_by_member_id",
  "market",
  "currency",
  "amount",
  "state",
  "deposited_at",
];
export const referral_commissions_keys_str =
  referral_commissions_keys.join(", ");

export const orders_keys = [
  "id",
  "bid",
  "ask",
  "price",
  "origin_volume",
  "type",
  "member_id",
  "created_at",
];
export const orders_keys_str = orders_keys.join(", ");

export const trades_keys = [
  "id",
  "ask_id",
  "bid_id",
  "ask_member_id",
  "bid_member_id",
  "created_at",
];
export const trades_keys_str = trades_keys.join(", ");

export const jobs_keys = [
  "id",
  "table_name",
  "sync_id",
  "parsed_id",
  "created_at",
  "updated_at",
];
export const jobs_keys_str = jobs_keys.join(", ");

export const REASON_PAIRS = {
  "800": "820",
  "820": "800",
  "810": "830",
  "830": "810",
  "2000": "2001",
  "2001": "2000",
};
