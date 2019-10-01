import { WebClient, ChatPostMessageArguments } from "@slack/web-api";
import Logger from "./Logger";

export namespace RPA {
  export class Slack extends WebClient {
    private static slack: Slack;

    // Override readonly field
    public token?: string;

    /* eslint-disable no-useless-constructor */
    private constructor() {
      super();
    }

    public static get instance(): Slack {
      if (!this.slack) {
        this.slack = new Slack();
      }
      return this.slack;
    }

    /**
     * Initializes the instance by setting the API token.
     * @param credential
     */
    public initialise(credential: { apiToken: string }): void {
      this.token = credential.apiToken;
    }

    /**
     * Post a message to a channel.
     */
    public static async postMessage(
      params: ChatPostMessageArguments
    ): Promise<void> {
      Logger.debug("Slack.postMessage", params);
      const res = await this.slack.chat.postMessage(params);
      if (!res.ok || res.error) {
        throw new Error("Slack.postMessage failed.");
      }
    }
  }
}

export default RPA.Slack.instance;
