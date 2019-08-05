import Logger from "./Logger";

export namespace RPA {
  export class StringClass {
    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    public static halveZenkakuAscii(str: string): string {
      Logger.debug("String.halveZenkakuAscii", str);
      return (
        str
          // ascii
          .replace(/[\uff01-\uff5e]/g, (c): string =>
            String.fromCodePoint(c.codePointAt(0) - 0xfee0)
          )
          // full-width space
          .replace(/\u3000/g, " ")
      );
    }
  }
}

export default RPA.StringClass;
