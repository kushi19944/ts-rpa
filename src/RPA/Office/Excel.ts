import * as xlsx from "xlsx";
import * as path from "path";
import File from "../File";
import Logger from "../Logger";

export namespace RPA {
  export namespace Office {
    export class Excel {
      private static excel: Excel;

      private workbook: xlsx.WorkBook;

      private static outDir: string = process.env.WORKSPACE_DIR || "./";

      private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

      public static get instance(): Excel {
        if (!this.excel) {
          this.excel = new Excel();
        }
        return this.excel;
      }

      public load(filename: string): void {
        const filePath = path.join(Excel.outDir, filename);
        this.workbook = xlsx.readFile(filePath);
      }

      /**
       * Convert to CSV and export file.
       */
      public exportCSV(params: {
        filename?: string;
        targetSheetName: string;
      }): string {
        Logger.debug("Office.Excel.exportCSV", params);
        let outFilename = `${params.targetSheetName}.csv`;
        if (params.filename) {
          this.load(params.filename);
          outFilename = `${path.parse(params.filename).name}_${
            params.targetSheetName
          }.csv`;
        }
        const sheetName = this.workbook.SheetNames.find(
          (name): boolean => name === params.targetSheetName
        );
        const sheet = this.workbook.Sheets[sheetName];
        const csv = xlsx.utils.sheet_to_csv(sheet);
        File.write({ filename: outFilename, data: csv });
        return outFilename;
      }
    }
  }
}

export default RPA.Office.Excel;
