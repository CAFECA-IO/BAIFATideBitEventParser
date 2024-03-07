export type TCode = "00000000" | "90000000";

export type TCodeConstant = {
  SUCCESS: TCode;
  INTERNAL_SERVER_ERROR: TCode;
};

export type TReason = {
  [key in TCode]: string;
};

export const Code: TCodeConstant = {
  SUCCESS: "00000000",
  INTERNAL_SERVER_ERROR: "90000000",
};

export const Reason: TReason = {
  "00000000": "ERROR_MESSAGE.SUCCESS",
  "90000000": "ERROR_MESSAGE.INTERNAL_SERVER_ERROR",
};
