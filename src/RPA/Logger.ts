import { configure, getLogger, addLayout, LoggingEvent } from "log4js";

const layout = (): ((logEvent: LoggingEvent) => string) => (
  logEvent: LoggingEvent
): string => {
  return JSON.stringify({
    time: logEvent.startTime,
    severity:
      logEvent.level.levelStr === "WARN" ? "WARNING" : logEvent.level.levelStr,
    message: logEvent.data.reduce(
      (a, c): string => `${a} ${JSON.stringify(c)}`
    ),
    data: logEvent.data
  });
};

let layoutType = "coloured";
if (process.env.KUBERNETES_SERVICE_HOST) {
  addLayout("stackdriver", layout);
  layoutType = "stackdriver";
}
configure({
  appenders: {
    default: { type: "stdout", layout: { type: layoutType } },
    system: { type: "stderr", layout: { type: layoutType } }
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

/* eslint-disable no-console */
console.error = (message?: any, ...optionalParams: any[]): void => {
  RPA.SystemLogger.error(message, optionalParams);
};

/**
 * @ignore
 */
export const system = RPA.SystemLogger;
