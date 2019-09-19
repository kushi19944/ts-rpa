import * as path from "path";
import * as fs from "fs";
import * as iconv from "iconv-lite";
import * as parse from "csv-parse";
import * as writer from "csv-writer";
import File from "./File";
import Logger from "./Logger";

export namespace RPA {
  export class CSV {
    private static outDir: string = process.env.WORKSPACE_DIR || "./";

    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    /**
     * Reads a CSV file as string[][].
     * @param params
     */
    public static async read(params: {
      /** The name of the file to read. */
      filename: string;
      /** The encoding of the file */
      encoding?: string;
      /** If true, detects and excludes the byte order mark (BOM) from the CSV input if present. */
      bom?: boolean;
      /** The field delimiter. One or multiple character. Defaults to "," (comma). */
      delimiter?: string;
      /** Optional character surrounding a field; one character only; disabled if null, false or empty; defaults to double quote. */
      quote?: string & { length: 1 };
      /** Discards inconsistent columns count; disabled if null, false or empty; default to false. */
      relaxColumnCount?: boolean;
    }): Promise<any[]> {
      const filePath = path.join(this.outDir, params.filename);
      Logger.debug("CSV.read", params);
      return new Promise((resolve, reject): void => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(iconv.decodeStream(params.encoding || "utf8"))
          .pipe(
            parse({
              bom: params.bom,
              delimiter: params.delimiter,
              quote: params.quote,
              relax_column_count: params.relaxColumnCount // eslint-disable-line @typescript-eslint/camelcase
            })
          )
          .on("data", (data): number => results.push(data))
          .on("error", (error): void => reject(error))
          .on("end", (): void => {
            resolve(results);
          });
      });
    }

    /**
     * Writes data to a CSV file.
     * @param params
     */
    public static async write(params: {
      filename: string;
      data: any[][];
    }): Promise<void> {
      const filePath = path.join(this.outDir, params.filename);
      Logger.debug("CSV.write", { filename: params.filename });
      const createCsvWriter = writer.createArrayCsvWriter;
      const csvWriter = createCsvWriter({ path: filePath });
      await csvWriter.writeRecords(params.data);
      return File.addBom({ filename: params.filename });
    }
  }
}

export default RPA.CSV;
