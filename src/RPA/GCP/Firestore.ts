import { Firestore as Client } from "@google-cloud/firestore";
import Logger from "../Logger";

export namespace RPA {
  export namespace GCP {
    export class Firestore {
      private static firestore: Firestore;

      public db: Client;

      private constructor() {
        this.db = new Client();
      }

      public static get instance(): Firestore {
        if (!this.firestore) {
          this.firestore = new Firestore();
        }
        return this.firestore;
      }
    }
  }
}

export default RPA.GCP.Firestore;
