import { configure, getLogger } from "log4js";

configure({
    appenders: {
        default: { type: "stdout" },
        system: { type: "stderr" }
    },
    categories: {
        default: { appenders: ["default", "stdout"], level: "all" },
        system: { appenders: ["system", "stdout"], level: "error" }
    }
});

export default getLogger("default");
export const systemLogger = getLogger("system");
