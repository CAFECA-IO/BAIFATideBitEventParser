import { TCode } from "src/type/t_code";
import { Event } from "./i_event";

export interface IResponse {
    powerby: string,
    code: TCode;
    message: string;
    success: boolean;
    data: Event[]
}