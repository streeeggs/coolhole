var ChannelModule = require("./module");
const LOGGER = require("@calzoneman/jsli")("golds");

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
            LOGGER.info(`calculateGold: Found Gold Message: ${chatText}`);
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