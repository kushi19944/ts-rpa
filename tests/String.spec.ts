import StringClass from "../src/RPA/String";

describe("RPA.String", () => {
  describe("halveZenkakuAscii", () => {
    it("halves all ascii chars", async () => {
      expect(
        StringClass.halveZenkakuAscii(
          "Ｔｈｅ　ｑｕｉｃｋ　ｂｒｏｗｎ　ｆｏｘ　ｊｕｍｐｓ　ｏｖｅｒ　ｔｈｅ　ｌａｚｙ　ｄｏｇ！　１２３４５６７８９０．"
        )
      ).toBe("The quick brown fox jumps over the lazy dog! 1234567890.");
    });

    it("skips half-width or non-ascii chars", async () => {
      expect(StringClass.halveZenkakuAscii("abcあいう１２３一二三")).toBe(
        "abcあいう123一二三"
      );
    });
  });
});
