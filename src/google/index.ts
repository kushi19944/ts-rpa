/* eslint-disable import/prefer-default-export */
import Auth from "./Auth";
import Spreadsheet from "./Spreadsheet";
import Drive from "./Drive";

export class Google {
  public static authorize = Auth.instance.authorize;

  public static Spreadsheet = Spreadsheet.instance;

  public static Drive = Drive.instance;
}
