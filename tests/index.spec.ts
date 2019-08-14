import { RPA } from "../src/index";

describe("RPA", (): void => {
  describe("retry", (): void => {
    it("executes functions that are always resolved only once", async (): Promise<
      void
    > => {
      let count = 0;
      await RPA.retry(
        async (): Promise<void> => {
          count += 1;
        }
      );
      expect(count).toBe(1);
    });

    it("executes functions until resolved", async (): Promise<void> => {
      let count = 0;
      await RPA.retry(async (): Promise<void> => {
        count += 1;
        if (count <= 1) throw new Error();
      }, 3);
      expect(count).toBe(2);
    });

    it("executes functions that are always rejected `retryCount` times", async (): Promise<
      void
    > => {
      let count = 0;
      try {
        await RPA.retry(async (): Promise<void> => {
          count += 1;
          throw new Error("test error message");
        }, 3);
      } catch (e) {
        expect(e.message).toBe("test error message");
      }
      expect(count).toBe(3);
    });
  });
});
