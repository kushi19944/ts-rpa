import * as path from "path";
import * as fs from "fs";
import * as parse from "csv-parse";
import * as stringify from "csv-stringify";
import Logger from "./Logger";

export class CSV {
  private static outDir: string = process.env.WORKSPACE_DIR || "./";

  private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

  public static async read(params: { filename: string }): Promise<any[]> {
    const filePath = path.join(this.outDir, params.filename);
    Logger.debug("CSV.read", params);
    return new Promise(
      (resolve): void => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(parse())
          .on("data", data => results.push(data))
          .on("end", () => {
            resolve(results);
          });
      }
    );
  }

  public static async write(params: {
    filename: string;
    data: any[][];
  }): Promise<any[]> {
    const filePath = path.join(this.outDir, params.filename);
    Logger.debug("CSV.write", params);
    return new Promise(
      (resolve): void => {
        const writableStream = fs.createWriteStream(filePath, {
          encoding: "utf-8"
        });
        const stringifier = stringify();
        stringifier.pipe(writableStream);
        stringifier.write(params.data);
      }
    );
  }
}

export default CSV;
