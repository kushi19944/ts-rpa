import * as path from "path";
import * as fs from "fs";
import Logger from "./Logger";

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
}

export default File;
