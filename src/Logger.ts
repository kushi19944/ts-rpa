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

export default getLogger("default");
export const systemLogger = getLogger("system");
