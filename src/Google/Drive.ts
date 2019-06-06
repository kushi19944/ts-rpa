import { google, drive_v3 as driveApi } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import * as request from "request";
import { Headers } from "gaxios";
import * as path from "path";
import * as fs from "fs";
import * as MimeStream from "mime-stream";
import Logger from "../Logger";

export namespace RPA {
  export namespace Google {
    export class Drive {
      private static drive: Drive;

      private api: driveApi.Drive;

      private outDir: string = process.env.WORKSPACE_DIR || "./";

      private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

      public static get instance(): Drive {
        if (!this.drive) {
          this.drive = new Drive();
        }
        return this.drive;
      }

      public initialise(auth: OAuth2Client): void {
        this.api = google.drive({ version: "v3", auth });
      }

      public async listFiles(): Promise<driveApi.Schema$File[]> {
        const res = await this.api.files.list({});
        Logger.debug("Google.Drive.listFiles");
        return res.data.files;
      }

      public async upload(params: {
        filename: string;
        parents?: string[];
      }): Promise<string> {
        const filePath = path.join(this.outDir, params.filename);
        Logger.debug("Google.Drive.upload", filePath, params.parents);
        return new Promise(
          (resolve): void => {
            const file = fs.createReadStream(filePath).pipe(
              MimeStream(
                async (type): Promise<void> => {
                  let mimeType = "text/plain";
                  if (type !== null) {
                    mimeType = type.mime;
                  }
                  const res = await this.api.files.create({
                    requestBody: {
                      parents: params.parents,
                      name: params.filename
                    },
                    supportsTeamDrives: true,
                    media: {
                      mimeType,
                      body: file
                    },
                    fields: "id"
                  });
                  resolve(res.data.id);
                }
              )
            );
          }
        );
      }

      public async download(params: {
        fileId?: string;
        filename?: string;
        url?: string;
      }): Promise<string> {
        let outFilename: string;
        if (params.filename) {
          outFilename = params.filename;
        }
        if (params.fileId) {
          Logger.debug(
            "Google.Drive.download",
            params.fileId,
            params.filename,
            params.url
          );
          const res = await this.api.files.get({
            fileId: params.fileId
          });
          if (!params.filename) {
            outFilename = res.data.name;
          }
          await Drive.fetch(
            `${res.config.url}?alt=media`,
            res.config.headers,
            path.join(this.outDir, outFilename)
          );
          return outFilename;
        }
        if (params.url && params.filename) {
          await Drive.fetch(
            `${params.url}?alt=media`,
            this.api.files.context._options.headers, // eslint-disable-line no-underscore-dangle
            path.join(this.outDir, outFilename)
          );
          return outFilename;
        }
        throw Error("Invalid parameter.");
      }

      private static async fetch(
        url: string,
        headers: Headers,
        to: string
      ): Promise<void> {
        const res = await request({ url, headers, gzip: true });
        const out = fs.createWriteStream(to);
        return new Promise(
          (resolve, reject): void => {
            res.pipe(out);
            res.on(
              "end",
              (): void => {
                out.close();
                resolve();
              }
            );
            out.on("error", reject);
          }
        );
      }
    }
  }
}

export default RPA.Google.Drive;
