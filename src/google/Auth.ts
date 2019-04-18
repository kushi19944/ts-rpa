import * as fs from "fs";
import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import * as readline from "readline";
import Logger from "../Logger";

const TOKEN_DIR = "./";
const TOKEN_PATH = TOKEN_DIR + "google-auth-token";
const SCOPES = "https://www.googleapis.com/auth/drive";

export class Auth {
    public client: OAuth2Client;

    constructor() {
        this.authenticate();
    }

    public async authenticate() {
        return await this.authorize({
            clientId: "*****",
            clientSecret: "*****",
            redirectUrl: "http://localhost/"
        });
    }

    private async authorize(credentials) {
        return await this.getToken(credentials);
    }

    private getNewToken(oauth2Client) {
        return new Promise((resolve, reject) => {
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: SCOPES
            });
            // console.log("Authorize this app by visiting this url: \n ", authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question("\n\nEnter the code from that page here: ", code => {
                rl.close();
                oauth2Client.getToken(code, (err, token) => {
                    if (err) {
                        reject(err);
                    }
                    oauth2Client.credentials = token;
                    this.storeToken(token);
                    resolve(oauth2Client);
                });
            });
        });
    }

    private getToken(credentials) {
        const oauth2Client = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.redirectUrl
        );

        return new Promise((resolve, reject) => {
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) {
                    this.getNewToken(oauth2Client).then(
                        oauth2ClientNew => {
                            resolve(oauth2ClientNew);
                        },
                        error => {
                            reject(error);
                        }
                    );
                } else {
                    oauth2Client.credentials = JSON.parse(token.toString());
                    resolve(oauth2Client);
                }
            });
        });
    }

    private storeToken(token) {
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
