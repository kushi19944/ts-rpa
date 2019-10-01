import * as path from "path";
import * as fs from "fs";
import * as fileType from "file-type";
import * as isUtf8 from "is-utf8";
import Logger from "./Logger";

enum SortType {
  Name = "name",
  Birthtime = "birthtime",
  Ctime = "ctime",
  Mtime = "mtime",
  Size = "size"
}

enum OrderBy {
  ASC,
  DESC
}

export namespace RPA {
  export class File {
    public static readonly SortType = SortType;

    public static readonly OrderBy = OrderBy;

    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    public static readonly outDir: string = process.env.WORKSPACE_DIR || "./";

    /**
     * Change the name or location of a file or directory.
     * @param params
     */
    public static rename(params: {
      /** A relative path to a file from {@link outDir}. */
      old: string;
      /** A relative path to a file from {@link outDir}. */
      new: string;
    }): void {
      Logger.debug("File.rename", params);
      const oldPath = path.join(this.outDir, params.old);
      const newPath = path.join(this.outDir, params.new);
      return fs.renameSync(oldPath, newPath);
    }

    /**
     * Delete a name and possibly the file it refers to.
     * @param params
     */
    public static delete(params: {
      /** A relative path to a file from {@link outDir}. */
      filename: string;
    }): void {
      Logger.debug("File.delete", params);
      return fs.unlinkSync(path.join(this.outDir, params.filename));
    }

    /**
     * Delete all files in a directory. Same as `rm -rf <dirPath>`.
     * @param params
     */
    public static rimraf(params: {
      /**
       * A path to a file or directory.
       * Specify an absolute path or a relative path from the current directory.
       */
      dirPath: string;
    }): void {
      Logger.debug("File.rimraf", params);
      if (fs.existsSync(params.dirPath)) {
        fs.readdirSync(params.dirPath).forEach((entry): void => {
          const entryPath = path.join(params.dirPath, entry);
          if (fs.lstatSync(entryPath).isDirectory()) {
            this.rimraf({ dirPath: entryPath });
          } else {
            fs.unlinkSync(entryPath);
          }
        });
        fs.rmdirSync(params.dirPath);
      }
    }

    /**
     * Write data to a file, replacing the file if it already exists.
     * @param params
     */
    public static write(params: {
      /** A relative path to a file from {@link outDir}. */
      filename: string;
      data: any;
    }): void {
      Logger.debug("File.write", params.filename);
      fs.writeFileSync(path.join(this.outDir, params.filename), params.data);
    }

    /**
     * Create a directory.
     * @param params
     */
    public static makeDir(params: {
      /** A relative path to the new directory from {@link outDir}. */
      dirname: string;
    }): void {
      Logger.debug("File.makeDir", params);
      return fs.mkdirSync(path.join(this.outDir, params.dirname));
    }

    /**
     * Tests whether or not the given path exists by checking with the file system.
     * @param params
     */
    public static exists(params: {
      /** A relative path from {@link outDir}. */
      filename: string;
    }): boolean {
      Logger.debug("File.exists", params);
      return fs.existsSync(path.join(this.outDir, params.filename));
    }

    /**
     * Appends "\uFEFF" that is byte order mark (BOM) representing UTF-8 to the beginning of the file.
     * @param params
     */
    public static addBom(params: {
      /** A relative path to a file from {@link outDir}. */
      filename: string;
    }): Promise<void> {
      Logger.debug("File.addBom", params);
      return new Promise<void>((resolve, reject): void => {
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
      });
    }

    /**
     * Guess the MIME type of a file.
     * @param params
     */
    public static getMimeType(params: {
      /** A relative path to a file from {@link outDir}. */
      filename: string;
    }): string {
      const file = fs.readFileSync(path.join(this.outDir, params.filename));
      return fileType(file).mime;
    }

    /**
     * Get file status.
     * @param params
     */
    public static getStats(params: {
      /** A relative path to a file from {@link outDir}. */
      filename: string;
    }): fs.Stats {
      Logger.debug("File.getStats", params);
      return fs.statSync(path.join(this.outDir, params.filename));
    }

    /**
     * Lists files or directories in a directory.
     * @param params
     */
    public static list(params?: {
      /** A relative path to a directory from {@link outDir}. */
      dirname?: string;
      /** If specified, sorts by sortType */
      sortType?: SortType;
      /** Whether the sort order is descending or ascending. The default is ascending. */
      orderBy?: OrderBy;
    }) {
      const dirname = (params && params.dirname) || "./";
      Logger.debug("File.list", { dirname });
      const fileList = fs.readdirSync(path.join(this.outDir, dirname));
      if (params && params.sortType) {
        Logger.debug("File.list->sort", { params });
        if (params.sortType === SortType.Name) {
          fileList.sort(
            new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
              .compare
          );
          if (params.orderBy === OrderBy.DESC) {
            fileList.reverse();
          }
        } else {
          return fileList
            .map(filename => {
              return {
                filename,
                value: this.getStats({ filename })[params.sortType]
              };
            })
            .sort((a, b) =>
              params.orderBy === OrderBy.DESC
                ? b.value - a.value
                : a.value - b.value
            )
            .map(v => v.filename);
        }
      }
      return fileList;
    }

    /**
     * Lists only files in a directory.
     * @param params
     */
    public static listFiles(params?: {
      /** A relative path to a directory from {@link outDir}. */
      dirname?: string;
      /** If specified, sorts by sortType */
      sortType?: SortType;
      /** Whether the sort order is descending or ascending. The default is ascending. */
      orderBy?: OrderBy;
    }): string[] {
      const dirname = (params && params.dirname) || "./";
      Logger.debug("File.listFiles", { dirname });
      return File.list(params).filter((filename): boolean =>
        File.isFile({ filename: path.join(dirname, filename) })
      );
    }

    /**
     * Tests whether the given path is a file.
     * @param params
     */
    public static isFile(params: {
      /** A relative path to a file from {@link outDir}. */
      filename: string;
    }): boolean {
      Logger.debug("File.isFile", params);
      const file = path.resolve(path.join(this.outDir, params.filename));
      return File.exists(params) && fs.lstatSync(file).isFile();
    }
  }
}

export default RPA.File;
