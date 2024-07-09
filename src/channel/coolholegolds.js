import ChannelModule from './module'
const LOGGER = require("@calzoneman/jsli")("golds");

const ActionType = {
    earnings: "earnings",
    losses: "losses",
    expenditures: "expenditures",
    statues: "statuses"
};

const cpOptsDefaults = [
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


/**
 * This module calculates if chat messages are gold.
 * @param {Object} _channel 
 */
class CoolholeGoldsModule extends ChannelModule{
    constructor(_channel) {
        super(_channel);
    }

    /**
     * Calculates if the chat message is gold.
     * @param {string} msg chat message
     * @returns returns true if gold, false if not gold
     */
    calculateGold(msg) {
        if(this.channel.modules["playlist"]?.current?.media?.title === undefined)
            return false;

        // Get current video title
        const currentVideoTitle = this.channel.modules["playlist"].current.media.title;
        
        // Add some date specific modifer to let golds "go stale"; this is based on each quarter per year (~3 month period)
        const dateModifier = Math.floor((new Date().getUTCMonth() + 3) / 3) + new Date().getUTCFullYear();

        // Convert to lower case to allow for different cased gold
        const chatText = msg.toLowerCase();

        // Combine the msg, video title, date, and a constant (legacy was "co"); 
        const lotteryText = chatText + currentVideoTitle + "co" + dateModifier.toString();

        // Hash string
        let lotteryHash = this.hashFunc(lotteryText);

        // Modulo hash by 100
        lotteryHash %= 100;

        // No negatives
        lotteryHash = lotteryHash < 0 ? -lotteryHash : lotteryHash;

        // 1% chance? Idk either. If it's equal to one, they get a gold
        if (lotteryHash === 1) {
            LOGGER.info("Found Gold Message (channel: %s): %s", this.channel.name, chatText);
            return true;
        }

        return false;
    }

    /**
     * Some cheap hash function grabbed off of stackoverflow.com. 
     * Returns the hash of a string.
     * @param {string} str 
     * @returns {int} returns the hash of the string
     */
    hashFunc(str) {
        var hash = 0,
            i,
            chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
}

module.exports = CoolholeGoldsModule;
exports = module.exports;
exports.cpOptsDefaults = cpOptsDefaults;