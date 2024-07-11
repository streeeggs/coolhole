import ChannelModule from './module'
const LOGGER = require('@calzoneman/jsli')('channel');

const ActionType = {
    Earnings: "Earnings",
    Losses: "Losses",
    Expenditures: "Expenditures",
    Statuses: "Statuses"
};


/**
 * Default options for cool points
 * @namespace
 * @property {String} name Name of the option
 * @property {String} actionType Type of action
 * @property {String} modTitle Title for mod options page
 * @property {String} userTitle Title for user status page
 * @property {String} userDescription Description for user status page
 * @property {Array} options Array of option objects
 * @property {String} options.optionName Name of the option
 * @property {String} options.optionType Type of the option
 * @property {*} options.optionValue Value of the option
 * @property {String} options.optionDescription Description of the option
 */
const cpOptsDefaults = [
    {
        name: "active",
        actionType: ActionType["Earnings"],
        modTitle: "Being Active",
        userTitle: "Active",
        userDescription: "Participation is key. A reward to those that are present",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: 6,
                optionDescription: "Points per Tick"
            },
            {
                optionName: "interval",
                optionType: "time",
                optionValue: 100,
                optionDescription: "Tick Interval"
            }
        ]
    },
    {
        name: "addingVid",
        actionType: ActionType["Earnings"],
        modTitle: "Adding a video",
        userTitle: "Submitting Media",
        userDescription: "Providing media is the foundation of the application and is the catalyst for valuable data",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: 6,
                optionDescription: "Points per Video"
            }
        ]
    },
    {
        name: "skipped",
        actionType: ActionType["Losses"],
        modTitle: "Having your video skipped",
        userTitle: "Unsatisfactory Media",
        userDescription: "Not all media is created equal and it's important to ensure you're providing the highest quality content. Please do better in the future. Don't fucking post family guy. Or anime.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: 6,
                optionDescription: "Points lost"
            }
        ]
    },
    {
        name: "highlight",
        actionType: ActionType["Expenditures"],
        modTitle: "Highlight",
        userTitle: "Highlight",
        userDescription: "Individuality provides a sense of self-expression and personal fulfillment. While modest, this chat message will help you stand out",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: 15,
                optionDescription: "Cost"
            },
            {
                optionName: "command",
                optionType: "string",
                optionValue: "/highlight",
                optionDescription: "Usage: /highlight"
            }
        ]
    },
    {
        name: "skip",
        actionType: ActionType["Expenditures"],
        modTitle: "Skipping a video",
        userTitle: `"Sister"ing Content`,
        userDescription: "As a publicly accountable organization, we are compelled to express our sincerest apprehension regarding the participation of incest.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: 20,
                optionDescription: "Cost"
            }
        ]
    },
    {
        name: "danmu",
        actionType: ActionType["Expenditures"],
        modTitle: "Danmaku ('On Screen' Comments)",
        userTitle: "Danmu",
        userDescription: `AKA: Danmaku or barrage or niconico video is usually described as は、ニコニコ動画で流れる文字コメントのことで、動画をより楽しい \ (•◡•) /コメントが彩ります`,
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: 250,
                optionDescription: "Cost"
            },
            {
                optionName: "command",
                optionType: "string",
                optionValue: "/danmu",
                optionDescription: "Usage: /danmu"
            }
        ]
    },
    {
        name: "secretary",
        actionType: ActionType["Expenditures"],
        modTitle: "Super Invasive Chat",
        userTitle: "Invasive Chat Message",
        userDescription: "Children who are often deprived of attention resort to frequent disruptions through auditory and visual harassment. To be noticed, to be seen, is to be reminded that you're alive; that you matter. Use her wisely.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: 10000,
                optionDescription: "Cost"
            },
            {
                optionName: "command",
                optionType: "string",
                optionValue: "/secretary",
                optionDescription: "Usage: /secretary"
            }
        ]
    },
    {
        name: "debtlvl0",
        actionType: ActionType["Statuses"],
        modTitle: "Debt Level 0 - Stutter filter",
        userTitle: "Debt Level 0 - Repeating Interruptions of Typical Speech",
        userDescription: "Our bio-integrated cryptocurrency may cause speech repetition due to additional Proof of Work requirements for users below a certain threshold.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: 5,
                optionDescription: "Points below"
            }
        ]
    },
    {
        name: "debtlvl1",
        actionType: ActionType["Statuses"],
        modTitle: "Debt Level 1 - Lisp filter",
        userTitle: "Debt Level 1 - Further Degradation of Speech",
        userDescription: "It's unsure if this effect is the result of impaired faculties or if it's a best estimation of what the fiscally irresponsible sound like.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: -10,
                optionDescription: "Points below"
            }
        ]
    },
    {
        name: "debtlvl2",
        actionType: ActionType["Statuses"],
        modTitle: "Debt Level 2 - Random Ad",
        userTitle: "Debt Level 2 - Occasional Content Insertion to Recoup Cost",
        userDescription: "To avoid the ability to provide you with more opportunities to contribute, we require external sources to keep operating costs nominal.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: -100,
                optionDescription: "Points below"
            }
        ]
    },
    {
        name: "debtlvl3",
        actionType: ActionType["Statuses"],
        modTitle: "Debt Level 3 - 'Coolhole1' Text",
        userTitle: "Debt Level 3 - Lower Physical Footprint",
        userDescription: "As your brain and body begin to degrade, it becomes necessary to reduce swelling by reducing the text size reducing necessary throughput to continue minimal cognitive development.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: -500,
                optionDescription: "Points below"
            }
        ]
    },
    {
        name: "debtlvl4",
        actionType: ActionType["Statuses"],
        modTitle: "Debt Level 4 - Letters Missing",
        userTitle: "Debt Level 4 - Reduced Bandwidth",
        userDescription: "It's at this point that your brainwaves have become unstable and we cannot guarantee total transmission of your messages.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: -1000,
                optionDescription: "Points below"
            }
        ]
    },
    {
        name: "debtlvl5",
        actionType: ActionType["Statuses"],
        modTitle: "Debt Level 5 - 'Criticality Animation'",
        userTitle: "Debt Level 5 - Criticality Event",
        userDescription: "Criticality accident likely. May God have mercy on your soul.",
        options: [
            {
                optionName: "enabled",
                optionType: "bool",
                optionValue: true,
                optionDescription: "Enable"
            },
            {
                optionName: "points",
                optionType: "int",
                optionValue: -2000,
                optionDescription: "Points below"
            }
        ]
    }
];

