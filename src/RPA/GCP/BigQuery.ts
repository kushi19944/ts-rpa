import {
  BigQuery as Client,
  Query,
  QueryOptions,
  SimpleQueryRowsResponse
} from "@google-cloud/bigquery";
import Logger from "../Logger";

export namespace RPA {
  export namespace GCP {
    export class BigQuery {
      private static bigQuery: BigQuery;

      private client: Client;

      private constructor() {
        this.client = new Client();
      }

      public static get instance(): BigQuery {
        if (!this.bigQuery) {
          this.bigQuery = new BigQuery();
        }
        return this.bigQuery;
      }

      public async query(
        query: Query,
        options?: QueryOptions
      ): Promise<SimpleQueryRowsResponse> {
        Logger.debug("BigQuery.query", query, options);
        return this.client.query(query, options);
      }
    }
  }
}

export default RPA.GCP.BigQuery;
