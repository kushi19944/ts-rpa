import WebBrowserInst from "./WebBrowser";

import Logger from "./Logger";

export const WebBrowser = WebBrowserInst;
export { Until, By, Key } from "./WebBrowser";
export const logger = Logger;
export { systemLogger } from "./Logger";

export * from "./google";

export * from "./CSV";

export * from "./Zip";

export const sleep = (msec: number): Promise<void> =>
  new Promise(
    (resolve): void => {
      setTimeout((): void => {
        resolve();
      }, msec);
    }
  );
