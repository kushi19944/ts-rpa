import * as readline from "readline";

import * as WebBrowserModule from "./RPA/WebBrowser";

import * as LoggerModule from "./RPA/Logger";

import GoogleModule from "./RPA/Google";

import GCPModule from "./RPA/GCP";

import SlackModule from "./RPA/Slack";

import ChatworkModule from "./RPA/Chatwork";

import FileModule from "./RPA/File";

import CSVModule from "./RPA/CSV";

import HashModule from "./RPA/Hash";

import ZipModule from "./RPA/Zip";

import RequestModule from "./RPA/Request";
import StringModule from "./RPA/String";

export namespace RPA {
  export const Google = GoogleModule;

  export const GCP = GCPModule;

  export const Slack = SlackModule;

  export const Chatwork = ChatworkModule;

  export const File = FileModule;

  export const CSV = CSVModule;

  export const Hash = HashModule;

  export const Zip = ZipModule;

  export const Request = RequestModule;

  export const String = StringModule;

  export const WebBrowser = WebBrowserModule.default;

  export const Logger = LoggerModule.default;

  export const SystemLogger = LoggerModule.system;

  export const sleep = (msec: number): Promise<void> =>
    new Promise((resolve): void => {
      setTimeout((): void => {
        resolve();
      }, msec);
    });

  export const prompt = (question: string): Promise<string> => {
    const stdio = readline.createInterface(process.stdin, process.stdout);
    return new Promise((resolve): void => {
      stdio.question(question, (answer): void => {
        stdio.close();
        resolve(answer);
      });
    });
  };

  /**
   * Executes up to `retryCount` times until `asyncFunc` resolves
   */
  export const retry = <T>(
    asyncFunc: () => Promise<T>,
    retryCount = 3
  ): Promise<T> => {
    const nums = Array.from(Array(retryCount));
    return nums.reduce((prm, _, i): Promise<T> => {
      return prm.catch((): Promise<T> => sleep(i * 1000).then(asyncFunc));
    }, Promise.reject());
  };
}

export default RPA;
