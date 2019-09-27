import * as path from "path";
import * as fs from "fs";
import * as unzipper from "unzipper";
import Logger from "./Logger";

export namespace RPA {
  export class Zip {
    private static outDir: string = process.env.WORKSPACE_DIR || "./";

    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    private static async writeFileSync(file): Promise<string> {
      fs.writeFileSync(path.join(this.outDir, file.path), await file.buffer());
      return file.path;
    }

    /**
     * Decompresses the specified zip file.
     */
    public static async decompress(params: {
      filename: string;
    }): Promise<string[]> {
      const filePath = path.join(this.outDir, params.filename);
      Logger.debug("Zip.decompress", params);
      const directory = await unzipper.Open.file(filePath);
      const results = [];
      for (let i = 0; i < directory.files.length; i += 1) {
        const file = directory.files[i];
        if (file.path.slice(-1) === "/") {
          fs.mkdirSync(path.join(this.outDir, file.path));
        } else {
          results.push(this.writeFileSync(file));
        }
      }
      return Promise.all(results);
    }
  }
}

export default RPA.Zip;
