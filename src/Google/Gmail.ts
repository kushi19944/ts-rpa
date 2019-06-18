import { gmail_v1 as gmailApi, google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import { Options as MailOptions } from "nodemailer/lib/mailer";

import MailComposer = require("nodemailer/lib/mail-composer");

export namespace RPA {
  export namespace Google {
    export class Gmail {
      private static gmail: Gmail;

      private api: gmailApi.Gmail;

      private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

      public static get instance(): Gmail {
        if (!this.gmail) {
          this.gmail = new Gmail();
        }
        return this.gmail;
      }

      public initialise(auth: OAuth2Client): void {
        this.api = google.gmail({ version: "v1", auth });
      }

      public async send(params: MailOptions): Promise<string> {
        const message = await Gmail.buildMessage(params);
        const res = await this.api.users.messages.send({
          userId: "me",
          requestBody: { raw: message }
        });
        return res.data.id;
      }

      public async createDraft(params: MailOptions): Promise<string> {
        const message = await Gmail.buildMessage(params);
        const res = await this.api.users.drafts.create({
          userId: "me",
          requestBody: {
            message: { raw: message }
          }
        });
        return res.data.id;
      }

      public async sendDraft(params: { id: string }): Promise<string> {
        const res = await this.api.users.drafts.send({
          userId: "me",
          requestBody: { id: params.id }
        });
        return res.data.id;
      }

      public async deleteDraft(params: { id: string }): Promise<void> {
        await this.api.users.drafts.send({
          userId: "me",
          requestBody: { id: params.id }
        });
      }

      private static async buildMessage(params: MailOptions): Promise<string> {
        return new Promise(
          (resolve, reject): void => {
            new MailComposer(params).compile().build(
              (err, message): void => {
                if (err) {
                  reject(err);
                } else {
                  resolve(
                    // url safe Base64
                    message
                      .toString("base64")
                      .replace(/\+/g, "-")
                      .replace(/\//g, "_")
                  );
                }
              }
            );
          }
        );
      }
    }
  }
}

export default RPA.Google.Gmail;
