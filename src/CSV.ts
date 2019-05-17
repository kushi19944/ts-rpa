import * as path from "path";
import * as fs from "fs";
import * as parse from "csv-parse";
import * as writer from "csv-writer";
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
          .on("data", (data): number => results.push(data))
          .on(
            "end",
            (): void => {
              resolve(results);
            }
          );
      }
    );
  }

  public static async write(params: {
    filename: string;
    data: any[][];
  }): Promise<void> {
    const filePath = path.join(this.outDir, params.filename);
    Logger.debug("CSV.write", params);
    const createCsvWriter = writer.createArrayCsvWriter;
    const csvWriter = createCsvWriter({ path: filePath });
    return csvWriter.writeRecords(params.data);
  }
}

export default CSV;
