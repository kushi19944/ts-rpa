import * as path from "path";
import * as fs from "fs";
import * as isUtf8 from "is-utf8";
import Logger from "./Logger";

export namespace RPA {
  export class File {
    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    private static outDir: string = process.env.WORKSPACE_DIR || "./";

    public static rename(params: { old: string; new: string }): void {
      Logger.debug("File.rename", params);
      const oldPath = path.join(this.outDir, params.old);
      const newPath = path.join(this.outDir, params.new);
      return fs.renameSync(oldPath, newPath);
    }

    public static delete(params: { filename: string }): void {
      Logger.debug("File.delete", params);
      return fs.unlinkSync(path.join(this.outDir, params.filename));
    }

    public static rimraf(params: { dirPath: string }): void {
      Logger.debug("File.rimraf", params);
      if (fs.existsSync(params.dirPath)) {
        fs.readdirSync(params.dirPath).forEach(
          (entry): void => {
            const entryPath = path.join(params.dirPath, entry);
            if (fs.lstatSync(entryPath).isDirectory()) {
              this.rimraf({ dirPath: entryPath });
            } else {
              fs.unlinkSync(entryPath);
            }
          }
        );
        fs.rmdirSync(params.dirPath);
      }
    }

    public static write(params: { filename: string; data: any }): void {
      Logger.debug("File.write", params.filename);
      fs.writeFileSync(path.join(this.outDir, params.filename), params.data);
    }

    public static makeDir(params: { dirname: string }): void {
      Logger.debug("File.makeDir", params);
      return fs.mkdirSync(path.join(this.outDir, params.dirname));
    }

    public static exists(params: { filename: string }): boolean {
      Logger.debug("File.exists", params);
      return fs.existsSync(path.join(this.outDir, params.filename));
    }

    public static addBom(params: { filename: string }): Promise<void> {
      Logger.debug("File.addBom", params);
      return new Promise<void>(
        (resolve, reject): void => {
          fs.readFile(
            path.join(this.outDir, params.filename),
            (readError, buf): void => {
              if (readError) reject(readError);
              if (!Buffer.isBuffer(buf)) reject(new Error("Got no buffer"));
              if (!isUtf8(buf))
                reject(new Error("File is not in UTF-8 encoding"));
              if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf)
                resolve();
              fs.writeFile(
                path.join(this.outDir, params.filename),
                `\ufeff${buf}`,
                (writeError): void => {
                  if (writeError) reject(writeError);
                  else resolve();
                }
              );
            }
          );
        }
      );
    }
  }
}

export default RPA.File;
