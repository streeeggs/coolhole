var ChannelModule = require("./module");
const LOGGER = require("@calzoneman/jsli")("channel");

function CoolholeGoldsModule(_channel) {
    ChannelModule.apply(this, arguments);
    this.supportsDirtyCheck = false;
}

CoolholeGoldsModule.prototype = Object.create(ChannelModule.prototype);

/**
 * Checks if the chat message is gold and applies it to the coolholeMeta object
 * @param {Object} user user who sent the chat message
 * @param {Object} data data input from user
 * @param {Object} msgobj message object about to be sent out to clients
 */ 
CoolholeGoldsModule.prototype.coolholePostUserProcessMessage = function(user, data, msgobj) {
    this.maybeMakeMessageGold(msgobj);
    return true;
}

/**
 * Calculates if the message is gold, and applies it to data.meta.coolholeMeta
 * @param {Object} msgobj
 */
CoolholeGoldsModule.prototype.maybeMakeMessageGold = function (msgobj) {
    if(this.channel.modules["playlist"].current === null ||
       this.channel.modules["playlist"].current.media === null ||
       this.channel.modules["playlist"].current.media.title === null)
       return;

    // Get current video title
    const currentVideoTitle = this.channel.modules["playlist"].current.media.title;
    
    // Add some date specific modifer to let golds "go stale"; this is based on each quarter per year (~3 month period)
    const dateModifier = Math.floor((new Date().getUTCMonth() + 3) / 3) + new Date().getUTCFullYear();

    // Convert to lower case to allow for different cased gold
    const chatText = msgobj.msg.toLowerCase();

    // Combine the msg, video title, date, and a constant (legacy was "co"); 
    const lotteryText = chatText + currentVideoTitle + "co" + dateModifier.toString();

    // Hash string
    let lotteryHash = hashFunc(lotteryText);

    // Modulo hash by 100
    lotteryHash %= 100;

    // No negatives
    lotteryHash = lotteryHash < 0 ? -lotteryHash : lotteryHash;

    // 1% chance? Idk either. If it's equal to one, they get a gold
    if (lotteryHash === 1) {
        LOGGER.info(`maybeMakeMessageGold: Found Gold Message: ${chatText}`);
        msgobj.meta.coolholeMeta.otherClasses.push("text-lottery");
    }
}

/**
 * Some cheap hash function grabbed off of stackoverflow.com. 
 * Returns the hash of a string.
 * @param {string} str 
 * @returns {int} returns the hash of the string
 */
function hashFunc(str) {
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

module.exports = CoolholeGoldsModule;