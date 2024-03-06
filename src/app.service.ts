import "dotenv/config";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { Sequelize } from "sequelize";
import {
  EVENT_TYPE,
  REASON,
  REASON_PAIRS,
  account_versions_keys_str,
  jobs_keys_str,
  orders_keys_str,
  referral_commissions_keys_str,
  trades_keys_str,
} from "./constants/constants";
import { Event } from "./interfaces/i_event";
import { TideBitEvent } from "./interfaces/i_tidebit_event";
import { AccountVersion } from "./interfaces/i_account_version";
import { ReferralCommission } from "./interfaces/i_refferal_commission";
import { Order } from "./interfaces/i_order";
import { Trade } from "./interfaces/i_trade";
import { CommonService } from "./common/common.service";

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly DEFAULT_LIMIT = 100;
  private readonly WAREHOUSE_DATABASE_URL = process.env
    .WAREHOUSE_DATABASE_URL as string;
  private readonly WAREHOUSE_DB = new Sequelize(this.WAREHOUSE_DATABASE_URL, {
    logging: false,
  });

  constructor(private readonly commonService: CommonService) {}

  onApplicationBootstrap() {
    console.log("應用啟動後，所有模組初始化完畢，此時在服務中調用");
    // 在這裡執行初始化後的操作
  }

  async convertDeposit(accountVersion: AccountVersion): Promise<TideBitEvent> {
    try {
      const query = `SELECT ${referral_commissions_keys_str} FROM referral_commissions WHERE state = 'deposited' AND referred_by_member_id = ? AND currency = ? AND amount = ? AND deposited_at <= ? LIMIT 1;`;
      const values = [
        accountVersion.member_id,
        accountVersion.currency,
        accountVersion.balance,
        accountVersion.created_at,
      ];
      const [result, metadata] = await this.WAREHOUSE_DB.query(query, {
        replacements: values,
      });
      const referralCommision = result[0] as ReferralCommission;
      const tidebitEvent = this.commonService.convertDeposit(
        accountVersion,
        referralCommision
      );
      return tidebitEvent;
    } catch (e) {
      console.error(`convertDeposit error: `, e);
      throw e;
    }
  }

  async convertOrder(
    type: string,
    accountVersion: AccountVersion
  ): Promise<TideBitEvent> {
    try {
      let order: Order;
      const [result, metadata] = await this.WAREHOUSE_DB.query(
        `SELECT ${orders_keys_str} FROM orders WHERE id = ${accountVersion.modifiable_id} LIMIT 1;`
      );
      order = result[0] as Order;
      const tidebitEvent = this.commonService.convertOrder(
        type,
        accountVersion,
        order
      );
      return tidebitEvent;
    } catch (e) {
      console.error(`convertOrder error: `, e);
      throw e;
    }
  }

  async convertTrade(
    accountVersions: AccountVersion[]
  ): Promise<TideBitEvent | null> {
    try {
      const [result3, metadata3] = await this.WAREHOUSE_DB.query(
        `SELECT ${trades_keys_str} FROM trades WHERE id = ${accountVersions[0].modifiable_id} LIMIT 1;`
      );
      const trade = result3[0] as Trade;
      const [result4, metadata4] = await this.WAREHOUSE_DB.query(
        `SELECT ${orders_keys_str} FROM orders WHERE id = ${trade.ask_id} LIMIT 1;`
      );
      const askOrder = result4[0] as Order;
      const [result5, metadata5] = await this.WAREHOUSE_DB.query(
        `SELECT ${orders_keys_str} FROM orders WHERE id = ${trade.bid_id} LIMIT 1;`
      );
      const bidOrder = result5[0] as Order;
      const tidebitEvent = this.commonService.convertTrade(
        accountVersions,
        askOrder,
        bidOrder
      );
      return tidebitEvent;
    } catch (e) {
      console.error(`convertTrade error: `, e);
      throw e;
    }
  }

  async convertOrderFullfilled(
    accountVersion: AccountVersion
  ): Promise<TideBitEvent> {
    try {
      let order: Order;
      const [result1, metadata1] = await this.WAREHOUSE_DB.query(
        `SELECT ${trades_keys_str} FROM trades WHERE id = ${accountVersion.modifiable_id} LIMIT 1;`
      );
      const trade = result1[0] as Trade;
      if (accountVersion.member_id === trade.ask_member_id) {
        const [result2, metadata2] = await this.WAREHOUSE_DB.query(
          `SELECT ${orders_keys_str} FROM orders WHERE id = ${trade.ask_id} LIMIT 1;`
        );
        order = result2[0] as Order;
      }
      const tidebitEvent = this.commonService.convertOrderFullfilled(
        accountVersion,
        order
      );
      return tidebitEvent;
    } catch (e) {
      console.error(`convertOrderFullfilled error: `, e);
      throw e;
    }
  }

  async eventParser(
    accountVersion: AccountVersion
  ): Promise<TideBitEvent | null> {
    switch (accountVersion.reason) {
      case REASON.DEPOSIT:
        return this.convertDeposit(accountVersion);
      case REASON.ORDER_SUBMIT:
        return this.convertOrder(null, accountVersion);
      case REASON.ORDER_CANCEL:
        return this.convertOrder("CANCEL", accountVersion);
      case REASON.ORDER_FULLFILLED:
        return this.convertOrderFullfilled(accountVersion);
      default:
        return null;
    }
  }

  async doJob() {
    const t = await this.WAREHOUSE_DB.transaction();
    let tidebitEvent: TideBitEvent, currentEndId: number;
    try {
      let keepGo = false;
      const table_name = "account_versions";
      const count = 1000;

      // step1: read job status from warehouse
      const step1Query = `SELECT ${jobs_keys_str} FROM jobs WHERE table_name = '${table_name}';`;
      const [jobStatus, jobStatusMetadata] = await this.WAREHOUSE_DB.query(
        step1Query
      );
      const jobStartId: number =
        (jobStatus[0] as { parsed_id: number })?.parsed_id || 0;
      console.log(`doJob, jobStartId: ${jobStartId}`, jobStatus);

      // step1.1: check latest id from warehouse
      const [latestIdResults, latestIdMetadata] = await this.WAREHOUSE_DB.query(
        `SELECT MAX(id) as id FROM account_versions;`
      );
      const latestId: number = (latestIdResults[0] as { id: number })?.id || 0;
      console.log(`doJob, latestId: ${latestId}`);
      if (latestId > jobStartId) {
        const startId: number = jobStartId;
        const endId: number = startId + count;

        // step2: read data from source
        const step2Query = `SELECT ${account_versions_keys_str} FROM account_versions WHERE id > ${startId} AND id <= ${endId};`;
        console.log(`doJob step2Query: ${step2Query}`);
        const [results, metadata] = await this.WAREHOUSE_DB.query(step2Query);
        const accountVersions = results as AccountVersion[];
        // step3: convert account version to TideBit event
        const tidebitEvents = [];
        console.log(`doJob results: [${results.length}]`);
        for (const accountVersion of accountVersions) {
          console.log(`doJob accountVersion: `, accountVersion);
          if (accountVersion.modifiable_type === "Trade") {
            const existedTidebitEvent = tidebitEvents?.find(
              (tidebitEvent) =>
                tidebitEvent.type === EVENT_TYPE.SPOT_TRADE_MATCH &&
                JSON.parse(tidebitEvent.account_version_ids).includes(
                  accountVersion.id
                )
            );
            if (existedTidebitEvent) continue;
            const relatedAccountVersions = accountVersions.filter(
              (av) =>
                av.modifiable_id === accountVersion.modifiable_id &&
                av.modifiable_type === "Trade"
            );
            tidebitEvent = await this.convertTrade(relatedAccountVersions);
            if (tidebitEvent) {
              currentEndId = Math.max(
                ...relatedAccountVersions.map((av) => av.id)
              );
              tidebitEvents.push(tidebitEvent);
            } else {
              keepGo = true;
              break;
            }
          } else if (accountVersion.modifiable_type === "Withdraw") {
            const existedTidebitEvent = tidebitEvents?.find(
              (tidebitEvent) =>
                tidebitEvent.type.includes(EVENT_TYPE.WITHDRAW) &&
                JSON.parse(tidebitEvent.account_version_ids).includes(
                  accountVersion.id
                )
            );
            console.log(`doJob existedTidebitEvent: `, existedTidebitEvent);
            if (existedTidebitEvent) continue;
            const match = accountVersions.find(
              (matchAv) =>
                matchAv.reason.toString() ===
                  REASON_PAIRS[accountVersion.reason.toString()] &&
                matchAv.modifiable_id === accountVersion.modifiable_id
            );
            tidebitEvent = this.commonService.withdrawParser([
              accountVersion,
              match,
            ]);
            if (tidebitEvent) {
              currentEndId = Math.max(accountVersion.id, match.id);
              tidebitEvents.push(tidebitEvent);
            } else {
              keepGo = true;
              break;
            }
          } else {
            tidebitEvent = await this.eventParser(
              accountVersion as AccountVersion
            );
            currentEndId = accountVersion.id;
            console.log(`doJob tidebitEvent: `, tidebitEvent);
            if (!!tidebitEvent) tidebitEvents.push(tidebitEvent);
          }
        }
        // step4: write data to warehouse
        if (tidebitEvents.length > 0) {
          const step4Values = tidebitEvents.map((result: TideBitEvent) => {
            return `('${result.event_code}', '${result.type}', '${result.details}', ${result.occurred_at}, ${result.created_at}, '${result.account_version_ids}')`;
          });
          const step4Query = `INSERT INTO accounting_events (event_code, type, details, occurred_at, created_at, account_version_ids) VALUES ${step4Values.join(
            ","
          )};`;
          console.log(`doJob, step4Query: `, step4Query);
          const [step4Results] = await this.WAREHOUSE_DB.query(step4Query, {
            transaction: t,
          });
        }

        // step5: update or insert job status
        keepGo = currentEndId < latestId;
        const unix_timestamp = Math.round(new Date().getTime() / 1000);
        const step5Query = `INSERT INTO jobs (table_name, sync_id, parsed_id, created_at, updated_at) VALUES ('${table_name}', ${
          (jobStatus[0] as { sync_id: number })?.sync_id || 0
        }, ${currentEndId}, ${unix_timestamp}, ${unix_timestamp}) ON CONFLICT(table_name) DO UPDATE SET parsed_id = ${currentEndId}, updated_at = ${unix_timestamp};`;
        console.log(`doJob, step5Query: `, step5Query);
        const [step5Results] = await this.WAREHOUSE_DB.query(step5Query, {
          transaction: t,
        });

        await t.commit(); // Commit the transaction

        // step5: return if continue or not
        const currentCount = results.length;
        const time = new Date().toTimeString().split(" ")[0];
        console.log(
          `parsed ${startId} - ${endId} (${currentCount} records) at ${time}`
        );
      }
      console.log(`doJob, keepGo: ${keepGo}`);
      return keepGo;
    } catch (error) {
      await t.rollback(); // Roll back the transaction in case of error
      console.error(error);
      return false;
    }
  }

  async parser() {
    let keepGo = await this.doJob();
    while (keepGo) {
      await this.commonService.sleep();
      keepGo = await this.doJob();
    }

    this.WAREHOUSE_DB.close();
    await this.commonService.sleep(3600000);
  }

  async listEvents(query: {
    begin?: number;
    end?: number;
    beginId?: number;
    endId?: number;
    limit?: number;
  }): Promise<Event[]> {
    let events: Event[] = [];
    try {
      let { begin, end, beginId, endId, limit } = query;
      let _limit = Math.min(
          Number(limit) || this.DEFAULT_LIMIT,
          this.DEFAULT_LIMIT
        ),
        _beginId: number,
        _endId: number,
        _begin: number,
        _end: number;
      if (beginId && !endId) {
        _beginId = Number(beginId);
        _endId = _beginId + _limit - 1;
      } else if (!beginId && endId) {
        _endId = Number(endId);
        _beginId = _endId - _limit + 1;
      }
      let conditions = [];
      if (_beginId && _endId) {
        conditions.push(`id BETWEEN ${_beginId} AND ${_endId}`);
      } else if (begin) {
        // Assuming 'occurred_at' is in UNIX timestamp format
        _begin = Number(begin);
        conditions.push(`occurred_at >= ${_begin}`);
      } else if (end) {
        _end = Number(end);
        conditions.push(`occurred_at <= ${_end}`);
      }

      const whereClause =
        conditions.length > 0 ? conditions.join(" AND ") : "1=1";
      const queryString = `SELECT * FROM accounting_events WHERE ${whereClause} ORDER BY id LIMIT ${_limit};`;
      const [results, metadata] = await this.WAREHOUSE_DB.query(queryString);
      events = results
        ? results.map((result: any) => ({
            id: result.id,
            occurredAt: result.occurred_at,
            type: result.type,
            amount: result.amount,
            eventCode: result.event_code, // Added 'eventCode' property
            details: result.details,
            occurred_at: result.occurred_at,
            createdAt: result.created_at, // Added 'createdAt' property
          }))
        : [];
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    return events;
  }
}
