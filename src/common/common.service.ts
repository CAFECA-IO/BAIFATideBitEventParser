import { Injectable } from "@nestjs/common";
import { currencies } from "../constants/coins";
import { EVENT_CODE, EVENT_TYPE, REASON, TYPE } from "../constants/constants";
import { markets } from "../constants/markets";
import { AccountVersion } from "../interfaces/i_account_version";
import { Currency } from "../interfaces/i_currency";
import { Market } from "../interfaces/i_market";
import { Order } from "../interfaces/i_order";
import { ReferralCommission } from "../interfaces/i_refferal_commission";
import { TideBitEvent } from "../interfaces/i_tidebit_event";

@Injectable()
export class CommonService {
  private currencyMap: { [key: string]: Currency };
  private marketMap: { [key: string]: Market };

  constructor() {
    this.currencyMap = currencies.reduce((prev, coin) => {
      prev[coin.id] = coin;
      return prev;
    }, {});

    this.marketMap = markets.reduce((prev, ticker) => {
      prev[ticker.code] = ticker;
      return prev;
    }, {});
  }

  getTimestamp(date: Date) {
    return Math.ceil(date.getTime() / 1000);
  }

  async sleep(ms: number = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  convertDeposit(
    accountVersion: AccountVersion,
    referralCommision?: ReferralCommission
  ): TideBitEvent {
    const currency =
      this.currencyMap[accountVersion.currency].code.toUpperCase();
    let tidebitEventCode: string = EVENT_CODE.DEPOSIT[currency];

    let tidebitEvent: TideBitEvent;
    if (referralCommision) {
      const tickerName = this.marketMap[referralCommision.market].name.replace(
        "/",
        "_"
      );
      tidebitEventCode = EVENT_CODE.REFERRAL_COMMISSION[tickerName];
      tidebitEvent = {
        event_code: tidebitEventCode ?? EVENT_CODE.UNDEFINED,
        type: EVENT_TYPE.REFERRAL_COMMISSION,
        details: JSON.stringify({
          EP001: referralCommision.amount,
          EP002: 0,
          // EP003: 0,//TODO: exchange rate (20240205 - tzuhan)
          // EP004: 0,//TODO: exchange rate (20240205 - tzuhan)
          // EP005: SafeMath.div(referralCommision.amount, referralCommision.ref_gross_fee),
          EP003: accountVersion.created_at,
        }),
        occurred_at: this.getTimestamp(new Date(accountVersion.created_at)),
        created_at: this.getTimestamp(new Date()),
        account_version_ids: JSON.stringify([accountVersion.id]),
      };
    } else {
      tidebitEvent = {
        event_code: tidebitEventCode ?? EVENT_CODE.UNDEFINED,
        type: EVENT_TYPE.DEPOSIT,
        details: JSON.stringify({
          EP001: Math.abs(+accountVersion.balance),
          EP002: Math.abs(+accountVersion.fee),
          EP003: 0,
          EP004: accountVersion.created_at,
          EP005: 0, //TODO: exchange rate (20240123 - tzuhan)
        }),
        occurred_at: this.getTimestamp(new Date(accountVersion.created_at)),
        created_at: this.getTimestamp(new Date()),
        account_version_ids: JSON.stringify([accountVersion.id]),
      };
    }
    return tidebitEvent;
  }

  convertWithdraw(
    type: string,
    accountVersions: AccountVersion[]
  ): TideBitEvent {
    const withdrawAccountVeresion = accountVersions.find(
      (av) => av.reason === REASON[`WITHDRAW${type ? `_${type}` : ""}`]
    );
    const withdrawFeeAccountVeresion = accountVersions.find(
      (av) => av.reason === REASON[`WITHDRAW_FEE${type ? `_${type}` : ""}`]
    );
    if (!withdrawAccountVeresion || !withdrawFeeAccountVeresion) {
      // Deprecated: [debug] (20240229 - tzuhan)
      console.error(
        `[convertWithdraw] withdrawAccountVeresion or withdrawFeeAccountVeresion is null, accountVersions: `,
        accountVersions
      );
      return null;
    }
    const currency =
      this.currencyMap[withdrawAccountVeresion.currency].code.toUpperCase();
    const tidebitEventCode =
      EVENT_CODE[`WITHDRAW${type ? `_${type}` : ""}`][currency];
    const tidebitEvent: TideBitEvent = {
      event_code: tidebitEventCode ?? EVENT_CODE.UNDEFINED,
      type: EVENT_TYPE[`WITHDRAW${type ? `_${type}` : ""}`],
      details: JSON.stringify({
        EP001: Math.abs(+withdrawAccountVeresion.locked),
        EP002: Math.abs(+withdrawFeeAccountVeresion?.locked || 0),
        EP003: 0,
        EP004: withdrawAccountVeresion.created_at,
        EP005: 0, //TODO: exchange rate of withdraw currency (20240123 - tzuhan)
      }),
      occurred_at: this.getTimestamp(
        new Date(withdrawAccountVeresion.created_at)
      ),
      created_at: this.getTimestamp(new Date()),
      account_version_ids: JSON.stringify([
        withdrawAccountVeresion.id,
        withdrawFeeAccountVeresion.id,
      ]),
    };
    return tidebitEvent;
  }

  withdrawParser(accountVersions: AccountVersion[]): TideBitEvent {
    switch (accountVersions[0].reason) {
      case REASON.WITHDRAW_LOCK:
      case REASON.WITHDRAW_FEE_LOCK:
        return this.convertWithdraw("LOCK", accountVersions);
      case REASON.WITHDRAW:
      case REASON.WITHDRAW_FEE:
        return this.convertWithdraw(null, accountVersions);
      case REASON.WITHDRAW_UNLOCK:
      case REASON.WITHDRAW_FEE_UNLOCK:
        return this.convertWithdraw("UNLOCK", accountVersions);
      default:
        return null;
    }
  }

  convertOrder(
    type: string,
    accountVersion: AccountVersion,
    order: Order
  ): TideBitEvent {
    let currency1: string,
      currency2: string,
      tidebitEventCode: string,
      tidebitEvent: TideBitEvent;
    if (order.type === TYPE.ORDER_ASK) {
      currency1 = this.currencyMap[order.ask].code.toUpperCase();
      currency2 = this.currencyMap[order.bid].code.toUpperCase();
    } else {
      currency1 = this.currencyMap[order.bid].code.toUpperCase();
      currency2 = this.currencyMap[order.ask].code.toUpperCase();
    }
    tidebitEventCode =
      EVENT_CODE[`SPOT_TRADE${type ? `_${type}` : ""}`][
        `${currency1}_${currency2}`
      ];
    tidebitEvent = {
      event_code: tidebitEventCode ?? EVENT_CODE.UNDEFINED,
      type: EVENT_TYPE[`SPOT_TRADE${type ? `_${type}` : ""}`],
      details: JSON.stringify({
        EP001: Math.abs(+accountVersion.locked),
        EP002:
          order.type === TYPE.ORDER_ASK
            ? +order.price * Math.abs(+accountVersion.locked)
            : Math.abs(+order.origin_volume),
        EP003: accountVersion.created_at,
      }),
      occurred_at: this.getTimestamp(new Date(accountVersion.created_at)),
      created_at: this.getTimestamp(new Date()),
      account_version_ids: JSON.stringify([accountVersion.id]),
    };
    return tidebitEvent;
  }

  convertTrade(
    accountVersions: AccountVersion[],
    askOrder: Order,
    bidOrder: Order
  ): TideBitEvent | null {
    if (!askOrder || !bidOrder) {
      // Deprecated: [debug] (20240229 - tzuhan)
      console.error(
        `[convertTrade] askOrder or bidOrder is null, accountVersion.modifiable_id:${accountVersions[0].modifiable_id}, accountVersions`,
        accountVersions
      );
      return null;
    }
    let makerOrder: Order,
      takerOrder: Order,
      currency1: string,
      currency2: string,
      makerAccountVersionSubbed: AccountVersion,
      makerAccountVersionAdded: AccountVersion,
      takerAccountVersionSubbed: AccountVersion,
      takerAccountVersionAdded: AccountVersion;
    if (
      new Date(askOrder.created_at).getTime() >
      new Date(bidOrder.created_at).getTime()
    ) {
      takerOrder = askOrder;
      makerOrder = bidOrder;
    } else {
      takerOrder = bidOrder;
      makerOrder = askOrder;
    }
    if (makerOrder.type === TYPE.ORDER_ASK) {
      currency1 = this.currencyMap[makerOrder.ask].code.toUpperCase();
      currency2 = this.currencyMap[makerOrder.bid].code.toUpperCase();
    } else {
      currency1 = this.currencyMap[makerOrder.bid].code.toUpperCase();
      currency2 = this.currencyMap[makerOrder.ask].code.toUpperCase();
    }
    makerAccountVersionAdded = accountVersions.find((accountVersion) =>
      accountVersion.reason === REASON.STRIKE_ADD &&
      accountVersion.member_id === makerOrder.member_id &&
      makerOrder.type === TYPE.ORDER_ASK
        ? accountVersion.currency === makerOrder.bid
        : accountVersion.currency === makerOrder.ask
    );
    makerAccountVersionSubbed = accountVersions.find((accountVersion) =>
      accountVersion.reason === REASON.STRIKE_SUB &&
      accountVersion.member_id === makerOrder.member_id &&
      makerOrder.type === TYPE.ORDER_ASK
        ? accountVersion.currency === makerOrder.ask
        : accountVersion.currency === makerOrder.bid
    );
    takerAccountVersionAdded = accountVersions.find((accountVersion) =>
      accountVersion.reason === REASON.STRIKE_ADD &&
      accountVersion.member_id === takerOrder.member_id &&
      takerOrder.type === TYPE.ORDER_ASK
        ? accountVersion.currency === takerOrder.bid
        : accountVersion.currency === takerOrder.ask
    );
    takerAccountVersionSubbed = accountVersions.find((accountVersion) =>
      accountVersion.reason === REASON.STRIKE_SUB &&
      accountVersion.member_id === takerOrder.member_id &&
      takerOrder.type === TYPE.ORDER_ASK
        ? accountVersion.currency === takerOrder.ask
        : accountVersion.currency === takerOrder.bid
    );
    if (
      !makerAccountVersionAdded ||
      !makerAccountVersionSubbed ||
      !takerAccountVersionAdded ||
      !takerAccountVersionSubbed
    ) {
      // Deprecated: [debug] (20240229 - tzuhan)
      console.error(
        `[convertTrade], makerAccountVersionAdded or makerAccountVersionSubbed or takerAccountVersionAdded or takerAccountVersionSubbed is null, accountVersion.modifiable_id:${accountVersions[0].modifiable_id}, accountVersions`,
        accountVersions
      );
      return null;
    }
    const tidebitEventCode =
      EVENT_CODE.SPOT_TRADE_MATCH[`${currency1}_${currency2}`];
    const tidebitEvent: TideBitEvent = {
      event_code: tidebitEventCode ?? EVENT_CODE.UNDEFINED,
      type: EVENT_TYPE.SPOT_TRADE_MATCH,
      details: JSON.stringify({
        EP001: Math.abs(+makerAccountVersionSubbed.locked), // 0.101 BTC (maker)
        EP002: Math.abs(+makerAccountVersionAdded.balance), // 2750 USDT (maker)
        EP003: Math.abs(+takerAccountVersionSubbed.locked), // 2800 USDT (taker)
        EP004: Math.abs(+takerAccountVersionAdded.balance), // 0.1 BTC (taker)
        EP005: 0, //TODO: 交易時匯率 1 USDT = 1.01 USD (20240129 - tzuhan)
        EP006: 0, //TODO: 交易時匯率 1 BTC = 25000 USD (20240129 - tzuhan)
        EP007: Math.abs(+takerAccountVersionAdded.fee), // 內扣手續費 0.001 BTC (taker)
        EP008: 0, // 外扣手續費 10 USDT (taker)
        EP009: Math.abs(+makerAccountVersionAdded.fee), // 內扣手續費 20 USDT (maker)
        EP010: 0, // 外扣手續費 0.002 BTC (maker)
      }),
      occurred_at: this.getTimestamp(
        new Date(makerAccountVersionAdded.created_at)
      ),
      created_at: this.getTimestamp(new Date()),
      account_version_ids: JSON.stringify([
        makerAccountVersionAdded.id,
        makerAccountVersionSubbed.id,
        takerAccountVersionAdded.id,
        takerAccountVersionSubbed.id,
      ]),
    };
    return tidebitEvent;
  }

  convertOrderFullfilled(
    accountVersion: AccountVersion,
    order: Order
  ): TideBitEvent {
    let currency1: string, currency2: string;
    if (order.type === TYPE.ORDER_ASK) {
      currency1 = this.currencyMap[order.ask].code.toUpperCase();
      currency2 = this.currencyMap[order.bid].code.toUpperCase();
    } else {
      currency1 = this.currencyMap[order.bid].code.toUpperCase();
      currency2 = this.currencyMap[order.ask].code.toUpperCase();
    }
    const tidebitEventCode =
      EVENT_CODE.SPOT_TRADE_FULLFILL[`${currency1}_${currency2}`];
    const tidebitEvent = {
      event_code: tidebitEventCode ?? EVENT_CODE.UNDEFINED,
      type: EVENT_TYPE.SPOT_TRADE_FULLFILL,
      details: JSON.stringify({
        EP001: Math.abs(+accountVersion.balance),
        EP002: accountVersion.created_at,
      }),
      occurred_at: this.getTimestamp(new Date(accountVersion.created_at)),
      created_at: this.getTimestamp(new Date()),
      account_version_ids: JSON.stringify([accountVersion.id]),
    };
    return tidebitEvent;
  }
}
