var ChannelModule = require("./module");
var FilterList = require("cytubefilters");
var LOGGER = require("@calzoneman/jsli")("coolpoints");
var Flags = require("../flags");
import { ActionType } from "./coolholepoints-actions-options";

/**
 * @class PointData
 * @classdesc PointData class
 * @param {String} user user
 * @param {Number} points points
 * @returns {Object} PointData object
 */
class PointData {
  constructor(user, points) {
    this.user = user;
    this.points = points;
  }
}
/**
 * @class ReturnPointData
 * @classdesc ReturnPointData class
 * @param {String} user user
 * @param {Number} points difference in points
 * @param {Number} currentPoints currentPoints
 * @returns {Object} ReturnPointData object
 */
class ReturnPointData {
  constructor(user, points, currentPoints) {
    this.user = user;
    this.points = points;
    this.currentPoints = currentPoints;
  }
}

/**
 * @class ReturnMsg
 * @classdesc ReturnMsg class
 * @param {String} msg message
 * @param {String} userMessage user message
 * @param {Object} data data
 * @returns {Object} ReturnMsg object
 **/
class ReturnMsg {
  constructor(msg, userMessage, data) {
    this.msg = msg;
    this.userMessage = userMessage;
    this.data = data;
  }
}

const ADS = [
  "Checkout RAID: Shadow Legends™, an immersive RPG title with an awesome storyline, awesome 3D graphics, and epic boss fights. Download today! https://apkspark.com/raid-shadow-legends-mod-apk/",
  "This message is brought to you by MapScaped. When manscaping, you gotta use the right tools for the job, and trust me, your balls will thank you. Feel my smooth balls at https://www.manscaped.com/",
  "Wanna know something? Dragon cum is slightly warmer than human cum, and much thicker, too. Imagine filling yourself up. Try Bad Dragon today. https://tinyurl.com/y267avw3",
  "Discover a sugoi world of anime magic! Onii-chan, get ready for a kawaii adventure with Crunchyroll. Watch heartwarming romances to epic battles. Itadakimasu!",
  "联盟戦亡選機稿 Welcome to the TikTok. Dance and sing and see om om om 哈哈. Join TikTok (抖音) now. Create amazing content together (一起创作)! 加油! No Xi.",
  "the movie start with a parody of 2001 monkey being women's playing with baby doll. The appear the barbie. Then you have a 5 minutes song on the Barbie world is perfect and ken is a cuck. 9/10 https://www.cinemark.com/movies/barbie",
  "Coming soon to Disney+, the next weekly MCU movie featuring Tobey Maguire in a wheel chair. After having his Funko Pops stolen, he has to team up with unlikely heros, other Spidermans, to jerk each other off on camera for 2 and half hours.",
  "The sequel to the captivating tale of Fuga: Melodies of Steel has arrived! Enjoy countless hours of anthropromorphic animals massaging eachother's prostates before loading children into a cannon and firing them into 15 tons of steel.",
  "Checkout the new Adult Swim show My Adventures with Superman. God I love tomgirls. I want to lick sweat off of their abs and feel the pressure on my skull as they wrap their thighs tight around my head. I also love men.",
  "BBBYQ: They plan on filing the plan & disclosure statement in the next 24 hours and seek approval at a hearing around August. If you don't buy, you're a fucking moron.",
  "Vagabomb- Exclusive Urbane Indian Women Ironic Contemporary Love Writing/Story, Romance Ideas, Sex Moves, Lovely Beauty Trends, Sex and Relationships, Miraculous Resolution about Dating, Notable Love examples, marry me.",
  "Your phone number has being randomly select for a cash prize of $4,950,000 in our 2016 PROMOTIONS/PRISE AWARD. Email your details to forgotmycockli@protonmail.com",
  "Want to quit gaming, but don't know how? Sick of feeling like you're wasting your potential? Ready to break out of this vicious cycle? Getting so bad you wrote a suicide note? Join https://gamequitters.com",
  "Want a break from the ads? Watch this short video and get 30 minutes of ad free messages https://youtu.be/m4QO5jyEw2E?t=3",
  "Smnart like girlfriend 360° constant temperature twice the efficency shaft rub pocketed device",
  `I am Paizuri-chan, a girl with the biggest anime titties known to man! ( • )( • )ԅ(≖‿≖ԅ). I may look innocent, but don't be fooled, I can get as dirty as an uncesored hentai! ( ͡° ͜ʖ ͡°) Find me on https://boards.4channel.org/g/`,
  "I sell a personalize match finding experience exclusively targeting kissless virgins. To get people to kiss, we sent them an e-mail to visit our website and pick a match. Once did, had fully customised they kiss. http://kiss.me/",
  "I have a buisness that specalizes in customize satchel making. Give me a way to sell it to you. I would like to do that.",
  "COOL FRIEND | GNCDE '''Satirical''' Alt-Right Indie-Rock https://youtu.be/hc801HuELUc",
  "ummm, uhhh, guys I can't hold it in anymore i- GRRRRRRRRRRR WOOF WOOF BARK BARK ARF BARK GRRRR WOOF SNARL HSSSS GRRRR WOOF WOOF BARK ARF GRRRR HSSSS WOOF WOOF BARK ARF GRRRRR HSSSSS BARK ARF GRRRR https://furrycons.com/calendar/",
  "as a proud christian my priorties are guns, Trump, beer, god, Nascar®, barbieq, and freedom in that order and we will continue to show support because he understands this we will keep sending half of our insulin money to support him",
  "GrubHub perks give you deals on the food you love. The kind of deals that make you boogie. Get the food you love, with perks from GrubHub! Grub what you love!",
];

