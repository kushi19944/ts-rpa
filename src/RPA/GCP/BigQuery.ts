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

      /**
       * Executes a query to BigQuery.
       * Example:
       * ```ts
       * const sql = `
       *   SELECT * FROM \`bigquery-public-data.ml_datasets.iris\`
       *   WHERE petal_width > @petal_width
       *   LIMIT 10`;
       * const res = await RPA.GCP.BigQuery.query({
       *   query: sql,
       *   params: { petal_width: 1.0 }
       * });
       * ```
       * @param query
       * @param options
       */
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
