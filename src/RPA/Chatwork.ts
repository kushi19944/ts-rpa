import nodeFetch, { Response } from "node-fetch";
import * as qs from "querystring";
import * as fs from "fs";
import * as path from "path";
import * as FormData from "form-data";
import Logger from "./Logger";
import File from "./File";

// http://developer.chatwork.com/ja/index.html

export namespace RPA {
  export class Chatwork {
    private static chatwork: Chatwork;

    private outDir: string = process.env.WORKSPACE_DIR || "./";

    private apiToken: string;

    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    public static get instance(): Chatwork {
      if (!this.chatwork) {
        this.chatwork = new Chatwork();
      }
      return this.chatwork;
    }

    public initialise(credential: { apiToken: string }): void {
      this.apiToken = credential.apiToken;
    }

    /**
     * Post a message to the chat.
     */
    public async postMessage(params: {
      roomId: string;
      message: string;
    }): Promise<void> {
      Logger.debug("Chatwork.postMessage", params);
      await this.request({
        url: `https://api.chatwork.com/v2/rooms/${params.roomId}/messages`,
        method: "POST",
        data: {
          body: params.message
        }
      });
    }

    /**
     * Post a file to the chat.
     * Note that the maximum file size is 5MB.
     */
    public async postFile(params: {
      roomId: string;
      filename: string;
      message?: string;
    }): Promise<number> {
      Logger.debug("Chatwork.postFile", params);
      if (!File.exists({ filename: params.filename })) {
        throw new Error("File does not exist");
      }

      const form = new FormData();
      form.append(
        "file",
        fs.createReadStream(path.join(this.outDir, params.filename))
      );
      if (params.message) {
        form.append("message", params.message);
      }

      const res = await (await this.request({
        url: `https://api.chatwork.com/v2/rooms/${params.roomId}/files`,
        method: "POST",
        data: form
      })).json();
      if ("file_id" in res) {
        return res.file_id;
      }
      throw new Error(res.toString());
    }

    private async request(params: {
      url: string;
      method: string;
      data: { [key: string]: string } | FormData;
    }): Promise<Response> {
      return nodeFetch(params.url, {
        method: params.method,
        headers: Object.assign(
          { "X-ChatWorkToken": this.apiToken },
          params.data instanceof FormData
            ? params.data.getHeaders()
            : { "Content-Type": "application/x-www-form-urlencoded" }
        ),
        body:
          params.data instanceof FormData
            ? params.data
            : qs.stringify(params.data)
      });
    }
  }
}

export default RPA.Chatwork.instance;