const randomLettersRegex = () => {
  const randomLetters = "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  return `(${randomLetters.join("|")})`;
};
const makePointsFilter = (name, source, flags, replace) => ({
  name: name,
  source: source,
  flags: flags,
  replace: replace,
  active: true,
  filterlinks: false,
});

const STUTTER_FILTER = makePointsFilter(
  "debt level 0",
  "(^| )([Cc]|[Gg]|[Tt][Hh]|[Ss]|[Hh]|[Ii]|[Qq][Uu]|[Ff]|[Pp]|[Ww]|[Nn]|[Ll]|[Ss][Hh])([aeiou]+?)",
  "gi",
  "\\1\\2-\\2-\\2-\\2-\\2-\\3"
);
const LISP_FILTER = makePointsFilter(
  "debt level 1",
  "(ss|sh|ch|s|z|c|x)",
  "gi",
  "th"
);
const MISSING_LETTERS_FILTER = makePointsFilter(
  "debt level 4",
  "([a-z])", // To be replaced when applied
  "gi",
  ""
);

/**
 * Coolpoints controls CRUD operations for users' coolpoints
 * @param {Object} _channel
 */
class Coolpoints extends ChannelModule {
  constructor(_channel) {
    super(_channel);

    ChannelModule.apply(this, arguments);

    this.supportsDirtyCheck = true;
    this.userActiveIntervalIds = {};
    this.coolpoints = [];
  }

  /**
   * Post join hook
   * @param {*} user user object
   */
  onUserPostJoin(user) {
    user.socket.on(
      "applyPointsToUser",
      this.handleApplyPointsToUser.bind(this, user)
    );

    this.init(user);
    this.handleActive(user);
  }

  onUserPart(user) {
    LOGGER.info(`Clearing active interval for ${user.getName()}`);
    clearInterval(this.userActiveIntervalIds[user.getName()]);
    delete this.userActiveIntervalIds[user.getName()];
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
    LOGGER.error(
      `Exception caught in ${callingFunction} for CoolPoints. Here's hopefully relevant data: ${JSON.stringify(
        data ? data : {}
      )} Error:  ${err}`
    );

    if (returnSocket)
      // Return an empty array of point data... for now probably
      user.socket.emit(returnSocket, new ReturnMsg("error", userMessage, []));
  }

  /**
   * Load CoolPoints
   * @param {PointData} data CoolPoints class
   */
  load(data) {
    if ("coolpoints" in data) {
      this.coolpoints = data.coolpoints;
      this.dirty = false;
    } else {
      //otherwise, create an empty array
      this.coolpoints = [];

      //set dirty flag so bgtask will save it
      this.dirty = true;
    }
  }

  /**
   * Saves coolpoints to channel data
   * @param {Object} data channel object
   */
  save(data) {
    data.coolpoints = this.coolpoints;
  }

  /**
   * Get coolpoints for a user
   * @param {String} user User object
   * @returns {PointData} User's coolpoints object
   */
  get(name) {
    return this.coolpoints.find((cp) => cp.user === name);
  }

  /**
   * Exists check for a user's coolpoints
   * @param {String} name User's name
   * @returns {Boolean} if user exists
   */
  exists(name) {
    return this.coolpoints.some((cp) => cp.user === name);
  }

  /**
   * Set coolpoints for a user
   * @param {String} name User's name
   * @param {Number} points User's coolpoints
   */
  set(name, points) {
    const cp = this.get(name);
    if (cp) {
      cp.points = points;
    } else {
      this.coolpoints.push(new PointData(name, points));
    }
    this.dirty = true;
  }

