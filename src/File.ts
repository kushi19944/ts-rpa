import * as path from "path";
import * as fs from "fs";
import Logger from "./Logger";

class File {
  private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

  private static outDir: string = process.env.WORKSPACE_DIR || "./";

  private static rename(params: { old: string; new: string }) {
    Logger.debug("File.rename", params);
    const oldPath = path.join(this.outDir, params.old);
    const newPath = path.join(this.outDir, params.new);
    return fs.renameSync(oldPath, newPath);
  }

  private static delete(params: { filename: string }) {
    Logger.debug("File.delete", params);
    return fs.unlinkSync(path.join(this.outDir, params.filename));
  }

  private static makeDir(params: { dirname: string }) {
    Logger.debug("File.makeDir", params);
    return fs.mkdirSync(path.join(this.outDir, params.dirname));
  }
}

export default File;
