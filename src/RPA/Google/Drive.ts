import { google, drive_v3 as driveApi } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import * as path from "path";
import * as fs from "fs";
import * as MimeStream from "mime-stream";
import Request from "../Request";
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

      public async listFiles(params: {
        parents?: string[];
      }): Promise<driveApi.Schema$File[]> {
        Logger.debug("Google.Drive.listFiles", params);
        // Build `q` parameter
        // https://developers.google.com/drive/api/v3/search-files
        let query = "";
        if (params.parents) {
          query += `(${params.parents
            .map((parent): string => `"${parent}" in parents`)
            .join(" or ")})`;
        }
        const res = await this.api.files.list({ q: query });
        return res.data.files;
      }

      public async export(params: {
        fileId: string;
        mimeType: string;
        filename: string;
      }) {
        const out = fs.createWriteStream(
          path.join(this.outDir, params.filename)
        );
        const res: any = await this.api.files.export(
          {
            fileId: params.fileId,
            mimeType: params.mimeType
          },
          {
            responseType: "stream"
          }
        );
        return new Promise(async (resolve, reject) => {
          res.data
            .on("end", () => {
              resolve();
            })
            .on("error", (err: Error) => {
              reject(err);
            })
            .pipe(out);
        });
      }

      public async upload(params: {
        filename: string;
        parents?: string[];
      }): Promise<string> {
        const filePath = path.join(this.outDir, params.filename);
        Logger.debug("Google.Drive.upload", filePath, params.parents);
        return new Promise((resolve): void => {
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
        });
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
          await Request.download(
            path.join(this.outDir, outFilename),
            `${res.config.url}?alt=media`,
            { headers: res.config.headers, compress: true }
          );
          return outFilename;
        }
        if (params.url && params.filename) {
          const queryParams = new URL(params.url).searchParams;
          /* eslint-disable no-underscore-dangle */
          await Request.download(
            path.join(this.outDir, outFilename),
            `${params.url}${queryParams ? "&" : "?"}alt=media`,
            {
              headers: {
                Authorization: `Bearer ${
                  (await (this.api.context._options
                    .auth as OAuth2Client).getAccessToken()).token
                }`
              },
              compress: true
            }
          );
          /* eslint-enable no-underscore-dangle */
          return outFilename;
        }
        throw Error("Invalid parameter.");
      }
    }
  }
}

export default RPA.Google.Drive;
