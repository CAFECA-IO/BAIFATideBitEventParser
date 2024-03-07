import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";
import { IResponse } from "./interfaces/i_response";
import { Code, Reason } from "./type/t_code";
import { CommonService } from "./common/common.service";

@Controller("api/v1")
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly commonService: CommonService
  ) {}

  @Get("/events")
  async listEvents(
    @Query()
    query?: {
      begin?: number;
      end?: number;
      beginId?: number;
      endId?: number;
      limit: number;
    }
  ): Promise<IResponse> {
    let response: IResponse;
    try {
      const events = await this.appService.listEvents(query);
      response = this.commonService.createResponse(
        Code.SUCCESS,
        Reason[Code.SUCCESS],
        events
      );
    } catch (error) {
      console.log(error);
      response = this.commonService.createResponse(
        Code.INTERNAL_SERVER_ERROR,
        Reason[Code.INTERNAL_SERVER_ERROR],
        null
      );
    }
    return response;
  }
}
