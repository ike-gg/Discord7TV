import OAuth from "discord-oauth2";

declare global {
  namespace Express {
    export interface Request {
      user?: OAuth.User;
    }
  }
}
