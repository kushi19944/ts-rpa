import { configure, getLogger } from "log4js";

configure({
  appenders: {
    default: { type: "stdout" },
    system: { type: "stderr" }
  },
  categories: {
    default: { appenders: ["default"], level: "all" },
    system: { appenders: ["system"], level: "error" }
  }
});

export namespace RPA {
  export const Logger = getLogger("default");
  export const SystemLogger = getLogger("system");
}
export default RPA.Logger;

/**
 * @ignore
 */
export const system = RPA.SystemLogger;