  /**
   * Initialize coolpoints for a user
   * @param {Object} user User object
   * @emits coolpointsInitResponse
   */
  init(user) {
    if (
      user.getName() && // User has a name
      user.account.globalRank !== 0 && // Is not a guest
      !this.exists(user.getName())
    ) {
      this.set(user.getName(), 0);
    }
    user.socket.emit(
      "coolpointsInitResponse",
      new ReturnMsg("success", "Here's everyones' points", this.coolpoints)
    );
  }

  /**
   * Add coolpoints for a user
   * @param {String} name User's name
   * @param {Number} points User's coolpoints
   */
  add(name, points) {
    const curPoints = this.get(name)?.points ?? 0;
    this.set(name, curPoints + points);
    this.dirty = true;
  }

  /**
   * Subtract coolpoints for a user
   * @param {String} name User's name
   * @param {Number} points User's coolpoints
   */
  subtract(name, points) {
    this.set(name, this.get(name)?.points ?? 0 - points);
    this.dirty = true;
  }

  /**
   * @summary Quick check to see if a given user is mod or below and return and error if they are
   * @param {Object} user user object
   * @param {String} socketName call back socket
   * @returns {Boolean} if they can update points or not
   */
  canUpdateOthersPoints = function (user, socketName) {
    if (user.account.effectiveRank <= 2) {
      this.logError({
        user,
        callingFunction: "canUpdateOthersPoints",
        returnSocket: socketName,
        err: `User's rank does not allow ${user.getName()} update other's points`,
        data: user.account.effectiveRank,
        userMessage:
          "Error: Your rank does not allow you update other's points",
      });
      return false;
    }

    return true;
  };

  /**
   * @summary Applies a coolpoint change to a user
   * @param {Object} user user object
   * @param {Object} data data object
   * @param {String} data.targetName target username
   * @param {Number} data.points points to add or subtract (if negative)
   */
  handleApplyPointsToUser(user, data) {
    try {
      const { targetName, points } = data;
      if (!this.canUpdateOthersPoints(user, "applyPointsToUser")) return;

      const target = this.get(targetName);
      if (!target) {
        this.logError({
          user,
          callingFunction: "applyPointsToUser",
          returnSocket: "coolpointsFailure",
          err: `User ${targetName} not found to apply points to`,
          data: targetName,
          userMessage: `Error: User ${targetName} not found to apply points to`,
        });
        return;
      }

      this.add(targetName, points);

      const currTargetPoints = this.get(targetName).points;

      this.channel.broadcastAll(
        "updateCoolPointsResponse",
        new ReturnMsg(
          `${user.getName()} applied ${points} to user ${targetName}`,
          `Powers that be applied ${points} to user ${targetName}`,
          new ReturnPointData(targetName, points, currTargetPoints)
        )
      );

      LOGGER.info(`${user.getName()} applied ${points} to user ${targetName}`);
    } catch (err) {
      this.logError({
        user,
        callingFunction: "applyPointsToUser",
        returnSocket: "coolpointsFailure",
        err,
        data: { user: data.targetName, points: data.points },
        userMessage: `Error: Unable to apply points to user ${data.targetName}. Let the head monkey in charge know`,
      });
    }
  }

  /**
   * @summary Validates an action for a user
   * @param {Object} user user object
   * @param {String} action action to validate
   * @param {String} expectedActionType expected action type
   * @param {String} callingFunction calling function
   * @returns boolean
   */
  isValidAction(user, action, expectedActionType, callingFunction) {
    const pointData = this.get(user.getName());
    if (!pointData) {
      this.logError({
        user,
        callingFunction,
        returnSocket: "coolpointsFailure",
        err: `User ${user.getName()} not found for point ${action}`,
        data: { user: user.getName(), action },
        userMessage: `Error: You were not found... Good luck with that`,
      });
      return false;
    }

    const actionData = this.channel.modules.coolholeactionspoints.get(action);
    if (actionData.actionType !== expectedActionType) {
      this.logError({
        user,
        callingFunction,
        returnSocket: "coolpointsFailure",
        err: `Action ${action} is not an ${expectedActionType}`,
        data: { user: user.getName(), action },
        userMessage: `Error: Action ${action} is not an ${expectedActionType}`,
      });
      return false;
    }

    if (
      actionData.options.find((opt) => opt.optionName === "enabled")
        .optionValue === false
    ) {
      if (action !== "active")
        // "Active" still runs even if it's inactive; no need to log
        this.logError({
          user,
          callingFunction,
          returnSocket: "coolpointsFailure",
          err: `Action ${action} is not enabled`,
          data: { user: user.getName(), action },
          userMessage: `Error: Action ${action} is not enabled`,
        });
      return false;
    }

    switch (expectedActionType) {
      case ActionType.Expenditures:
        if (
          pointData.points <
          actionData.options.find((opt) => opt.optionName === "points")
            .optionValue
        ) {
          this.logError({
            user,
            callingFunction,
            returnSocket: "coolpointsFailure",
            err: `User ${user.getName()} does not have enough points to spend on ${action}`,
            data: { user: user.getName(), action },
            userMessage: `Error: You do not have enough points to spend on ${action}`,
          });
          return false;
        }
        break;
      case ActionType.Statuses:
        if (
          pointData.points <=
          actionData.options.find((opt) => opt.optionName === "points")
            .optionValue
        ) {
          return true;
        }
        return false;
      case ActionType.Losses:
      case ActionType.Earnings:
        break;
    }

    return true;
  }

