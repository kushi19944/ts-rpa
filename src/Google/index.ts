import GoogleAuth from "./Auth";
import * as GoogleSpreadsheet from "./Spreadsheet";
import * as GoogleDrive from "./Drive";
import * as GoogleGmail from "./Gmail";

export namespace RPA {
  export namespace Google {
    export const { authorize } = GoogleAuth.instance;
    export const Spreadsheet = GoogleSpreadsheet.default.instance;
    export const Drive = GoogleDrive.default.instance;
    export const Gmail = GoogleGmail.default.instance;
  }
}

export default RPA.Google;
