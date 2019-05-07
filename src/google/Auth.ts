import * as fs from "fs";
import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import * as readline from "readline";
import Logger from "../Logger";

const TOKEN_DIR = "./";
const TOKEN_PATH = `${TOKEN_DIR}google-auth-token`;
const SCOPES = "https://www.googleapis.com/auth/drive";

export class Auth {
  public client: OAuth2Client;

  public constructor() {
    this.authenticate();
  }

  public async authenticate() {
    const authorize = await this.authorize({
      clientId: "*****",
      clientSecret: "*****",
      redirectUrl: "http://localhost/"
    });
    return authorize;
  }

  private async authorize(credentials) {
    const token = await this.getToken(credentials);
    return token;
  }

  private getNewToken() {
    return new Promise((resolve, reject) => {
      const authUrl = this.client.generateAuthUrl({
        access_type: "offline", // eslint-disable-line @typescript-eslint/camelcase
        scope: SCOPES
      });
      // console.log("Authorize this app by visiting this url: \n ", authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question("\n\nEnter the code from that page here: ", code => {
        rl.close();
        this.client.getToken(code, (err, token) => {
          if (err) {
            reject(err);
          }
          this.client.credentials = token;
          Auth.storeToken(token);
          resolve(this.client);
        });
      });
    });
  }

  private getToken(credentials) {
    this.client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUrl
    );

    return new Promise((resolve, reject) => {
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          this.getNewToken().then(
            oauth2ClientNew => {
              resolve(oauth2ClientNew);
            },
            error => {
              reject(error);
            }
          );
        } else {
          this.client.credentials = JSON.parse(token.toString());
          resolve(this.client);
        }
      });
    });
  }

  private static storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
      Logger.error(err);
    });
    // console.log("Token stored to " + TOKEN_PATH);
  }
}

export default new Auth();