  /**
   * @summary Spend coolpoints
   * @param {Object} user user object
   * @param {String} action action to spend points on
   */
  spend(user, action) {
    try {
      if (!this.isValidAction(user, action, ActionType.Expenditures, "spend"))
        return;

      const actionData = this.channel.modules.coolholeactionspoints.get(action);
      const pointsToSpend = actionData.options.find(
        (opt) => opt.optionName === "points"
      ).optionValue;

      this.subtract(user.getName(), pointsToSpend);

      LOGGER.info(
        `User ${user.getName()} spent ${
          actionData.options.find((opt) => opt.optionName === "points")
            ?.optionValue
        } points on ${action}`
      );

      this.channel.broadcastAll(
        "updateCoolPointsResponse",
        new ReturnMsg(
          `User ${user.getName()} spent ${pointsToSpend} points on ${action}`,
          `Wise spender ${user.getName()} spent ${pointsToSpend} points on ${action}`,
          new ReturnPointData(
            user.getName(),
            pointsToSpend,
            this.get(user.getName()).points
          )
        )
      );
    } catch (err) {
      this.logError({
        user,
        callingFunction: "spend",
        returnSocket: "coolpointsFailure",
        err,
        data: user.getName(),
        userMessage: `Error: Unable to spend points. Let the head monkey in charge know`,
      });
    }
  }

  /**
   * @summary Earn coolpoints
   * @param {Object} user user object
   * @param {String} action action was rewarded for
   */
  earn(user, action) {
    try {
      if (!this.isValidAction(user, action, ActionType.Earnings, "earn"))
        return;

      const actionData = this.channel.modules.coolholeactionspoints.get(action);
      const pointsToEarn = actionData.options.find(
        (opt) => opt.optionName === "points"
      ).optionValue;

      this.add(user.getName(), pointsToEarn);

      LOGGER.info(
        `User ${user.getName()} was awarded ${pointsToEarn} points for ${action}`
      );

      this.channel.broadcastAll(
        "updateCoolPointsResponse",
        new ReturnMsg(
          `User ${user.getName()} was awarded ${pointsToEarn} points for ${action}`,
          `${user.getName()} was awarded ${pointsToEarn} points for ${action}`,
          new ReturnPointData(
            user.getName(),
            pointsToEarn,
            this.get(user.getName()).points
          )
        )
      );
    } catch (err) {
      this.logError({
        user,
        callingFunction: "earn",
        returnSocket: "coolpointsFailure",
        err,
        data: user.getName(),
        userMessage: `Error: Unable to award points. Let the head monkey in charge know`,
      });
    }
  }

  /**
   * @summary Lose coolpoints and allows users to go negative
   * @param {Object} user user object
   * @param {String} action action was penalized for
   */
  lose(user, action) {
    try {
      if (!this.isValidAction(user, action, ActionType.Losses, "lose")) return;

      const actionData = this.channel.modules.coolholeactionspoints.get(action);
      const pointsToLose = actionData.options.find(
        (opt) => opt.optionName === "points"
      ).optionValue;

      this.subtract(user.getName(), pointsToLose);

      LOGGER.info(
        `User ${user.getName()} lost ${pointsToLose} points for ${action}`
      );

      this.channel.broadcastAll(
        "updateCoolPointsResponse",
        new ReturnMsg(
          `User ${user.getName()} lost ${pointsToLose} points for ${action}`,
          `${user.getName()} lost ${pointsToLose} points for ${action}`,
          new ReturnPointData(
            user.getName(),
            pointsToLose,
            this.get(user.getName()).points
          )
        )
      );
    } catch (err) {
      this.logError({
        user,
        callingFunction: "lose",
        returnSocket: "coolpointsFailure",
        err,
        data: user.getName(),
        userMessage: `Error: Unable to lose points. Let the head monkey in charge know`,
      });
    }
  }

