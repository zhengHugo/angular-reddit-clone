export interface LoginResponsePayload {
  authenticationToken: string;
  refreshToken: string;
  expireAt: Date;
  username: string;
}
