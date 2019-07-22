import * as GCPBigQuery from "./BigQuery";

export namespace RPA {
  export namespace GCP {
    export const BigQuery = GCPBigQuery.default.instance;
  }
}

export default RPA.GCP;
