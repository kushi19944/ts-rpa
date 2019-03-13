## Installation
```
npm i -g ts-rpa
```

## Usage
```
ts-rpa sample.ts
```

## Sample
```js
import * as RPA from "ts-rpa";

(async () => {
    try {
        await RPA.WebBrowser.get("https://www.google.com/");
        const input = await RPA.WebBrowser.findElement(".gLFyf");
        await RPA.WebBrowser.sendKeys(input, ["RPA"]);
        await RPA.WebBrowser.findElement(
            ".FPdoLc > center:nth-child(1) > input:nth-child(2)"
        ).click();
        await RPA.WebBrowser.takeScreenshot();
    } catch (error) {
        RPA.systemLogger.error(error);
    }
})();
```
