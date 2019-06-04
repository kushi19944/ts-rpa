import * as readline from "readline";

import * as WebBrowserModule from "./WebBrowser";

import * as LoggerModule from "./Logger";

import GoogleModule from "./Google";

import SlackModule from "./Slack";

import ChatworkModule from "./Chatwork";

import FileModule from "./File";

import CSVModule from "./CSV";

import HashModule from "./Hash";

import ZipModule from "./Zip";

export namespace RPA {
  export const Google = GoogleModule;

  export const Slack = SlackModule;

  export const Chatwork = ChatworkModule;

  export const File = FileModule;

  export const CSV = CSVModule;

  export const Hash = HashModule;

  export const Zip = ZipModule;

  export const WebBrowser = WebBrowserModule.default;

  export const Logger = LoggerModule.default;

  export const SystemLogger = LoggerModule.system;

  export const sleep = (msec: number): Promise<void> =>
    new Promise(
      (resolve): void => {
        setTimeout((): void => {
          resolve();
        }, msec);
      }
    );

  export const prompt = (question: string): Promise<string> => {
    const stdio = readline.createInterface(process.stdin, process.stdout);
    return new Promise(
      (resolve): void => {
        stdio.question(
          question,
          (answer): void => {
            stdio.close();
            resolve(answer);
          }
        );
      }
    );
  };

  export const retry = <T>(
    asyncFunc: () => Promise<T>,
    retryCount = 3
  ): Promise<T> => {
    const uniqueObj = {};
    const nums = Array.from(Array(retryCount));
    return nums.reduce(
      (prm, _, i): any =>
        prm.catch(
          (err): Promise<T> =>
            err !== uniqueObj
              ? Promise.reject(err)
              : asyncFunc().catch(
                  (): Promise<never> =>
                    sleep(i * 1000).then(
                      (): Promise<never> => Promise.reject(uniqueObj)
                    )
                )
        ),
      Promise.reject(uniqueObj)
    );
  };
}

export default RPA;
