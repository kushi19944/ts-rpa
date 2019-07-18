import nodeFetch, { RequestInit, Response } from "node-fetch";
import * as FormData from "form-data";
import * as path from "path";
import * as fs from "fs";
import Logger from "./Logger";

export namespace RPA {
  export class Request {
    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    private static outDir: string = process.env.WORKSPACE_DIR || "./";

    public static FormData = FormData;

    public static fetch(url: string, init?: RequestInit): Promise<Response> {
      Logger.debug("Request.fetch", url, init);
      return nodeFetch(url, init);
    }

    public static async download(
      filename: string,
      url: string,
      init?: RequestInit
    ): Promise<Response> {
      Logger.debug("Request.download", url, init);
      const res = await nodeFetch(url, init);
      const fileStream = fs.createWriteStream(path.join(this.outDir, filename));
      return new Promise((resolve, reject): void => {
        res.body.pipe(fileStream);
        res.body.on("error", (err): void => {
          reject(err);
        });
        fileStream.on("finish", (): void => {
          resolve(res);
        });
      });
    }
  }
}

export default RPA.Request;
