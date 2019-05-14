import { google } from "googleapis";
import { Credentials } from "google-auth-library";
import { OAuth2Client } from "googleapis-common";

import Spreadsheet from "./Spreadsheet";

interface ClientCredentials {
  clientSecret: string;
  clientId: string;
  redirectUrl: string;
}

export default class Auth {
  private static auth: Auth;

  public client: Promise<OAuth2Client>;

  private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

  public static get instance(): Auth {
    if (!this.auth) {
      this.auth = new Auth();
    }
    return this.auth;
  }

  public async authorize(authCredentials: Credentials): Promise<void> {
    const clientCredentials: ClientCredentials = {
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUrl: "urn:ietf:wg:oauth:2.0:oob"
    };

    this.client = new Promise(
      (resolve): void => {
        const client = new google.auth.OAuth2(
          clientCredentials.clientId,
          clientCredentials.clientSecret,
          clientCredentials.redirectUrl
        );
        client.credentials = authCredentials;
        Spreadsheet.instance.initialise(client);
        resolve(client);
      }
    );
  }
}
