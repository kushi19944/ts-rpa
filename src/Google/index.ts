import GoogleAuth from "./Auth";
import GoogleSpreadsheet from "./Spreadsheet";
import GoogleDrive from "./Drive";

export namespace RPA {
  export namespace Google {
    export const { authorize } = GoogleAuth.instance;
    export const Spreadsheet = GoogleSpreadsheet.instance;
    export const Drive = GoogleDrive.instance;
  }
}

export default RPA.Google;
