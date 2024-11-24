import Config from "../../config";
import { sendPug } from "../pug";
import { HTTPError } from "../../errors";
import {
  cpOptsDefaults,
  cpOptTypes,
} from "../../channel/coolholepoints-actions-options";

export default function initialize(app, ioConfig) {
  app.get(`/`, async (req, res) => {
    const endpoints = ioConfig.getSocketEndpoints();
    if (endpoints.length === 0) {
      throw new HTTPError("No socket.io endpoints configured");
    }
    const socketBaseURL = endpoints[0].url;

    sendPug(res, "channel", {
      channelName: "coolesthole",
      sioSource: `${socketBaseURL}/socket.io/socket.io.js`,
      maxMsgLen: Config.get("max-chat-message-length"),
      // Inject coolhole default variables into pug
      cpOptsDefaults: cpOptsDefaults,
      cpOptsTypes: cpOptTypes,
    });
  });
}
