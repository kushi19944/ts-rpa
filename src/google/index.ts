/* eslint-disable import/prefer-default-export */
import Auth from "./Auth";
import Spreadsheet from "./Spreadsheet";

export class Google {
  public static authorize = Auth.instance.authorize;

  public static Spreadsheet = Spreadsheet.instance;
}
