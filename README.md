[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][circleci-image]][circleci-url]
[![Codecov][codecov-image]][codecov-url]
[![Dependencies Status][dependencies-image]][dependencies-url]

## Installation
```
npm i -g ts-rpa
```

## Requirements
### Installation
- chromedriver
### Enviroment
```
export NODE_PATH=$(npm root -g)
export GOOGLE_CLIENT_SECRET = ************************
export GOOGLE_CLIENT_ID = ************-********************************.apps.googleusercontent.com
export WORKSPACE_DIR = ./tmp/
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
[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://npmjs.org/package/ts-rpa
[downloads-image]: https://img.shields.io/npm/dm/ts-rpa.svg
[downloads-url]: https://npmjs.org/package/ts-rpa
[circleci-image]: https://circleci.com/gh/ca-rpa/ts-rpa.svg?style=shield
[circleci-url]: https://circleci.com/gh/ca-rpa/ts-rpa
[codecov-image]: https://codecov.io/gh/ca-rpa/ts-rpa/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/ca-rpa/ts-rpa
[dependencies-image]: https://david-dm.org/ca-rpa/ts-rpa/status.svg
[dependencies-url]: https://david-dm.org/ca-rpa/ts-rpa