const cpOptTypes = Object.keys(ActionType);

/**
 * Coolpoints options control how users earn, lose, spend and are effected by coolpoints
 * @param {Object} _channel 
 */
class CoolholePointsActionsOptionsModule extends ChannelModule {
    constructor(_channel) {
        super(_channel);

        ChannelModule.apply(this, arguments);

        this.supportsDirtyCheck = true;
        this.actionTypes = ActionType;
        this.actions = [];

        /**
         * cpActions defines the list of actions available
         * @type {Array.<Object>}
         */
        this.actionsDefault = cpOptsDefaults;
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
    logError({
        user,
        callingFunction,
        returnSocket,
        err,
        data,
        userMessage,
    }
    ) {
        LOGGER.error(`Exception caught in ${callingFunction}. Error:  ${err}`);

        LOGGER.error(
            `Unkown error in ${callingFunction} for CoolholePointsActionsOptionsModule. Here's hopefully relevant data: ${JSON.stringify(
                data ? data : {}
            )}`
        );

        if (returnSocket)
            // Return an empty array of point data... for now probably
            user.socket.emit(
                returnSocket,
                new ReturnMsg("error", userMessage, [new PointData()])
            );

    }

    /**
     * Load CoolholePointsActions
     * @param {Object} data CoolholePointsActions class
     */
    load(data) {
        if ("actions" in data) {
            this.actions = data.actions;
            this.dirty = false;
        } else {
            //otherwise, just start with defaults
            this.actions = this.actionsDefault;

            //set dirty flag so bgtask will save it
            this.dirty = true;
        }
    };

    /**
     * 
     * @param {*} data 
     */
    save(data) {
        data.actions = this.actions;
    };

    /**
     * Load action name
     * @param {String} name Action name
     * @returns 
     */
    get(name) {
        if (this.actions.includes(action => action.name === name)) {
            throw new Error("CP Action Not found");
        }

        return this.actions.find(action => action.name === name);
    };

    /**
     * Set Action Options based on name
     * @param {String} actionName 
     * @param {String} optionName
     * @param {*} optionValue
     */
    set(actionName, optionName, optionValue) {
        if (this.actions.includes(action => action.name === actionName)) {
            const action = this.actions.find(action => action.name === actionName);
            if (action.options.includes(option => option.optionName === optionName))
                action.options.find(option => option.optionName === optionName).optionValue = optionValue;
            else
                LOGGER.error(`Unable to find option ${optionName} for action ${actionName} for CoolholePointsActionsOptionsModule.`);
        }
        else
            LOGGER.error(`Unable to find action ${actionName} for CoolholePointsActionsOptionsModule.`);
    }

    /**
     * Post join hook
     * @param {*} user user object
     */
    onUserPostJoin(user) {
        user.socket.on("setCpOptions", this.handleSetCpOptions.bind(this, user));

        this.sendCpOpts([user]);
    };

    /**
     * Send options to each provided user
     * @param {Array.*} users Array of user objects
     */
    sendCpOpts(users) {
        const actions = this.actions;

        if (users === this.channel.users) {
            this.channel.broadcastAll("channelCoolPointOpts", actions);
        } else {
            users.forEach(function (user) {
                user.socket.emit("channelCoolPointOpts", actions);
            });
        }
    };

    /**
     * Gets permissions. Copied from opts... Seems kinda silly
     * @returns permissions class
     */
    getPermissions() {
        return this.channel.modules.permissions;
    };

    /**
     * Validate and update options based on data provided
     * @param {*} user Users object
     * @param {Object} data Data object
     * @param {String} data.actionName Name of the action we want updated
     * @param {String} data.optionName Name of the option within the action we want updated
     * @param {*} data.optionValue value of the option within the action we want updated
     */
    handleSetCpOptions(user, data) {
        if (typeof data !== "object") {
            return;
        }

        if (!this.getPermissions().canSetOptions(user)) {
            user.kick("Attempted setCpOptions as a non-moderator");
            return;
        }

        let sendUpdate = false;

        const isValidPoints = (pts) => !Number.isNaN(pts);
        const targetBuilder = (action, option) => `#cp-${action}-${option}`;
        const isValidInput = (actionName, optionName, optionValue) => {
            switch (optionName) {
                case "points":
                case "interval":
                    if (!isValidPoints(optionValue)) {
                        user.socket.emit("validationError", {
                            target: targetBuilder(actionName, optionName),
                            message: `Input must be a number, not "${optionValue}"`
                        });
                        return false;
                    }

                    user.socket.emit("validationPassed", {
                        target: targetBuilder(actionName, optionName),
                    });
                    return true;

                case "enabled":
                    // TODO: Validate more? Seems unnecessary to begin with but w/e
                    if (typeof (optionValue) !== Boolean && !/(true|false)/i.test(optionValue)) {
                        user.socket.emit("validationError", {
                            target: targetBuilder(actionName, optionName),
                            message: `Provided value doesn't seem like a booelan: "${optionValue}"`
                        });
                        return false;
                    }

                    return true;

                default:
                    // If we don't know it, how can we validate?
                    return false;
            }
        }
        // Trying to prevent bad data from being in here...
        const normalizeInput = (optionType, val) => {
            switch (optionType) {
                case "points":
                case "interval":
                    return parseInt(val);

                case "enabled":
                    return !!val;

                default:
                    // If we don't know it, how can we normalize?
                    return null;
            }
        }

        if (isValidInput(data.actionName, data.optionName, data.optionValue)) {
            this.set(data.actionName, data.optionName, normalizeInput(data.optionName, data.optionValue));
            sendUpdate = true;
        }

        if (sendUpdate) {
            LOGGER.info("[mod] " + user.getName() + " updated coolpoint channel options");
            this.dirty = true;
            this.sendCpOpts(this.channel.users);
        }
    }

}

module.exports = CoolholePointsActionsOptionsModule;
module.exports.cpOptsDefaults = cpOptsDefaults;
module.exports.cpOptTypes = cpOptTypes;