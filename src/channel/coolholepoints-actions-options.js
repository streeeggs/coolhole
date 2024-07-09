import ChannelModule from './module'
const LOGGER = require('@calzoneman/jsli')('channel');

/**
 * @param {Object} _channel 
 */
class CoolholePointsActionsOptionsModule extends ChannelModule {
    constructor(_channel) {
        super(_channel);

        ChannelModule.apply(this, arguments);
        const ActionType = {
            earnings: "earnings",
            losses: "losses",
            expenditures: "expenditures",
            statues: "statuses"
        };

        this.supportsDirtyCheck = true;
        this.actionTypes = ActionType;
        this.actions = [];

        /**
         * cpActions defines the list of actions available
         * @type {Array.<Object>}
         * @public
         */
        this.actionsDefault = [
            /** 
             * @namespace
             * @property {string} name Name of the option
             * @property {ActionType} actionType Type of action
             * @property {Object} options Object to store mutable attributes about the action
             */
            {
                name: "active",
                actionType: ActionType["earnings"],
                options: {
                    enabled: true,
                    points: 6,
                    interval: 100
                }
            },
            {
                name: "addingVid",
                actionType: ActionType["earnings"],
                options: {
                    enabled: true,
                    points: 6
                }
            },
            {
                name: "skipped",
                actionType: ActionType["losses"],
                options: {
                    enabled: true,
                    points: 6
                }
            },
            {
                name: "highlight",
                actionType: ActionType["expenditures"],
                options: {
                    enabled: true,
                    points: 15,
                    command: "/highlight"
                }
            },
            {
                name: "skip",
                actionType: ActionType["expenditures"],
                options: {
                    enabled: true,
                    points: 20
                }
            },
            {
                name: "danmu",
                actionType: ActionType["expenditures"],
                options: {
                    enabled: true,
                    points: 250,
                    command: "/danmu"
                }
            },
            {
                name: "secretary",
                actionType: ActionType["expenditures"],
                options: {
                    enabled: true,
                    points: 10000,
                    command: "/secretary"
                }
            },
            {
                name: "debtlvl0",
                actionType: ActionType["statuses"],
                options: {
                    enabled: true,
                    points: 5
                }
            },
            {
                name: "debtlvl1",
                actionType: ActionType["statuses"],
                options: {
                    enabled: true,
                    points: -10
                }
            },
            {
                name: "debtlvl2",
                actionType: ActionType["statuses"],
                options: {
                    enabled: true,
                    points: -100
                }
            },
            {
                name: "debtlvl3",
                actionType: ActionType["statuses"],
                options: {
                    enabled: true,
                    points: -500
                }
            },
            {
                name: "debtlvl4",
                actionType: ActionType["statuses"],
                options: {
                    enabled: true,
                    points: -1000
                }
            },
            {
                name: "debtlvl5",
                actionType: ActionType["statuses"],
                options: {
                    enabled: true,
                    points: -2000
                }
            }
        ];
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
            if (optionName in action.options)
                action.options[optionName] = optionValue;
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