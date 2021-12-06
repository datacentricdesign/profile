export interface User {
  entityId?: string;
  token?: string;
  sub?: string;
  exp: number;
  token_type?: string;
}
