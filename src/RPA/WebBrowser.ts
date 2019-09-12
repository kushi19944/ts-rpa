import {
  Builder,
  By,
  Capabilities,
  Condition,
  IWebDriverOptionsCookie,
  ThenableWebDriver,
  WebElement,
  until,
  Key,
  Alert
} from "selenium-webdriver";
import { Command } from "selenium-webdriver/lib/command";

import * as fs from "fs";
import util from "../util";
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
      this.capabilities.set("goog:chromeOptions", {
        args,
        prefs,
        mobileEmulation
      });
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
    public async scrollTo(params: {
      selector?: string;
      xpath?: string;
      /** The selector of an element that is set CSS `overflow` property */
      containerSelector?: string;
      /** The XPath of an element that is set CSS `overflow` property */
      containerXpath?: string;
    }): Promise<void> {
      Logger.debug("WebBrowser.scrollTo", params);

      if (params.containerSelector || params.containerXpath) {
        await this.driver.executeScript(
          (
            selector: string,
            xpath: string,
            containerSelector: string,
            containerXpath: string
          ): void => {
            /* eslint-disable no-undef */
            const target = selector
              ? document.querySelector(selector)
              : (document
                  .evaluate(xpath, document, null, XPathResult.ANY_TYPE, null)
                  .iterateNext() as Element);
            const container = containerSelector
              ? document.querySelector(containerSelector)
              : (document
                  .evaluate(
                    containerXpath,
                    document,
                    null,
                    XPathResult.ANY_TYPE,
                    null
                  )
                  .iterateNext() as Element);
            const x =
              target.getBoundingClientRect().left -
              container.getBoundingClientRect().left -
              container.clientWidth / 2;
            const y =
              target.getBoundingClientRect().top -
              container.getBoundingClientRect().top -
              container.clientHeight / 2;
            container.scrollTo(x, y);
            /* eslint-enable no-undef */
          },
          params.selector,
          params.xpath,
          params.containerSelector,
          params.containerXpath
        );
      }

      await this.driver.executeScript(
        (selector: string, xpath: string): void => {
          /* eslint-disable no-undef */
          const target = selector
            ? document.querySelector(selector)
            : (document
                .evaluate(xpath, document, null, XPathResult.ANY_TYPE, null)
                .iterateNext() as Element);
          const x =
            target.getBoundingClientRect().left +
            window.pageXOffset -
            window.innerWidth / 2;
          const y =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            window.innerHeight / 2;
          window.scrollTo(x, y);
          /* eslint-enable no-undef */
        },
        params.selector,
        params.xpath
      );
    }

    /**
     * Retrieve the current window handle.
     */
    public async getWindowHandle(): Promise<string> {
      Logger.debug("WebBrowser.getWindowHandle");
      return this.driver.getWindowHandle();
    }

    /**
     * Retrieve the current list of available window handles.
     */
    public async getAllWindowHandles(): Promise<string[]> {
      Logger.debug("WebBrowser.getAllWindowHandles");
      return this.driver.getAllWindowHandles();
    }

    /**
     * Switch the focus of all future commands to another window.
     */
    public async switchToWindow(windowHandle: string): Promise<void> {
      Logger.debug("WebBrowser.switchToWindow", windowHandle);
      await this.driver.switchTo().window(windowHandle);
    }

    /**
     * Switch the focus of all future commands to another frame.
     * @param {Promise<WebElement>|WebElement|null} frame
     *    A WebElement reference, which correspond to a `frame` or `iframe` DOM element.
     *    If not specified, selects the topmost frame on the page.
     */
    public async switchToFrame(
      frame?: Promise<WebElement> | WebElement
    ): Promise<void> {
      Logger.debug("WebBrowser.switchToFrame");
      await this.driver.switchTo().frame(frame ? await frame : null);
    }

    /**
     * Close a window.
     * If no window is specified, close the current window.
     */
    public async closeWindow(windowHandle?: string): Promise<void> {
      Logger.debug("WebBrowser.closeWindow", windowHandle);
      const currentWindow = await this.driver.getWindowHandle();
      if (windowHandle != null && windowHandle !== currentWindow) {
        await this.driver.switchTo().window(windowHandle);
        await this.driver.close();
        await this.driver.switchTo().window(currentWindow);
      } else {
        await this.driver.close();
      }
    }

    /**
     * Change focus to the active modal dialog,
     * such as those opened by `window.alert()`, `window.confirm()`, and `window.prompt()`.
     */
    public async focusToAlert(): Promise<Alert> {
      return this.driver.switchTo().alert();
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

    /**
     * Wait for the download to complete.
     * @returns The name of the downloaded file.
     */
    // eslint-disable-next-line class-methods-use-this
    public async waitForDownload(params: {
      /** Function to start the download. */
      downloader: () => Promise<void>;
      /** Extension name of the file to download. */
      extname?: string;
      /** How long to wait, in milliseconds, for the download to complete. */
      timeout?: number;
    }): Promise<string> {
      const timeout = params.timeout || 30000;
      let extname = params.extname || "";
      if (extname && !extname.startsWith(".")) {
        extname = `.${extname}`;
      }
      Logger.debug("WebBrowser.download", { timeout, extname });

      const startedAt = Date.now();
      await params.downloader();

      // Omit the debug logs temporarily
      const logLevel = Logger.level;
      Logger.level = Logger.isInfoEnabled() ? "INFO" : Logger.level;
      try {
        while (Date.now() < startedAt + timeout) {
          const files = File.listFiles({
            sortType: File.SortType.Mtime,
            orderBy: File.OrderBy.DESC
          })
            .filter((filename): boolean => !filename.endsWith(".crdownload"))
            .filter((filename): boolean => filename.endsWith(extname));

          if (files.length > 0) {
            const latestFile = files[0];
            if (File.getStats({ filename: latestFile }).mtimeMs > startedAt) {
              return latestFile;
            }
          }
          await util.sleep(100); // eslint-disable-line no-await-in-loop
        }
      } finally {
        Logger.level = logLevel;
      }
      throw new Error("Download timed out");
    }
  }
}

export default RPA.WebBrowser.instance;
