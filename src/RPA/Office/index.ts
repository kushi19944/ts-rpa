import * as OfficeExcel from "./Excel";

export namespace RPA {
  export namespace Office {
    export const Excel = OfficeExcel.default.instance;
  }
}

export default RPA.Office;
