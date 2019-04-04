import {
    Builder,
    By,
    Capabilities,
    Condition,
    ThenableWebDriver,
    WebElement,
    WebElementPromise
} from "selenium-webdriver";
export { until as Until, By, Key } from "selenium-webdriver";

import * as fs from "fs";
import Logger from "./Logger";

export class WebBrowser {
    public driver: ThenableWebDriver;
    private capabilities: Capabilities;

    constructor() {
        this.capabilities = Capabilities.chrome();
        this.capabilities.set("chromeOptions", {
            args: [
                "--headless",
                "--no-sandbox",
                "--disable-gpu",
                "--window-size=1980,1200"
            ]
        });
        this.driver = new Builder().withCapabilities(this.capabilities).build();
    }

    public get(url: string) {
        Logger.debug(`WebBrowser.get(${url})`);
        return this.driver.get(url);
    }

    public wait(
        condition: Condition<boolean> | PromiseLike<boolean>,
        optTimeout?: number
    ) {
        Logger.debug(`WebBrowser.wait(${condition}, ${optTimeout})`);
        return this.driver.wait(condition, optTimeout);
    }

    public mouseMove(element: WebElementPromise | WebElement) {
        Logger.debug(`WebBrowser.mouseMove(${element})`);
        return this.driver
            .actions()
            .mouse()
            .move({ origin: element })
            .perform();
    }

    public mouseClick(element: WebElementPromise | WebElement) {
        Logger.debug(`WebBrowser.mouseClick(${element})`);
        return this.driver
            .actions()
            .mouse()
            .move({ origin: element })
            .press()
            .release()
            .perform();
    }

    public sendKeys(
        element: WebElementPromise | WebElement,
        [args]: Array<string | number | Promise<string | number>>
    ) {
        Logger.debug(`WebBrowser.sendKeys(${element})`);
        return element.sendKeys(args);
    }

    public findElement(selector: string) {
        Logger.debug(`WebBrowser.findElement(${selector})`);
        return this.driver.findElement(By.css(selector));
    }

    public findElements(selector: string) {
        Logger.debug(`WebBrowser.findElement(${selector})`);
        return this.driver.findElements(By.css(selector));
    }

    public findElementById(id: string) {
        Logger.debug(`WebBrowser.findElementById(${id})`);
        return this.driver.findElement(By.id(id));
    }

    public findElementsById(id: string) {
        Logger.debug(`WebBrowser.findElementById(${id})`);
        return this.driver.findElements(By.id(id));
    }

    public findElementByClassName(name: string) {
        Logger.debug(`WebBrowser.findElementByClassName(${name})`);
        return this.driver.findElement(By.className(name));
    }

    public findElementsByClassName(name: string) {
        Logger.debug(`WebBrowser.findElementByClassName(${name})`);
        return this.driver.findElements(By.className(name));
    }

    public findElementByCSSSelector(selector: string) {
        Logger.debug(`WebBrowser.findElementByCSSSelector(${selector})`);
        return this.driver.findElement(By.css(selector));
    }

    public findElementsByCSSSelector(selector: string) {
        Logger.debug(`WebBrowser.findElementByCSSSelector(${selector})`);
        return this.driver.findElements(By.css(selector));
    }

    public findElementByXPath(xpath: string) {
        Logger.debug(`WebBrowser.findElementByXPath(${xpath})`);
        return this.driver.findElement(By.xpath(xpath));
    }

    public findElementsByXPath(xpath: string) {
        Logger.debug(`WebBrowser.findElementByXPath(${xpath})`);
        return this.driver.findElements(By.xpath(xpath));
    }

    public async takeScreenshot() {
        Logger.debug(`WebBrowser.takeScreenshot()`);
        const image = await this.driver.takeScreenshot();
        return fs.writeFile(
            `${Math.round(new Date().getTime() / 1000)}.png`,
            image,
            "base64",
            error => {
                if (error != null) {
                    Logger.error(error);
                }
            }
        );
    }
}

export default new WebBrowser();
