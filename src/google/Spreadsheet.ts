import { google, sheets_v4 as api } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import Logger from "../Logger";

export default class Spreadsheet {
  private static spreadsheet: Spreadsheet;

  private sheets: api.Sheets;

  private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

  public static get instance(): Spreadsheet {
    if (!this.spreadsheet) {
      this.spreadsheet = new Spreadsheet();
    }
    return this.spreadsheet;
  }

  public initialise(auth: OAuth2Client): void {
    this.sheets = google.sheets({ version: "v4", auth });
  }

  public async getValues(params: {
    spreadsheetId: string;
    range: string;
  }): Promise<any[][]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: params.spreadsheetId,
      range: params.range
    });
    Logger.debug("Google.Spreadsheet.getValues", params);
    return res.data.values;
  }

  public async setValues(params: {
    spreadsheetId: string;
    range: string;
    values: string[][];
  }): Promise<any[][]> {
    const res = await this.sheets.spreadsheets.values.update(
      {
        spreadsheetId: params.spreadsheetId,
        range: params.range,
        valueInputOption: "RAW"
      },
      {
        body: JSON.stringify({
          range: params.range,
          majorDimension: "ROWS",
          values: params.values
        })
      }
    );
    Logger.debug("Google.Spreadsheet.setValues", params);
    return res.data.updatedData.values;
  }

  public async create(params: { title: string }): Promise<string> {
    const res = await this.sheets.spreadsheets.create({
      requestBody: { properties: { title: params.title } }
    });
    Logger.debug("Google.Spreadsheet.create", params);
    return res.data.spreadsheetId;
  }

  private async get(params: {
    spreadsheetId: string;
  }): Promise<api.Schema$Spreadsheet> {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: params.spreadsheetId
    });
    Logger.debug("Google.Spreadsheet.get", params);
    return res.data;
  }

  public async getTitle(params: { spreadsheetId: string }): Promise<string> {
    const data = await this.get({ spreadsheetId: params.spreadsheetId });
    Logger.debug("Google.Spreadsheet.getTitle", params);
    return data.properties.title;
  }

  public async updateTitle(params: {
    spreadsheetId: string;
    title: string;
  }): Promise<string> {
    const res = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSpreadsheetProperties: {
              properties: {
                title: params.title
              },
              fields: "title"
            }
          }
        ]
      }
    });
    Logger.debug("Google.Spreadsheet.updateTitle", params);
    return res.data.updatedSpreadsheet.properties.title;
  }

  public async createSheet(params: {
    spreadsheetId: string;
    title: string;
  }): Promise<number> {
    const res = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: params.title
              }
            }
          }
        ]
      }
    });
    Logger.debug("Google.Spreadsheet.createSheet", params);
    return res.data.replies[0].addSheet.properties.sheetId;
  }

  public async deleteSheet(params: {
    spreadsheetId: string;
    sheetId: number;
  }): Promise<number> {
    const res = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteSheet: {
              sheetId: params.sheetId
            }
          }
        ]
      }
    });
    Logger.debug("Google.Spreadsheet.createSheet", params);
    return res.data.replies[0].addSheet.properties.sheetId;
  }

  public async updateSheetTitle(params: {
    spreadsheetId: string;
    sheetId: number;
    title: string;
  }): Promise<string> {
    const res = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: params.sheetId,
                title: params.title
              },
              fields: "title"
            }
          }
        ]
      }
    });
    Logger.debug("Google.Spreadsheet.updateSheetTitle", params);
    return res.data.updatedSpreadsheet.properties.title;
  }

  public async getSheetIdFromTitle(params: {
    spreadsheetId: string;
    title: string;
  }): Promise<number> {
    const data = await this.get({ spreadsheetId: params.spreadsheetId });
    Logger.debug("Google.Spreadsheet.getSheetIdFromTitle", params);
    return data.sheets.filter(
      (v): boolean => v.properties.title === params.title
    )[0].properties.sheetId;
  }

  public async getTitleFromSheetId(params: {
    spreadsheetId: string;
    sheetId: number;
  }): Promise<string> {
    const data = await this.get({ spreadsheetId: params.spreadsheetId });
    Logger.debug("Google.Spreadsheet.getTitle", params);
    return data.sheets.filter(
      (v): boolean => v.properties.sheetId === params.sheetId
    )[0].properties.title;
  }

  public async copySheet(params: {
    spreadsheetId: string;
    sheetId: number;
    destinationSpreadsheetId: string;
  }): Promise<number> {
    const res = await this.sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: params.spreadsheetId,
      sheetId: params.sheetId,
      requestBody: {
        destinationSpreadsheetId: params.destinationSpreadsheetId
      }
    });
    Logger.debug("Google.Spreadsheet.copySheet", params);
    return res.data.sheetId;
  }
}
