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
