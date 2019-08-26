import { google, sheets_v4 as sheetsApi } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import Logger from "../Logger";

export namespace RPA {
  export namespace Google {
    export class Spreadsheet {
      private static spreadsheet: Spreadsheet;

      private api: sheetsApi.Sheets;

      private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

      public static get instance(): Spreadsheet {
        if (!this.spreadsheet) {
          this.spreadsheet = new Spreadsheet();
        }
        return this.spreadsheet;
      }

      public initialise(auth: OAuth2Client): void {
        this.api = google.sheets({ version: "v4", auth });
      }

      public async getValues(params: {
        spreadsheetId: string;
        range: string;
      }): Promise<any[][]> {
        const res = await this.api.spreadsheets.values.get({
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
        parseValues?: boolean;
      }): Promise<sheetsApi.Schema$UpdateValuesResponse> {
        const res = await this.api.spreadsheets.values.update(
          {
            spreadsheetId: params.spreadsheetId,
            range: params.range,
            valueInputOption: params.parseValues ? "USER_ENTERED" : "RAW"
          },
          {
            body: JSON.stringify({
              range: params.range,
              majorDimension: "ROWS",
              values: params.values
            })
          }
        );
        Logger.debug(
          "Google.Spreadsheet.setValues",
          params.spreadsheetId,
          params.range
        );
        return res.data;
      }

      public async create(params: { title: string }): Promise<string> {
        const res = await this.api.spreadsheets.create({
          requestBody: { properties: { title: params.title } }
        });
        Logger.debug("Google.Spreadsheet.create", params);
        return res.data.spreadsheetId;
      }

      private async get(params: {
        spreadsheetId: string;
      }): Promise<sheetsApi.Schema$Spreadsheet> {
        const res = await this.api.spreadsheets.get({
          spreadsheetId: params.spreadsheetId
        });
        Logger.debug("Google.Spreadsheet.get", params);
        return res.data;
      }

      public async getTitle(params: {
        spreadsheetId: string;
      }): Promise<string> {
        const data = await this.get({ spreadsheetId: params.spreadsheetId });
        Logger.debug("Google.Spreadsheet.getTitle", params);
        return data.properties.title;
      }

      public async updateTitle(params: {
        spreadsheetId: string;
        title: string;
      }): Promise<string> {
        const res = await this.api.spreadsheets.batchUpdate({
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
        const res = await this.api.spreadsheets.batchUpdate({
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
        const res = await this.api.spreadsheets.batchUpdate({
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
        Logger.debug("Google.Spreadsheet.deleteSheet", params);
        return res.data.replies[0].addSheet.properties.sheetId;
      }

      public async updateSheetTitle(params: {
        spreadsheetId: string;
        sheetId: number;
        title: string;
      }): Promise<string> {
        const res = await this.api.spreadsheets.batchUpdate({
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
        Logger.debug("Google.Spreadsheet.getTitleFromSheetId", params);
        return data.sheets.filter(
          (v): boolean => v.properties.sheetId === params.sheetId
        )[0].properties.title;
      }

      public async copySheet(params: {
        spreadsheetId: string;
        sheetId: number;
        destinationSpreadsheetId: string;
      }): Promise<number> {
        const res = await this.api.spreadsheets.sheets.copyTo({
          spreadsheetId: params.spreadsheetId,
          sheetId: params.sheetId,
          requestBody: {
            destinationSpreadsheetId: params.destinationSpreadsheetId
          }
        });
        Logger.debug("Google.Spreadsheet.copySheet", params);
        return res.data.sheetId;
      }

      public async setCellsFormat(params: {
        spreadsheetId: string;
        range: sheetsApi.Schema$GridRange;
        format: sheetsApi.Schema$CellFormat;
      }): Promise<sheetsApi.Schema$Spreadsheet> {
        const res = await this.api.spreadsheets.batchUpdate({
          spreadsheetId: params.spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: params.range,
                  cell: { userEnteredFormat: params.format },
                  fields: "userEnteredFormat"
                }
              }
            ]
          }
        });
        Logger.debug("Google.Spreadsheet.setCellsFormat", params);
        return res.data.updatedSpreadsheet;
      }

      /**
       * Lists sheet properties in a spreadsheet.
       */
      public async listSheetProperties(params: {
        spreadsheetId: string;
        sheetId?: number;
      }): Promise<sheetsApi.Schema$SheetProperties[]> {
        Logger.debug("Google.Spreadsheet.listSheetProperties", params);
        const data = await this.get({ spreadsheetId: params.spreadsheetId });
        return data.sheets
          .map((sheet): sheetsApi.Schema$SheetProperties => sheet.properties)
          .filter(
            (property): boolean =>
              params.sheetId == null || property.sheetId === params.sheetId
          );
      }

      public async updateSheetProperties(params: {
        spreadsheetId: string;
        properties: sheetsApi.Schema$SheetProperties;
        fields: string;
      }): Promise<void> {
        const res = await this.api.spreadsheets.batchUpdate({
          spreadsheetId: params.spreadsheetId,
          requestBody: {
            requests: [
              {
                updateSheetProperties: {
                  properties: params.properties,
                  fields: params.fields
                }
              }
            ]
          }
        });
        Logger.debug("Google.Spreadsheet.updateSheetProperties", params);
      }

      public async addProtectedRange(params: {
        spreadsheetId: string;
        protectedRange: sheetsApi.Schema$ProtectedRange;
      }): Promise<sheetsApi.Schema$ProtectedRange> {
        const res = await this.api.spreadsheets.batchUpdate({
          spreadsheetId: params.spreadsheetId,
          requestBody: {
            requests: [
              {
                addProtectedRange: {
                  protectedRange: params.protectedRange
                }
              }
            ]
          }
        });
        Logger.debug("Google.Spreadsheet.addProtectedRange", params);
        return res.data.replies[0].addProtectedRange.protectedRange;
      }

      public async deleteProtectedRange(params: {
        spreadsheetId: string;
        protectedRangeId: number;
      }): Promise<void> {
        const res = await this.api.spreadsheets.batchUpdate({
          spreadsheetId: params.spreadsheetId,
          requestBody: {
            requests: [
              {
                deleteProtectedRange: {
                  protectedRangeId: params.protectedRangeId
                }
              }
            ]
          }
        });
        Logger.debug("Google.Spreadsheet.deleteProtectedRange", params);
      }

      /**
       * Lists the protected ranges of a spreadsheet.
       */
      public async listProtectedRanges(params: {
        spreadsheetId: string;
        sheetId?: number;
      }): Promise<sheetsApi.Schema$ProtectedRange[]> {
        Logger.debug("Google.Spreadsheet.listProtectedRanges", params);
        const data = await this.get({ spreadsheetId: params.spreadsheetId });
        const sheets = data.sheets.filter(
          (v): boolean =>
            params.sheetId == null || v.properties.sheetId === params.sheetId
        );
        return (
          sheets
            .map(sheet => sheet.protectedRanges || [])
            // flatten
            .reduce((ret, ranges) => ret.concat(ranges), [])
        );
      }

      /**
       * Deletes specified dimension
       */
      public async deleteDimension(params: {
        spreadsheetId: string;
        range: sheetsApi.Schema$GridRange;
      }): Promise<void> {
        Logger.debug("Google.Spreadsheet.deleteDimension", params);

        // converts Schema$GridRange to Schema$DimensionRange
        const dimensionRanges: sheetsApi.Schema$DimensionRange[] = [];
        if (
          params.range.startColumnIndex != null ||
          params.range.endColumnIndex != null
        ) {
          dimensionRanges.push({
            startIndex: params.range.startColumnIndex,
            endIndex: params.range.endColumnIndex,
            sheetId: params.range.sheetId,
            dimension: "COLUMNS"
          });
        }
        if (
          params.range.startRowIndex != null ||
          params.range.endRowIndex != null
        ) {
          dimensionRanges.push({
            startIndex: params.range.startRowIndex,
            endIndex: params.range.endRowIndex,
            sheetId: params.range.sheetId,
            dimension: "ROWS"
          });
        }

        await Promise.all(
          dimensionRanges.map(
            async (range): Promise<void> => {
              await this.api.spreadsheets.batchUpdate({
                spreadsheetId: params.spreadsheetId,
                requestBody: {
                  requests: [{ deleteDimension: { range } }]
                }
              });
            }
          )
        );
      }

      /**
       * Sorts the specified range using the column of `keyColumnIndex`.
       * The default order is ascending.
       */
      public async sortRange(params: {
        spreadsheetId: string;
        range: sheetsApi.Schema$GridRange;
        keyColumnIndex: number;
        desc?: boolean;
      }): Promise<void> {
        Logger.debug("Google.Spreadsheet.sortRange", params);
        const order = params.desc ? "DESCENDING" : "ASCENDING";
        await this.api.spreadsheets.batchUpdate({
          spreadsheetId: params.spreadsheetId,
          requestBody: {
            requests: [
              {
                sortRange: {
                  range: params.range,
                  sortSpecs: [
                    {
                      dimensionIndex: params.keyColumnIndex,
                      sortOrder: order
                    }
                  ]
                }
              }
            ]
          }
        });
      }

      /**
       * Finds and replaces data in cells over a range or all sheets.
       * You must specify either `range` or `allSheets`.
       */
      public async findReplace(params: {
        spreadsheetId: string;
        range?: sheetsApi.Schema$GridRange;
        allSheets?: boolean;
        /** The value to search. */
        find: string;
        /** The value to use as the replacement. */
        replacement: string;
        /** Set true if the search is case sensitive. */
        matchCase?: boolean;
        /** Set true if the find value should match the entire cell. */
        matchEntireCell?: boolean;
        /** Set true if the find value is a regex. */
        searchByRegex?: boolean;
        /** Set true if the search should include cells with formulas. Set false to skip cells with formulas. */
        includeFormulas?: boolean;
      }): Promise<void> {
        Logger.debug("Google.Spreadsheet.findReplace", params);
        await this.api.spreadsheets.batchUpdate({
          spreadsheetId: params.spreadsheetId,
          requestBody: {
            requests: [
              {
                findReplace: {
                  range: params.range,
                  allSheets: params.allSheets,
                  find: params.find,
                  replacement: params.replacement,
                  matchCase: params.matchCase,
                  matchEntireCell: params.matchEntireCell,
                  searchByRegex: params.searchByRegex,
                  includeFormulas: params.includeFormulas
                }
              }
            ]
          }
        });
      }
    }
  }
}

export default RPA.Google.Spreadsheet;
