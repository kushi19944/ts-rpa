import WebBrowserInstance from "../src/WebBrowser";

describe("WebBrowserInstance", () => {
  describe("driver", () => {
    it("Browser is chrome", async () => {
      const capabilities = await WebBrowserInstance.driver.getCapabilities();
      expect(capabilities.getBrowserName()).toBe("chrome");
    });
  });
});
