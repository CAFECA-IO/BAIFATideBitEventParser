export interface TideBitEvent {
  id?: number;
  event_code: string;
  type: string;
  details: string;
  occurred_at: number; //Info: unix timestamp (seconds) (20240306 - tzuhan)
  created_at: number; //Info: unix timestamp (seconds) (20240306 - tzuhan)
  account_version_ids: string;
}
