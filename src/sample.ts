import * as RPA from "node-rpa";

(async () => {
    try {
        await RPA.WebBrowser.get("https://www.google.com/");
        const input = await RPA.WebBrowser.findElement(".gLFyf");
        await RPA.WebBrowser.sendKeys(input, ["CyberAgent"]);
        await RPA.WebBrowser.findElement(
            ".FPdoLc > center:nth-child(1) > input:nth-child(2)"
        ).click();
        await RPA.WebBrowser.takeScreenshot();
    } catch (error) {
        RPA.systemLogger.error(error);
    }
})();
