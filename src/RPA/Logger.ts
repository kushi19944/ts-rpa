import { configure, getLogger, LoggingEvent } from "log4js";

let layout = {};
layout = { type: "coloured" };
if (process.env.KUBERNETES_SERVICE_HOST) {
  layout = {
    type: "pattern",
    pattern: JSON.stringify({
      serviceContext: {
        service: "%h"
      },
      time: "%d{ISO8601_WITH_TZ_OFFSET}",
      severity: "%x{severity}",
      message: "%x{message}",
      data: "%x{data}",
      context: {
        reportLocation: {
          functionName: "%x{functionName}",
          lineNumber: "%l",
          filePath: "%f"
        }
      }
    })
      .replace('"%l"', "%l")
      .replace('"%x{message}"', "%x{message}")
      .replace('"%x{data}"', "%x{data}"),
    tokens: {
      severity: (logEvent: LoggingEvent): string =>
        logEvent.level.levelStr === "WARN"
          ? "WARNING"
          : logEvent.level.levelStr,
      functionName: (logEvent: any): string =>
        logEvent.functionName || "<anonymous>",
      message: (logEvent: LoggingEvent): string =>
        JSON.stringify(logEvent.data[0]),
      data: (logEvent: LoggingEvent): string => JSON.stringify(logEvent.data)
    }
  };
}
const config = {
  appenders: {
    default: { type: "stdout", layout },
    system: { type: "stderr", layout }
  },
  categories: {
    default: { appenders: ["default"], level: "all", enableCallStack: true },
    system: { appenders: ["system"], level: "error", enableCallStack: true }
  }
};
configure(config);

export namespace RPA {
  export const Logger = getLogger("default");
  export const SystemLogger = getLogger("system");
}
export default RPA.Logger;

/* eslint-disable no-console */
console.error = (message?: any, ...optionalParams: any[]): void => {
  RPA.SystemLogger.error(message, optionalParams);
};

/**
 * @ignore
 */
export const system = RPA.SystemLogger;
