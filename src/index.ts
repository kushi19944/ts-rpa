import WebBrowserInst from "./WebBrowser";

import Logger from "./Logger";

export const WebBrowser = WebBrowserInst;
export { Until, By, Key } from "./WebBrowser";
export const logger = Logger;
export { systemLogger } from "./Logger";

export * from "./google";

export * from "./CSV";

export * from "./Zip";

export * from "./File";

export const sleep = (msec: number): Promise<void> =>
  new Promise(
    (resolve): void => {
      setTimeout((): void => {
        resolve();
      }, msec);
    }
  );

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
