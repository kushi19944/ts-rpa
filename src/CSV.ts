import * as path from "path";
import * as fs from "fs";
import * as parse from "csv-parse";
import * as writer from "csv-writer";
import Logger from "./Logger";

export class CSV {
  private static outDir: string = process.env.WORKSPACE_DIR || "./";

  private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

  public static async read(params: {
    filename: string;
    encoding?: string;
    bom?: boolean;
    delimiter?: string;
    quote?: string & { length: 1 };
  }): Promise<any[]> {
    const filePath = path.join(this.outDir, params.filename);
    Logger.debug("CSV.read", params);
    return new Promise(
      (resolve, reject): void => {
        const results = [];
        fs.createReadStream(filePath, { encoding: params.encoding })
          .pipe(
            parse({
              bom: params.bom,
              delimiter: params.delimiter,
              quote: params.quote
            })
          )
          .on("data", (data): number => results.push(data))
          .on("error", (error): void => reject(error))
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
    Logger.debug("CSV.write", { filename: params.filename });
    const createCsvWriter = writer.createArrayCsvWriter;
    const csvWriter = createCsvWriter({ path: filePath });
    return csvWriter.writeRecords(params.data);
  }
}

export default CSV;
