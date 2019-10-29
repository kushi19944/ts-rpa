import {
  Firestore as Client,
  CollectionReference
} from "@google-cloud/firestore";
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

      /**
       * Gets a `CollectionReference` instance that refers to the collection at
       * the specified path.
       *
       * @param collectionPath A slash-separated path to a collection.
       * @return The `CollectionReference` instance.
       */
      public collection(collectionPath: string): CollectionReference {
        Logger.debug("Firestore.collection", collectionPath);
        return this.db.collection(collectionPath);
      }
    }
  }
}

export default RPA.GCP.Firestore;
