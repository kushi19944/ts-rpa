import { gmail_v1 as gmailApi, google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import { Options as MailOptions } from "nodemailer/lib/mailer";
import Logger from "../Logger";

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

      /**
       * Gets the current user's Gmail profile.
       * @param params
       */
      public async getProfile(
        params: gmailApi.Params$Resource$Users$Getprofile
      ): Promise<gmailApi.Schema$Profile> {
        const profile = await this.api.users.getProfile(params);
        Logger.debug("Gmail.getProfile");
        return profile.data;
      }

      /**
       * Sends the specified message from current user.
       * @param params
       */
      public async send(params: MailOptions): Promise<string> {
        Logger.debug("Gmail.send", params);
        const message = await Gmail.buildMessage(params);
        const res = await this.api.users.messages.send({
          userId: "me",
          requestBody: { raw: message }
        });
        return res.data.id;
      }

      /**
       * Creates a new draft.
       * @param params
       */
      public async createDraft(params: MailOptions): Promise<string> {
        Logger.debug("Gmail.createDraft", params);
        const message = await Gmail.buildMessage(params);
        const res = await this.api.users.drafts.create({
          userId: "me",
          requestBody: {
            message: { raw: message }
          }
        });
        return res.data.id;
      }

      /**
       * Sends the specified, existing draft.
       * @param params
       */
      public async sendDraft(params: {
        /** The ID of the draft to send. */
        id: string;
      }): Promise<string> {
        Logger.debug("Gmail.sendDraft", params);
        const res = await this.api.users.drafts.send({
          userId: "me",
          requestBody: { id: params.id }
        });
        return res.data.id;
      }

      /**
       * Immediately and permanently deletes the specified draft. Does not simply trash it.
       * @param params
       */
      public async deleteDraft(params: {
        /** The ID of the draft to delete. */
        id: string;
      }): Promise<void> {
        Logger.debug("Gmail.deleteDraft", params);
        await this.api.users.drafts.delete({
          userId: "me",
          id: params.id
        });
      }

      private static async buildMessage(params: MailOptions): Promise<string> {
        return new Promise((resolve, reject): void => {
          new MailComposer(params).compile().build((err, message): void => {
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
          });
        });
      }
    }
  }
}

export default RPA.Google.Gmail;
