import * as WebBrowserModule from "./RPA/WebBrowser";

import * as LoggerModule from "./RPA/Logger";

import GoogleModule from "./RPA/Google";

import GCPModule from "./RPA/GCP";

import SlackModule from "./RPA/Slack";

import ChatworkModule from "./RPA/Chatwork";

import FileModule from "./RPA/File";

import CSVModule from "./RPA/CSV";

import HashModule from "./RPA/Hash";

import ZipModule from "./RPA/Zip";

import RequestModule from "./RPA/Request";

import StringModule from "./RPA/String";

import UtilModule from "./util";

export namespace RPA {
  export const Google = GoogleModule;

  export const GCP = GCPModule;

  export const Slack = SlackModule;

  export const Chatwork = ChatworkModule;

  export const File = FileModule;

  export const CSV = CSVModule;

  export const Hash = HashModule;

  export const Zip = ZipModule;

  export const Request = RequestModule;

  export const String = StringModule;

  export const WebBrowser = WebBrowserModule.default;

  export const Logger = LoggerModule.default;

  export const SystemLogger = LoggerModule.system;

  export const { sleep, prompt, retry } = UtilModule;
}

export default RPA;
