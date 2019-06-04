import { WebClient } from "@slack/web-api";

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

    public initialise(credential: { apiToken: string }): void {
      this.token = credential.apiToken;
    }
  }
}

export default RPA.Slack.instance;
