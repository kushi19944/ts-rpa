import * as readline from "readline";

export namespace RPA {
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
