export interface User {
  id?: string;
  name?: string;
  email?: string;
  entityId?: string;
  token?: string;
  sub?: string;
  exp: number;
  token_type?: string;
}
