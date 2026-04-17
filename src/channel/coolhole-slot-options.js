var ChannelModule = require("./module");
const LOGGER = require("@calzoneman/jsli")("coolhole-slots-options");
const Flags = require("../flags");

const DEFAULT_SYMBOL_ODDS = {
  0: 1,
  1: 3,
  2: 5,
  3: 7,
  4: 9,
  5: 11,
  6: 13,
  7: 15,
  8: 17,
  9: 19,
};

const DEFAULT_SYMBOL_PAYOUTS = {
  0: 100,
  1: 80,
  2: 70,
  3: 55,
  4: 50,
  5: 30,
  6: 25,
  7: 20,
  8: 10,
  9: 5,
};

const defaultOptions = {
  symbolPayouts: DEFAULT_SYMBOL_PAYOUTS,
  symbolOdds: DEFAULT_SYMBOL_ODDS,
  minBet: 10,
};

class CoolholeSlotOptions extends ChannelModule {
  constructor(_channel) {
    super(_channel);

    ChannelModule.apply(this, arguments);

    this.coolholeSlotOptions = {};

    this.supportsDirtyCheck = true;
  }

  /**
   * Generic Log Error wrapper
   * @param {Object} errorObject Error information
   * @param {Object} errorObject.user User information
   * @param {String} errorObject.callingFunction Function the error was caught in
   * @param {String} errorObject.returnSocket Event name to emit to
   * @param {String} errorObject.err Error string
   * @param {Object} errorObject.data Data related to the error
   * @param {String} errorObject.userMessage Message to display to the user
   */
  logError({ user, callingFunction, returnSocket, err, data, userMessage }) {
    LOGGER.error(`Exception caught in ${callingFunction}. Error:  ${err}`);

    LOGGER.error(
      `Unkown error in ${callingFunction} for CoolholeSlotOptionsModule. Here's hopefully relevant data: ${JSON.stringify(
        data ? data : {},
      )}`,
    );

    if (returnSocket)
      // Return an empty array of point data... for now probably
      user.socket.emit(returnSocket, new ReturnMsg("error", userMessage, []));
  }

  /**
   * Gets permissions. Copied from opts... Still seems kinda silly
   * @returns permissions class
   */
  getPermissions() {
    return this.channel.modules.permissions;
  }

  onUserPostJoin(user) {
    if (!user.channel.is(Flags.C_REGISTERED)) return;

    user.socket.on(
      "setCoolholeSlotOption",
      this.handleSetSlotOptions.bind(this, user),
    );
    user.socket.on(
      "getCoolholeSlotOptions",
      this.sendSlotOptions.bind(this, [user]),
    );
    // send current options on join
    this.sendSlotOptions([user]);
  }

  load(data) {
    if ("coolholeSlotOptions" in data) {
      // Load saved options first
      this.coolholeSlotOptions = data.coolholeSlotOptions;
      // Then compare keys and set defaults if missing
      const existingKeys = Object.keys(this.coolholeSlotOptions);
      const newKeys = Object.keys(defaultOptions);
      const missingKeys = newKeys.filter((key) => !existingKeys.includes(key));
      if (missingKeys.length > 0) {
        LOGGER.info(
          `Adding missing coolhole slot options: ${missingKeys.join(", ")}`,
        );
        for (const key of missingKeys) {
          this.coolholeSlotOptions[key] = defaultOptions[key];
        }
      }
    } else {
      this.coolholeSlotOptions = defaultOptions;
    }
  }
  save(data) {
    data.coolholeSlotOptions = this.coolholeSlotOptions;
  }

  set(options) {
    try {
      for (const key in options) {
        if (key in defaultOptions) {
          const isValid =
            (typeof options[key] === "object" &&
              Object.values(options[key]).every(
                (v) => typeof v === "number",
              )) ||
            typeof options[key] === "number";
          if (isValid) {
            // Deep merge for nested objects to preserve existing symbols
            if (
              typeof options[key] === "object" &&
              typeof this.coolholeSlotOptions[key] === "object"
            ) {
              Object.assign(this.coolholeSlotOptions[key], options[key]);
            } else {
              // Direct replacement for scalar values
              this.coolholeSlotOptions[key] = options[key];
            }
            LOGGER.info(
              `Set coolhole slot option ${key} to ${JSON.stringify(options[key])}`,
            );
          }
        }
      }
      this.dirty = true;
    } catch (e) {
      LOGGER.error("Error setting coolhole slot options:", e);
    }
  }

  handleSetSlotOptions(user, options) {
    if (!this.getPermissions().canSetOptions(user)) {
      user.kick("Attempted to set slot options as a non-moderator");
      this.logError({
        user,
        callingFunction: "handleSetSlotOptions",
        returnSocket: "coolpointsFailure",
        err: `User ${user.getName()} is not a moderator`,
        data,
        userMessage: "You are not a moderator",
      });
      return;
    }

    this.set(options);
    LOGGER.info(
      `User ${user.getName()} updated slot options: ${JSON.stringify(options)}`,
    );
    this.sendSlotOptions(this.channel.users);
  }

  /**
   * Send options to each provided user
   * @param {Array.*} users Array of user objects
   */
  sendSlotOptions(users) {
    const actions = this.coolholeSlotOptions;

    if (users === this.channel.users) {
      this.channel.broadcastAll("updateCoolholeSlotOpts", actions);
    } else {
      users.forEach(function (user) {
        user.socket.emit("updateCoolholeSlotOpts", actions);
      });
    }
  }
}

module.exports = CoolholeSlotOptions;
module.exports.coolholeSlotOptionsDefaults = defaultOptions;
