import nodeFetch, { RequestInit, Response } from "node-fetch";
import * as FormData from "form-data";
import Logger from "./Logger";

export namespace RPA {
  export class Request {
    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    public static FormData = FormData;

    public static fetch(url: string, init?: RequestInit): Promise<Response> {
      Logger.debug("Request.fetch", url, init);
      return nodeFetch(url, init);
    }
  }
}

export default RPA.Request;
