import {
  Builder,
  By,
  Capabilities,
  Condition,
  IWebDriverOptionsCookie,
  ThenableWebDriver,
  WebElement,
  until,
  Key
} from "selenium-webdriver";
import { Command } from "selenium-webdriver/lib/command";

import * as fs from "fs";
import Logger from "./Logger";
import File from "./File";

export namespace RPA {
  export class WebBrowser {
    private static webBrowser: WebBrowser;

    public driver: ThenableWebDriver;

    private capabilities: Capabilities;

    public Until = until;

    public Key = Key;

    public By = By;

    private static headless: boolean =
      (process.env.WEB_BROWSER_HEADLESS || "true") === "true";

    private static mobile: boolean = process.env.WEB_BROWSER_MOBILE === "true";

    private static outDir: string = process.env.WORKSPACE_DIR || "./";

    private static userDataDir: string = `${WebBrowser.outDir}/user-data`;

    public static get instance(): WebBrowser {
      if (!this.webBrowser) {
        this.webBrowser = new WebBrowser();
      }
      return this.webBrowser;
    }

    private constructor() {
      File.rimraf({ dirPath: WebBrowser.userDataDir });
      this.capabilities = Capabilities.chrome();
      const args = [
        "--no-sandbox",
        "--disable-gpu",
        "--window-size=1980,1200",
        "--enable-features=NetworkService,NetworkServiceInProcess", // refs: https://bugs.chromium.org/p/chromedriver/issues/detail?id=2897
        `--user-data-dir=${WebBrowser.userDataDir}`,
        "--disable-dev-shm-usage" // refs: https://stackoverflow.com/questions/50642308/webdriverexception-unknown-error-devtoolsactiveport-file-doesnt-exist-while-t
      ];
      if (WebBrowser.headless) {
        args.push("--headless");
      }
      const prefs = {
        "download.default_directory": WebBrowser.outDir,
        "download.prompt_for_download": false
      };
      let mobileEmulation = {};
      if (WebBrowser.mobile) {
        mobileEmulation = {
          deviceMetrics: { width: 360, height: 640, pixelRatio: 3.0 },
          userAgent:
            "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
        };
      }
      this.capabilities.set("chromeOptions", { args, prefs, mobileEmulation });
      this.driver = new Builder().withCapabilities(this.capabilities).build();
      this.enableDownloadInHeadlessChrome();
    }

    public get(url: string): Promise<void> {
      Logger.debug("WebBrowser.get", { url });
      return this.driver.get(url);
    }

    public quit(): Promise<void> {
      Logger.debug("WebBrowser.quit");
      return this.driver.quit();
    }

    public wait<T>(
      condition: Condition<T> | PromiseLike<T> | Function,
      optTimeout?: number
    ): Promise<T> {
      Logger.debug("WebBrowser.wait", { condition, optTimeout });
      return this.driver.wait(condition, optTimeout);
    }

    public async mouseMove(
      element: Promise<WebElement> | WebElement
    ): Promise<void> {
      Logger.debug("WebBrowser.mouseMove");
      const actions = this.driver.actions({ bridge: true });
      const mouse = actions.mouse();
      actions.pause(mouse).move({ origin: await element });
      return actions.perform();
    }

    public async mouseClick(
      element: Promise<WebElement> | WebElement
    ): Promise<void> {
      Logger.debug("WebBrowser.mouseClick");
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
      Logger.debug("WebBrowser.sendKeys");
      return (await element).sendKeys(args);
    }

    /* eslint-enable class-methods-use-this */

    public findElement(selector: string): Promise<WebElement> {
      Logger.debug("WebBrowser.findElement", { selector });
      return this.driver.findElement(By.css(selector));
    }

    public findElements(selector: string): Promise<WebElement[]> {
      Logger.debug("WebBrowser.findElement", { selector });
      return this.driver.findElements(By.css(selector));
    }

    public findElementById(id: string): Promise<WebElement> {
      Logger.debug("WebBrowser.findElementById", { id });
      return this.driver.findElement(By.id(id));
    }

    public findElementsById(id: string): Promise<WebElement[]> {
      Logger.debug("WebBrowser.findElementById", { id });
      return this.driver.findElements(By.id(id));
    }

    public findElementByClassName(name: string): Promise<WebElement> {
      Logger.debug("WebBrowser.findElementByClassName", { name });
      return this.driver.findElement(By.className(name));
    }

    public findElementsByClassName(name: string): Promise<WebElement[]> {
      Logger.debug("WebBrowser.findElementByClassName", { name });
      return this.driver.findElements(By.className(name));
    }

    public findElementByCSSSelector(selector: string): Promise<WebElement> {
      Logger.debug("WebBrowser.findElementByCSSSelector", { selector });
      return this.driver.findElement(By.css(selector));
    }

    public findElementsByCSSSelector(selector: string): Promise<WebElement[]> {
      Logger.debug("WebBrowser.findElementByCSSSelector", { selector });
      return this.driver.findElements(By.css(selector));
    }

    public findElementByXPath(xpath: string): Promise<WebElement> {
      Logger.debug("WebBrowser.findElementByXPath", { xpath });
      return this.driver.findElement(By.xpath(xpath));
    }

    public findElementsByXPath(xpath: string): Promise<WebElement[]> {
      Logger.debug("WebBrowser.findElementByXPath", { xpath });
      return this.driver.findElements(By.xpath(xpath));
    }

    public findElementByLinkText(text: string): Promise<WebElement> {
      Logger.debug("WebBrowser.findElementByLinkText", { text });
      return this.driver.findElement(By.linkText(text));
    }

    public async takeScreenshot(): Promise<void> {
      Logger.debug("WebBrowser.takeScreenshot");
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

    public getCurrentUrl(): Promise<string> {
      Logger.debug("WebBrowser.getCurrentUrl");
      return this.driver.getCurrentUrl();
    }

    public getCookie(name: string): Promise<IWebDriverOptionsCookie> {
      Logger.debug("WebBrowser.getCookie", { name });
      return this.driver.manage().getCookie(name);
    }

    public getCookies(): Promise<IWebDriverOptionsCookie[]> {
      Logger.debug("WebBrowser.getCookies");
      return this.driver.manage().getCookies();
    }

    /**
     * Scroll to the element
     */
    public async scrollTo(
      params: { selector?: string } | { xpath?: string }
    ): Promise<void> {
      Logger.debug("WebBrowser.scrollTo", params);
      const escape = (s: string): string =>
        s
          .split("")
          .map((c): string => `\\u{${c.codePointAt(0).toString(16)}}`)
          .join("");

      let js: string;
      if ("selector" in params) {
        js = `{
          const target = document.querySelector(\`${escape(params.selector)}\`);
          const x = target.getBoundingClientRect().left + window.pageXOffset - window.innerWidth / 2;
          const y = target.getBoundingClientRect().top + window.pageYOffset - window.innerHeight / 2;
          window.scrollTo(x, y);
        }`;
      }
      if ("xpath" in params) {
        js = `{
          const result = document.evaluate(\`${escape(
            params.xpath
          )}\`, document, null, XPathResult.ANY_TYPE, null);
          const target = result.iterateNext();
          const x = target.getBoundingClientRect().left + window.pageXOffset - window.innerWidth / 2;
          const y = target.getBoundingClientRect().top + window.pageYOffset - window.innerHeight / 2;
          window.scrollTo(x, y);
        }`;
      }
      return this.driver.executeScript(js);
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
}

export default RPA.WebBrowser.instance;