  /**
   * @summary Check what statuses should be applied for a user
   * @param {Object} user user object
   * @returns {Array} statuses to apply
   */
  checkStatuses(user) {
    const statuses = [];
    this.channel.modules.coolholeactionspoints
      .filter((action) => action.actionType === ActionType.Statuses)
      .forEach((action) => {
        if (
          this.isValidAction(user, action, ActionType.Statuses, "checkStatuses")
        ) {
          statuses.push(action);
        }
      });

    return statuses;
  }

  /**
   * @summary Applies statuses to a user's message
   * @param {Object} user user object
   * @param {Object} chatObj chat message object
   * @returns {Object} chat message object with statuses applied
   */
  handleChatStatuses(user, chatObj) {
    const statuses = this.checkStatuses(user);
    let res = { ...chatObj };
    let filters = [];
    let attemptToApplyAd = false;

    statuses.forEach((status) => {
      switch (status.name) {
        case "debtlvl0":
          filters.push(STUTTER_FILTER);
          break;
        case "debtlvl1":
          filters.push(LISP_FILTER);
          break;
        case "debtlvl2":
          attemptToApplyAd = true;
          break;
        case "debtlvl3":
          resMsg.coolholeMeta.otherClasses.push("shrink");
          break;
        case "debtlvl4":
          MISSING_LETTERS_FILTER.source = randomLettersRegex();
          filters.push(MISSING_LETTERS_FILTER);
          break;
        case "debtlvl5":
          resMsg.coolholeMeta.otherClasses.push("criticality-accident");
          break;
        default:
          break;
      }
    });

    // Apply filters first to message
    if (filters.length !== 0) {
      const statuFilterList = new FilterList(filters);
      res.msg = statuFilterList.filter(chatObj.msg);
    }

    // Then apply ad if needed
    if (attemptToApplyAd) {
      res.msg = this.maybeAppendAdToChat(res.msg);
    }

    return res;
  }

  /**
   * Flips a coin and maybe appends an ad to a chat message
   * @param {String} msg chat message
   * @returns new chat message
   */
  maybeAppendAdToChat(msg) {
    // ~50% odds.. Maybe make this configurable
    const randomIndex = Math.floor(Math.random() * (ADS.length * 2));
    const shouldReplaceMessageWithAd = randomIndex < ADS.length;
    let resMsg = msg;

    if (shouldReplaceMessageWithAd) {
      const chosenAd = ADS[randomIndex];
      // 400 character limit - 2 for '- ' so just remove as much as we need
      const howMuchTextToRemove = Math.max(
        chosenAd.length + msg.length - 398,
        msg.length
      );
      resMsg = `${msg.substring(0, howMuchTextToRemove)}- ${chosenAd}`;
    }

    return resMsg;
  }

  /**
   * @summary Handles the active earning action for logged in users. Runs on an interval and writes the interval userActiveIntervalIds keyed by the user's name + channel
   * @param {*} user user object
   */
  handleActive(user) {
    if (!user.is(Flags.U_REGISTERED)) {
      LOGGER.info(`Guest is not eligible for points. Skipping active check`);
      return;
    }

    const activeActionData =
      this.channel.modules.coolholeactionspoints.get("active");
    // Multiply by 1000 to convert to milliseconds
    const activeInterval =
      activeActionData.options.find((opt) => opt.optionName === "interval")
        .optionValue * 1000;
    this.userActiveIntervalIds[user.getName() + "-" + user.channel.name] =
      setInterval(() => {
        // Has the interval changed? If so, clear and restart
        const curInterval =
          this.channel.modules.coolholeactionspoints
            .get("active")
            .options.find((opt) => opt.optionName === "interval").optionValue *
          1000;
        if (curInterval !== activeInterval) {
          LOGGER.info(
            `Interval has changed. Clearing and restarting for ${user.getName()}`
          );

          clearInterval(this.userActiveIntervalIds[user.getName()]);
          this.handleActive(user);
          return;
        }

        // Check if the action is still valid/active. If not, just return since I don't wanna build a hook to start this up again when it's turned on
        if (
          !this.isValidAction(user, "active", ActionType.Earnings, "active")
        ) {
          LOGGER.info(
            `'Acitve' is no longer active. Oh well. From: ${user.getName()}`
          );
          return;
        }

        if (user.is(Flags.U_AFK)) {
          LOGGER.info(
            `${user.getName()} is AFK. No points for you! AI gave me an epic Sienfeld reference`
          );
          return;
        }

        this.earn(user, "active");
      }, activeInterval);
  }
}

module.exports = Coolpoints;
