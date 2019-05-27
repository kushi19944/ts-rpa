import {
  Builder,
  By,
  Capabilities,
  Condition,
  ThenableWebDriver,
  WebElement
} from "selenium-webdriver";
import { Command } from "selenium-webdriver/lib/command";

import * as fs from "fs";
import Logger from "./Logger";

export { until as Until, By, Key } from "selenium-webdriver";

export class WebBrowser {
  public driver: ThenableWebDriver;

  private capabilities: Capabilities;

  private static headless: boolean =
    (process.env.WEB_BROWSER_HEADLESS || "true") === "true";

  private static outDir: string = process.env.WORKSPACE_DIR || "./";

  public constructor() {
    this.capabilities = Capabilities.chrome();
    const args = [
      "--no-sandbox",
      "--disable-gpu",
      "--window-size=1980,1200",
      `--user-data-dir=${WebBrowser.outDir}/user-data`
    ];
    if (WebBrowser.headless) {
      args.push("--headless");
    }
    const prefs = {
      "download.default_directory": WebBrowser.outDir,
      "download.prompt_for_download": false
    };
    this.capabilities.set("chromeOptions", { args, prefs });
    this.driver = new Builder().withCapabilities(this.capabilities).build();
    this.enableDownloadInHeadlessChrome();
  }

  public get(url: string): Promise<void> {
    Logger.debug(`WebBrowser.get(${url})`);
    return this.driver.get(url);
  }

  public quit(): Promise<void> {
    Logger.debug("WebBrowser.quit");
    return this.driver.quit();
  }

  public wait<T>(
    condition: Condition<T> | PromiseLike<T>,
    optTimeout?: number
  ): Promise<T> {
    Logger.debug(`WebBrowser.wait(${condition}, ${optTimeout})`);
    return this.driver.wait(condition, optTimeout);
  }

  public async mouseMove(
    element: Promise<WebElement> | WebElement
  ): Promise<void> {
    Logger.debug(`WebBrowser.mouseMove(${element})`);
    const actions = this.driver.actions({ bridge: true });
    const mouse = actions.mouse();
    actions.pause(mouse).move({ origin: await element });
    return actions.perform();
  }

  public async mouseClick(
    element: Promise<WebElement> | WebElement
  ): Promise<void> {
    Logger.debug(`WebBrowser.mouseClick(${element})`);
    const actions = this.driver.actions({ bridge: true });
    const mouse = actions.mouse();
    actions
      .pause(mouse)
      .move({ origin: await element })
      .press()
      .release();
    return actions.perform();
  }

  /* eslint-disable class-methods-use-this */
  public async sendKeys(
    element: Promise<WebElement> | WebElement,
    [args]: (string | number | Promise<string | number>)[]
  ): Promise<void> {
    Logger.debug(`WebBrowser.sendKeys(${element})`);
    return (await element).sendKeys(args);
  }
  /* eslint-enable class-methods-use-this */

  public findElement(selector: string): Promise<WebElement> {
    Logger.debug(`WebBrowser.findElement(${selector})`);
    return this.driver.findElement(By.css(selector));
  }

  public findElements(selector: string): Promise<WebElement[]> {
    Logger.debug(`WebBrowser.findElement(${selector})`);
    return this.driver.findElements(By.css(selector));
  }

  public findElementById(id: string): Promise<WebElement> {
    Logger.debug(`WebBrowser.findElementById(${id})`);
    return this.driver.findElement(By.id(id));
  }

  public findElementsById(id: string): Promise<WebElement[]> {
    Logger.debug(`WebBrowser.findElementById(${id})`);
    return this.driver.findElements(By.id(id));
  }

  public findElementByClassName(name: string): Promise<WebElement> {
    Logger.debug(`WebBrowser.findElementByClassName(${name})`);
    return this.driver.findElement(By.className(name));
  }

  public findElementsByClassName(name: string): Promise<WebElement[]> {
    Logger.debug(`WebBrowser.findElementByClassName(${name})`);
    return this.driver.findElements(By.className(name));
  }

  public findElementByCSSSelector(selector: string): Promise<WebElement> {
    Logger.debug(`WebBrowser.findElementByCSSSelector(${selector})`);
    return this.driver.findElement(By.css(selector));
  }

  public findElementsByCSSSelector(selector: string): Promise<WebElement[]> {
    Logger.debug(`WebBrowser.findElementByCSSSelector(${selector})`);
    return this.driver.findElements(By.css(selector));
  }

  public findElementByXPath(xpath: string): Promise<WebElement> {
    Logger.debug(`WebBrowser.findElementByXPath(${xpath})`);
    return this.driver.findElement(By.xpath(xpath));
  }

  public findElementsByXPath(xpath: string): Promise<WebElement[]> {
    Logger.debug(`WebBrowser.findElementByXPath(${xpath})`);
    return this.driver.findElements(By.xpath(xpath));
  }

  public findElementByLinkText(text: string): Promise<WebElement> {
    Logger.debug(`WebBrowser.findElementByLinkText(${text})`);
    return this.driver.findElement(By.linkText(text));
  }

  public async takeScreenshot(): Promise<void> {
    Logger.debug(`WebBrowser.takeScreenshot()`);
    const image = await this.driver.takeScreenshot();
    return fs.writeFile(
      `${WebBrowser.outDir}/${Math.round(new Date().getTime() / 1000)}.png`,
      image,
      "base64",
      (error): void => {
        if (error != null) {
          Logger.error(error);
        }
      }
    );
  }

  /**
   * Enable file downloads in Chrome running in headless mode
   */
  private enableDownloadInHeadlessChrome(): void {
    /* eslint-disable no-underscore-dangle */
    const executor = (this.driver as any).getExecutor
      ? (this.driver as any).getExecutor()
      : (this.driver as any).executor_;
    /* eslint-enable no-underscore-dangle */
    executor.defineCommand(
      "send_command",
      "POST",
      "/session/:sessionId/chromium/send_command"
    );
    const params = {
      cmd: "Page.setDownloadBehavior",
      params: {
        behavior: "allow",
        downloadPath: WebBrowser.outDir
      }
    };
    this.driver.execute(new Command("send_command").setParameters(params));
  }
}

export default new WebBrowser();
