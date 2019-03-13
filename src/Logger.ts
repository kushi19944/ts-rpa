import { configure, getLogger } from "log4js";

configure({
    appenders: {
        default: { type: "file", filename: "trace.log" },
        system: { type: "file", filename: "error.log" }
    },
    categories: {
        default: { appenders: ["default"], level: "all" },
        system: { appenders: ["system"], level: "error" }
    }
});

export default getLogger("default");
export const systemLogger = getLogger("system");
